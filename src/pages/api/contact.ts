import type { APIRoute } from 'astro';
import { MailJunky } from '@mailjunky/sdk';

export const prerender = false;

const client = new MailJunky({
  apiKey: import.meta.env.MAILJUNKY_API_KEY || '',
});

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    const errors: FieldErrors = {};

    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!message) {
      errors.message = 'Message is required';
    } else if (message.length < 10) {
      errors.message = 'Please write a bit more';
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors,
          values: { name, email, message },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await client.emails.send({
      from: 'hello@skillfulgorilla.com',
      to: 'stevie@skillfulgorilla.com',
      subject: `swm.cc contact: ${name}`,
      html: `
        <h2>New message from swm.cc</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Failed to send email:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
