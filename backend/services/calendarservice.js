import { google } from "googleapis";

// Google Calendar integration for interview scheduling + reminders.
// Requires a Google service account or OAuth client set up in Google Cloud Console.
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
  // Creates an event with a reminder N minutes before the interview
  async createInterviewEvent({ refreshToken, summary, description, startTime, durationMinutes = 45, attendeeEmails = [], reminderMinutesBefore = 30 }) {
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
        overrides: [{ method: "email", minutes: reminderMinutesBefore }, { method: "popup", minutes: reminderMinutesBefore }],
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "all",
    });
    return res.data;
  },

  async cancelEvent({ refreshToken, eventId }) {
    const calendar = getCalendarClient(refreshToken);
    await calendar.events.delete({ calendarId: "primary", eventId, sendUpdates: "all" });
  },
};

export default calendarService;