/**
 * Section-based page content for the landing, Dance Company, Weddings and Dresses pages.
 * Each page is described once here; the admin editor, validation and default content are
 * all generated from it.
 */

import { IMG } from "./images-builtin";

export type ListItem = Record<string, string>;
export type FieldValue = string | ListItem[];
export type SectionDoc = { visible: boolean; values: Record<string, FieldValue> };
export type PageDoc = Record<string, SectionDoc>;

type Base = { k: string; label: string; help?: string; ph?: string };

export type SubField = Base & {
  t: "text" | "area" | "select" | "image";
  opts?: readonly string[];
  /** Take the select options from another list field in the same section (its `label` values). */
  optsFrom?: string;
};

export type Field =
  | (Base & { t: "text" | "area"; v: string })
  | (Base & { t: "select"; opts: readonly string[]; v: string })
  | (Base & { t: "image"; v: string })
  | (Base & { t: "list"; item: string; items: string; sub: SubField[]; v: ListItem[] });

export type SectionDef = {
  id: string;
  title: string;
  desc: string;
  /** Always shown (menu, footer): no "Show on site" switch. */
  fixed?: boolean;
  fields: Field[];
};

export type PageKey = "landing" | "dance" | "weddings" | "dresses";

export type PageSchema = {
  key: PageKey;
  /** Admin URL segment. */
  slug: string;
  label: string;
  path: string;
  dev?: string;
  sections: SectionDef[];
};

const HIGHLIGHT_HELP = "Wrap words in *asterisks* to show them in rose.";

const OCCASIONS = ["Bharatanatyam", "Kuchipudi", "Semi-classical", "Bridal", "Sangeet"];
export const COLOURS = ["Red", "Pink", "Gold", "Green", "Blue", "Maroon"] as const;

const landing: PageSchema = {
  key: "landing",
  slug: "landing",
  label: "Landing page",
  path: "/",
  sections: [
    {
      id: "menu",
      title: "Menu & header",
      desc: "The top menu, shown on every page.",
      fixed: true,
      fields: [
        {
          k: "links",
          label: "Menu links",
          t: "list",
          item: "Link",
          items: "Links",
          sub: [
            { k: "label", label: "Label", t: "text" },
            { k: "href", label: "Goes to", t: "text", ph: "/page-address" },
          ],
          v: [
            { label: "Natyashastra Hub", href: "/natyashastra-hub" },
            { label: "Dance Company", href: "/navaras-dance-company" },
            { label: "Weddings", href: "/navaras-weddings" },
            { label: "Dresses", href: "/navaras-dresses" },
          ],
        },
        { k: "cta", label: "Highlighted button", t: "text", v: "Free trial class" },
        { k: "ctaHref", label: "Highlighted button goes to", t: "text", v: "/navaras-dance-company#trial" },
      ],
    },
    {
      id: "hero",
      title: "Top section",
      desc: "The first thing visitors see.",
      fields: [
        { k: "kicker", label: "Small line above the heading", t: "text", v: "नृत्य · उत्सव · शृंगार" },
        { k: "heading", label: "Heading", t: "area", help: HIGHLIGHT_HELP, v: "Dance, celebration and costume, rooted in the *Natyashastra*. xyz" },
        {
          k: "text",
          label: "Introduction",
          t: "area",
          v: "Navarasa — the nine emotions of classical Indian performance — runs through everything we do. Learn the art, celebrate your wedding with it, and dress for it.",
        },
        { k: "b1", label: "First button", t: "text", v: "Explore the Natyashastra Hub" },
        { k: "b1h", label: "First button goes to", t: "text", v: "#hub-intro" },
        { k: "b2", label: "Second button", t: "text", v: "Our services" },
        { k: "b2h", label: "Second button goes to", t: "text", v: "#services" },
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.classical },
      ],
    },
    {
      id: "hub",
      title: "Natyashastra Hub introduction",
      desc: "The maroon section that leads visitors into the Hub.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "नाट्यशास्त्र" },
        { k: "eyebrow", label: "Small label", t: "text", v: "The Navaras Natyashastra Hub" },
        { k: "heading", label: "Heading", t: "area", v: "Learn the Natyashastra, one concept at a time." },
        {
          k: "text",
          label: "Text",
          t: "area",
          v: "The theory behind classical Indian dance, explained in simple words. Every concept has its own photos and video — read it, watch it, and mark it as read as you go.",
        },
        {
          k: "chips",
          label: "Topic labels",
          t: "list",
          item: "Label",
          items: "Labels",
          sub: [
            { k: "label", label: "English", t: "text" },
            { k: "dev", label: "Devanagari", t: "text" },
          ],
          v: [
            { label: "Rasa", dev: "रस" },
            { label: "Abhinaya", dev: "अभिनय" },
            { label: "Hasta mudra", dev: "हस्त" },
            { label: "Forms of dance", dev: "नृत्त" },
          ],
        },
        { k: "btn", label: "Button", t: "text", v: "Start learning" },
        { k: "btnh", label: "Button goes to", t: "text", v: "/natyashastra-hub" },
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.blue },
      ],
    },
    {
      id: "services",
      title: "Our services",
      desc: "The three cards just before the footer.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Our services" },
        { k: "heading", label: "Heading", t: "text", v: "Learn the art. Celebrate with it. Dress for it." },
        {
          k: "cards",
          label: "Service cards",
          t: "list",
          item: "Card",
          items: "Cards",
          sub: [
            { k: "title", label: "Title", t: "text" },
            { k: "dev", label: "Devanagari", t: "text" },
            { k: "unit", label: "Business name", t: "text" },
            { k: "btn", label: "Link text", t: "text" },
            { k: "desc", label: "Description", t: "area" },
            { k: "href", label: "Goes to", t: "text" },
            { k: "img", label: "Image", t: "image" },
          ],
          v: [
            {
              title: "Learn",
              dev: "शिक्षा",
              unit: "Navaras Dance Company",
              btn: "See classes",
              desc: "Live online classical and semi-classical classes, from first steps to performance.",
              href: "/navaras-dance-company",
              img: IMG.online,
            },
            {
              title: "Celebrate",
              dev: "उत्सव",
              unit: "Navaras Weddings",
              btn: "Plan your sangeet",
              desc: "Sangeet and wedding choreography — even for families spread across countries.",
              href: "/navaras-weddings",
              img: IMG.couple,
            },
            {
              title: "Adorn",
              dev: "शृंगार",
              unit: "Navaras Dresses",
              btn: "Browse costumes",
              desc: "Costume rentals and custom stitching for stage, sangeet and arangetram.",
              href: "/navaras-dresses",
              img: IMG.costume,
            },
          ],
        },
      ],
    },
    {
      id: "footer",
      title: "Footer & contact details",
      desc: "Shown at the bottom of every page.",
      fixed: true,
      fields: [
        { k: "tagline", label: "Tagline", t: "area", v: "The Natyashastra, taught simply — and dance, celebration and costume built on it." },
        { k: "news", label: "Newsletter heading", t: "text", v: "Get new Hub concepts in your inbox" },
        { k: "wa", label: "WhatsApp number", t: "text", v: "", ph: "+91 …" },
        { k: "email", label: "Email", t: "text", v: "", ph: "hello@…" },
        { k: "city", label: "City", t: "text", v: "", ph: "Your city" },
        { k: "ig", label: "Instagram link", t: "text", v: "", ph: "https://instagram.com/…" },
        { k: "yt", label: "YouTube link", t: "text", v: "", ph: "https://youtube.com/…" },
        { k: "fb", label: "Facebook link", t: "text", v: "", ph: "https://facebook.com/…" },
      ],
    },
  ],
};

const dance: PageSchema = {
  key: "dance",
  slug: "dance-company",
  label: "Dance Company",
  path: "/navaras-dance-company",
  sections: [
    {
      id: "hero",
      title: "Top section",
      desc: "Headline, introduction and the class video.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "नृत्य" },
        { k: "heading", label: "Heading", t: "area", help: HIGHLIGHT_HELP, v: "Classical dance, taught live, wherever you are." },
        {
          k: "text",
          label: "Introduction",
          t: "area",
          v: "Structured classical and semi-classical classes, live online — for kids, teens and adults, in groups or one-on-one.",
        },
        { k: "b1", label: "Button", t: "text", v: "Book a free trial class" },
        { k: "video", label: "Video link", t: "text", v: "", ph: "YouTube or Vimeo link" },
        { k: "img", label: "Video thumbnail", t: "image", v: IMG.blue },
      ],
    },
    {
      id: "levels",
      title: "Learning pathways",
      desc: "The four levels, from first step to the stage.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "मार्ग" },
        { k: "heading", label: "Heading", t: "text", v: "Four levels, from first step to the stage." },
        {
          k: "list",
          label: "Levels",
          t: "list",
          item: "Level",
          items: "Levels",
          sub: [
            { k: "name", label: "Level name", t: "text" },
            { k: "duration", label: "Duration", t: "text", ph: "e.g. 6 months" },
            { k: "covers", label: "What it covers", t: "area", ph: "What students learn at this level" },
          ],
          v: [
            { name: "Foundation", duration: "", covers: "" },
            { name: "Intermediate", duration: "", covers: "" },
            { name: "Advanced", duration: "", covers: "" },
            { name: "Performance", duration: "", covers: "" },
          ],
        },
      ],
    },
    {
      id: "batches",
      title: "Class options",
      desc: "The two ways to learn, with what's good about each and what to keep in mind.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Class options" },
        { k: "heading", label: "Heading", t: "text", v: "Two ways to learn. Pick what suits you." },
        {
          k: "list",
          label: "Options",
          t: "list",
          item: "Option",
          items: "Options",
          sub: [
            { k: "name", label: "Option name", t: "text" },
            { k: "who", label: "Short description", t: "text", ph: "e.g. Live group class · up to 10 dancers" },
            { k: "pros", label: "Why choose it (one per line)", t: "area" },
            { k: "cons", label: "Keep in mind (one per line)", t: "area" },
            { k: "price", label: "Fee", t: "text", ph: "e.g. ₹2,500" },
            { k: "per", label: "Charged", t: "select", opts: ["/ month", "/ class", "/ term"] },
            { k: "style", label: "Card style", t: "select", opts: ["Standard", "Highlighted (rose)"] },
          ],
          v: [
            {
              name: "Small batch",
              who: "Live group class · up to 10 dancers",
              pros: "Learn alongside others, which keeps practice fun and motivating\nGroup choreography and formation work\nLower fee per class\nA fixed weekly timetable keeps you consistent",
              cons: "Class times are set, so less flexible\nThe teacher's attention is shared\nThe pace follows the group",
              price: "",
              per: "/ month",
              style: "Standard",
            },
            {
              name: "One-on-one",
              who: "Personal classes, just you and your teacher",
              pros: "Full attention and corrections as you dance\nLessons shaped around your goals: exams, arangetram or a performance\nTimings that fit your schedule\nMove at your own pace",
              cons: "Higher fee per class\nNo group practice or ensemble pieces",
              price: "",
              per: "/ class",
              style: "Highlighted (rose)",
            },
          ],
        },
      ],
    },
    {
      id: "trial",
      title: "Free trial class",
      desc: "The booking form and the slots visitors can pick.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Free trial class" },
        { k: "heading", label: "Heading", t: "text", v: "Try a class before you commit." },
        { k: "text", label: "Text", t: "area", v: "Pick a slot that suits you. Times are shown in your time zone, so you never have to convert." },
        {
          k: "slots",
          label: "Trial slots",
          t: "list",
          item: "Slot",
          items: "Slots",
          help: "Enter times in India time (IST). Visitors see them in their own time zone.",
          sub: [
            { k: "day", label: "Day", t: "select", opts: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
            { k: "time", label: "Time (IST)", t: "text", ph: "e.g. 6:00 pm" },
          ],
          v: [
            { day: "Monday", time: "4:00 pm" },
            { day: "Monday", time: "5:00 pm" },
            { day: "Monday", time: "6:00 pm" },
            { day: "Tuesday", time: "4:00 pm" },
            { day: "Tuesday", time: "5:00 pm" },
            { day: "Tuesday", time: "6:00 pm" },
            { day: "Thursday", time: "4:00 pm" },
            { day: "Thursday", time: "5:00 pm" },
            { day: "Thursday", time: "6:00 pm" },
          ],
        },
        { k: "to", label: "Send bookings to", t: "text", v: "+91 96632 52637", ph: "Email or WhatsApp number" },
      ],
    },
    {
      id: "portal",
      title: "Student portal",
      desc: "What students get between classes.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Student portal" },
        { k: "heading", label: "Heading", t: "text", v: "Everything you need between classes." },
        {
          k: "features",
          label: "Features",
          t: "list",
          item: "Feature",
          items: "Features",
          sub: [{ k: "text", label: "Feature", t: "text" }],
          v: [{ text: "Class recordings" }, { text: "Practice videos" }, { text: "Progress tracking" }, { text: "Certificates and exam milestones" }],
        },
        { k: "btn", label: "Button", t: "text", v: "Log in to the portal" },
        { k: "href", label: "Portal link", t: "text", v: "", ph: "https://…" },
        { k: "img", label: "Screenshot", t: "image", v: IMG.dashboard },
      ],
    },
    {
      id: "hubLink",
      title: "Natyashastra Hub banner",
      desc: "The maroon banner pointing students to the Hub.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "नाट्यशास्त्र" },
        { k: "heading", label: "Heading", t: "text", v: "Curious about the theory behind your steps?" },
        { k: "text", label: "Text", t: "text", v: "Rasa, abhinaya and mudras are explained in the Natyashastra Hub." },
        { k: "btn", label: "Button", t: "text", v: "Open the Natyashastra Hub" },
      ],
    },
  ],
};

const weddings: PageSchema = {
  key: "weddings",
  slug: "weddings",
  label: "Weddings",
  path: "/navaras-weddings",
  sections: [
    {
      id: "hero",
      title: "Top section",
      desc: "Headline, introduction and highlight reel.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "उत्सव · संगीत" },
        { k: "heading", label: "Heading", t: "area", help: HIGHLIGHT_HELP, v: "Choreographed for your *sangeet*." },
        {
          k: "text",
          label: "Introduction",
          t: "area",
          v: "Wedding choreography for couples and whole families — rehearsed online from wherever everyone lives, performed together on the day.",
        },
        { k: "b1", label: "First button", t: "text", v: "Get a quote" },
        { k: "b2", label: "Second button", t: "text", v: "Watch past sangeets" },
        { k: "video", label: "Highlight reel link", t: "text", v: "", ph: "YouTube or Vimeo link" },
        { k: "img", label: "Video thumbnail", t: "image", v: IMG.couple },
      ],
    },
    {
      id: "packages",
      title: "Packages",
      desc: "Packages by occasion, with prices.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Packages by occasion" },
        { k: "heading", label: "Heading", t: "text", v: "From one entrance to the whole show." },
        {
          k: "list",
          label: "Packages",
          t: "list",
          item: "Package",
          items: "Packages",
          sub: [
            { k: "name", label: "Package name", t: "text" },
            { k: "price", label: "Price", t: "text", ph: "e.g. ₹25,000" },
            { k: "style", label: "Card style", t: "select", opts: ["Standard", "Featured (maroon)"] },
            { k: "includes", label: "What’s included", t: "area", ph: "Number of songs, sessions, rehearsals…" },
          ],
          v: [
            { name: "Couple dance", price: "", style: "Standard", includes: "" },
            { name: "Bride or groom entry", price: "", style: "Standard", includes: "" },
            { name: "Family sangeet performances", price: "", style: "Standard", includes: "" },
            { name: "Full sangeet show", price: "", style: "Featured (maroon)", includes: "" },
          ],
        },
      ],
    },
    {
      id: "online",
      title: "Online choreography",
      desc: "How families in different cities rehearse.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Online choreography" },
        { k: "heading", label: "Heading", t: "text", v: "Rehearse apart. Perform together." },
        {
          k: "text",
          label: "Text",
          t: "area",
          v: "For families spread across cities and countries, each group learns its part from video tutorials and live online sessions. Everything comes together at the wedding.",
        },
        {
          k: "chips",
          label: "Highlights",
          t: "list",
          item: "Highlight",
          items: "Highlights",
          sub: [{ k: "label", label: "Highlight", t: "text" }],
          v: [{ label: "Video tutorials" }, { label: "Live sessions" }, { label: "In-person final run-through" }],
        },
        { k: "img", label: "Image", t: "image", v: IMG.videoCall },
      ],
    },
    {
      id: "steps",
      title: "How it works",
      desc: "The steps from first call to performance day.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "विधि" },
        { k: "heading", label: "Heading", t: "text", v: "How it works" },
        {
          k: "list",
          label: "Steps",
          t: "list",
          item: "Step",
          items: "Steps",
          help: "The last step is highlighted in saffron.",
          sub: [{ k: "title", label: "Step", t: "text" }],
          v: [
            { title: "Consultation" },
            { title: "Song selection" },
            { title: "Rehearsals, in person or online" },
            { title: "Final run-through" },
            { title: "Performance day" },
          ],
        },
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio & testimonials",
      desc: "Past sangeet videos and what couples said.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Portfolio" },
        { k: "heading", label: "Heading", t: "text", v: "Past sangeets" },
        {
          k: "videos",
          label: "Videos",
          t: "list",
          item: "Video",
          items: "Videos",
          sub: [
            { k: "title", label: "Title", t: "text", ph: "e.g. Priya & Arjun, Pune" },
            { k: "url", label: "Video link", t: "text", ph: "YouTube or Vimeo link" },
            { k: "img", label: "Thumbnail", t: "image" },
          ],
          v: [
            { title: "", url: "", img: IMG.couple },
            { title: "", url: "", img: IMG.group },
            { title: "", url: "", img: IMG.videoCall },
          ],
        },
        {
          k: "quotes",
          label: "Testimonials",
          t: "list",
          item: "Testimonial",
          items: "Testimonials",
          sub: [
            { k: "name", label: "Couple", t: "text" },
            { k: "city", label: "City", t: "text" },
            { k: "quote", label: "What they said", t: "area" },
          ],
          v: [
            { name: "", city: "", quote: "" },
            { name: "", city: "", quote: "" },
          ],
        },
      ],
    },
    {
      id: "quote",
      title: "Quote form",
      desc: "The enquiry form and where enquiries go.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Get a quote" },
        { k: "heading", label: "Heading", t: "text", v: "Tell us about your wedding." },
        { k: "btn", label: "Button", t: "text", v: "Send my inquiry" },
        { k: "waBtn", label: "WhatsApp button", t: "text", v: "Or chat on WhatsApp", help: "Uses the WhatsApp number from the landing page footer." },
        {
          k: "levels",
          label: "Skill level options",
          t: "list",
          item: "Option",
          items: "Options",
          sub: [{ k: "label", label: "Option", t: "text" }],
          v: [{ label: "Mostly beginners" }, { label: "Mixed" }, { label: "Mostly experienced" }],
        },
        { k: "to", label: "Send enquiries to", t: "text", v: "", ph: "Email or WhatsApp number" },
        { k: "bundle", label: "Bundle note", t: "area", v: "Bundle and save: add coordinated family outfits from Navaras Dresses." },
      ],
    },
  ],
};

const dresses: PageSchema = {
  key: "dresses",
  slug: "dresses",
  label: "Dresses",
  path: "/navaras-dresses",
  sections: [
    {
      id: "hero",
      title: "Top section",
      desc: "Headline and introduction.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "आहार्य अभिनय" },
        { k: "heading", label: "Heading", t: "area", help: HIGHLIGHT_HELP, v: "*Aharya*: the costume is part of the dance." },
        {
          k: "text",
          label: "Introduction",
          t: "area",
          v: "Rent a costume for the night, or have one stitched to your measurements — for stage, sangeet or arangetram.",
        },
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.costume },
      ],
    },
    {
      id: "catalogue",
      title: "Rental catalogue",
      desc: "Every costume in the rental shop, with its filters.",
      fields: [
        {
          k: "occasions",
          label: "Occasion filters",
          t: "list",
          item: "Occasion",
          items: "Occasions",
          sub: [{ k: "label", label: "Occasion", t: "text" }],
          v: OCCASIONS.map((label) => ({ label })),
        },
        { k: "sizes", label: "Sizes offered", t: "text", v: "XS, S, M, L, XL", help: "Separate sizes with commas." },
        {
          k: "items",
          label: "Costumes",
          t: "list",
          item: "Costume",
          items: "Costumes",
          sub: [
            { k: "name", label: "Costume name", t: "text" },
            { k: "occasion", label: "Occasion", t: "select", optsFrom: "occasions" },
            { k: "size", label: "Sizes", t: "text", ph: "e.g. S, M" },
            { k: "colour", label: "Colour", t: "select", opts: COLOURS },
            { k: "price", label: "Rental price", t: "text", ph: "e.g. ₹1,500" },
            { k: "period", label: "Rental period", t: "select", opts: ["per day", "per 3 days", "per week"] },
            { k: "status", label: "Availability", t: "select", opts: ["Available", "Booked", "Out for cleaning"] },
            { k: "img", label: "Photo", t: "image" },
          ],
          v: [
            { name: "", occasion: "Bharatanatyam", size: "", colour: "Pink", price: "", period: "per 3 days", status: "Available", img: IMG.costume },
            { name: "", occasion: "Kuchipudi", size: "", colour: "Gold", price: "", period: "per 3 days", status: "Available", img: IMG.costume2 },
            { name: "", occasion: "Semi-classical", size: "", colour: "Green", price: "", period: "per day", status: "Booked", img: IMG.costume3 },
          ],
        },
      ],
    },
    {
      id: "custom",
      title: "Custom stitching",
      desc: "The four steps, and the measurement guide.",
      fields: [
        { k: "heading", label: "Heading", t: "text", v: "Your costume, in four steps." },
        {
          k: "steps",
          label: "Steps",
          t: "list",
          item: "Step",
          items: "Steps",
          help: "The last step is shown in maroon with a booking button.",
          sub: [
            { k: "title", label: "Step", t: "text" },
            { k: "text", label: "Description", t: "area" },
            { k: "img", label: "Image", t: "image" },
          ],
          v: [
            { title: "Pick a style", text: "Bharatanatyam, Kuchipudi, semi-classical, bridal or sangeet.", img: IMG.costume3 },
            { title: "Choose your fabric", text: "Silk, colours and border options.", img: IMG.silk },
            { title: "Measure at home", text: "Follow the video, or download the printable chart.", img: IMG.costume2 },
            { title: "Book a consultation", text: "", img: IMG.costume },
          ],
        },
        { k: "video", label: "Measurement video link", t: "text", v: "", ph: "YouTube or Vimeo link" },
        { k: "chart", label: "Printable measurement chart", t: "text", v: "", ph: "Link to the PDF" },
        { k: "book", label: "Consultation booking link", t: "text", v: "", ph: "https://… or leave empty to use WhatsApp" },
      ],
    },
    {
      id: "arangetram",
      title: "Arangetram",
      desc: "Full-look coordination for a debut.",
      fields: [
        { k: "kicker", label: "Devanagari line", t: "text", v: "रंगप्रवेश" },
        { k: "heading", label: "Heading", t: "text", v: "Your debut, dressed from head to toe." },
        { k: "text", label: "Text", t: "area", v: "We coordinate the full look — costume, jewellery and makeup — so you can focus on the performance." },
        {
          k: "chips",
          label: "What’s included",
          t: "list",
          item: "Item",
          items: "Items",
          sub: [{ k: "label", label: "Item", t: "text" }],
          v: [{ label: "Costume" }, { label: "Jewellery" }, { label: "Makeup" }],
        },
        { k: "btn", label: "Button", t: "text", v: "Bundle with arangetram training" },
        { k: "img", label: "Image", t: "image", v: IMG.arangetram },
      ],
    },
    {
      id: "policies",
      title: "Rental policies",
      desc: "Clear terms shown before customers book.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Policies" },
        { k: "heading", label: "Heading", t: "text", v: "Clear terms, no surprises." },
        {
          k: "list",
          label: "Policies",
          t: "list",
          item: "Policy",
          items: "Policies",
          sub: [
            { k: "title", label: "Title", t: "text" },
            { k: "text", label: "Details", t: "area", ph: "Explain the policy in one or two sentences" },
          ],
          v: [
            { title: "Rental duration", text: "" },
            { title: "Deposit", text: "" },
            { title: "Cleaning", text: "" },
            { title: "Damage", text: "" },
            { title: "Alteration timelines", text: "" },
          ],
        },
      ],
    },
    {
      id: "perk",
      title: "Student perk",
      desc: "The discount for Navaras Dance students.",
      fields: [
        { k: "label", label: "Small label", t: "text", v: "Student perk" },
        { k: "heading", label: "Heading", t: "text", v: "Navaras Dance students get {discount} off rentals.", help: "{discount} is replaced with the discount below." },
        { k: "discount", label: "Discount", t: "text", v: "", ph: "e.g. 15%" },
        { k: "btn", label: "Button", t: "text", v: "Join a class" },
      ],
    },
  ],
};

export const PAGE_SCHEMAS: Record<PageKey, PageSchema> = { landing, dance, weddings, dresses };
export const PAGE_KEYS = Object.keys(PAGE_SCHEMAS) as PageKey[];

export function pageBySlug(slug: string): PageSchema | undefined {
  return PAGE_KEYS.map((k) => PAGE_SCHEMAS[k]).find((p) => p.slug === slug);
}

export function defaultPageDoc(schema: PageSchema): PageDoc {
  return Object.fromEntries(
    schema.sections.map((s) => [
      s.id,
      { visible: true, values: Object.fromEntries(s.fields.map((f) => [f.k, structuredClone(f.v)])) },
    ]),
  );
}

/** Fill sections and fields added to the schema after a document was saved. */
export function normalizePageDoc(schema: PageSchema, saved: PageDoc | undefined): PageDoc {
  const base = defaultPageDoc(schema);
  if (!saved) return base;
  for (const s of schema.sections) {
    const got = saved[s.id];
    if (!got) continue;
    base[s.id].visible = s.fixed ? true : got.visible !== false;
    for (const f of s.fields) {
      const v = got.values?.[f.k];
      if (f.t === "list" ? Array.isArray(v) : typeof v === "string") base[s.id].values[f.k] = v as FieldValue;
    }
  }
  return base;
}

/** Read helpers for the public pages. */
export function section(doc: PageDoc, id: string) {
  const s = doc[id];
  return {
    visible: s?.visible !== false,
    text: (k: string): string => {
      const v = s?.values[k];
      return typeof v === "string" ? v : "";
    },
    list: (k: string): ListItem[] => {
      const v = s?.values[k];
      return Array.isArray(v) ? v : [];
    },
  };
}
