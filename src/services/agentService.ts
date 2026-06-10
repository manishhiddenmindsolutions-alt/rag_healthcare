/**
 * Service to communicate with the n8n Healthcare RAG and Appointment Booking Webhook
 */

const WEBHOOK_URL =
  '/api-webhook/webhook/e69a53ea-9a80-48ab-854b-e5e5f99eba26';

export interface WebhookResponse {
  text: string;
  isAppointmentBooked: boolean;
  appointmentDetails?: {
    doctor?: string;
    specialty?: string;
    date?: string;
    time?: string;
  };
}

/**
 * Generate unique session ID
 */
export const generateSessionId = (): string => {
  return 'hms_session_' + Math.random().toString(36).substring(2, 15);
};

/**
 * Extract appointment information from AI response
 */
function parseAppointmentDetails(text: string) {
  const lowercase = text.toLowerCase();

  const isBooked =
    lowercase.includes('book') ||
    lowercase.includes('schedul') ||
    lowercase.includes('confirm') ||
    lowercase.includes('appoint');

  if (!isBooked) return null;

  // Doctor name
  const docMatch = text.match(
    /Dr\.\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)?)/,
  );

  // Time
  const timeMatch = text.match(
    /(\d{1,2}(:\d{2})?\s*(AM|PM|am|pm)?)/i,
  );

  // Date
  const dateKeywords = [
    'today',
    'tomorrow',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  let dateFound = '';

  for (const keyword of dateKeywords) {
    if (lowercase.includes(keyword)) {
      dateFound =
        keyword.charAt(0).toUpperCase() + keyword.slice(1);
      break;
    }
  }

  if (!dateFound) {
    const dateMatch = text.match(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i,
    );

    if (dateMatch) {
      dateFound = dateMatch[0];
    }
  }

  return {
    doctor: docMatch
      ? `Dr. ${docMatch[1]}`
      : undefined,

    date: dateFound || undefined,

    time: timeMatch
      ? timeMatch[0]
      : undefined,
  };
}

/**
 * Clean AI response
 */
export function cleanResponseText(rawText: any): string {
  if (rawText === null || rawText === undefined) {
    return '';
  }

  // STRING
  if (typeof rawText === 'string') {
    const trimmed = rawText.trim();

    // Parse JSON strings
    if (
      (trimmed.startsWith('[') &&
        trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') &&
        trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return cleanResponseText(parsed);
      } catch (e) {}
    }

    let result = trimmed;

    // Remove outer quotes
    if (
      result.startsWith('"') &&
      result.endsWith('"')
    ) {
      result = result.slice(1, -1).trim();
    }

    // Recheck JSON
    if (
      (result.startsWith('[') &&
        result.endsWith(']')) ||
      (result.startsWith('{') &&
        result.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(result);
        return cleanResponseText(parsed);
      } catch (e) {}
    }

    return result;
  }

  // ARRAY
  if (Array.isArray(rawText)) {
    if (rawText.length === 0) return '';

    return cleanResponseText(rawText[0]);
  }

  // OBJECT
  if (typeof rawText === 'object') {
    const priorityKeys = [
      'output',
      'response',
      'text',
      'message',
      'result',
    ];

    for (const key of priorityKeys) {
      if (
        key in rawText &&
        rawText[key] !== undefined &&
        rawText[key] !== null
      ) {
        return cleanResponseText(rawText[key]);
      }
    }

    if (rawText.data) {
      return cleanResponseText(rawText.data);
    }

    return JSON.stringify(rawText);
  }

  return String(rawText);
}

/**
 * Send message to n8n agent
 */
export async function sendMessageToAgent(
  message: string,
  sessionId: string,
): Promise<WebhookResponse> {

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 90000);

  try {

    /**
     * FINAL BODY FORMAT
     * Only message + sessionId
     */
    const payload = {
      sessionId,
      message,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),

      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Server returned status ${response.status}`,
      );
    }

    // Parse response
    const contentType =
      response.headers.get('content-type');

    let textReply = '';

    // JSON response
    if (
      contentType &&
      contentType.includes('application/json')
    ) {

      const data = await response.json();

      textReply = cleanResponseText(data);

    } else {

      // Plain text response
      const rawText = await response.text();

      textReply = cleanResponseText(rawText);
    }

    // Appointment parsing
    const appointmentDetails =
      parseAppointmentDetails(textReply);

    const isAppointmentBooked =
      appointmentDetails !== null &&
      (
        message.toLowerCase().includes('book') ||
        message.toLowerCase().includes('appoint') ||
        message.toLowerCase().includes('schedul') ||
        textReply.toLowerCase().includes('confirm') ||
        textReply.toLowerCase().includes('book') ||
        textReply.toLowerCase().includes('schedul')
      );

    return {
      text: textReply,

      isAppointmentBooked,

      appointmentDetails:
        appointmentDetails || undefined,
    };

  } catch (error: any) {

    clearTimeout(timeoutId);

    console.error(
      'Error calling n8n webhook:',
      error,
    );

    const isTimeout =
      error.name === 'AbortError';

    const errorMsg = isTimeout
      ? `### ⏰ Connection Timeout

I was unable to receive a response from the clinic assistant in time.

• Reason: Server took longer than 90 seconds.
• Action: Please try again later.`
      : `### ⚠️ System Connection Error

I am unable to communicate with the clinic assistant right now.

• Reason: Backend webhook is offline or unreachable.
• Action: Please verify your n8n webhook configuration.`;

    return {
      text: errorMsg,

      isAppointmentBooked: false,
    };
  }
}