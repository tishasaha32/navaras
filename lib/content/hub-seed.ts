import { assignSlugs, lessonBody, type Chapter, type Hub, type HubSection, type Question, type Quiz } from "./hub";
import { IMG } from "./images-builtin";

/** Initial Natyashastra Hub content, written to the content file the first time the site runs. */

type RawChapter = [id: string, title: string, summary: string, points: string[]];
type RawQuiz = [id: string, title: string, type: string, questions: [text: string, options: string[], answer: number, explain: string][]];
type RawSection = {
  id: string;
  cat: string;
  title: string;
  dev: string;
  desc: string;
  img: string;
  pool: string[];
  chapters: RawChapter[];
  quizzes: RawQuiz[];
};

const raw: RawSection[] = [
  {
    id: "introduction-to-rasa",
    cat: "rasa",
    title: "Introduction to Rasa",
    dev: "रस",
    img: IMG.classical,
    pool: [IMG.classical, IMG.blue, IMG.group],
    desc: "What rasa is, how it is born, and the lasting emotions behind it.",
    chapters: [
      [
        "what-is-rasa",
        "What is rasa?",
        "Rasa literally means juice or essence. In the Natyashastra, traditionally attributed to the sage Bharata Muni, it is the emotional flavour the audience tastes when a performance succeeds.",
        [
          "Rasa is experienced by the audience, the rasika.",
          "The dancer evokes rasa by portraying bhava — the emotions of the character.",
          "Bharata sets out the idea in the sixth chapter of the Natyashastra.",
        ],
      ],
      [
        "rasa-sutra",
        "The rasa sutra",
        "Bharata explains in one line how rasa is born: it arises from the combination of vibhava, anubhava and vyabhichari bhava.",
        [
          "Vibhava — the causes: the character or object (alambana) and the setting that heightens the feeling (uddipana).",
          "Anubhava — the visible responses: glances, gestures and movements.",
          "Vyabhichari bhava — passing emotions such as doubt, pride or anxiety. The Natyashastra lists 33 of them.",
        ],
      ],
      [
        "sthayi-bhava",
        "Sthayi bhava",
        "Each rasa grows out of a lasting emotion, its sthayi bhava — rati (love) for Shringara, hasa (mirth) for Hasya, shoka (grief) for Karuna, and so on.",
        ["Sthayi means lasting: these emotions stay underneath the passing ones.", "The dancer builds the sthayi bhava until the audience tastes the rasa."],
      ],
    ],
    quizzes: [
      [
        "q-rasa-check",
        "Quick check",
        "Multiple choice",
        [
          ["Who experiences rasa?", ["The dancer", "The audience (rasika)", "The musicians"], 1, "Rasa is the flavour the audience tastes. The dancer portrays bhava so that the rasika can experience rasa."],
          [
            "The Natyashastra is traditionally attributed to which sage?",
            ["Nandikeshvara", "Abhinavagupta", "Bharata Muni"],
            2,
            "The Natyashastra is traditionally attributed to Bharata Muni. Abhinavagupta wrote a famous commentary on it, and Nandikeshvara wrote the Abhinaya Darpana.",
          ],
          [
            "According to the rasa sutra, rasa arises from vibhava, anubhava and…",
            ["Vyabhichari bhava", "Sattvika abhinaya", "Aharya"],
            0,
            "The rasa sutra says rasa is born from the combination of vibhava, anubhava and vyabhichari bhava.",
          ],
          ["What is the sthayi bhava (lasting emotion) of Shringara?", ["Hasa", "Rati", "Shoka"], 1, "Rati, love, is the lasting emotion behind Shringara. Hasa belongs to Hasya and shoka to Karuna."],
          ["How many vyabhichari bhavas does the Natyashastra list?", ["8", "33", "9"], 1, "The Natyashastra lists 33 vyabhichari bhavas — passing emotions such as doubt, pride and anxiety."],
        ],
      ],
      [
        "q-rasa-match",
        "Match the terms",
        "Match the pairs",
        [
          ["Vibhava means…", ["The causes of an emotion", "The visible responses", "A passing emotion"], 0, "Vibhava is the cause: the character or object, and the setting that heightens the feeling."],
          ["Glances, gestures and movements are…", ["Vibhava", "Anubhava", "Sthayi bhava"], 1, "Anubhava are the visible responses that show an emotion."],
          ["Shoka (grief) is the lasting emotion of…", ["Hasya", "Karuna", "Veera"], 1, "Shoka is the sthayi bhava behind Karuna, the rasa of compassion."],
        ],
      ],
    ],
  },
  {
    id: "the-nine-rasas",
    cat: "rasa",
    title: "The Nine Rasas",
    dev: "नवरस",
    img: IMG.online,
    pool: [IMG.online, IMG.blue, IMG.classical],
    desc: "Each of the nine rasas, its lasting emotion and how a dancer shows it.",
    chapters: [
      [
        "shringara-hasya",
        "Shringara and Hasya",
        "Shringara is love and beauty, born of rati (love). Hasya is laughter and joy, born of hasa (mirth).",
        ["Shringara is often called rasaraja, the king of rasas.", "Hasya can be shown subtly, with a smile, or broadly, with laughter."],
      ],
      [
        "karuna-raudra",
        "Karuna and Raudra",
        "Karuna is compassion and sorrow, born of shoka (grief). Raudra is fury, born of krodha (anger).",
        ["Karuna moves the audience through loss and separation.", "Raudra shows in reddened eyes, a furrowed brow and forceful movement."],
      ],
      [
        "veera-bhayanaka",
        "Veera and Bhayanaka",
        "Veera is courage and heroism, born of utsaha (energy). Bhayanaka is fear, born of bhaya.",
        ["Veera is shown through firm posture and resolve.", "Bhayanaka shows in trembling, darting eyes and shrinking back."],
      ],
      [
        "bibhatsa-adbhuta",
        "Bibhatsa and Adbhuta",
        "Bibhatsa is disgust, born of jugupsa (aversion). Adbhuta is wonder, born of vismaya (astonishment).",
        ["Bibhatsa turns the face and body away.", "Adbhuta shows in wide eyes and raised eyebrows."],
      ],
      [
        "shanta",
        "Shanta",
        "Shanta is peace, born of shama (tranquillity). The Natyashastra describes eight rasas; later scholars, most famously Abhinavagupta, argued for Shanta as the ninth.",
        ["Shanta is the absence of agitation — calm, detached and complete."],
      ],
    ],
    quizzes: [
      [
        "q-nine-identify",
        "Identify the rasa",
        "Watch and answer",
        [
          ["Which rasa is born of vismaya (astonishment)?", ["Adbhuta", "Bhayanaka", "Hasya"], 0, "Adbhuta, wonder, grows out of vismaya — astonishment."],
          ["Reddened eyes, a furrowed brow and forceful movement show…", ["Karuna", "Raudra", "Shanta"], 1, "These are the signs of Raudra, the rasa of fury, born of krodha (anger)."],
          ["Which rasa is often called rasaraja, the king of rasas?", ["Veera", "Shringara", "Adbhuta"], 1, "Shringara, the rasa of love and beauty, is often called rasaraja."],
        ],
      ],
      [
        "q-nine-cards",
        "Rasa flashcards",
        "Flashcards",
        [
          ["Utsaha (energy) is the lasting emotion of…", ["Veera", "Bibhatsa", "Hasya"], 0, "Veera, courage and heroism, is born of utsaha."],
          ["Which scholar argued for Shanta as the ninth rasa?", ["Bharata Muni", "Abhinavagupta", "Nandikeshvara"], 1, "The Natyashastra describes eight rasas; Abhinavagupta famously argued for Shanta as the ninth."],
        ],
      ],
    ],
  },
  {
    id: "the-four-abhinayas",
    cat: "abhinaya",
    title: "The Four Abhinayas",
    dev: "अभिनय",
    img: IMG.blue,
    pool: [IMG.blue, IMG.costume, IMG.group],
    desc: "Angika, vachika, aharya and sattvika — the four ways a performer expresses.",
    chapters: [
      [
        "angika",
        "Angika abhinaya",
        "Expression through the body: the head, eyes, hands, torso and feet.",
        [
          "The body is divided into anga (major limbs), pratyanga (minor limbs) and upanga (features such as the eyes and eyebrows).",
          "Hasta mudras are part of angika abhinaya.",
        ],
      ],
      [
        "vachika",
        "Vachika abhinaya",
        "Expression through speech, song and rhythm.",
        ["In dance, vachika lives in the lyrics and music the dancer interprets.", "The dancer brings the words of the song to life through abhinaya."],
      ],
      [
        "aharya",
        "Aharya abhinaya",
        "Expression through costume, makeup, jewellery and the stage setting.",
        ["Aharya tells the audience who a character is before a single step is danced.", "Classical costumes, temple jewellery and makeup are all aharya."],
      ],
      [
        "sattvika",
        "Sattvika abhinaya",
        "Expression of inner emotion that shows involuntarily — the hardest abhinaya to teach.",
        [
          "The Natyashastra lists eight sattvika bhavas, including tears, trembling, perspiration and change of colour.",
          "It is what makes an audience believe the emotion is real.",
        ],
      ],
    ],
    quizzes: [
      [
        "q-abhi-check",
        "Quick check",
        "Multiple choice",
        [
          ["Costume and makeup belong to which abhinaya?", ["Angika", "Aharya", "Sattvika"], 1, "Aharya abhinaya is expression through costume, makeup, jewellery and the stage setting."],
          ["Hasta mudras are part of…", ["Angika abhinaya", "Vachika abhinaya", "Aharya abhinaya"], 0, "Mudras are expression through the body, so they belong to angika abhinaya."],
        ],
      ],
      [
        "q-abhi-match",
        "Which abhinaya?",
        "Match the pairs",
        [
          ["Tears and trembling that show involuntarily are…", ["Sattvika", "Vachika", "Angika"], 0, "Sattvika abhinaya is inner emotion that shows involuntarily."],
          ["The lyrics and music a dancer interprets are…", ["Aharya", "Vachika", "Sattvika"], 1, "Vachika abhinaya is expression through speech, song and rhythm."],
        ],
      ],
    ],
  },
  {
    id: "asamyuta-hastas",
    cat: "mudra",
    title: "Asamyuta Hastas",
    dev: "असंयुत हस्त",
    img: IMG.mudra,
    pool: [IMG.mudra, IMG.classical, IMG.online],
    desc: "Single-hand gestures, each with its shape, uses and shloka.",
    chapters: [
      [
        "pataka",
        "Pataka — flag",
        "All fingers held straight and together, with the thumb bent. Used at the start of a dance, and to show clouds, a forest or a blessing.",
        ["Each hasta has several uses, called viniyoga.", "Learn the shloka along with the shape."],
      ],
      ["tripataka", "Tripataka — three parts of a flag", "Pataka with the ring finger bent. Shows a crown, a tree or a flame.", ["Keep the other fingers straight and together."]],
      ["ardhapataka", "Ardhapataka — half flag", "Tripataka with the little finger also bent. Shows tender leaves, a knife or a flag.", ["Only the index and middle fingers stay straight, with the thumb."]],
      [
        "kartarimukha",
        "Kartarimukha — scissors’ face",
        "The index and middle fingers spread apart like the blades of scissors. Shows separation, lightning or the corner of the eye.",
        ["The ring and little fingers fold, held by the thumb."],
      ],
      [
        "mayura",
        "Mayura — peacock",
        "The ring finger touches the thumb while the other fingers stay straight. Shows a peacock, a creeper or applying a tilak.",
        ["The shape echoes a peacock’s head and crest."],
      ],
      [
        "ardhachandra",
        "Ardhachandra — half moon",
        "Pataka with the thumb stretched away from the fingers. Shows the crescent moon, a spear or meditation.",
        ["The gap between thumb and fingers forms the crescent."],
      ],
    ],
    quizzes: [
      [
        "q-asam-name",
        "Name the mudra",
        "Picture quiz",
        [
          ["In Pataka, which finger is bent?", ["The thumb", "The ring finger", "The little finger"], 0, "In Pataka all fingers are straight and together, with only the thumb bent."],
          ["Which hasta shows a peacock?", ["Mayura", "Tripataka", "Kartarimukha"], 0, "Mayura means peacock: the ring finger touches the thumb."],
        ],
      ],
      [
        "q-asam-shloka",
        "Shloka recall",
        "Fill in the blanks",
        [
          ["The uses of a hasta are called…", ["Viniyoga", "Shloka", "Bhava"], 0, "Each hasta has several uses, called viniyoga."],
          ["Ardhachandra means…", ["Half flag", "Half moon", "Scissors’ face"], 1, "Ardhachandra is the half moon: the thumb stretches away from the fingers."],
        ],
      ],
    ],
  },
  {
    id: "samyuta-hastas",
    cat: "mudra",
    title: "Samyuta Hastas",
    dev: "संयुत हस्त",
    img: IMG.group,
    pool: [IMG.group, IMG.mudra, IMG.blue],
    desc: "Double-hand gestures that join both hands into one meaning.",
    chapters: [
      [
        "anjali",
        "Anjali — salutation",
        "Two pataka hands joined palm to palm. Held above the head for the gods, before the face for teachers, and at the chest in greeting.",
        ["Often the first samyuta hasta a student learns."],
      ],
      ["kapota", "Kapota — dove", "Anjali with the palms slightly hollowed and joined at the edges. Shows respectful conversation or humble agreement.", ["The hollow between the palms gives the dove its shape."]],
      ["karkata", "Karkata — crab", "The fingers of both hands interlocked. Shows a crowd arriving, stretching, or the blowing of a conch.", ["The interlocked fingers suggest the crab’s legs."]],
      ["swastika", "Swastika — crossed", "Two pataka hands crossed at the wrists. Among its uses, it shows a crocodile.", ["Keep both hands flat as you cross them."]],
      ["dola", "Dola — swing", "Both pataka hands hang loosely beside the thighs. Used at the beginning of a dance.", ["The arms are relaxed, like a swing at rest."]],
      ["pushpaputa", "Pushpaputa — flower casket", "Two cupped hands joined at the sides. Shows offering flowers or water, as in pushpanjali.", ["The cupped hands form a bowl of flowers."]],
    ],
    quizzes: [
      [
        "q-sam-name",
        "Name the mudra",
        "Picture quiz",
        [
          ["Which hasta is used to salute the gods, teachers and elders?", ["Karkata", "Anjali", "Dola"], 1, "Anjali — two pataka hands joined palm to palm — is the gesture of salutation."],
          ["Interlocked fingers of both hands form…", ["Karkata", "Kapota", "Swastika"], 0, "Karkata, the crab: the interlocked fingers suggest the crab’s legs."],
        ],
      ],
    ],
  },
  {
    id: "nritta-nritya-natya",
    cat: "forms",
    title: "Nritta, Nritya and Natya",
    dev: "नृत्त · नृत्य · नाट्य",
    img: IMG.group,
    pool: [IMG.group, IMG.classical, IMG.online],
    desc: "The three layers of a performance: pure dance, expressive dance and drama.",
    chapters: [
      ["nritta", "Nritta", "Pure movement and rhythm, with no story to tell.", ["Nritta shows the dancer’s command of rhythm and line."]],
      ["nritya", "Nritya", "Expressive dance that adds meaning through abhinaya, rasa and bhava.", ["Most of a dancer’s storytelling happens in nritya."]],
      ["natya", "Natya", "Drama: dance with story, characters and dialogue.", ["Natya brings all four abhinayas together."]],
    ],
    quizzes: [
      [
        "q-forms-check",
        "Quick check",
        "Multiple choice",
        [
          ["Pure rhythmic movement with no story is called…", ["Natya", "Nritya", "Nritta"], 2, "Nritta is pure movement and rhythm, with no story to tell."],
          ["Expressive dance that uses abhinaya, rasa and bhava is…", ["Nritya", "Nritta", "Natya"], 0, "Nritya adds meaning to movement through abhinaya, rasa and bhava."],
        ],
      ],
    ],
  },
  {
    id: "tandava-and-lasya",
    cat: "forms",
    title: "Tandava and Lasya",
    dev: "ताण्डव · लास्य",
    img: IMG.blue,
    pool: [IMG.blue, IMG.online, IMG.group],
    desc: "The two energies of dance: the vigorous and the graceful.",
    chapters: [
      ["tandava", "Tandava", "The vigorous, forceful energy of dance, associated with Shiva.", ["Strong, expansive movement and sharp rhythm."]],
      ["lasya", "Lasya", "The gentle, graceful energy of dance, associated with Parvati.", ["Soft, flowing movement and delicate expression."]],
    ],
    quizzes: [
      [
        "q-tl-tf",
        "True or false",
        "True or false",
        [
          ["Lasya is the energy associated with Parvati and grace.", ["True", "False"], 0, "True — lasya is the gentle, graceful energy of dance, associated with Parvati."],
          ["Tandava is soft, flowing movement.", ["True", "False"], 1, "False — tandava is vigorous and forceful, associated with Shiva."],
        ],
      ],
    ],
  },
];

function chapter(c: RawChapter, i: number, pool: string[]): Chapter {
  const [id, title, summary, points] = c;
  return {
    id,
    slug: id,
    status: "published",
    title,
    body: lessonBody(summary, points),
    thumb: pool[i % pool.length],
  };
}

function quiz(q: RawQuiz): Quiz {
  const [id, title, type, questions] = q;
  return {
    id,
    slug: id,
    status: "published",
    title,
    type,
    pass: 60,
    questions: questions.map(([text, options, answer, explain]): Question => ({ text, options, answer, explain })),
  };
}

export function seedHub(): Hub {
  const sections: HubSection[] = raw.map((s) => ({
    id: s.id,
    slug: s.id,
    status: "published",
    cat: s.cat,
    title: s.title,
    dev: s.dev,
    desc: s.desc,
    img: s.img,
    chapters: s.chapters.map((c, i) => chapter(c, i, s.pool)),
    quizzes: s.quizzes.map(quiz),
  }));
  return assignSlugs({
    categories: [
      { id: "rasa", name: "Rasa", dev: "रस" },
      { id: "abhinaya", name: "Abhinaya", dev: "अभिनय" },
      { id: "mudra", name: "Hasta mudra", dev: "हस्त" },
      { id: "forms", name: "Forms of dance", dev: "नृत्त" },
    ],
    sections,
  });
}
