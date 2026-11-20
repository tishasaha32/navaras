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

const DRESS_CATEGORIES = ["Anarkali", "Blouse", "Lehenga"];
const JEWELLERY_CATEGORIES = ["Temple Jewellery", "Heavy Earrings", "Mang Tika", "Earring and Mang Tika Set", "Necklace and Earring Set", "Full Set"];

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
        { k: "heading", label: "Heading", t: "area", help: HIGHLIGHT_HELP, v: "Dance, celebration and costume, rooted in the *Natyashastra*." },
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
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.homeHero },
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
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.homeHub },
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
              img: IMG.homeDance,
            },
            {
              title: "Celebrate",
              dev: "उत्सव",
              unit: "Navaras Weddings",
              btn: "Plan your sangeet",
              desc: "Sangeet and wedding choreography — even for families spread across countries.",
              href: "/navaras-weddings",
              img: IMG.homeWeddings,
            },
            {
              title: "Adorn",
              dev: "शृंगार",
              unit: "Navaras Dresses",
              btn: "Browse costumes",
              desc: "Costume rentals and custom stitching for stage, sangeet and arangetram.",
              href: "/navaras-dresses",
              img: IMG.homeDresses,
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
        { k: "wa", label: "WhatsApp number", t: "text", v: "+91 96632 52637", ph: "+91 …", help: "Also used by the Contact us page." },
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
        { k: "img", label: "Video thumbnail", t: "image", v: IMG.danceHero },
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
            { k: "img", label: "Picture", t: "image", help: "Left empty, each level shows its built-in lotus picture." },
          ],
          v: [
            { name: "Foundation", duration: "", covers: "", img: IMG.stageFoundation },
            { name: "Intermediate", duration: "", covers: "", img: IMG.stageIntermediate },
            { name: "Advanced", duration: "", covers: "", img: IMG.stageAdvanced },
            { name: "Performance", duration: "", covers: "", img: IMG.stagePerformance },
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
      id: "reviews",
      title: "Reviews",
      desc: "Video reviews from students and parents.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Reviews" },
        { k: "heading", label: "Heading", t: "text", v: "Hear it from our students." },
        {
          k: "list",
          label: "Videos",
          t: "list",
          item: "Video",
          items: "Videos",
          help: "Videos are kept in Firebase Storage under videos/.",
          sub: [
            { k: "video", label: "Video", t: "text", ph: "/videos/…" },
            { k: "name", label: "Who it’s from", t: "text" },
          ],
          v: [
            { video: "/videos/review-sample-4.mp4", name: "Tejal" },
            { video: "/videos/review-sample-5.mp4", name: "Shatakshi’s mother" },
          ],
        },
        {
          k: "quotes",
          label: "Written reviews",
          t: "list",
          item: "Review",
          items: "Reviews",
          sub: [
            { k: "text", label: "Review", t: "area" },
            { k: "name", label: "Who said it", t: "text" },
            { k: "from", label: "Class", t: "text", ph: "e.g. Online class" },
          ],
          v: [
            { text: "After I started learning from Tisha, I felt like I found my passion. You get so crazy for something that it makes you happy, and you look forward to it the whole week. If this went out of my life, my life would be useless.", name: "Online student", from: "Online class" },
            { text: "When I watch dance videos, I imagine myself in them, and think that one day I could dance like that too.", name: "Mahima Chakravarti", from: "Online class · translated from Hindi" },
            { text: "For me, dancing is happy. Happy!", name: "Aparna A.V.", from: "Online class" },
            { text: "I just like it. I enjoy dance.", name: "Tejal Alai", from: "Online class" },
            { text: "It’s been really nice with Tisha Ma’am. She’s been very patient with me, and she can break down any complex step into simple, easy-to-do fragments.", name: "Student", from: "Weekend semi-classical class, Bangalore" },
            { text: "She’s very helpful, and I aspire to learn the grace that she has.", name: "Student", from: "Weekend semi-classical class, Bangalore" },
            { text: "The class is fun and welcoming, and people are easy to get along with.", name: "Student", from: "Weekend semi-classical class, Bangalore" },
            { text: "After having a baby it’s difficult, but I’m enjoying it so much.", name: "Student and new mother", from: "Weekend semi-classical class, Bangalore" },
            { text: "I really like the class and the trainer. It feels very good to learn from Tisha Ma’am.", name: "Student", from: "Weekend semi-classical class, Bangalore" },
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
        { k: "video", label: "Video", t: "text", v: "/videos/student-portal.mp4", ph: "/videos/…", help: "Shown instead of the screenshot. Videos are kept in Firebase Storage under videos/." },
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
        { k: "reel", label: "Hero video", t: "text", v: "/videos/weddings-hero.mp4", ph: "/videos/…", help: "Plays muted and looping in the arch, instead of the picture. Videos are kept in Firebase Storage under videos/." },
        { k: "video", label: "Highlight reel link", t: "text", v: "", ph: "YouTube or Vimeo link", help: "Only used when there is no hero video." },
        { k: "img", label: "Picture", t: "image", v: IMG.couple, help: "Shown when there is no hero video." },
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
            { k: "img", label: "Picture", t: "image" },
          ],
          v: [
            { name: "Couple dance", price: "", style: "Standard", includes: "", img: IMG.packageCouple },
            { name: "Bride or groom entry", price: "", style: "Standard", includes: "", img: IMG.packageEntry },
            { name: "Family sangeet performances", price: "", style: "Standard", includes: "", img: IMG.packageFamily },
            { name: "Full sangeet show", price: "", style: "Featured (maroon)", includes: "", img: IMG.packageShow },
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
        { k: "video", label: "Video", t: "text", v: "/videos/weddings-intro.mp4", ph: "/videos/…", help: "Shown at its full shape instead of the picture. Videos are kept in Firebase Storage under videos/." },
        { k: "img", label: "Picture", t: "image", v: IMG.videoCall, help: "Shown when there is no video." },
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
          help: "Videos kept in Firebase Storage under videos/ play in a sideways-scrolling row. A YouTube or Vimeo link with a thumbnail shows as a picture instead.",
          sub: [
            { k: "title", label: "Title", t: "text", ph: "e.g. Priya & Arjun, Pune" },
            { k: "video", label: "Video", t: "text", ph: "/videos/…" },
            { k: "url", label: "Or a video link", t: "text", ph: "YouTube or Vimeo link" },
            { k: "img", label: "Thumbnail for a link", t: "image" },
          ],
          v: [
            { title: "Bride’s solo", video: "/videos/sangeet-bride-solo.mp4", url: "", img: "" },
            { title: "Couple dance", video: "/videos/sangeet-couple-1.mp4", url: "", img: "" },
            { title: "Couple dance", video: "/videos/sangeet-couple-2.mp4", url: "", img: "" },
            { title: "Family performance", video: "/videos/sangeet-family.mp4", url: "", img: "" },
            { title: "Friend’s performance", video: "/videos/sangeet-friend.mp4", url: "", img: "" },
            { title: "Guest performance", video: "/videos/sangeet-guest.mp4", url: "", img: "" },
            { title: "Kid’s performance", video: "/videos/sangeet-kid.mp4", url: "", img: "" },
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
        { k: "waBtn", label: "WhatsApp button", t: "text", v: "Or chat on WhatsApp", help: "Uses the WhatsApp number from the landing page footer, or else the number below." },
        {
          k: "levels",
          label: "Skill level options",
          t: "list",
          item: "Option",
          items: "Options",
          sub: [{ k: "label", label: "Option", t: "text" }],
          v: [{ label: "Mostly beginners" }, { label: "Mixed" }, { label: "Mostly experienced" }],
        },
        { k: "to", label: "Send enquiries to", t: "text", v: "+91 96632 52637", ph: "Email or WhatsApp number" },
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
        { k: "btn", label: "Button", t: "text", v: "Book us now", help: "Jumps to the custom stitching section." },
        { k: "reel", label: "Hero video", t: "text", v: "/videos/dresses-hero.mp4", ph: "/videos/…", help: "Plays muted and looping in the arch, instead of the picture. Videos are kept in Firebase Storage under videos/." },
        { k: "img", label: "Image (arched frame)", t: "image", v: IMG.costume, help: "Shown when there is no hero video." },
      ],
    },
    {
      id: "catalogue",
      title: "Rental catalogue",
      desc: "Every costume in the rental shop, with its filters.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Rental" },
        { k: "heading", label: "Heading", t: "text", v: "Rent a costume or jewellery for the day." },
        {
          k: "categories",
          label: "Category filters",
          t: "list",
          item: "Category",
          items: "Categories",
          sub: [{ k: "label", label: "Category", t: "text" }],
          v: DRESS_CATEGORIES.map((label) => ({ label })),
        },
        {
          k: "items",
          label: "Costumes",
          t: "list",
          item: "Costume",
          items: "Costumes",
          help: "Prices are from the Navaras Dresses price list. Photos are kept in Firebase Storage under images/dress-….",
          sub: [
            { k: "code", label: "Product ID", t: "text", ph: "e.g. A001" },
            { k: "name", label: "Costume name", t: "text" },
            { k: "category", label: "Category", t: "select", optsFrom: "categories" },
            { k: "size", label: "Sizes", t: "text", ph: "e.g. S, M" },
            { k: "price", label: "Rental price", t: "text", ph: "e.g. ₹1,500" },
            { k: "period", label: "Rental period", t: "select", opts: ["per day", "per 3 days", "per week"] },
            { k: "sale", label: "Sale price", t: "text", ph: "e.g. ₹1,500 with fabric, ₹1,000 without" },
            { k: "status", label: "Availability", t: "select", opts: ["Available", "Booked", "Out for cleaning"] },
            { k: "img", label: "Photo", t: "image" },
          ],
          v: [
            { code: "A001", name: "Purple Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,500 with fabric, ₹1,000 without", status: "", img: "/images/dress-a001.jpg" },
            { code: "A002", name: "Bottle Green Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,500 with fabric, ₹1,000 without", status: "", img: "/images/dress-a002.jpg" },
            { code: "A003", name: "Red Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,500 with fabric, ₹1,000 without", status: "", img: "/images/dress-a003.jpg" },
            { code: "A004", name: "Navy Blue Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,500 with fabric, ₹1,000 without", status: "", img: "/images/dress-a004.jpg" },
            { code: "A005", name: "Maroon Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a005.jpg" },
            { code: "A006", name: "Orange Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a006.jpg" },
            { code: "A007", name: "White Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹2,800 with fabric, ₹1,200 without", status: "", img: "/images/dress-a007.jpg" },
            { code: "A008", name: "Teal Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a008.jpg" },
            { code: "A009", name: "Turquoise Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a009.jpg" },
            { code: "A010", name: "White and Red Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a010.jpg" },
            { code: "A011", name: "Black Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,500 with fabric, ₹1,000 without", status: "", img: "/images/dress-a011.jpg" },
            { code: "A012", name: "Maroon and Gold Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "", status: "", img: "/images/dress-a012.jpg" },
            { code: "A013", name: "Dark Purple Anarkali", category: "Anarkali", size: "", price: "₹600", period: "per day", sale: "₹1,800 with fabric, ₹1,500 without", status: "", img: "/images/dress-a013.jpg" },
            { code: "L001", name: "Multicolour Lehenga", category: "Lehenga", size: "", price: "₹500", period: "per day", sale: "₹1,300 with fabric, ₹1,000 without", status: "", img: "/images/dress-l001.jpg" },
            { code: "L002", name: "Crimson Lehenga", category: "Lehenga", size: "", price: "₹550", period: "per day", sale: "₹3,000 with fabric, ₹1,500 without", status: "", img: "/images/dress-l002.jpg" },
            { code: "L003", name: "Green Lehenga", category: "Lehenga", size: "", price: "₹500", period: "per day", sale: "", status: "", img: "/images/dress-l003.jpg" },
            { code: "L004", name: "Royal Blue Lehenga", category: "Lehenga", size: "", price: "₹450", period: "per day", sale: "₹1,200 with fabric, ₹800 without", status: "", img: "/images/dress-l004.jpg" },
            { code: "L005", name: "Bottle Green Lehenga", category: "Lehenga", size: "", price: "₹500", period: "per day", sale: "₹2,000 with fabric, ₹1,000 without", status: "", img: "/images/dress-l005.jpg" },
            { code: "L006", name: "Red and Green Lehenga", category: "Lehenga", size: "", price: "₹500", period: "per day", sale: "", status: "", img: "/images/dress-l006.jpg" },
            { code: "L007", name: "Orange Lehenga", category: "Lehenga", size: "", price: "₹450", period: "per day", sale: "", status: "", img: "/images/dress-l007.jpg" },
            { code: "L008", name: "Magenta Lehenga", category: "Lehenga", size: "", price: "₹450", period: "per day", sale: "₹1,300 with fabric, ₹1,000 without", status: "", img: "/images/dress-l008.jpg" },
            { code: "L009", name: "Peach and Red Lehenga", category: "Lehenga", size: "", price: "₹550", period: "per day", sale: "₹3,000 with fabric, ₹1,500 without", status: "", img: "/images/dress-l009.jpg" },
            { code: "L010", name: "Red Lehenga", category: "Lehenga", size: "", price: "₹400", period: "per day", sale: "", status: "", img: "/images/dress-l010.jpg" },
            { code: "L011", name: "Coral Red Lehenga", category: "Lehenga", size: "", price: "₹500", period: "per day", sale: "₹2,500 with fabric, ₹1,200 without", status: "", img: "/images/dress-l011.jpg" },
            { code: "L012", name: "Black Lehenga", category: "Lehenga", size: "", price: "₹400", period: "per day", sale: "₹1,200 with fabric, ₹800 without", status: "", img: "/images/dress-l012.jpg" },
            { code: "L013", name: "Red and Blue Lehenga", category: "Lehenga", size: "", price: "₹400 (big), ₹300 (small)", period: "per day", sale: "", status: "", img: "/images/dress-l013.jpg" },
            { code: "L014", name: "Deep Red Lehenga", category: "Lehenga", size: "", price: "₹400 (big), ₹300 (small)", period: "per day", sale: "", status: "", img: "/images/dress-l014.jpg" },
            { code: "L015", name: "Dark Red Lehenga", category: "Lehenga", size: "", price: "₹400", period: "per day", sale: "", status: "", img: "/images/dress-l015.jpg" },
            { code: "L016", name: "Red and Gold Lehenga", category: "Lehenga", size: "", price: "₹400", period: "per day", sale: "", status: "", img: "/images/dress-l016.jpg" },
            { code: "L017", name: "White and Gold Lehenga", category: "Lehenga", size: "", price: "₹400", period: "per day", sale: "", status: "", img: "/images/dress-l017.jpg" },
            { code: "L018", name: "Pink and Gold Lehenga", category: "Lehenga", size: "", price: "₹700", period: "per day", sale: "", status: "", img: "/images/dress-l018.jpg" },
            { code: "B001", name: "Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b001.jpg" },
            { code: "B002", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b002.jpg" },
            { code: "B003", name: "Black and Multicolour Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b003.jpg" },
            { code: "B004", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b004.jpg" },
            { code: "B005", name: "Maroon Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b005.jpg" },
            { code: "B006", name: "Pink Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b006.jpg" },
            { code: "B007", name: "Yellow Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b007.jpg" },
            { code: "B008", name: "Green Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b008.jpg" },
            { code: "B009", name: "Royal Blue Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b009.jpg" },
            { code: "B010", name: "Sea Green Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b010.jpg" },
            { code: "B011", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b011.jpg" },
            { code: "B012", name: "White Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b012.jpg" },
            { code: "B013", name: "Royal Blue Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b013.jpg" },
            { code: "B014", name: "Pastel Yellow Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b014.jpg" },
            { code: "B015", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b015.jpg" },
            { code: "B016", name: "Maroon Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b016.jpg" },
            { code: "B017", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b017.jpg" },
            { code: "B018", name: "Navy Blue Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b018.jpg" },
            { code: "B019", name: "Navy Blue Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b019.jpg" },
            { code: "B020", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b020.jpg" },
            { code: "B021", name: "Red Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b021.jpg" },
            { code: "B022", name: "Bottle Green Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b022.jpg" },
            { code: "B023", name: "Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b023.jpg" },
            { code: "B024", name: "Bottle Green Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b024.jpg" },
            { code: "B025", name: "Cream Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b025.jpg" },
            { code: "B026", name: "Teal Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b026.jpg" },
            { code: "B027", name: "Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b027.jpg" },
            { code: "B028", name: "Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b028.jpg" },
            { code: "B029", name: "Green Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b029.jpg" },
            { code: "B030", name: "Silver Grey Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b030.jpg" },
            { code: "B031", name: "Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b031.jpg" },
            { code: "B032", name: "Multicolour Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b032.jpg" },
            { code: "B033", name: "White Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b033.jpg" },
            { code: "B034", name: "Yellow and Black Blouse", category: "Blouse", size: "", price: "₹50", period: "per day", sale: "", status: "", img: "/images/dress-b034.jpg" },
          ],
        },
      ],
    },
    {
      id: "jewellery",
      title: "Jewellery",
      desc: "Jewellery for rent or sale, with its category filter.",
      fields: [
        {
          k: "categories",
          label: "Category filters",
          t: "list",
          item: "Category",
          items: "Categories",
          sub: [{ k: "label", label: "Category", t: "text" }],
          v: JEWELLERY_CATEGORIES.map((label) => ({ label })),
        },
        {
          k: "items",
          label: "Pieces",
          t: "list",
          item: "Piece",
          items: "Pieces",
          help: "Photos are kept in Firebase Storage under images/jewel-….",
          sub: [
            { k: "code", label: "Product ID", t: "text", ph: "e.g. MT001" },
            { k: "name", label: "Name", t: "text" },
            { k: "category", label: "Category", t: "select", optsFrom: "categories" },
            { k: "price", label: "Rental price", t: "text", ph: "e.g. ₹300" },
            { k: "period", label: "Rental period", t: "select", opts: ["per day", "per 3 days", "per week"] },
            { k: "sale", label: "Sale price", t: "text", ph: "e.g. ₹1,500" },
            { k: "status", label: "Availability", t: "select", opts: ["Available", "Booked", "Out for cleaning"] },
            { k: "img", label: "Photo", t: "image" },
          ],
          v: [
            { code: "T001", name: "Gold Temple Necklace Set", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t001.jpg" },
            { code: "T002", name: "Gold and Ruby Temple Bangles", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t002.jpg" },
            { code: "T003", name: "Gold Temple Armlet", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t003.jpg" },
            { code: "T004", name: "Pearl and Gold Temple Necklace", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t004.jpg" },
            { code: "T005", name: "Gold Temple Waist Belt", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t005.jpg" },
            { code: "T006", name: "Gold Temple Earrings and Mang Tika", category: "Temple Jewellery", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-t006.jpg" },
            { code: "HE001", name: "Rose Gold Heavy Earrings", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he001.jpg" },
            { code: "HE002", name: "Silver and Pearl Heavy Earrings", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he002.jpg" },
            { code: "HE003", name: "Gold Kundan Heavy Earrings", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he003.jpg" },
            { code: "HE004", name: "Gold and Multicolour Heavy Earrings", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he004.jpg" },
            { code: "HE005", name: "Gold Pearl Jhumkas", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he005.jpg" },
            { code: "HE006", name: "Gold Chandbali Jhumkas", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he006.jpg" },
            { code: "HE007", name: "Gold and Pearl Heavy Earrings", category: "Heavy Earrings", price: "₹50", period: "per day", sale: "", status: "", img: "/images/jewel-he007.jpg" },
            { code: "MT001", name: "Rose Gold Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt001.jpg" },
            { code: "MT002", name: "Silver Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt002.jpg" },
            { code: "MT003", name: "Gold and Multicolour Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt003.jpg" },
            { code: "MT004", name: "Gold Pearl Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt004.jpg" },
            { code: "MT005", name: "Silver Pearl Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt005.jpg" },
            { code: "MT006", name: "Peach Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt006.jpg" },
            { code: "MT007", name: "Gold Kundan Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt007.jpg" },
            { code: "MT008", name: "Gold and White Stone Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt008.jpg" },
            { code: "MT009", name: "Silver and Mint Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt009.jpg" },
            { code: "MT010", name: "Blush Pink Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt010.jpg" },
            { code: "MT012", name: "Antique Gold Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt012.jpg" },
            { code: "MT013", name: "Bright Gold Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt013.jpg" },
            { code: "MT014", name: "Gold Kundan and Pearl Mang Tika", category: "Mang Tika", price: "₹30", period: "per day", sale: "", status: "", img: "/images/jewel-mt014.jpg" },
            { code: "EMT001", name: "Gold Temple Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt001.jpg" },
            { code: "EMT002", name: "Rose Gold Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt002.jpg" },
            { code: "EMT003", name: "Gold and Multicolour Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt003.jpg" },
            { code: "EMT004", name: "Gold Kundan Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt004.jpg" },
            { code: "EMT005", name: "Silver Pearl Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt005.jpg" },
            { code: "EMT006", name: "Blush Pink Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt006.jpg" },
            { code: "EMT007", name: "Silver and Mint Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt007.jpg" },
            { code: "EMT008", name: "Peach Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt008.jpg" },
            { code: "EMT009", name: "Gold Pearl Earring and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt009.jpg" },
            { code: "EMT010", name: "Gold Kundan Jhumka and Mang Tika Set", category: "Earring and Mang Tika Set", price: "₹80", period: "per day", sale: "", status: "", img: "/images/jewel-emt010.jpg" },
            { code: "NE001", name: "Silver and Pink Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne001.jpg" },
            { code: "NE002", name: "Silver and Green Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne002.jpg" },
            { code: "NE003", name: "Silver Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne003.jpg" },
            { code: "NE004", name: "Gold Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne004.jpg" },
            { code: "NE005", name: "Gold Pearl Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne005.jpg" },
            { code: "NE006", name: "Pearl and Gold Temple Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne006.jpg" },
            { code: "NE007", name: "Gold Kundan Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne007.jpg" },
            { code: "NE008", name: "Antique Gold Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne008.jpg" },
            { code: "NE009", name: "Gold Peacock Necklace and Earring Set", category: "Necklace and Earring Set", price: "₹120", period: "per day", sale: "", status: "", img: "/images/jewel-ne009.jpg" },
            { code: "FS001", name: "Gold and Pink Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs001.jpg" },
            { code: "FS002", name: "Silver and Mint Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs002.jpg" },
            { code: "FS003", name: "Rose Gold Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs003.jpg" },
            { code: "FS004", name: "Gold Pearl Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs004.jpg" },
            { code: "FS005", name: "Gold and Multicolour Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs005.jpg" },
            { code: "FS006", name: "Gold Kundan Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs006.jpg" },
            { code: "FS007", name: "Silver Pearl Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs007.jpg" },
            { code: "FS008", name: "Copper Full Set", category: "Full Set", price: "₹200", period: "per day", sale: "", status: "", img: "/images/jewel-fs008.jpg" },
          ],
        },
      ],
    },
    {
      id: "custom",
      title: "Custom stitching",
      desc: "The four steps, and the measurement guide.",
      fields: [
        { k: "eyebrow", label: "Small label", t: "text", v: "Custom stitching" },
        { k: "heading", label: "Heading", t: "text", v: "Your costume, in four steps." },
        {
          k: "steps",
          label: "Steps",
          t: "list",
          item: "Step",
          items: "Steps",
          help: "The last step is shown in maroon, with a button that jumps to the enquiry form.",
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
        { k: "to", label: "Send enquiries to", t: "text", v: "+91 96632 52637", ph: "Email or WhatsApp number", help: "The enquiry form below the steps opens a WhatsApp chat (or an email) with this." },
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
