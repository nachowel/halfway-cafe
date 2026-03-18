import type { Metadata } from "next";
import DesktopFaq from "@/components/DesktopFaq";
import FaqPageSwitcher from "@/components/FaqPageSwitcher";

export const metadata: Metadata = {
  title: "FAQ | Halfway Cafe Sidcup DA15",
  description:
    "Got questions about Halfway Cafe in Sidcup? Find answers about opening hours, parking, takeaway, allergens, and more. Visit us at 176 Halfway Street, DA15 8DJ.",
  keywords:
    "Halfway Cafe FAQ, Halfway Cafe opening hours, Halfway Cafe parking, Sidcup cafe, DA15 cafe",
  alternates: {
    canonical: "/faq",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is Halfway Cafe located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We're at 176 Halfway Street, Sidcup, DA15 8DJ — right in the heart of Sidcup, easily accessible from Eltham, Bexley, Blackfen, and surrounding areas.",
      },
    },
    {
      "@type": "Question",
      name: "What are your opening hours?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We're open Monday to Saturday from 7:00am to 3:00pm, and Sunday from 9:00am to 2:00pm. We're here for breakfast and lunch every day of the week.",
      },
    },
    {
      "@type": "Question",
      name: "Is there parking near Halfway Cafe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — there is street parking available on Halfway Street and nearby roads. We're also a short walk from local bus stops, making us easy to reach by public transport.",
      },
    },
    {
      "@type": "Question",
      name: "Do you serve breakfast all day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We serve our full breakfast menu from opening time until early afternoon. We recommend arriving before 1:00pm to make sure you get the full selection — popular items can sell out on busy mornings!",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer takeaway?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer takeaway on all menu items. Simply ask at the counter and we'll have everything packed and ready for you.",
      },
    },
    {
      "@type": "Question",
      name: "Do you cater for vegetarians?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — we have vegetarian options on our menu, including vegetarian breakfasts and light bites. Just let us know when ordering and we'll be happy to help.",
      },
    },
    {
      "@type": "Question",
      name: "Do you cater for food allergies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We take allergies seriously. Please speak to a member of staff before ordering and we will do our best to accommodate your needs. Our kitchen handles common allergens including gluten, dairy, and eggs.",
      },
    },
    {
      "@type": "Question",
      name: "Do you accept card payments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we accept all major debit and credit cards as well as cash. Contactless payments are welcome.",
      },
    },
    {
      "@type": "Question",
      name: "Can I book a table?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Halfway Cafe operates on a walk-in basis — no reservation needed. We do get busy during peak breakfast hours (8am–11am on weekends), so arriving a little earlier is always a good idea.",
      },
    },
    {
      "@type": "Question",
      name: "Is Halfway Cafe family-friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Halfway Cafe has been a welcoming family-run caff for over 20 years. Families and children are always welcome, and our portions are generous enough for even the biggest appetites!",
      },
    },
    {
      "@type": "Question",
      name: "How do I contact Halfway Cafe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can call us on 020 3343 5303. You can also find us on Instagram and Facebook — links are in the footer of our website.",
      },
    },
    {
      "@type": "Question",
      name: "Is Halfway Cafe on Uber Eats or Deliveroo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — you can also order through delivery platforms. Check our homepage for current delivery options and links.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqPageSwitcher desktopFaq={<DesktopFaq />} />
    </>
  );
}
