# CanGo Database Schema (MVP)

## Overall Idea

CanGo has two types of data:

### Content Data
This is the learning material created by us:
- scenarios
- modules
- lessons
- audio
- transcripts
- questions
- challenges
- vocabulary

This data is the same for every user.

### User Data
This stores individual user progress:
- selected scenario levels
- completed lessons
- XP
- streak
- vocabulary Kanban
- activity history

Keeping these separate is important because thousands of users will use the same lessons, but each user has different progress.

---

## Content Database

### 1. Languages

**Purpose:** Stores the languages available in CanGo.

- **For MVP:** German
- **Future:** Italian, French, Spanish

**Fields:**
- ID
- Language name
- Language code

**Example:**
- German
- Code: `de`

**Reason:** Even though CanGo launches only for German, keeping a language table avoids rebuilding the database if we expand later.

---

### 2. Scenarios

**Purpose:** Stores real-life situations where users practice German.

**Examples:**
- Transportation
- Doctor
- Job Interview
- Restaurant
- Bank
- Supermarket

Each scenario belongs to a language.

**Example:** German → Transportation

**Fields:**
- ID
- Language ID
- Scenario name
- Description
- Cover image

**Reason:** Your core idea is "My Germany", where users learn through real-life situations instead of traditional chapters.

---

### 3. Levels

**Purpose:** Stores CEFR levels.

- **For MVP:** A2, B1, B2

**Fields:**
- ID
- Level name
- Order

**Reason:** The content needs to know whether something belongs to A2, B1, or B2.

---

### 4. Scenario Levels

**Purpose:** Connects a scenario with available levels.

**Example (Transportation):**
- A2 content
- B1 content
- B2 content

**Fields:**
- ID
- Scenario ID
- Level ID

**Reason:** We decided not to have one global user level. A user can have:
- Transportation → B1
- Doctor → A2
- Job Interview → B2

Each scenario has independent progress.

---

### 5. Modules

**Purpose:** Modules are smaller topics inside a scenario.

**Example (Transportation B1):**
- Understanding announcements
- Buying tickets
- Asking for help
- Problems and delays

**Fields:**
- ID
- Scenario level ID
- Module name
- Description
- Order

**Reason:** A scenario should not be a huge list of lessons. Modules make navigation easier. When the user opens a scenario:
- first incomplete module opens automatically
- completed modules stay collapsed
- future modules stay collapsed

---

### 6. Experiences (Lessons)

**Purpose:** The actual learning units.

**Example:** Transportation → B1 → Announcements

**Experience:** "Train delay announcement"

**Fields:**
- ID
- Module ID
- Title
- Description
- Audio file location
- Image location
- Duration
- XP reward
- Order

**Reason:** Users complete experiences, not entire scenarios. A user completes "Train delay announcement", not "Transportation".

---

### 7. Transcript Lines

**Purpose:** Stores the audio transcript. Each audio has multiple lines.

**Example:**
- German: "Mein Zug hat Verspätung."
- English: "My train is delayed."

**Fields:**
- ID
- Experience ID
- German text
- English translation
- Order

**Reason:** The app needs:
- hidden transcript by default
- German transcript
- German + English toggle
- word translation on hover/tap

---

### 8. Words (Global Vocabulary Dictionary)

**Purpose:** Stores all German vocabulary.

**Example:**
- "die Rechnung"
- Translation: "The bill"

**Fields:**
- ID
- German word
- English meaning
- Article
- Plural

**Reason:** A word can appear in many scenarios. Example: "Termin" can appear in Doctor, Bank, Job interview. We should not create the same word multiple times.

---

### 9. Experience Words

**Purpose:** Connects vocabulary with lessons.

**Example (Experience "Restaurant bill"):**
- Rechnung
- bezahlen
- Kellner

**Fields:**
- Experience ID
- Word ID

**Reason:** One lesson has many words. One word can appear in many lessons. This is a many-to-many relationship.

---

### 10. Questions

**Purpose:** Stores exercises after listening.

**Types:** Multiple choice, Matching, Challenge

**Fields:**
- ID
- Experience ID
- Question type
- Question text
- Translation
- Order

**Reason:** Every experience follows the same structure: Listen → Understand → Practice.

---

### 11. Question Options

**Purpose:** Stores answers for multiple-choice questions.

**Example (Question: "Why is the train delayed?"):**
- Weather
- Technical problem
- Driver issue

**Fields:**
- ID
- Question ID
- Answer text
- Translation
- Correct/incorrect

---

### 12. Challenges

**Purpose:** Stores bonus activities.

**Types:**
- Choose best response
- Arrange dialogue
- Vocabulary match

**Fields:**
- ID
- Experience ID
- Challenge type
- Instructions

**Reason:** Challenges are optional bonus XP. They are not required to complete the lesson.

---

### 13. Challenge Items

**Purpose:** Stores the individual parts of a challenge.

**Example (Arrange dialogue):**
- Sentence 1
- Sentence 2
- Sentence 3

or:

- Vocabulary matching: German word → English meaning

**Fields:**
- ID
- Challenge ID
- Text
- Translation
- Correct order/value

**Reason:** Instead of creating separate tables for every challenge type, MVP keeps one flexible structure.

---

## User Database

### 14. Users

Stores account information.

**Fields:**
- ID
- Email
- Name
- Authentication provider
- Created date

**Reason:** No guest mode. Users need accounts because progress must sync between phone, laptop, web.

---

### 15. User Scenario Settings

Stores the user's chosen level for each scenario.

**Example (User: Owais):**
- Transportation: B1
- Doctor: A2

**Fields:**
- User ID
- Scenario ID
- Selected level ID

**Reason:** A user does not have one German level everywhere. Their ability can differ by situation.

---

### 16. User Experience Progress

Stores completed lessons.

**Fields:**
- User ID
- Experience ID
- Completed
- Completion date
- Lesson XP claimed
- Bonus XP claimed

**Example:**
- User completes lesson → Lesson XP claimed: Yes, Bonus: No
- Later, user completes bonus → Bonus XP claimed: Yes

**Reason:** We decided: replaying lessons is unlimited, users should not farm XP, bonus XP can still be earned later.

---

### 17. User Statistics

Stores quick stats.

**Fields:**
- User ID
- Total XP
- Current streak
- Longest streak
- Last activity date

**Reason:** Dashboard needs fast access. We don't want to calculate XP every time.

---

### 18. User Activity

Stores daily activity history.

**Fields:**
- ID
- User ID
- Date
- XP earned that day

**Reason:** Needed for streak calculation. CanGo has a 3-day grace period. To know whether a streak survives, we need activity history.

---

### 19. User Vocabulary (Kanban)

Stores the user's personal vocabulary board.

**Columns:** Learning, Review, Mastered

**Fields:**
- User ID
- Word ID
- Status
- Added date

**Important MVP decision:** CanGo does NOT automatically add vocabulary. Users add words themselves. They can:
- add from transcript
- manually type words
- move cards anytime

**Reason:** Automatic vocabulary management becomes complicated: repeated words, multiple scenarios, duplicate categories, deciding mastery automatically. For MVP, user controls the system.

---

## Offline Support

**First app download:** User downloads lessons, audio, images, questions, transcripts. The app stores them locally.

**After that:** Learning works offline. Internet is only needed for account sync, updates, new content.

---

## Recommended Database

**PostgreSQL.**

**Reason:** CanGo has many relationships:
- scenarios → modules
- lessons → questions
- lessons → vocabulary
- users → progress

A relational database fits naturally.

---

## Final MVP Tables

### Content:
1. Languages
2. Scenarios
3. Levels
4. Scenario Levels
5. Modules
6. Experiences
7. Transcript Lines
8. Words
9. Experience Words
10. Questions
11. Question Options
12. Challenges
13. Challenge Items

### User:
14. Users
15. User Scenario Settings
16. User Experience Progress
17. User Statistics
18. User Activity
19. User Vocabulary