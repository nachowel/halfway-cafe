import nodemailer from "nodemailer";

interface ContactTransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface ContactMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

interface ContactTransport {
  sendMail(message: ContactMessage): Promise<unknown>;
}

export type ContactTransportFactory = (
  options: ContactTransportOptions,
) => ContactTransport;

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  ip: string;
  timestamp: string;
}

interface SendContactEmailOptions {
  user: string;
  pass: string;
  submission: ContactSubmission;
}

const createNodemailerTransport: ContactTransportFactory = (options) =>
  nodemailer.createTransport(options);

export async function sendContactEmail(
  { user, pass, submission }: SendContactEmailOptions,
  createTransport: ContactTransportFactory = createNodemailerTransport,
) {
  const transport = createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const text = `New website contact form submission

Name: ${submission.name}
Email: ${submission.email}
Submitted: ${submission.timestamp}
IP: ${submission.ip}

Message:
${submission.message}`;

  return transport.sendMail({
    from: `"Halfway Cafe Website" <${user}>`,
    to: "info@halfwaycafe.co.uk",
    replyTo: submission.email,
    subject: "New Contact Form Message - Halfway Cafe",
    text,
  });
}
