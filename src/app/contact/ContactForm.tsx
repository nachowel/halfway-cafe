/* ContactForm — Client-side contact form UI */

"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      email: (formData.get("email") as string)?.trim(),
      message: (formData.get("message") as string)?.trim(),
      // honeypot — should always be empty
      company: formData.get("company"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Could not send your message. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-8 text-center">
        <span className="block text-4xl">✉️</span>
        <h3 className="mt-3 font-playfair text-xl font-bold text-ink">
          Message Received
        </h3>
        <p className="mt-2 font-lora text-sm italic text-ink-light">
          Thanks for contacting Halfway Cafe. Your message has been sent successfully and we&apos;ll get back to you as soon as possible.
        </p>
        <p className="mt-2 font-lora text-xs text-ink-light">
          We usually respond during opening hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-baskerville text-xs uppercase tracking-wider text-red hover:text-red-dark"
        >
          Send another message
        </button>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      {/* Honeypot — hidden from real users, catches bots */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

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
          disabled={isLoading}
          className="w-full rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20 disabled:opacity-60"
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
          disabled={isLoading}
          className="w-full rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20 disabled:opacity-60"
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
          disabled={isLoading}
          className="w-full resize-none rounded-[10px] border border-border bg-parchment px-4 py-[14px] font-lora text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#d77a37] focus:ring-2 focus:ring-red/20 disabled:opacity-60"
          placeholder="How can we help?"
        />
      </div>

      {/* Error message */}
      {status === "error" && (
        <p role="alert" className="rounded-[10px] bg-red/10 px-4 py-3 font-lora text-sm text-red">
          {errorMessage}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-[10px] bg-red py-3.5 font-baskerville text-xs uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#c86821] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Sending…" : "Send Message"}
      </button>

      <p className="text-center font-lora text-xs italic text-ink-light">
        We aim to respond within a few hours during opening times.
      </p>
    </form>
  );
}
