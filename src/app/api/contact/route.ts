import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 5 submissions per IP per 10 minutes
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // Resolve sender IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  // Rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  // Honeypot check — silently reject bots
  if (body.company) {
    return NextResponse.json({ success: true, message: "Message sent." });
  }

  // Extract and trim fields
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  // Validation
  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, message: "All fields are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return NextResponse.json(
      { success: false, message: "Input exceeds maximum allowed length." },
      { status: 400 }
    );
  }

  // SMTP credentials
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("Contact form: EMAIL_USER or EMAIL_PASS is not set.");
    return NextResponse.json(
      { success: false, message: "Server configuration error. Please try again later." },
      { status: 500 }
    );
  }

  // Build transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const timestamp = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "full",
    timeStyle: "short",
  });

  const emailBody = `New website contact form submission

Name: ${name}
Email: ${email}
Submitted: ${timestamp}
IP: ${ip}

Message:
${message}
`.trim();

  try {
    await transporter.sendMail({
      from: `"Halfway Cafe Website" <${user}>`,
      to: "info@halfwaycafe.co.uk",
      replyTo: email,
      subject: "New Contact Form Message - Halfway Cafe",
      text: emailBody,
    });

    return NextResponse.json({
      success: true,
      message: "Thanks for your message. We'll be in touch shortly.",
    });
  } catch (err) {
    console.error("Contact form: failed to send email:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send your message. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed." }, { status: 405 });
}
