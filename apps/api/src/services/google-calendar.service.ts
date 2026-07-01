import { google } from 'googleapis';
import logger from '../infrastructure/logger/logger';

export class GoogleCalendarService {
  private oauth2Client: any;
  private isConfigured: boolean = false;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.isConfigured = true;
    } else {
      logger.warn('Google Calendar Integration is not configured. Falling back to mock meet links.');
    }
  }

  async createCalendarEvent(params: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmails: string[];
  }) {
    if (!this.isConfigured) {
      const suffix1 = Math.random().toString(36).substring(2, 5);
      const suffix2 = Math.random().toString(36).substring(2, 6);
      const suffix3 = Math.random().toString(36).substring(2, 5);
      const meetLink = `https://meet.google.com/${suffix1}-${suffix2}-${suffix3}`;
      const calendarEventId = `mock_event_${Math.random().toString(36).substring(2, 15)}`;
      return { meetLink, calendarEventId };
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = {
        summary: params.title,
        description: params.description,
        start: {
          dateTime: params.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: params.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: params.attendeeEmails.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const calendarEventId = response.data.id || '';
      const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || '';

      return { meetLink, calendarEventId };
    } catch (error) {
      logger.error({ error }, 'Failed to create Google Calendar event. Falling back to mock meet link.');
      const suffix1 = Math.random().toString(36).substring(2, 5);
      const suffix2 = Math.random().toString(36).substring(2, 6);
      const suffix3 = Math.random().toString(36).substring(2, 5);
      const meetLink = `https://meet.google.com/${suffix1}-${suffix2}-${suffix3}`;
      const calendarEventId = `mock_event_failed_${Math.random().toString(36).substring(2, 10)}`;
      return { meetLink, calendarEventId };
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
