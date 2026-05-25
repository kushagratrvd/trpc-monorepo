import { Resend } from 'resend';
import { env } from '../env';

const resend = new Resend(env.RESEND_API_KEY || 're_eval_dummy_123');

class EmailService {
    static async sendNewSubmissionNotification(
        creatorEmail: string,
        formTitle: string,
        submissionValues: { label: string; value: string }[]
    ) {
        const html = `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h2 style="color: #4f46e5; margin-top: 0;">New Form Submission 🎉</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                    Great news! Someone just submitted a response to your form: <strong>${formTitle}</strong>
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                    <h3 style="margin-top: 0; margin-bottom: 16px; color: #111827; font-size: 18px;">Response Summary:</h3>
                    ${submissionValues.map(v => `
                        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                            <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                                ${v.label}
                            </div>
                            <div style="font-size: 15px; color: #1f2937; font-weight: 500;">
                                ${v.value || '<span style="color: #9ca3af; font-style: italic;">No answer provided</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 32px;">
                    Log in to your Formz dashboard to view full analytics and manage responses.
                </p>
            </div>
        `;

        try {
            const { data, error } = await resend.emails.send({
                from: 'Formz Notifications <onboarding@resend.dev>',
                to: [creatorEmail],
                subject: `New Response: ${formTitle}`,
                html,
            });

            if (error) {
                throw error;
            }

            console.log(`✅ [EmailService] Successfully sent notification to ${creatorEmail} (ID: ${data?.id})`);
        } catch (error: any) {
            console.log(`⚠️  Failed to send via Resend API.`);
            console.log(`\n📤 Dispatching Mock Notification:`);
            console.log(`To:      ${creatorEmail}`);
            console.log(`Subject: New Response: ${formTitle}`);
            console.log(`\nPayload (HTML):`);
            console.log(`-------------------------------------------`);
            console.log(html);
            console.log(`-------------------------------------------\n\n`);
        }
    }
}

export default EmailService;
