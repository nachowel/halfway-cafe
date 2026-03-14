/* ContactForm — Client-side contact form UI */
// TODO: Connect to email service (Resend/Nodemailer)

"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("Contact form submitted:", {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 text-center">
        <span className="block text-4xl">✉️</span>
        <h3 className="mt-3 font-playfair text-xl font-bold text-ink">
          Message Sent!
        </h3>
        <p className="mt-2 font-lora text-sm italic text-ink-light">
          Thanks for getting in touch. We&apos;ll reply as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 font-baskerville text-xs uppercase tracking-wider text-red hover:text-red-dark"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block font-baskerville text-xs uppercase tracking-wider text-ink"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-baskerville text-xs uppercase tracking-wider text-ink"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20"
          placeholder="you@example.com"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-baskerville text-xs uppercase tracking-wider text-ink"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-none rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20"
          placeholder="How can we help?"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-[10px] bg-red py-3.5 font-baskerville text-xs uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#c86821]"
      >
        Send Message
      </button>
    </form>
  );
}
