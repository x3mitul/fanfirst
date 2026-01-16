import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

interface SendReminderParams {
    to: string;
    userName: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
}

export async function sendReminderEmail({
    to,
    userName,
    eventName,
    eventDate,
    eventTime
}: SendReminderParams) {
    if (!resend) {
        console.log("⚠️ [Email Mock] Would send reminder to:", to);
        console.log(`   Subject: Reminder: ${eventName} is coming up!`);
        console.log(`   Hi ${userName}, don't forget about ${eventName} on ${eventDate} at ${eventTime}.`);
        return { success: true, mocked: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'FanFirst <noreply@fanfirst.dtu>', // Use a verified domain in prod
            to: [to],
            subject: `Reminder: ${eventName} is coming up!`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Event Reminder 🎟️</h1>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>This is a reminder that you have an upcoming event:</p>
                    <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0; color: #000;">${eventName}</h2>
                        <p style="margin: 10px 0 0 0;">📅 ${eventDate} at ${eventTime}</p>
                    </div>
                    <p>Get ready for an amazing experience!</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888;">FanFirst - Fair Ticketing for Real Fans</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Email sending failed:", err);
        return { success: false, error: err };
    }
}
