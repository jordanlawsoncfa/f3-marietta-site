import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: 'F3 Marietta <contact@f3marietta.com>',
            to: ['f3marietta@googlegroups.com'],
            replyTo: email,
            subject: `F3 Marietta Contact: ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br />')}</p>
                <hr />
                <p style="color: #666; font-size: 12px;">
                    This message was sent via the F3 Marietta website contact form.
                </p>
            `,
        });

        if (error) {
            console.error('Resend error details:', JSON.stringify(error, null, 2));
            console.error('Resend error name:', error.name);
            console.error('Resend error message:', error.message);
            return NextResponse.json(
                { error: 'Failed to send email', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, messageId: data?.id });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
