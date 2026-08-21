import { google } from "googleapis";

// Google Calendar integration for interview scheduling + reminders.
// Requires a Google OAuth client set up in Google Cloud Console.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function getCalendarClient(refreshToken) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export const calendarService = {
  // Creates a calendar event with an auto-generated Google Meet link and a
  // reminder N minutes before the interview. Returns the event, including
  // event.hangoutLink (the Meet URL) so it can be added to the email.
  async createInterviewEvent({
    refreshToken,
    summary,
    description,
    startTime,
    durationMinutes = 45,
    attendeeEmails = [],
    reminderMinutesBefore = 30,
  }) {
    const calendar = getCalendarClient(refreshToken);
    const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000);

    const event = {
      summary,
      description,
      start: { dateTime: startTime },
      end: { dateTime: endTime.toISOString() },
      attendees: attendeeEmails.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: reminderMinutesBefore },
          { method: "popup", minutes: reminderMinutesBefore },
        ],
      },
      // Auto-creates a Google Meet link for the interview
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1, // required for conferenceData to take effect
      sendUpdates: "all",
    });

    return {
      ...res.data,
      meetLink: res.data.hangoutLink || null,
    };
  },

  async cancelEvent({ refreshToken, eventId }) {
    const calendar = getCalendarClient(refreshToken);
    await calendar.events.delete({ calendarId: "primary", eventId, sendUpdates: "all" });
  },
};

export default calendarService;