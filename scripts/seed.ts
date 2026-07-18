import { db } from "../src/lib/db";
import {
  languages, scenarios, levels, scenarioLevels, modules, experiences,
  transcriptLines, words, experienceWords, questions, questionOptions,
  challenges, challengeItems
} from "../src/lib/db/schema";

async function main() {
  console.log("🌱 Seeding CanGo content...\n");

  // ── Languages ──
  await db.insert(languages).values([{ id: 1, name: "German", code: "de" }]);

  // ── Levels ──
  await db.insert(levels).values([
    { id: 1, name: "A2", order: 1 },
    { id: 2, name: "B1", order: 2 },
    { id: 3, name: "B2", order: 3 },
  ]);

  // ── Scenarios ──
  await db.insert(scenarios).values([
    { id: 1, languageId: 1, name: "Transportation", slug: "transportation", description: "Tickets, delays, and navigating German public transport", order: 1 },
    { id: 2, languageId: 1, name: "Doctor & Healthcare", slug: "doctor", description: "Appointments, symptoms, and pharmacy visits", order: 2 },
    { id: 3, languageId: 1, name: "Job Interview", slug: "job-interview", description: "Professional communication and interview preparation", order: 3 },
  ]);

  // ── Scenario Levels (all 3 scenarios × all 3 levels) ──
  const slValues = [];
  let slId = 1;
  for (let s = 1; s <= 3; s++) {
    for (let l = 1; l <= 3; l++) {
      slValues.push({ id: slId++, scenarioId: s, levelId: l });
    }
  }
  await db.insert(scenarioLevels).values(slValues);

  // ── Modules ──
  const moduleData: { id: number; scenarioLevelId: number; title: string; order: number }[] = [];
  let modId = 1;
  // SC1: Transportation
  for (let l = 1; l <= 3; l++) { // A2, B1, B2
    const sl = { 1: 1, 2: 2, 3: 3 }[l]!;
    const baseSL = (l - 1) * 3 + 1;
    const titles = l === 1
      ? ["Buying a Ticket", "Finding Your Way"]
      : l === 2
      ? ["Delay Announcements", "Platform Changes"]
      : ["Complex Itinerary", "Customer Service"];
    for (const t of titles) {
      moduleData.push({ id: modId++, scenarioLevelId: baseSL, title: t, order: t === titles[0] ? 1 : 2 });
    }
  }
  // SC2: Doctor
  for (let l = 1; l <= 3; l++) {
    const baseSL = (l - 1) * 3 + 2;
    const titles = l === 1
      ? ["Making an Appointment", "Basic Symptoms"]
      : l === 2
      ? ["Describing Symptoms", "At the Pharmacy"]
      : ["Medical History", "Specialist Visit"];
    for (const t of titles) {
      moduleData.push({ id: modId++, scenarioLevelId: baseSL, title: t, order: t === titles[0] ? 1 : 2 });
    }
  }
  // SC3: Job Interview
  for (let l = 1; l <= 3; l++) {
    const baseSL = (l - 1) * 3 + 3;
    const titles = l === 1
      ? ["Self-Introduction", "First Interview"]
      : l === 2
      ? ["Experience & Skills", "Common Questions"]
      : ["Salary Negotiation", "Technical Discussion"];
    for (const t of titles) {
      moduleData.push({ id: modId++, scenarioLevelId: baseSL, title: t, order: t === titles[0] ? 1 : 2 });
    }
  }
  await db.insert(modules).values(moduleData);

  // ── Experiences + Transcripts + Questions + Challenges ──
  const expValues: typeof experiences.$inferInsert[] = [];
  const transValues: typeof transcriptLines.$inferInsert[] = [];
  const wordInsertValues: (typeof words.$inferInsert)[] = [];
  const expWordValues: { experienceId: number; wordId: number }[] = [];
  const qValues: typeof questions.$inferInsert[] = [];
  const qoValues: typeof questionOptions.$inferInsert[] = [];
  const chValues: typeof challenges.$inferInsert[] = [];
  const ciValues: typeof challengeItems.$inferInsert[] = [];

  let expId = 1;
  let transId = 1;
  let wordId = 1;
  let qId = 1;
  let qoId = 1;
  let chId = 1;
  let ciId = 1;

  // Helper: register a word + link to experience
  function addWord(german: string, english: string, article?: string, plural?: string, exp?: number) {
    const id = wordId++;
    wordInsertValues.push({ id, germanWord: german, englishTranslation: english, article, plural });
    if (exp) expWordValues.push({ experienceId: exp, wordId: id });
    return id;
  }

  // Helper: insert experience with transcripts, words, questions, matching, challenge
  function addExperience(
    moduleId: number, title: string, level: number, scenario: string,
    lines: { de: string; en: string }[],
    vocab: { de: string; en: string; article?: string; plural?: string }[],
    mcqs: { de: string; en: string; options: { de: string; en: string; correct: boolean }[] }[],
    matchingPairs: { de: string; en: string }[],
    challengeType: "BEST_RESPONSE" | "ARRANGE_DIALOGUE" | "VOCAB_MATCH",
    challengeItemsData: { text: string; translation?: string; order: number; correctValue?: string }[],
  ) {
    const eid = expId++;
    const durationMap: Record<number, string> = { 1: "1:30", 2: "2:15", 3: "3:00" };
    const durs = ["1:15", "1:45", "2:00", "2:30", "3:00"];
    expValues.push({
      id: eid, moduleId, title, order: (expId - 1) % 3 + 1,
      xpReward: 50, duration: durs[Math.floor(Math.random() * durs.length)],
      description: `${scenario} — ${level === 1 ? "A2" : level === 2 ? "B1" : "B2"}`,
    });

    // Transcript lines
    lines.forEach((l, i) => {
      transValues.push({ id: transId++, experienceId: eid, order: i + 1, germanText: l.de, englishText: l.en });
    });

    // Vocabulary
    vocab.forEach(v => addWord(v.de, v.en, v.article, v.plural, eid));

    // MCQs
    mcqs.forEach((mcq, i) => {
      const qid = qId++;
      qValues.push({ id: qid, experienceId: eid, type: "MCQ", questionText: mcq.de, englishTranslation: mcq.en, order: i + 1 });
      mcq.options.forEach(opt => {
        qoValues.push({ id: qoId++, questionId: qid, germanText: opt.de, englishText: opt.en, correct: opt.correct });
      });
    });

    // Matching (stored as question type MATCHING)
    if (matchingPairs.length > 0) {
      const mid = qId++;
      qValues.push({ id: mid, experienceId: eid, type: "MATCHING", questionText: "Verbinden Sie die Wörter", englishTranslation: "Match the words", order: mcqs.length + 1 });
      matchingPairs.forEach(p => {
        qoValues.push({ id: qoId++, questionId: mid, germanText: p.de, englishText: p.en, correct: false });
      });
    }

    // Challenge
    const cid = chId++;
    chValues.push({ id: cid, experienceId: eid, type: challengeType });
    challengeItemsData.forEach(ci => {
      ciValues.push({ id: ciId++, challengeId: cid, text: ci.text, translation: ci.translation, order: ci.order, correctValue: ci.correctValue });
    });
  }

  // ========================================
  // SCENARIO 1: TRANSPORTATION
  // ========================================

  // ── A2 Modules (id 1,2) ──
  // Module 1: Buying a Ticket
  addExperience(1, "Buying a Ticket at the Counter", 1, "Transportation",
    [
      { de: "Guten Tag, ich möchte eine Fahrkarte nach Berlin kaufen.", en: "Hello, I'd like to buy a ticket to Berlin." },
      { de: "Einfach oder hin und zurück?", en: "One-way or round trip?" },
      { de: "Einfach bitte. Wie viel kostet das?", en: "One-way please. How much does it cost?" },
      { de: "Das macht 45 Euro.", en: "That will be 45 euros." },
      { de: "Hier ist mein Geld. Vielen Dank!", en: "Here is my money. Thank you very much!" },
    ],
    [{ de: "die Fahrkarte", en: "ticket", article: "die", plural: "die Fahrkarten" }],
    [
      { de: "Was möchte der Fahrgast kaufen?", en: "What does the passenger want to buy?", options: [{ de: "Eine Fahrkarte nach Berlin", en: "A ticket to Berlin", correct: true }, { de: "Einen Snack", en: "A snack", correct: false }, { de: "Eine Zeitung", en: "A newspaper", correct: false }] },
      { de: "Wie viel kostet die Fahrkarte?", en: "How much does the ticket cost?", options: [{ de: "35 Euro", en: "35 euros", correct: false }, { de: "45 Euro", en: "45 euros", correct: true }, { de: "55 Euro", en: "55 euros", correct: false }] },
    ],
    [{ de: "einfach", en: "one-way" }, { de: "hin und zurück", en: "round trip" }, { de: "kosten", en: "to cost" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Guten Tag, ich möchte eine Fahrkarte nach Berlin kaufen.", order: 1 },
      { text: "Einfach oder hin und zurück?", order: 2 },
      { text: "Einfach bitte. Wie viel kostet das?", order: 3 },
      { text: "Das macht 45 Euro.", order: 4 },
      { text: "Hier ist mein Geld. Vielen Dank!", order: 5 },
    ],
  );

  addExperience(1, "Asking for a Discount Card", 1, "Transportation",
    [
      { de: "Haben Sie eine Bahncard?", en: "Do you have a Bahncard?" },
      { de: "Nein, noch nicht. Kann ich eine beantragen?", en: "No, not yet. Can I apply for one?" },
      { de: "Ja, hier ist das Formular. Die Bahncard 25 kostet 62 Euro im Jahr.", en: "Yes, here is the form. The Bahncard 25 costs 62 euros per year." },
      { de: "Und wie viel spare ich damit?", en: "And how much do I save with it?" },
      { de: "Sie bekommen 25 Prozent Rabatt auf den Fahrpreis.", en: "You get 25 percent discount on the fare." },
    ],
    [{ de: "die Bahncard", en: "discount rail card", article: "die" }, { de: "der Rabatt", en: "discount", article: "der" }, { de: "sparen", en: "to save" }],
    [
      { de: "Was kann man am Schalter beantragen?", en: "What can you apply for at the counter?", options: [{ de: "Eine Bahncard", en: "A Bahncard", correct: true }, { de: "Ein Ticket", en: "A ticket", correct: false }, { de: "Ein Visum", en: "A visa", correct: false }] },
      { de: "Wie viel Rabatt bekommt man mit der Bahncard 25?", en: "How much discount do you get with Bahncard 25?", options: [{ de: "10 Prozent", en: "10 percent", correct: false }, { de: "25 Prozent", en: "25 percent", correct: true }, { de: "50 Prozent", en: "50 percent", correct: false }] },
    ],
    [{ de: "beantragen", en: "to apply for" }, { de: "das Formular", en: "form" }],
    "BEST_RESPONSE",
    [
      { text: "Entschuldigung, wo kann ich eine Bahncard beantragen?", translation: "Excuse me, where can I apply for a Bahncard?", order: 2, correctValue: "correct" },
      { text: "Ich hätte gerne ein Bier, bitte.", translation: "I'd like a beer, please.", order: 1, correctValue: "wrong" },
      { text: "Können Sie mir den Weg zum Hotel zeigen?", translation: "Can you show me the way to the hotel?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(1, "Buying a Ticket from the Machine", 1, "Transportation",
    [
      { de: "Entschuldigung, wie funktioniert dieser Automat?", en: "Excuse me, how does this machine work?" },
      { de: "Drücken Sie zuerst auf 'Fahrkarte kaufen'.", en: "First press 'Buy ticket'." },
      { de: "Und dann wähle ich mein Ziel aus?", en: "And then I select my destination?" },
      { de: "Genau. Dann bezahlen Sie mit Karte oder Bargeld.", en: "Exactly. Then you pay with card or cash." },
      { de: "Vielen Dank für Ihre Hilfe!", en: "Thank you for your help!" },
    ],
    [{ de: "der Automat", en: "machine/vending machine", article: "der" }, { de: "das Bargeld", en: "cash", article: "das" }, { de: "auswählen", en: "to select" }],
    [
      { de: "Was muss man zuerst drücken?", en: "What must you press first?", options: [{ de: "Fahrkarte kaufen", en: "Buy ticket", correct: true }, { de: "Geld zurück", en: "Change return", correct: false }, { de: "Hilfe", en: "Help", correct: false }] },
      { de: "Wie kann man am Automaten bezahlen?", en: "How can you pay at the machine?", options: [{ de: "Nur mit Bargeld", en: "Cash only", correct: false }, { de: "Mit Karte oder Bargeld", en: "With card or cash", correct: true }, { de: "Nur mit Karte", en: "Card only", correct: false }] },
    ],
    [{ de: "drücken", en: "to press" }, { de: "das Ziel", en: "destination" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Entschuldigung, wie funktioniert dieser Automat?", order: 1 },
      { text: "Drücken Sie zuerst auf 'Fahrkarte kaufen'.", order: 2 },
      { text: "Und dann wähle ich mein Ziel aus?", order: 3 },
      { text: "Genau. Dann bezahlen Sie mit Karte oder Bargeld.", order: 4 },
      { text: "Vielen Dank für Ihre Hilfe!", order: 5 },
    ],
  );

  // Module 2: Finding Your Way (A2)
  addExperience(2, "Asking for Directions", 1, "Transportation",
    [
      { de: "Entschuldigung, wo ist Gleis 5?", en: "Excuse me, where is platform 5?" },
      { de: "Gehen Sie die Treppe hoch und dann nach rechts.", en: "Go up the stairs and then to the right." },
      { de: "Ist das weit von hier?", en: "Is that far from here?" },
      { de: "Nein, nur zwei Minuten zu Fuß.", en: "No, just two minutes on foot." },
      { de: "Vielen Dank!", en: "Thank you very much!" },
    ],
    [{ de: "das Gleis", en: "platform/track", article: "das", plural: "die Gleise" }, { de: "die Treppe", en: "stairs", article: "die" }],
    [
      { de: "Was sucht der Fahrgast?", en: "What is the passenger looking for?", options: [{ de: "Den Ausgang", en: "The exit", correct: false }, { de: "Gleis 5", en: "Platform 5", correct: true }, { de: "Das Restaurant", en: "The restaurant", correct: false }] },
      { de: "Wie weit ist es zum Gleis?", en: "How far is it to the platform?", options: [{ de: "Zehn Minuten", en: "Ten minutes", correct: false }, { de: "Zwei Minuten", en: "Two minutes", correct: true }, { de: "Fünf Minuten", en: "Five minutes", correct: false }] },
    ],
    [{ de: "hochgehen", en: "to go up" }, { de: "nach rechts", en: "to the right" }],
    "BEST_RESPONSE",
    [
      { text: "Entschuldigung, wo ist Gleis 5?", translation: "Excuse me, where is platform 5?", order: 1, correctValue: "correct" },
      { text: "Können Sie mir ein Taxi rufen?", translation: "Can you call me a taxi?", order: 2, correctValue: "wrong" },
      { text: "Ich möchte ein Zimmer reservieren.", translation: "I'd like to reserve a room.", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(2, "Finding the Right Bus", 1, "Transportation",
    [
      { de: "Fährt dieser Bus zum Hauptbahnhof?", en: "Does this bus go to the main train station?" },
      { de: "Ja, aber Sie müssen am Alexanderplatz umsteigen.", en: "Yes, but you need to change at Alexanderplatz." },
      { de: "Welche Linie muss ich dann nehmen?", en: "Which line do I need to take then?" },
      { de: "Die Linie M10 Richtung Hauptbahnhof.", en: "Line M10 towards the main station." },
      { de: "Vielen Dank für die Auskunft!", en: "Thank you for the information!" },
    ],
    [{ de: "der Hauptbahnhof", en: "main train station", article: "der" }, { de: "umsteigen", en: "to change/transfer" }, { de: "die Linie", en: "line", article: "die" }],
    [
      { de: "Wohin fährt der Bus?", en: "Where does the bus go?", options: [{ de: "Zum Flughafen", en: "To the airport", correct: false }, { de: "Zum Hauptbahnhof", en: "To the main station", correct: true }, { de: "Zum Museum", en: "To the museum", correct: false }] },
      { de: "Was muss der Fahrgast am Alexanderplatz machen?", en: "What does the passenger need to do at Alexanderplatz?", options: [{ de: "Aussteigen und ein Taxi nehmen", en: "Get off and take a taxi", correct: false }, { de: "Umsteigen in die M10", en: "Change to the M10", correct: true }, { de: "Eine Fahrkarte kaufen", en: "Buy a ticket", correct: false }] },
    ],
    [{ de: "die Auskunft", en: "information" }],
    "VOCAB_MATCH",
    [
      { text: "der Bus", translation: "bus", order: 1, correctValue: "bus" },
      { text: "umsteigen", translation: "to transfer", order: 2, correctValue: "transfer" },
      { text: "der Hauptbahnhof", translation: "main station", order: 3, correctValue: "mainstation" },
    ],
  );

  addExperience(2, "Reading the Departure Board", 1, "Transportation",
    [
      { de: "Entschuldigung, ich verstehe die Anzeigetafel nicht.", en: "Excuse me, I don't understand the departure board." },
      { de: "Welchen Zug suchen Sie?", en: "Which train are you looking for?" },
      { de: "Den ICE nach Hamburg um 14:30 Uhr.", en: "The ICE to Hamburg at 2:30 PM." },
      { de: "Der steht auf Gleis 7. Die Abfahrt ist pünktlich.", en: "It's on platform 7. The departure is on time." },
      { de: "Perfekt, vielen Dank!", en: "Perfect, thank you very much!" },
    ],
    [{ de: "die Anzeigetafel", en: "departure board", article: "die" }, { de: "pünktlich", en: "on time" }, { de: "die Abfahrt", en: "departure", article: "die" }],
    [
      { de: "Was sucht der Fahrgast?", en: "What is the passenger looking for?", options: [{ de: "Den ICE nach Hamburg", en: "The ICE to Hamburg", correct: true }, { de: "Den Bus zum Flughafen", en: "The bus to the airport", correct: false }, { de: "Das Fundbüro", en: "The lost and found", correct: false }] },
      { de: "Wann fährt der Zug?", en: "When does the train depart?", options: [{ de: "Um 13:30 Uhr", en: "At 1:30 PM", correct: false }, { de: "Um 14:30 Uhr", en: "At 2:30 PM", correct: true }, { de: "Um 15:30 Uhr", en: "At 3:30 PM", correct: false }] },
    ],
    [{ de: "verstehen", en: "to understand" }, { de: "suchen", en: "to look for" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Entschuldigung, ich verstehe die Anzeigetafel nicht.", order: 1 },
      { text: "Welchen Zug suchen Sie?", order: 2 },
      { text: "Den ICE nach Hamburg um 14:30 Uhr.", order: 3 },
      { text: "Der steht auf Gleis 7. Die Abfahrt ist pünktlich.", order: 4 },
      { text: "Perfekt, vielen Dank!", order: 5 },
    ],
  );

  // ── B1 Modules (id 3,4) ──
  addExperience(3, "Train Delay Announcement", 2, "Transportation",
    [
      { de: "Achtung, eine Durchsage für die Reisenden.", en: "Attention, an announcement for travelers." },
      { de: "Der ICE 782 nach München hat voraussichtlich 20 Minuten Verspätung.", en: "ICE 782 to Munich is预计 to be 20 minutes late." },
      { de: "Grund dafür ist eine technische Störung am Gleis.", en: "The reason is a technical fault on the track." },
      { de: "Wir bitten um Ihr Verständnis.", en: "We ask for your understanding." },
      { de: "Weitere Informationen erhalten Sie am Serviceschalter.", en: "Further information is available at the service desk." },
    ],
    [{ de: "die Verspätung", en: "delay", article: "die" }, { de: "die Störung", en: "fault/disturbance", article: "die" }, { de: "der Serviceschalter", en: "service desk", article: "der" }],
    [
      { de: "Warum hat der Zug Verspätung?", en: "Why is the train delayed?", options: [{ de: "Wegen des Wetters", en: "Because of the weather", correct: false }, { de: "Wegen einer technischen Störung", en: "Because of a technical fault", correct: true }, { de: "Wegen Personalmangels", en: "Because of staff shortage", correct: false }] },
      { de: "Wie viel Verspätung hat der Zug?", en: "How late is the train?", options: [{ de: "10 Minuten", en: "10 minutes", correct: false }, { de: "20 Minuten", en: "20 minutes", correct: true }, { de: "30 Minuten", en: "30 minutes", correct: false }] },
    ],
    [{ de: "voraussichtlich", en: "expected/probably" }, { de: "das Verständnis", en: "understanding" }],
    "BEST_RESPONSE",
    [
      { text: "Entschuldigung, warum hat der Zug Verspätung?", translation: "Excuse me, why is the train delayed?", order: 1, correctValue: "correct" },
      { text: "Ich möchte eine Fahrkarte kaufen.", translation: "I'd like to buy a ticket.", order: 2, correctValue: "wrong" },
      { text: "Wo ist das Restaurant?", translation: "Where is the restaurant?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(3, "Cancelled Train — Finding Alternatives", 2, "Transportation",
    [
      { de: "Meine Damen und Herren, der IC 208 nach Stuttgart fällt heute aus.", en: "Ladies and gentlemen, IC 208 to Stuttgart is cancelled today." },
      { de: "Bitte begeben Sie sich zu Gleis 4. Dort wartet ein Ersatzzug.", en: "Please proceed to platform 4. A replacement train is waiting there." },
      { de: "Die Abfahrt ist um 17:15 Uhr, etwa 30 Minuten später.", en: "Departure is at 5:15 PM, about 30 minutes later." },
      { de: "Alternativ können Sie den nächsten IC um 18:00 Uhr nehmen.", en: "Alternatively, you can take the next IC at 6:00 PM." },
      { de: "Wir entschuldigen uns für die Unannehmlichkeiten.", en: "We apologize for the inconvenience." },
    ],
    [{ de: "ausfallen", en: "to be cancelled" }, { de: "der Ersatzzug", en: "replacement train", article: "der" }, { de: "die Unannehmlichkeiten", en: "inconvenience" }],
    [
      { de: "Was ist mit dem IC 208 passiert?", en: "What happened to IC 208?", options: [{ de: "Er hat Verspätung", en: "It is delayed", correct: false }, { de: "Er fällt aus", en: "It is cancelled", correct: true }, { de: "Er fährt früher", en: "It departs earlier", correct: false }] },
      { de: "Wann fährt der Ersatzzug?", en: "When does the replacement train depart?", options: [{ de: "Um 17:15 Uhr", en: "At 5:15 PM", correct: true }, { de: "Um 18:00 Uhr", en: "At 6:00 PM", correct: false }, { de: "Um 16:45 Uhr", en: "At 4:45 PM", correct: false }] },
    ],
    [{ de: "sich begeben", en: "to proceed" }, { de: "alternativ", en: "alternatively" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Meine Damen und Herren, der IC 208 nach Stuttgart fällt heute aus.", order: 1 },
      { text: "Bitte begeben Sie sich zu Gleis 4.", order: 2 },
      { text: "Dort wartet ein Ersatzzug.", order: 3 },
      { text: "Die Abfahrt ist um 17:15 Uhr.", order: 4 },
      { text: "Wir entschuldigen uns für die Unannehmlichkeiten.", order: 5 },
    ],
  );

  addExperience(3, "Understanding Platform Changes", 2, "Transportation",
    [
      { de: "Aufgrund einer Gleiserneuerung ändert sich die Abfahrtsstelle.", en: "Due to track renovation, the departure point is changing." },
      { de: "Der RE 7 nach Köln fährt heute ab Gleis 12 statt Gleis 8.", en: "RE 7 to Cologne departs from platform 12 instead of platform 8 today." },
      { de: "Bitte beachten Sie die neuen Aushänge.", en: "Please pay attention to the new notices." },
      { de: "Die Züge nach Köln halten auch am Bahnsteig C.", en: "Trains to Cologne also stop at platform C." },
      { de: "Vielen Dank für Ihre Aufmerksamkeit.", en: "Thank you for your attention." },
    ],
    [{ de: "die Gleiserneuerung", en: "track renovation", article: "die" }, { de: "der Aushang", en: "notice", article: "der" }],
    [
      { de: "Warum ändert sich das Gleis?", en: "Why is the platform changing?", options: [{ de: "Wegen einer Verspätung", en: "Due to a delay", correct: false }, { de: "Wegen einer Gleiserneuerung", en: "Due to track renovation", correct: true }, { de: "Wegen des Wetters", en: "Due to weather", correct: false }] },
      { de: "Von welchem Gleis fährt der RE 7 jetzt?", en: "From which platform does RE 7 depart now?", options: [{ de: "Gleis 8", en: "Platform 8", correct: false }, { de: "Gleis 12", en: "Platform 12", correct: true }, { de: "Gleis 6", en: "Platform 6", correct: false }] },
    ],
    [{ de: "sich ändern", en: "to change" }, { de: "beachten", en: "to pay attention to" }],
    "VOCAB_MATCH",
    [
      { text: "die Gleiserneuerung", translation: "track renovation", order: 1, correctValue: "renovation" },
      { text: "der Aushang", translation: "notice", order: 2, correctValue: "notice" },
      { text: "der Bahnsteig", translation: "platform", order: 3, correctValue: "platform" },
    ],
  );

  // ── B2 Modules (id 5,6) ──
  addExperience(5, "Planning a Complex Multi-Leg Trip", 3, "Transportation",
    [
      { de: "Ich muss von Berlin über Frankfurt nach Zürich reisen.", en: "I need to travel from Berlin via Frankfurt to Zurich." },
      { de: "Empfehlen Sie mir eine Route mit möglichst kurzer Umsteigezeit?", en: "Can you recommend a route with the shortest possible transfer time?" },
      { de: "Nehmen Sie den ICE 109 um 7:30 Uhr. In Frankfurt haben Sie 15 Minuten Umsteigezeit.", en: "Take ICE 109 at 7:30 AM. In Frankfurt you have a 15-minute transfer time." },
      { de: "Und von Frankfurt nach Zürich fährt ein ICE um 10:15 Uhr.", en: "And from Frankfurt to Zurich, an ICE departs at 10:15 AM." },
      { de: "Das klingt gut. Buchen Sie mir bitte einen Sitzplatz im Großraumwagen.", en: "That sounds good. Please reserve me a seat in the open-plan carriage." },
    ],
    [{ de: "die Umsteigezeit", en: "transfer time", article: "die" }, { de: "der Großraumwagen", en: "open-plan carriage", article: "der" }],
    [
      { de: "Wohin möchte der Fahrgast reisen?", en: "Where does the passenger want to travel?", options: [{ de: "Berlin über Frankfurt nach Zürich", en: "Berlin via Frankfurt to Zurich", correct: true }, { de: "Frankfurt über Berlin nach Zürich", en: "Frankfurt via Berlin to Zurich", correct: false }, { de: "Berlin direkt nach Zürich", en: "Berlin directly to Zurich", correct: false }] },
      { de: "Wie lange hat er in Frankfurt Umsteigezeit?", en: "How long is his transfer time in Frankfurt?", options: [{ de: "10 Minuten", en: "10 minutes", correct: false }, { de: "15 Minuten", en: "15 minutes", correct: true }, { de: "20 Minuten", en: "20 minutes", correct: false }] },
    ],
    [{ de: "empfehlen", en: "to recommend" }, { de: "buchen", en: "to book" }],
    "BEST_RESPONSE",
    [
      { text: "Können Sie mir eine Route mit kurzer Umsteigezeit empfehlen?", translation: "Can you recommend a route with a short transfer time?", order: 1, correctValue: "correct" },
      { text: "Ich hätte gerne ein Bier und eine Brezel.", translation: "I'd like a beer and a pretzel.", order: 2, correctValue: "wrong" },
      { text: "Wo kann ich mein Gepäck abgeben?", translation: "Where can I drop off my luggage?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(5, "Handling a Missed Connection", 3, "Transportation",
    [
      { de: "Ich habe meinen Anschlusszug verpasst wegen der Verspätung.", en: "I missed my connecting train because of the delay." },
      { de: "Kein Problem. Ich buche Sie kostenlos auf den nächsten Zug um.", en: "No problem. I'll rebook you on the next train for free." },
      { de: "Der nächste Zug fährt in 45 Minuten ab Gleis 6.", en: "The next train departs in 45 minutes from platform 6." },
      { de: "Muss ich mich beeilen, um einen Sitzplatz zu bekommen?", en: "Do I need to hurry to get a seat?" },
      { de: "Nein, der Zug hat genug Kapazität. Sie können entspannt einsteigen.", en: "No, the train has enough capacity. You can board calmly." },
    ],
    [{ de: "verpassen", en: "to miss" }, { de: "der Anschlusszug", en: "connecting train", article: "der" }, { de: "die Kapazität", en: "capacity", article: "die" }],
    [
      { de: "Warum hat der Fahrgast den Anschlusszug verpasst?", en: "Why did the passenger miss the connecting train?", options: [{ de: "Er hat verschlafen", en: "He overslept", correct: false }, { de: "Wegen der Verspätung", en: "Because of the delay", correct: true }, { de: "Er war am falschen Gleis", en: "He was at the wrong platform", correct: false }] },
      { de: "Was macht der Service-Mitarbeiter?", en: "What does the service employee do?", options: [{ de: "Er gibt dem Fahrgast eine Entschädigung", en: "He gives the passenger compensation", correct: false }, { de: "Er bucht den Fahrgast kostenlos um", en: "He rebooks the passenger for free", correct: true }, { de: "Er ruft ein Taxi", en: "He calls a taxi", correct: false }] },
    ],
    [{ de: "umbuchen", en: "to rebook" }, { de: "entspannt", en: "relaxed" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Ich habe meinen Anschlusszug verpasst wegen der Verspätung.", order: 1 },
      { text: "Kein Problem. Ich buche Sie kostenlos auf den nächsten Zug um.", order: 2 },
      { text: "Muss ich mich beeilen, um einen Sitzplatz zu bekommen?", order: 3 },
      { text: "Nein, Sie können entspannt einsteigen.", order: 4 },
    ],
  );

  addExperience(6, "Lodge a Formal Complaint", 3, "Transportation",
    [
      { de: "Ich möchte eine Beschwerde einreichen wegen der gestrigen Zugfahrt.", en: "I would like to file a complaint about yesterday's train journey." },
      { de: "Die Klimaanlage im Waggon 3 hat nicht funktioniert.", en: "The air conditioning in carriage 3 was not working." },
      { de: "Haben Sie Ihre Fahrkarte und die Zugnummer parat?", en: "Do you have your ticket and the train number ready?" },
      { de: "Ja, hier sind alle Unterlagen. Ich erwarte eine Fahrpreiserstattung.", en: "Yes, here are all the documents. I expect a fare refund." },
      { de: "Wir werden Ihren Fall prüfen und uns innerhalb von 14 Tagen melden.", en: "We will review your case and get back to you within 14 days." },
    ],
    [{ de: "die Beschwerde", en: "complaint", article: "die" }, { de: "die Fahrpreiserstattung", en: "fare refund", article: "die" }, { de: "die Unterlagen", en: "documents" }],
    [
      { de: "Warum möchte der Fahrgast eine Beschwerde einreichen?", en: "Why does the passenger want to file a complaint?", options: [{ de: "Der Zug hatte Verspätung", en: "The train was late", correct: false }, { de: "Die Klimaanlage hat nicht funktioniert", en: "The AC was not working", correct: true }, { de: "Das Essen war schlecht", en: "The food was bad", correct: false }] },
      { de: "Wie lange dauert die Bearbeitung der Beschwerde?", en: "How long does the complaint processing take?", options: [{ de: "7 Tage", en: "7 days", correct: false }, { de: "14 Tage", en: "14 days", correct: true }, { de: "30 Tage", en: "30 days", correct: false }] },
    ],
    [{ de: "einreichen", en: "to file" }, { de: "prüfen", en: "to review" }],
    "VOCAB_MATCH",
    [
      { text: "die Beschwerde", translation: "complaint", order: 1, correctValue: "complaint" },
      { text: "die Fahrpreiserstattung", translation: "fare refund", order: 2, correctValue: "refund" },
      { text: "die Unterlagen", translation: "documents", order: 3, correctValue: "documents" },
    ],
  );

  addExperience(6, "Negotiating a Better Fare", 3, "Transportation",
    [
      { de: "Ich reise geschäftlich und brauche ein flexibles Ticket.", en: "I'm traveling for business and need a flexible ticket." },
      { de: "Dann empfehle ich das Flexpreis-Ticket. Es kostet 130 Euro.", en: "Then I recommend the flex fare ticket. It costs 130 euros." },
      { de: "Gibt es einen Rabatt für Vielreisende?", en: "Is there a discount for frequent travelers?" },
      { de: "Mit der Bahncard 100 reisen Sie ein Jahr lang unbegrenzt.", en: "With Bahncard 100 you travel unlimited for a year." },
      { de: "Das ist eine gute Investition für meine regelmäßigen Fahrten.", en: "That's a good investment for my regular trips." },
    ],
    [{ de: "geschäftlich", en: "business" }, { de: "das Flexpreis-Ticket", en: "flex fare ticket" }, { de: "unbegrenzt", en: "unlimited" }],
    [
      { de: "Welches Ticket empfehlen Sie?", en: "Which ticket do you recommend?", options: [{ de: "Das Sparpreis-Ticket", en: "The saver fare ticket", correct: false }, { de: "Das Flexpreis-Ticket", en: "The flex fare ticket", correct: true }, { de: "Das Sonderticket", en: "The special ticket", correct: false }] },
      { de: "Was ist der Vorteil der Bahncard 100?", en: "What is the advantage of Bahncard 100?", options: [{ de: "25 Prozent Rabatt", en: "25 percent discount", correct: false }, { de: "Unbegrenztes Reisen für ein Jahr", en: "Unlimited travel for a year", correct: true }, { de: "Kostenlose Getränke im Zug", en: "Free drinks on the train", correct: false }] },
    ],
    [{ de: "der Vielreisende", en: "frequent traveler" }, { de: "die Investition", en: "investment" }],
    "BEST_RESPONSE",
    [
      { text: "Gibt es einen Rabatt für Vielreisende?", translation: "Is there a discount for frequent travelers?", order: 1, correctValue: "correct" },
      { text: "Wo ist das nächste Hotel?", translation: "Where is the nearest hotel?", order: 2, correctValue: "wrong" },
      { text: "Können Sie mir das Datum nennen?", translation: "Can you tell me the date?", order: 3, correctValue: "wrong" },
    ],
  );

  // ========================================
  // SCENARIO 2: DOCTOR & HEALTHCARE
  // ========================================

  // A2 Module 7: Making an Appointment
  addExperience(7, "Calling the Doctor's Office", 1, "Doctor",
    [
      { de: "Praxis Dr. Müller, guten Tag. Was kann ich für Sie tun?", en: "Dr. Müller's practice, good day. How can I help you?" },
      { de: "Guten Tag, ich möchte einen Termin vereinbaren.", en: "Good day, I'd like to make an appointment." },
      { de: "Haben Sie Schmerzen oder ist es eine Vorsorgeuntersuchung?", en: "Do you have pain or is it a check-up?" },
      { de: "Es ist eine Vorsorgeuntersuchung.", en: "It's a check-up." },
      { de: "Dann nächste Woche Montag um 10:00 Uhr. Passt das?", en: "Then next Monday at 10:00 AM. Does that work?" },
    ],
    [{ de: "die Praxis", en: "medical practice", article: "die" }, { de: "der Termin", en: "appointment", article: "der" }, { de: "die Vorsorgeuntersuchung", en: "check-up", article: "die" }],
    [
      { de: "Warum ruft der Patient an?", en: "Why is the patient calling?", options: [{ de: "Er möchte einen Termin", en: "He wants an appointment", correct: true }, { de: "Er hat einen Notfall", en: "He has an emergency", correct: false }, { de: "Er möchte die Rechnung", en: "He wants the bill", correct: false }] },
      { de: "Wann ist der Termin?", en: "When is the appointment?", options: [{ de: "Morgen um 10:00 Uhr", en: "Tomorrow at 10 AM", correct: false }, { de: "Nächste Woche Montag um 10:00 Uhr", en: "Next Monday at 10 AM", correct: true }, { de: "Heute um 14:00 Uhr", en: "Today at 2 PM", correct: false }] },
    ],
    [{ de: "vereinbaren", en: "to arrange" }, { de: "der Schmerz", en: "pain" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Praxis Dr. Müller, guten Tag. Was kann ich für Sie tun?", order: 1 },
      { text: "Guten Tag, ich möchte einen Termin vereinbaren.", order: 2 },
      { text: "Haben Sie Schmerzen oder ist es eine Vorsorgeuntersuchung?", order: 3 },
      { text: "Es ist eine Vorsorgeuntersuchung.", order: 4 },
      { text: "Dann nächste Woche Montag um 10:00 Uhr.", order: 5 },
    ],
  );

  addExperience(7, "Confirming the Appointment", 1, "Doctor",
    [
      { de: "Ich habe einen Termin für heute um 15:30 Uhr bei Dr. Weber.", en: "I have an appointment today at 3:30 PM with Dr. Weber." },
      { de: "Moment bitte. Ja, ich sehe Sie in der Liste. Sind Sie neu hier?", en: "One moment please. Yes, I see you in the list. Are you new here?" },
      { de: "Ja, ich bin das erste Mal hier.", en: "Yes, this is my first time here." },
      { de: "Dann füllen Sie bitte dieses Formular aus.", en: "Then please fill out this form." },
      { de: "Muss ich meine Versicherungskarte abgeben?", en: "Do I need to hand in my insurance card?" },
    ],
    [{ de: "die Versicherungskarte", en: "insurance card", article: "die" }, { de: "ausfüllen", en: "to fill out" }],
    [
      { de: "Was muss der Patient beim ersten Besuch machen?", en: "What does the patient need to do on the first visit?", options: [{ de: "Ein Formular ausfüllen", en: "Fill out a form", correct: true }, { de: "Bar bezahlen", en: "Pay cash", correct: false }, { de: "Einen Test machen", en: "Take a test", correct: false }] },
      { de: "Was fragt der Patient nach der Versicherungskarte?", en: "What does the patient ask about the insurance card?", options: [{ de: "Ob er sie abgeben muss", en: "Whether he needs to hand it in", correct: true }, { de: "Ob sie kostenlos ist", en: "Whether it's free", correct: false }, { de: "Ob er sie verlängern kann", en: "Whether he can extend it", correct: false }] },
    ],
    [{ de: "das Formular", en: "form" }],
    "BEST_RESPONSE",
    [
      { text: "Muss ich meine Versicherungskarte abgeben?", translation: "Do I need to hand in my insurance card?", order: 1, correctValue: "correct" },
      { text: "Wo ist die nächste Apotheke?", translation: "Where is the nearest pharmacy?", order: 2, correctValue: "wrong" },
      { text: "Können Sie mir ein Rezept ausstellen?", translation: "Can you prescribe me a prescription?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(7, "Rescheduling an Appointment", 1, "Doctor",
    [
      { de: "Ich muss meinen Termin leider verschieben.", en: "I unfortunately have to reschedule my appointment." },
      { de: "Kein Problem. Welcher Tag würde Ihnen passen?", en: "No problem. Which day would suit you?" },
      { de: "Geht es am Donnerstag um 11:00 Uhr?", en: "Is Thursday at 11:00 AM possible?" },
      { de: "Ja, da habe ich einen Termin frei. Ich trage Sie ein.", en: "Yes, I have a free slot then. I'll put you down." },
      { de: "Vielen Dank und entschuldigen Sie die kurzfristige Absage.", en: "Thank you very much and sorry for the last-minute cancellation." },
    ],
    [{ de: "verschieben", en: "to reschedule/postpone" }, { de: "die Absage", en: "cancellation", article: "die" }],
    [
      { de: "Warum ruft der Patient an?", en: "Why is the patient calling?", options: [{ de: "Er ist krank", en: "He is sick", correct: false }, { de: "Er muss seinen Termin verschieben", en: "He needs to reschedule", correct: true }, { de: "Er möchte die Rechnung bezahlen", en: "He wants to pay the bill", correct: false }] },
      { de: "Wann ist der neue Termin?", en: "When is the new appointment?", options: [{ de: "Am Dienstag um 11:00 Uhr", en: "On Tuesday at 11 AM", correct: false }, { de: "Am Donnerstag um 11:00 Uhr", en: "On Thursday at 11 AM", correct: true }, { de: "Am Freitag um 10:00 Uhr", en: "On Friday at 10 AM", correct: false }] },
    ],
    [{ de: "passen", en: "to suit" }, { de: "eintragen", en: "to enter/register" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Ich muss meinen Termin leider verschieben.", order: 1 },
      { text: "Kein Problem. Welcher Tag würde Ihnen passen?", order: 2 },
      { text: "Geht es am Donnerstag um 11:00 Uhr?", order: 3 },
      { text: "Ja, da habe ich einen Termin frei.", order: 4 },
      { text: "Vielen Dank und entschuldigen Sie die kurzfristige Absage.", order: 5 },
    ],
  );

  // A2 Module 8: Basic Symptoms
  addExperience(8, "Describing a Headache", 1, "Doctor",
    [
      { de: "Guten Tag, Herr Doktor. Mir tut der Kopf weh.", en: "Good day, doctor. I have a headache." },
      { de: "Seit wann haben Sie die Kopfschmerzen?", en: "Since when have you had the headache?" },
      { de: "Seit gestern Abend. Es hilft nichts dagegen.", en: "Since yesterday evening. Nothing helps." },
      { de: "Haben Sie Fieber oder andere Symptome?", en: "Do you have a fever or other symptoms?" },
      { de: "Nein, nur die Kopfschmerzen. Aber sie sind sehr stark.", en: "No, just the headache. But it's very strong." },
    ],
    [{ de: "der Kopfschmerz", en: "headache", article: "der" }, { de: "das Fieber", en: "fever", article: "das" }, { de: "das Symptom", en: "symptom", article: "das" }],
    [
      { de: "Seit wann hat der Patient Kopfschmerzen?", en: "Since when does the patient have a headache?", options: [{ de: "Seit heute Morgen", en: "Since this morning", correct: false }, { de: "Seit gestern Abend", en: "Since yesterday evening", correct: true }, { de: "Seit einer Woche", en: "Since a week", correct: false }] },
      { de: "Hat der Patient noch andere Symptome?", en: "Does the patient have any other symptoms?", options: [{ de: "Ja, Fieber", en: "Yes, fever", correct: false }, { de: "Ja, Husten", en: "Yes, cough", correct: false }, { de: "Nein, nur Kopfschmerzen", en: "No, just headache", correct: true }] },
    ],
    [{ de: "weh tun", en: "to hurt" }, { de: "stark", en: "strong/severe" }],
    "VOCAB_MATCH",
    [
      { text: "der Kopfschmerz", translation: "headache", order: 1, correctValue: "headache" },
      { text: "das Fieber", translation: "fever", order: 2, correctValue: "fever" },
      { text: "weh tun", translation: "to hurt", order: 3, correctValue: "hurt" },
    ],
  );

  addExperience(8, "Telling the Doctor About a Cold", 1, "Doctor",
    [
      { de: "Ich habe mich erkältet. Ich huste und habe Schnupfen.", en: "I've caught a cold. I'm coughing and have a runny nose." },
      { de: "Haben Sie Ihre Temperatur gemessen?", en: "Have you taken your temperature?" },
      { de: "Ja, 38,5 Grad.", en: "Yes, 38.5 degrees." },
      { de: "Das ist leichtes Fieber. Ich verschreibe Ihnen einen Hustensaft.", en: "That's a mild fever. I'll prescribe you a cough syrup." },
      { de: "Soll ich im Bett bleiben?", en: "Should I stay in bed?" },
    ],
    [{ de: "sich erkälten", en: "to catch a cold" }, { de: "der Hustensaft", en: "cough syrup", article: "der" }, { de: "der Schnupfen", en: "runny nose", article: "der" }],
    [
      { de: "Was hat der Patient?", en: "What does the patient have?", options: [{ de: "Eine Erkältung", en: "A cold", correct: true }, { de: "Eine Allergie", en: "An allergy", correct: false }, { de: "Eine Verletzung", en: "An injury", correct: false }] },
      { de: "Welche Temperatur hat der Patient?", en: "What temperature does the patient have?", options: [{ de: "37,5 Grad", en: "37.5 degrees", correct: false }, { de: "38,5 Grad", en: "38.5 degrees", correct: true }, { de: "39,5 Grad", en: "39.5 degrees", correct: false }] },
    ],
    [{ de: "messen", en: "to measure" }, { de: "verschreiben", en: "to prescribe" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Ich habe mich erkältet. Ich huste und habe Schnupfen.", order: 1 },
      { text: "Haben Sie Ihre Temperatur gemessen?", order: 2 },
      { text: "Ja, 38,5 Grad.", order: 3 },
      { text: "Das ist leichtes Fieber.", order: 4 },
      { text: "Ich verschreibe Ihnen einen Hustensaft.", order: 5 },
    ],
  );

  addExperience(8, "Explaining an Allergy", 1, "Doctor",
    [
      { de: "Ich bekomme im Frühling immer tränende Augen.", en: "I always get watery eyes in spring." },
      { de: "Das klingt nach einer Allergie. Testen wir das.", en: "That sounds like an allergy. Let's test it." },
      { de: "Muss ich dafür etwas vorbereiten?", en: "Do I need to prepare anything for that?" },
      { de: "Nein, ein einfacher Bluttest reicht aus.", en: "No, a simple blood test is enough." },
      { de: "Und was kann ich gegen die Symptome tun?", en: "And what can I do about the symptoms?" },
    ],
    [{ de: "die Allergie", en: "allergy", article: "die" }, { de: "tränende Augen", en: "watery eyes" }, { de: "der Bluttest", en: "blood test", article: "der" }],
    [
      { de: "Wann bekommt der Patient tränende Augen?", en: "When does the patient get watery eyes?", options: [{ de: "Im Herbst", en: "In autumn", correct: false }, { de: "Im Frühling", en: "In spring", correct: true }, { de: "Im Winter", en: "In winter", correct: false }] },
      { de: "Welcher Test wird gemacht?", en: "Which test is done?", options: [{ de: "Ein Allergietest auf der Haut", en: "A skin allergy test", correct: false }, { de: "Ein einfacher Bluttest", en: "A simple blood test", correct: true }, { de: "Ein Röntgen", en: "An X-ray", correct: false }] },
    ],
    [{ de: "bekommen", en: "to get" }, { de: "ausreichen", en: "to be enough" }],
    "BEST_RESPONSE",
    [
      { text: "Was kann ich gegen die Symptome tun?", translation: "What can I do about the symptoms?", order: 1, correctValue: "correct" },
      { text: "Können Sie mir ein Rezept ausstellen?", translation: "Can you give me a prescription?", order: 2, correctValue: "wrong" },
      { text: "Muss ich operiert werden?", translation: "Do I need surgery?", order: 3, correctValue: "wrong" },
    ],
  );

  // ── Doctor B1 (Module 9) ──
  addExperience(9, "Describing Severe Symptoms", 2, "Doctor",
    [
      { de: "Ich habe seit drei Tagen starke Bauchschmerzen.", en: "I've had severe stomach pain for three days." },
      { de: "Wo genau tut es weh? Können Sie zeigen?", en: "Where exactly does it hurt? Can you show me?" },
      { de: "Hier, auf der rechten Seite. Es fühlt sich stechend an.", en: "Here, on the right side. It feels stabbing." },
      { de: "Haben Sie Übelkeit oder Durchfall?", en: "Do you have nausea or diarrhea?" },
      { de: "Ja, ich musste mich gestern übergeben.", en: "Yes, I vomited yesterday." },
    ],
    [{ de: "der Bauchschmerz", en: "stomach pain", article: "der" }, { de: "die Übelkeit", en: "nausea", article: "die" }, { de: "stechend", en: "stabbing" }],
    [
      { de: "Wie lange hat der Patient Schmerzen?", en: "How long has the patient had pain?", options: [{ de: "Seit einem Tag", en: "For one day", correct: false }, { de: "Seit drei Tagen", en: "For three days", correct: true }, { de: "Seit einer Woche", en: "For a week", correct: false }] },
      { de: "Welche zusätzlichen Symptome hat der Patient?", en: "What additional symptoms does the patient have?", options: [{ de: "Husten und Fieber", en: "Cough and fever", correct: false }, { de: "Übelkeit und Erbrechen", en: "Nausea and vomiting", correct: true }, { de: "Kopfschmerzen und Schwindel", en: "Headache and dizziness", correct: false }] },
    ],
    [{ de: "das Erbrechen", en: "vomiting" }, { de: "die Seite", en: "side" }],
    "VOCAB_MATCH",
    [
      { text: "die Übelkeit", translation: "nausea", order: 1, correctValue: "nausea" },
      { text: "stechend", translation: "stabbing", order: 2, correctValue: "stabbing" },
      { text: "der Durchfall", translation: "diarrhea", order: 3, correctValue: "diarrhea" },
    ],
  );

  addExperience(9, "Getting a Referral to a Specialist", 2, "Doctor",
    [
      { de: "Ich glaube, ich brauche eine Überweisung zum Hautarzt.", en: "I think I need a referral to a dermatologist." },
      { de: "Was haben Sie für Beschwerden?", en: "What complaints do you have?" },
      { de: "Ich habe einen Ausschlag am Arm, der nicht weggeht.", en: "I have a rash on my arm that won't go away." },
      { de: "Das sollte ein Facharzt untersuchen. Ich schreibe Ihnen die Überweisung.", en: "A specialist should examine that. I'll write you the referral." },
      { de: "Wie lange dauert es, bis ich einen Termin bekomme?", en: "How long does it take to get an appointment?" },
    ],
    [{ de: "die Überweisung", en: "referral", article: "die" }, { de: "der Hautarzt", en: "dermatologist", article: "der" }, { de: "der Ausschlag", en: "rash", article: "der" }],
    [
      { de: "Welche Art von Arzt braucht der Patient?", en: "What type of doctor does the patient need?", options: [{ de: "Einen Augenarzt", en: "An eye doctor", correct: false }, { de: "Einen Hautarzt", en: "A dermatologist", correct: true }, { de: "Einen Zahnarzt", en: "A dentist", correct: false }] },
      { de: "Was hat der Patient am Arm?", en: "What does the patient have on his arm?", options: [{ de: "Eine Schwellung", en: "A swelling", correct: false }, { de: "Einen Ausschlag", en: "A rash", correct: true }, { de: "Eine Verletzung", en: "An injury", correct: false }] },
    ],
    [{ de: "untersuchen", en: "to examine" }, { de: "der Facharzt", en: "specialist" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Ich glaube, ich brauche eine Überweisung zum Hautarzt.", order: 1 },
      { text: "Was haben Sie für Beschwerden?", order: 2 },
      { text: "Ich habe einen Ausschlag am Arm, der nicht weggeht.", order: 3 },
      { text: "Das sollte ein Facharzt untersuchen.", order: 4 },
      { text: "Ich schreibe Ihnen die Überweisung.", order: 5 },
    ],
  );

  addExperience(9, "Understanding a Diagnosis", 2, "Doctor",
    [
      { de: "Die Blutwerte zeigen, dass Sie eine Infektion haben.", en: "The blood test results show you have an infection." },
      { de: "Ist es etwas Ernstes?", en: "Is it something serious?" },
      { de: "Nein, es ist eine harmlose bakterielle Infektion.", en: "No, it's a harmless bacterial infection." },
      { de: "Ich verschreibe Ihnen Antibiotika für sieben Tage.", en: "I'll prescribe you antibiotics for seven days." },
      { de: "Nehmen Sie die Tabletten dreimal täglich nach dem Essen.", en: "Take the tablets three times a day after meals." },
    ],
    [{ de: "die Infektion", en: "infection", article: "die" }, { de: "das Antibiotikum", en: "antibiotic", article: "das" }, { de: "die Tablette", en: "tablet", article: "die" }],
    [
      { de: "Was zeigen die Blutwerte?", en: "What do the blood test results show?", options: [{ de: "Eine Allergie", en: "An allergy", correct: false }, { de: "Eine Infektion", en: "An infection", correct: true }, { de: "Einen Vitaminmangel", en: "A vitamin deficiency", correct: false }] },
      { de: "Wie oft soll der Patient die Tabletten nehmen?", en: "How often should the patient take the tablets?", options: [{ de: "Einmal täglich", en: "Once daily", correct: false }, { de: "Zweimal täglich", en: "Twice daily", correct: false }, { de: "Dreimal täglich", en: "Three times daily", correct: true }] },
    ],
    [{ de: "die Blutwerte", en: "blood test results" }, { de: "harmlos", en: "harmless" }],
    "BEST_RESPONSE",
    [
      { text: "Ist es etwas Ernstes?", translation: "Is it something serious?", order: 1, correctValue: "correct" },
      { text: "Kann ich morgen wieder arbeiten?", translation: "Can I go back to work tomorrow?", order: 2, correctValue: "wrong" },
      { text: "Brauche ich eine Impfung?", translation: "Do I need a vaccination?", order: 3, correctValue: "wrong" },
    ],
  );

  // ── Doctor B1 Module 10: At the Pharmacy ──
  addExperience(10, "Asking the Pharmacist for Medicine", 2, "Doctor",
    [
      { de: "Guten Tag, ich habe ein Rezept vom Arzt.", en: "Good day, I have a prescription from the doctor." },
      { de: "Gerne. Bitte legen Sie Ihre Versicherungskarte dazu.", en: "Certainly. Please put your insurance card with it." },
      { de: "Gibt es das Medikament auch rezeptfrei?", en: "Is this medication also available over the counter?" },
      { de: "Nein, dieses Medikament ist verschreibungspflichtig.", en: "No, this medication is prescription-only." },
      { de: "Alles klar. Wie viel muss ich bezahlen?", en: "Alright. How much do I need to pay?" },
    ],
    [{ de: "das Rezept", en: "prescription", article: "das" }, { de: "das Medikament", en: "medication", article: "das" }, { de: "verschreibungspflichtig", en: "prescription-only" }],
    [
      { de: "Was hat der Patient vom Arzt bekommen?", en: "What did the patient get from the doctor?", options: [{ de: "Ein Rezept", en: "A prescription", correct: true }, { de: "Eine Überweisung", en: "A referral", correct: false }, { de: "Eine Impfung", en: "A vaccination", correct: false }] },
      { de: "Ist das Medikament rezeptfrei?", en: "Is the medication over-the-counter?", options: [{ de: "Ja", en: "Yes", correct: false }, { de: "Nein, es ist verschreibungspflichtig", en: "No, it's prescription-only", correct: true }] },
    ],
    [{ de: "rezeptfrei", en: "over-the-counter" }, { de: "die Versicherungskarte", en: "insurance card" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Guten Tag, ich habe ein Rezept vom Arzt.", order: 1 },
      { text: "Bitte legen Sie Ihre Versicherungskarte dazu.", order: 2 },
      { text: "Gibt es das Medikament auch rezeptfrei?", order: 3 },
      { text: "Nein, dieses Medikament ist verschreibungspflichtig.", order: 4 },
      { text: "Wie viel muss ich bezahlen?", order: 5 },
    ],
  );

  addExperience(10, "Buying Painkillers", 2, "Doctor",
    [
      { de: "Ich brauche etwas gegen Kopfschmerzen. Haben Sie eine Empfehlung?", en: "I need something for headaches. Do you have a recommendation?" },
      { de: "Ich empfehle Ibuprofen 400. Das hilft schnell.", en: "I recommend Ibuprofen 400. It works quickly." },
      { de: "Gibt es Nebenwirkungen?", en: "Are there side effects?" },
      { de: "Nehmen Sie es nicht auf leeren Magen. Und trinken Sie viel Wasser.", en: "Don't take it on an empty stomach. And drink plenty of water." },
      { de: "Danke für den guten Rat!", en: "Thanks for the good advice!" },
    ],
    [{ de: "die Empfehlung", en: "recommendation", article: "die" }, { de: "die Nebenwirkung", en: "side effect", article: "die" }],
    [
      { de: "Welches Medikament empfiehlt die Apothekerin?", en: "Which medication does the pharmacist recommend?", options: [{ de: "Aspirin 500", en: "Aspirin 500", correct: false }, { de: "Ibuprofen 400", en: "Ibuprofen 400", correct: true }, { de: "Paracetamol 500", en: "Paracetamol 500", correct: false }] },
      { de: "Was soll der Patient vermeiden?", en: "What should the patient avoid?", options: [{ de: "Viel Wasser trinken", en: "Drinking plenty of water", correct: false }, { de: "Das Medikament auf leeren Magen nehmen", en: "Taking it on an empty stomach", correct: true }, { de: "Das Medikament mit Essen nehmen", en: "Taking it with food", correct: false }] },
    ],
    [{ de: "die Apothekerin", en: "pharmacist (female)" }, { de: "der Rat", en: "advice" }],
    "BEST_RESPONSE",
    [
      { text: "Haben Sie eine Empfehlung gegen Kopfschmerzen?", translation: "Do you have a recommendation for headaches?", order: 1, correctValue: "correct" },
      { text: "Können Sie mir ein Rezept ausstellen?", translation: "Can you give me a prescription?", order: 2, correctValue: "wrong" },
      { text: "Ich möchte eine Versicherung abschließen.", translation: "I'd like to take out insurance.", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(10, "Understanding the Dosage", 2, "Doctor",
    [
      { de: "Wie oft soll ich den Hustensaft einnehmen?", en: "How often should I take the cough syrup?" },
      { de: "Nehmen Sie dreimal täglich 5 Milliliter.", en: "Take 5 milliliters three times a day." },
      { de: "Vor oder nach dem Essen?", en: "Before or after meals?" },
      { de: "Am besten nach dem Essen. Schütteln Sie die Flasche vor Gebrauch.", en: "Best after meals. Shake the bottle before use." },
      { de: "Muss ich die ganze Flasche leer machen?", en: "Do I need to finish the whole bottle?" },
    ],
    [{ de: "der Hustensaft", en: "cough syrup", article: "der" }, { de: "das Milliliter", en: "milliliter" }, { de: "der Gebrauch", en: "use" }],
    [
      { de: "Wie viel Hustensaft soll der Patient nehmen?", en: "How much cough syrup should the patient take?", options: [{ de: "10 Milliliter", en: "10 ml", correct: false }, { de: "5 Milliliter", en: "5 ml", correct: true }, { de: "15 Milliliter", en: "15 ml", correct: false }] },
      { de: "Was soll der Patient vor Gebrauch machen?", en: "What should the patient do before use?", options: [{ de: "Die Flasche erwärmen", en: "Warm the bottle", correct: false }, { de: "Die Flasche schütteln", en: "Shake the bottle", correct: true }, { de: "Die Flasche öffnen und riechen", en: "Open and smell the bottle", correct: false }] },
    ],
    [{ de: "einnehmen", en: "to take (medication)" }, { de: "schütteln", en: "to shake" }],
    "VOCAB_MATCH",
    [
      { text: "der Hustensaft", translation: "cough syrup", order: 1, correctValue: "syrup" },
      { text: "einnehmen", translation: "to take", order: 2, correctValue: "take" },
      { text: "schütteln", translation: "to shake", order: 3, correctValue: "shake" },
    ],
  );

  // ── Doctor B2 Module 11: Medical History ──
  addExperience(11, "Discussing Family Medical History", 3, "Doctor",
    [
      { de: "Gibt es in Ihrer Familie erbliche Krankheiten?", en: "Are there hereditary diseases in your family?" },
      { de: "Mein Vater hatte Diabetes und meine Mutter hatte Bluthochdruck.", en: "My father had diabetes and my mother had high blood pressure." },
      { de: "Dann sollten wir regelmäßig Ihre Blutwerte kontrollieren.", en: "Then we should check your blood values regularly." },
      { de: "Wie oft empfehlen Sie eine Vorsorgeuntersuchung?", en: "How often do you recommend a check-up?" },
      { de: "Einmal pro Jahr ist ausreichend, wenn Sie beschwerdefrei sind.", en: "Once a year is sufficient if you are symptom-free." },
    ],
    [{ de: "erblich", en: "hereditary" }, { de: "der Bluthochdruck", en: "high blood pressure" }, { de: "die Vorsorgeuntersuchung", en: "preventive check-up" }],
    [
      { de: "Welche Krankheiten hatten die Eltern des Patienten?", en: "What diseases did the patient's parents have?", options: [{ de: "Krebs und Asthma", en: "Cancer and asthma", correct: false }, { de: "Diabetes und Bluthochdruck", en: "Diabetes and high blood pressure", correct: true }, { de: "Herzinfarkt und Schlaganfall", en: "Heart attack and stroke", correct: false }] },
      { de: "Wie oft sollte der Patient zur Vorsorge?", en: "How often should the patient go for check-ups?", options: [{ de: "Alle sechs Monate", en: "Every six months", correct: false }, { de: "Einmal pro Jahr", en: "Once a year", correct: true }, { de: "Alle zwei Jahre", en: "Every two years", correct: false }] },
    ],
    [{ de: "kontrollieren", en: "to check" }, { de: "ausreichend", en: "sufficient" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Gibt es in Ihrer Familie erbliche Krankheiten?", order: 1 },
      { text: "Mein Vater hatte Diabetes.", order: 2 },
      { text: "Und meine Mutter hatte Bluthochdruck.", order: 3 },
      { text: "Dann sollten wir regelmäßig Ihre Blutwerte kontrollieren.", order: 4 },
      { text: "Einmal pro Jahr ist ausreichend.", order: 5 },
    ],
  );

  addExperience(11, "Preparing for Surgery Consultation", 3, "Doctor",
    [
      { de: "Wir haben die Ergebnisse der Magnetresonanztomographie erhalten.", en: "We have received the MRI results." },
      { de: "Das Meniskusriss erfordert einen arthroskopischen Eingriff.", en: "The meniscus tear requires an arthroscopic procedure." },
      { de: "Wie lange dauert die Operation und der Heilungsprozess?", en: "How long does the surgery and recovery process take?" },
      { de: "Der Eingriff dauert etwa 45 Minuten. Sie können am selben Tag nach Hause.", en: "The procedure takes about 45 minutes. You can go home the same day." },
      { de: "In sechs Wochen sollten Sie wieder normal gehen können.", en: "In six weeks you should be able to walk normally again." },
    ],
    [{ de: "der Eingriff", en: "procedure/surgery", article: "der" }, { de: "der Heilungsprozess", en: "recovery process", article: "der" }],
    [
      { de: "Welche Untersuchung wurde gemacht?", en: "Which examination was done?", options: [{ de: "Röntgen", en: "X-ray", correct: false }, { de: "Magnetresonanztomographie", en: "MRI", correct: true }, { de: "Ultraschall", en: "Ultrasound", correct: false }] },
      { de: "Wie lange dauert der Eingriff?", en: "How long does the procedure take?", options: [{ de: "30 Minuten", en: "30 minutes", correct: false }, { de: "45 Minuten", en: "45 minutes", correct: true }, { de: "60 Minuten", en: "60 minutes", correct: false }] },
    ],
    [{ de: "der Meniskusriss", en: "meniscus tear" }, { de: "arthroskopisch", en: "arthroscopic" }],
    "BEST_RESPONSE",
    [
      { text: "Wie lange dauert der Heilungsprozess?", translation: "How long does the recovery process take?", order: 1, correctValue: "correct" },
      { text: "Kann ich die OP verschieben?", translation: "Can I postpone the surgery?", order: 2, correctValue: "wrong" },
      { text: "Haben Sie ein Rezept für Schmerzmittel?", translation: "Do you have a prescription for painkillers?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(12, "Requesting a Second Opinion", 3, "Doctor",
    [
      { de: "Ich würde gerne eine Zweitmeinung einholen.", en: "I would like to get a second opinion." },
      { de: "Das ist absolut verständlich. Ich kann Ihnen eine Kollegin empfehlen.", en: "That's completely understandable. I can recommend a colleague." },
      { de: "Können Sie mir die Befunde für den Termin mitgeben?", en: "Can you give me the findings for the appointment?" },
      { de: "Selbstverständlich. Ich lasse Ihnen alle Unterlagen kopieren.", en: "Of course. I'll have all the documents copied for you." },
      { de: "Vielen Dank für Ihr Verständnis.", en: "Thank you for your understanding." },
    ],
    [{ de: "die Zweitmeinung", en: "second opinion", article: "die" }, { de: "der Befund", en: "medical finding", article: "der" }],
    [
      { de: "Was möchte der Patient?", en: "What does the patient want?", options: [{ de: "Eine Überweisung", en: "A referral", correct: false }, { de: "Eine Zweitmeinung", en: "A second opinion", correct: true }, { de: "Ein Rezept", en: "A prescription", correct: false }] },
      { de: "Was bietet der Arzt dem Patienten an?", en: "What does the doctor offer the patient?", options: [{ de: "Die Befunde zu kopieren", en: "To copy the findings", correct: true }, { de: "Einen Termin nächste Woche", en: "An appointment next week", correct: false }, { de: "Ein kostenloses Rezept", en: "A free prescription", correct: false }] },
    ],
    [{ de: "einholen", en: "to obtain" }, { de: "mitgeben", en: "to give along" }],
    "VOCAB_MATCH",
    [
      { text: "die Zweitmeinung", translation: "second opinion", order: 1, correctValue: "opinion" },
      { text: "der Befund", translation: "medical finding", order: 2, correctValue: "finding" },
      { text: "die Unterlagen", translation: "documents", order: 3, correctValue: "documents" },
    ],
  );

  // ── Job Interview A2 Module 13: Self-Introduction ──
  addExperience(13, "Introducing Yourself", 1, "Job Interview",
    [
      { de: "Guten Tag, mein Name ist Anna Schmidt.", en: "Good day, my name is Anna Schmidt." },
      { de: "Ich komme aus Spanien und lebe seit zwei Jahren in Berlin.", en: "I come from Spain and have been living in Berlin for two years." },
      { de: "Ich habe Wirtschaftswissenschaften studiert.", en: "I studied economics." },
      { de: "Zurzeit mache ich einen Deutschkurs, um mein B2 zu verbessern.", en: "Currently I'm taking a German course to improve my B2." },
      { de: "Ich bin sehr motiviert, in Deutschland zu arbeiten.", en: "I am very motivated to work in Germany." },
    ],
    [{ de: "der Name", en: "name" }, { de: "studieren", en: "to study" }, { de: "motiviert", en: "motivated" }],
    [
      { de: "Woher kommt Anna Schmidt?", en: "Where does Anna Schmidt come from?", options: [{ de: "Aus Italien", en: "From Italy", correct: false }, { de: "Aus Spanien", en: "From Spain", correct: true }, { de: "Aus Frankreich", en: "From France", correct: false }] },
      { de: "Was hat sie studiert?", en: "What did she study?", options: [{ de: "Informatik", en: "Computer science", correct: false }, { de: "Wirtschaftswissenschaften", en: "Economics", correct: true }, { de: "Medizin", en: "Medicine", correct: false }] },
    ],
    [{ de: "das Wirtschaftswissenschaften", en: "economics" }, { de: "der Deutschkurs", en: "German course" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Guten Tag, mein Name ist Anna Schmidt.", order: 1 },
      { text: "Ich komme aus Spanien.", order: 2 },
      { text: "Ich habe Wirtschaftswissenschaften studiert.", order: 3 },
      { text: "Zurzeit mache ich einen Deutschkurs.", order: 4 },
      { text: "Ich bin sehr motiviert, in Deutschland zu arbeiten.", order: 5 },
    ],
  );

  addExperience(13, "Talking About Your Current Job", 1, "Job Interview",
    [
      { de: "Was machen Sie beruflich?", en: "What do you do for a living?" },
      { de: "Ich arbeite als Verkäuferin in einem Bekleidungsgeschäft.", en: "I work as a sales assistant in a clothing store." },
      { de: "Seit wann arbeiten Sie dort?", en: "Since when have you worked there?" },
      { de: "Seit einem Jahr. Es ist ein Teilzeitjob.", en: "For a year. It's a part-time job." },
      { de: "Gefällt Ihnen die Arbeit?", en: "Do you like the work?" },
    ],
    [{ de: "beruflich", en: "professionally" }, { de: "der Verkäufer", en: "sales assistant" }, { de: "der Teilzeitjob", en: "part-time job" }],
    [
      { de: "Wo arbeitet Anna?", en: "Where does Anna work?", options: [{ de: "In einem Restaurant", en: "In a restaurant", correct: false }, { de: "In einem Bekleidungsgeschäft", en: "In a clothing store", correct: true }, { de: "In einem Büro", en: "In an office", correct: false }] },
      { de: "Wie lange arbeitet sie dort?", en: "How long has she worked there?", options: [{ de: "Seit drei Monaten", en: "For three months", correct: false }, { de: "Seit einem Jahr", en: "For a year", correct: true }, { de: "Seit zwei Jahren", en: "For two years", correct: false }] },
    ],
    [{ de: "die Verkäuferin", en: "sales assistant (female)" }],
    "BEST_RESPONSE",
    [
      { text: "Was machen Sie beruflich?", translation: "What do you do for a living?", order: 1, correctValue: "correct" },
      { text: "Wo wohnen Sie?", translation: "Where do you live?", order: 2, correctValue: "wrong" },
      { text: "Wie alt sind Sie?", translation: "How old are you?", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(13, "Describing Your Strengths", 1, "Job Interview",
    [
      { de: "Was sind Ihre Stärken?", en: "What are your strengths?" },
      { de: "Ich bin freundlich und hilfsbereit.", en: "I am friendly and helpful." },
      { de: "Außerdem lerne ich sehr schnell.", en: "Besides, I learn very quickly." },
      { de: "Und ich arbeite gerne im Team.", en: "And I like working in a team." },
      { de: "Das sind gute Eigenschaften für unsere Firma.", en: "Those are good qualities for our company." },
    ],
    [{ de: "die Stärke", en: "strength" }, { de: "hilfsbereit", en: "helpful" }, { de: "die Eigenschaft", en: "quality" }],
    [
      { de: "Welche Stärke nennt Anna nicht?", en: "Which strength does Anna NOT mention?", options: [{ de: "Freundlich", en: "Friendly", correct: false }, { de: "Schnell lernen", en: "Fast learning", correct: false }, { de: "Perfekt Deutsch sprechen", en: "Speaking perfect German", correct: true }] },
      { de: "Wie arbeitet sie gerne?", en: "How does she like to work?", options: [{ de: "Alleine", en: "Alone", correct: false }, { de: "Im Team", en: "In a team", correct: true }, { de: "Von zu Hause", en: "From home", correct: false }] },
    ],
    [{ de: "freundlich", en: "friendly" }, { de: "das Team", en: "team" }],
    "VOCAB_MATCH",
    [
      { text: "die Stärke", translation: "strength", order: 1, correctValue: "strength" },
      { text: "hilfsbereit", translation: "helpful", order: 2, correctValue: "helpful" },
      { text: "freundlich", translation: "friendly", order: 3, correctValue: "friendly" },
    ],
  );

  // ── Job Interview A2 Module 14: First Interview ──
  addExperience(14, "Answering Simple Questions", 1, "Job Interview",
    [
      { de: "Warum möchten Sie bei uns arbeiten?", en: "Why do you want to work with us?" },
      { de: "Weil Ihre Firma einen sehr guten Ruf hat.", en: "Because your company has a very good reputation." },
      { de: "Und die Arbeit klingt sehr interessant.", en: "And the work sounds very interesting." },
      { de: "Haben Sie schon Erfahrung in dieser Branche?", en: "Do you already have experience in this industry?" },
      { de: "Ja, ich habe zwei Jahre in einem ähnlichen Job gearbeitet.", en: "Yes, I worked for two years in a similar job." },
    ],
    [{ de: "der Ruf", en: "reputation" }, { de: "die Branche", en: "industry" }, { de: "die Erfahrung", en: "experience" }],
    [
      { de: "Warum möchte Anna bei der Firma arbeiten?", en: "Why does Anna want to work at the company?", options: [{ de: "Wegen des hohen Gehalts", en: "Because of the high salary", correct: false }, { de: "Wegen des guten Rufs", en: "Because of the good reputation", correct: true }, { de: "Wegen der kurzen Arbeitszeit", en: "Because of the short working hours", correct: false }] },
      { de: "Wie viel Erfahrung hat Anna in der Branche?", en: "How much experience does Anna have in the industry?", options: [{ de: "Ein Jahr", en: "One year", correct: false }, { de: "Zwei Jahre", en: "Two years", correct: true }, { de: "Drei Jahre", en: "Three years", correct: false }] },
    ],
    [{ de: "der Ruf", en: "reputation" }, { de: "klingen", en: "to sound" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Warum möchten Sie bei uns arbeiten?", order: 1 },
      { text: "Weil Ihre Firma einen sehr guten Ruf hat.", order: 2 },
      { text: "Und die Arbeit klingt sehr interessant.", order: 3 },
      { text: "Haben Sie Erfahrung in dieser Branche?", order: 4 },
      { text: "Ja, ich habe zwei Jahre gearbeitet.", order: 5 },
    ],
  );

  addExperience(14, "Asking About the Job", 1, "Job Interview",
    [
      { de: "Können Sie mir mehr über die Stelle erzählen?", en: "Can you tell me more about the position?" },
      { de: "Sie arbeiten im Kundenservice und helfen unseren Kunden.", en: "You work in customer service and help our clients." },
      { de: "Wie sind die Arbeitszeiten?", en: "What are the working hours?" },
      { de: "Von Montag bis Freitag, 9 bis 17 Uhr.", en: "Monday to Friday, 9 AM to 5 PM." },
      { de: "Das klingt gut. Gibt es Homeoffice-Möglichkeiten?", en: "That sounds good. Are there home office options?" },
    ],
    [{ de: "die Stelle", en: "position/job" }, { de: "der Kundenservice", en: "customer service" }, { de: "die Arbeitszeit", en: "working hours" }],
    [
      { de: "In welcher Abteilung würde Anna arbeiten?", en: "In which department would Anna work?", options: [{ de: "Im Verkauf", en: "In sales", correct: false }, { de: "Im Kundenservice", en: "In customer service", correct: true }, { de: "In der Buchhaltung", en: "In accounting", correct: false }] },
      { de: "Welche Arbeitszeiten hat die Stelle?", en: "What are the working hours?", options: [{ de: "8 bis 16 Uhr", en: "8 AM to 4 PM", correct: false }, { de: "9 bis 17 Uhr", en: "9 AM to 5 PM", correct: true }, { de: "10 bis 18 Uhr", en: "10 AM to 6 PM", correct: false }] },
    ],
    [{ de: "erzählen", en: "to tell" }, { de: "die Möglichkeit", en: "possibility/option" }],
    "BEST_RESPONSE",
    [
      { text: "Gibt es Homeoffice-Möglichkeiten?", translation: "Are there home office options?", order: 1, correctValue: "correct" },
      { text: "Wie hoch ist das Gehalt?", translation: "How high is the salary?", order: 2, correctValue: "wrong" },
      { text: "Wann bekomme ich Urlaub?", translation: "When do I get vacation?", order: 3, correctValue: "wrong" },
    ],
  );

  // ── Job Interview B1 Module 15: Experience & Skills ──
  addExperience(15, "Presenting Your Work Experience", 2, "Job Interview",
    [
      { de: "Erzählen Sie mir von Ihrer bisherigen Berufserfahrung.", en: "Tell me about your previous work experience." },
      { de: "Ich habe drei Jahre als Projektassistentin gearbeitet.", en: "I worked for three years as a project assistant." },
      { de: "Meine Hauptaufgaben waren Terminplanung und Kundenkommunikation.", en: "My main tasks were scheduling and client communication." },
      { de: "Haben Sie Erfahrung mit Projektmanagement-Software?", en: "Do you have experience with project management software?" },
      { de: "Ja, ich habe mit Trello und Jira gearbeitet.", en: "Yes, I have worked with Trello and Jira." },
    ],
    [{ de: "die Berufserfahrung", en: "work experience", article: "die" }, { de: "die Hauptaufgabe", en: "main task", article: "die" }, { de: "die Terminplanung", en: "scheduling", article: "die" }],
    [
      { de: "Wie lange hat Anna als Projektassistentin gearbeitet?", en: "How long did Anna work as a project assistant?", options: [{ de: "Zwei Jahre", en: "Two years", correct: false }, { de: "Drei Jahre", en: "Three years", correct: true }, { de: "Vier Jahre", en: "Four years", correct: false }] },
      { de: "Mit welcher Software hat sie gearbeitet?", en: "Which software has she worked with?", options: [{ de: "Excel und Word", en: "Excel and Word", correct: false }, { de: "Trello und Jira", en: "Trello and Jira", correct: true }, { de: "Photoshop und Illustrator", en: "Photoshop and Illustrator", correct: false }] },
    ],
    [{ de: "bisherig", en: "previous" }, { de: "die Kundenkommunikation", en: "client communication" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Erzählen Sie mir von Ihrer Berufserfahrung.", order: 1 },
      { text: "Ich habe drei Jahre als Projektassistentin gearbeitet.", order: 2 },
      { text: "Meine Hauptaufgaben waren Terminplanung und Kommunikation.", order: 3 },
      { text: "Haben Sie Erfahrung mit Projektmanagement-Software?", order: 4 },
      { text: "Ja, ich habe mit Trello und Jira gearbeitet.", order: 5 },
    ],
  );

  addExperience(15, "Handling Difficult Questions", 2, "Job Interview",
    [
      { de: "Warum haben Sie Ihren letzten Job gekündigt?", en: "Why did you quit your last job?" },
      { de: "Ich wollte mich beruflich weiterentwickeln.", en: "I wanted to develop professionally." },
      { de: "Gab es keine Aufstiegsmöglichkeiten?", en: "Were there no advancement opportunities?" },
      { de: "Leider nicht. Die Firma war sehr klein.", en: "Unfortunately not. The company was very small." },
      { de: "Das verstehe ich. Hier bieten wir gute Entwicklungschancen.", en: "I understand. Here we offer good development opportunities." },
    ],
    [{ de: "kündigen", en: "to quit/resign" }, { de: "die Aufstiegsmöglichkeit", en: "advancement opportunity" }, { de: "die Entwicklungschance", en: "development opportunity" }],
    [
      { de: "Warum hat Anna ihren letzten Job gekündigt?", en: "Why did Anna quit her last job?", options: [{ de: "Wegen des niedrigen Gehalts", en: "Because of the low salary", correct: false }, { de: "Wegen fehlender Aufstiegsmöglichkeiten", en: "Because of missing advancement opportunities", correct: true }, { de: "Wegen des langen Arbeitswegs", en: "Because of the long commute", correct: false }] },
      { de: "Was bietet die neue Firma?", en: "What does the new company offer?", options: [{ de: "Höheres Gehalt", en: "Higher salary", correct: false }, { de: "Entwicklungschancen", en: "Development opportunities", correct: true }, { de: "Dienstwagen", en: "Company car", correct: false }] },
    ],
    [{ de: "sich weiterentwickeln", en: "to develop further" }, { de: "bieten", en: "to offer" }],
    "BEST_RESPONSE",
    [
      { text: "Ich wollte mich beruflich weiterentwickeln.", translation: "I wanted to develop professionally.", order: 1, correctValue: "correct" },
      { text: "Mein Chef war nicht nett.", translation: "My boss was not nice.", order: 2, correctValue: "wrong" },
      { text: "Die Arbeit war langweilig.", translation: "The work was boring.", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(16, "Discussing Salary Expectations", 2, "Job Interview",
    [
      { de: "Welche Gehaltsvorstellungen haben Sie?", en: "What salary expectations do you have?" },
      { de: "Ich habe mich über die übliche Vergütung informiert.", en: "I informed myself about the usual compensation." },
      { de: "Basierend auf meiner Erfahrung finde ich 45.000 Euro angemessen.", en: "Based on my experience, I find 45,000 euros appropriate." },
      { de: "Das liegt in unserem Budget. Bietet Ihnen die Firma auch Zusatzleistungen?", en: "That's within our budget. Does the company also offer you additional benefits?" },
      { de: "Ja, wir zahlen einen Zuschuss zur Kinderbetreuung.", en: "Yes, we pay a subsidy for childcare." },
    ],
    [{ de: "die Gehaltsvorstellung", en: "salary expectation", article: "die" }, { de: "die Vergütung", en: "compensation", article: "die" }, { de: "die Zusatzleistung", en: "additional benefit" }],
    [
      { de: "Welches Gehalt findet Anna angemessen?", en: "What salary does Anna find appropriate?", options: [{ de: "40.000 Euro", en: "40,000 euros", correct: false }, { de: "45.000 Euro", en: "45,000 euros", correct: true }, { de: "50.000 Euro", en: "50,000 euros", correct: false }] },
      { de: "Welche Zusatzleistung bietet die Firma?", en: "What additional benefit does the company offer?", options: [{ de: "Dienstwagen", en: "Company car", correct: false }, { de: "Zuschuss zur Kinderbetreuung", en: "Childcare subsidy", correct: true }, { de: "Kostenloses Mittagessen", en: "Free lunch", correct: false }] },
    ],
    [{ de: "angemessen", en: "appropriate" }, { de: "der Zuschuss", en: "subsidy" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Welche Gehaltsvorstellungen haben Sie?", order: 1 },
      { text: "Ich habe mich über die übliche Vergütung informiert.", order: 2 },
      { text: "45.000 Euro finde ich angemessen.", order: 3 },
      { text: "Das liegt in unserem Budget.", order: 4 },
      { text: "Wir zahlen auch einen Zuschuss zur Kinderbetreuung.", order: 5 },
    ],
  );

  // ── Job Interview B2 Module 17: Salary Negotiation ──
  addExperience(17, "Negotiating a Higher Salary", 3, "Job Interview",
    [
      { de: "Basierend auf meiner Qualifikation und Erfahrung hätte ich 55.000 Euro erwartet.", en: "Based on my qualifications and experience, I would have expected 55,000 euros." },
      { de: "Unser Budget für diese Stelle liegt bei 50.000 Euro.", en: "Our budget for this position is 50,000 euros." },
      { de: "Können wir über zusätzliche Leistungen wie Bonuszahlungen sprechen?", en: "Can we talk about additional benefits like bonus payments?" },
      { de: "Ja, wir bieten einen jährlichen Leistungsbonus von bis zu 10 Prozent.", en: "Yes, we offer an annual performance bonus of up to 10 percent." },
      { de: "Damit könnte ich leben. Dann nehmen wir den Vertrag an.", en: "I could live with that. Let's accept the contract then." },
    ],
    [{ de: "die Qualifikation", en: "qualification", article: "die" }, { de: "die Bonuszahlung", en: "bonus payment" }, { de: "der Leistungsbonus", en: "performance bonus" }],
    [
      { de: "Welches Gehalt hat Anna erwartet?", en: "What salary did Anna expect?", options: [{ de: "50.000 Euro", en: "50,000 euros", correct: false }, { de: "55.000 Euro", en: "55,000 euros", correct: true }, { de: "60.000 Euro", en: "60,000 euros", correct: false }] },
      { de: "Was bietet die Firma zusätzlich an?", en: "What does the company offer additionally?", options: [{ de: "Einen Dienstwagen", en: "A company car", correct: false }, { de: "Einen Leistungsbonus", en: "A performance bonus", correct: true }, { de: "Aktienoptionen", en: "Stock options", correct: false }] },
    ],
    [{ de: "erwarten", en: "to expect" }, { de: "jährlich", en: "annual" }],
    "BEST_RESPONSE",
    [
      { text: "Können wir über Bonuszahlungen sprechen?", translation: "Can we talk about bonus payments?", order: 1, correctValue: "correct" },
      { text: "Das Gehalt ist zu niedrig.", translation: "The salary is too low.", order: 2, correctValue: "wrong" },
      { text: "Ich muss mit meinem Anwalt sprechen.", translation: "I need to speak with my lawyer.", order: 3, correctValue: "wrong" },
    ],
  );

  addExperience(17, "Discussing Contract Details", 3, "Job Interview",
    [
      { de: "Ich habe den Arbeitsvertrag erhalten und durchgelesen.", en: "I received the employment contract and read through it." },
      { de: "Haben Sie Fragen zu bestimmten Klauseln?", en: "Do you have questions about specific clauses?" },
      { de: "Die Probezeit beträgt sechs Monate. Ist das verlängerbar?", en: "The probation period is six months. Is it extendable?" },
      { de: "Normalerweise nicht. Aber in Ausnahmefällen können wir verlängern.", en: "Usually not. But in exceptional cases we can extend." },
      { de: "Und wie viele Urlaubstage habe ich pro Jahr?", en: "And how many vacation days do I have per year?" },
    ],
    [{ de: "der Arbeitsvertrag", en: "employment contract", article: "der" }, { de: "die Probezeit", en: "probation period", article: "die" }, { de: "der Urlaubstag", en: "vacation day", article: "der" }],
    [
      { de: "Wie lange ist die Probezeit?", en: "How long is the probation period?", options: [{ de: "Drei Monate", en: "Three months", correct: false }, { de: "Sechs Monate", en: "Six months", correct: true }, { de: "Neun Monate", en: "Nine months", correct: false }] },
      { de: "Ist die Probezeit verlängerbar?", en: "Is the probation period extendable?", options: [{ de: "Nein, nie", en: "No, never", correct: false }, { de: "In Ausnahmefällen ja", en: "In exceptional cases, yes", correct: true }, { de: "Ja, immer", en: "Yes, always", correct: false }] },
    ],
    [{ de: "durchlesen", en: "to read through" }, { de: "die Klausel", en: "clause" }],
    "VOCAB_MATCH",
    [
      { text: "der Arbeitsvertrag", translation: "employment contract", order: 1, correctValue: "contract" },
      { text: "die Probezeit", translation: "probation period", order: 2, correctValue: "probation" },
      { text: "die Klausel", translation: "clause", order: 3, correctValue: "clause" },
    ],
  );

  addExperience(18, "Technical Interview Questions", 3, "Job Interview",
    [
      { de: "Wie würden Sie ein Team durch eine schwierige Projektphase führen?", en: "How would you lead a team through a difficult project phase?" },
      { de: "Zuerst würde ich die Probleme identifizieren und priorisieren.", en: "First, I would identify and prioritize the problems." },
      { de: "Dann würde ich klare Ziele setzen und Aufgaben verteilen.", en: "Then I would set clear goals and distribute tasks." },
      { de: "Wie gehen Sie mit Konflikten im Team um?", en: "How do you handle conflicts in the team?" },
      { de: "Ich spreche offen mit allen Beteiligten und suche eine gemeinsame Lösung.", en: "I speak openly with all involved and look for a joint solution." },
    ],
    [{ de: "identifizieren", en: "to identify" }, { de: "priorisieren", en: "to prioritize" }, { de: "der Konflikt", en: "conflict" }],
    [
      { de: "Was würde Anna zuerst tun?", en: "What would Anna do first?", options: [{ de: "Aufgaben verteilen", en: "Distribute tasks", correct: false }, { de: "Probleme identifizieren", en: "Identify problems", correct: true }, { de: "Ziele setzen", en: "Set goals", correct: false }] },
      { de: "Wie geht Anna mit Konflikten um?", en: "How does Anna handle conflicts?", options: [{ de: "Sie ignoriert sie", en: "She ignores them", correct: false }, { de: "Sie spricht offen mit allen", en: "She speaks openly with everyone", correct: true }, { de: "Sie geht zum Vorgesetzten", en: "She goes to the supervisor", correct: false }] },
    ],
    [{ de: "führen", en: "to lead" }, { de: "die Lösung", en: "solution" }],
    "ARRANGE_DIALOGUE",
    [
      { text: "Wie führen Sie ein Team durch eine schwierige Phase?", order: 1 },
      { text: "Zuerst würde ich die Probleme identifizieren.", order: 2 },
      { text: "Dann würde ich klare Ziele setzen.", order: 3 },
      { text: "Wie gehen Sie mit Konflikten um?", order: 4 },
      { text: "Ich spreche offen mit allen Beteiligten.", order: 5 },
    ],
  );

  addExperience(18, "Closing the Interview", 3, "Job Interview",
    [
      { de: "Haben Sie noch Fragen an uns?", en: "Do you have any more questions for us?" },
      { de: "Ja, wie sieht der Einarbeitungsplan für neue Mitarbeiter aus?", en: "Yes, what does the onboarding plan for new employees look like?" },
      { de: "In der ersten Woche bekommen Sie eine umfassende Einführung.", en: "In the first week, you'll get a comprehensive introduction." },
      { de: "Danach arbeiten Sie mit einem Mentor zusammen.", en: "After that, you'll work with a mentor." },
      { de: "Das klingt sehr strukturiert. Ich freue mich auf die Zusammenarbeit!", en: "That sounds very structured. I look forward to working together!" },
    ],
    [{ de: "der Einarbeitungsplan", en: "onboarding plan", article: "der" }, { de: "der Mentor", en: "mentor" }, { de: "die Zusammenarbeit", en: "collaboration" }],
    [
      { de: "Was passiert in der ersten Woche?", en: "What happens in the first week?", options: [{ de: "Man bekommt eine Einführung", en: "You get an introduction", correct: true }, { de: "Man beginnt sofort mit der Arbeit", en: "You start working immediately", correct: false }, { de: "Man unterschreibt den Vertrag", en: "You sign the contract", correct: false }] },
      { de: "Mit wem arbeitet der neue Mitarbeiter nach der Einführung?", en: "Who does the new employee work with after the introduction?", options: [{ de: "Mit dem Chef", en: "With the boss", correct: false }, { de: "Mit einem Mentor", en: "With a mentor", correct: true }, { de: "Alleine", en: "Alone", correct: false }] },
    ],
    [{ de: "umfassend", en: "comprehensive" }, { de: "strukturiert", en: "structured" }],
    "BEST_RESPONSE",
    [
      { text: "Wie sieht der Einarbeitungsplan aus?", translation: "What does the onboarding plan look like?", order: 1, correctValue: "correct" },
      { text: "Wann bekomme ich meine erste Gehaltserhöhung?", translation: "When do I get my first raise?", order: 2, correctValue: "wrong" },
      { text: "Kann ich nächste Woche Urlaub nehmen?", translation: "Can I take vacation next week?", order: 3, correctValue: "wrong" },
    ],
  );

  // ── INSERT ALL DATA ──
  console.log("  Inserting experiences...");
  // Chunk inserts to avoid issues
  const chunk = <T,>(arr: T[], size: number) => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  };

  for (const chunked of chunk(expValues, 10)) await db.insert(experiences).values(chunked);
  for (const chunked of chunk(transValues, 50)) await db.insert(transcriptLines).values(chunked);
  for (const chunked of chunk(wordInsertValues, 50)) await db.insert(words).values(chunked);
  for (const chunked of chunk(expWordValues, 50)) await db.insert(experienceWords).values(chunked);
  for (const chunked of chunk(qValues, 20)) await db.insert(questions).values(chunked);
  for (const chunked of chunk(qoValues, 50)) await db.insert(questionOptions).values(chunked);
  for (const chunked of chunk(chValues, 10)) await db.insert(challenges).values(chunked);
  for (const chunked of chunk(ciValues, 50)) await db.insert(challengeItems).values(chunked);

  console.log("\n✅ Seed complete!");
  console.log(`  ${expValues.length} experiences`);
  console.log(`  ${transValues.length} transcript lines`);
  console.log(`  ${wordInsertValues.length} words`);
  console.log(`  ${qValues.length} questions`);
  console.log(`  ${qoValues.length} question options`);
  console.log(`  ${chValues.length} challenges`);
}

main().catch(console.error);
