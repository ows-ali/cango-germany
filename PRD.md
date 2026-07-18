# CanGo — Product Requirements Document (PRD)

**Version:** 0.1 MVP  
**Product:** CanGo  
**Platform:** Progressive Web App (PWA)  
**Target Market:** Germany  
**Primary Language:** German learning  
**Audience:** International students, expats, professionals living in Germany

---

## 1. Product Vision

### What is CanGo?

CanGo is a real-life German learning platform designed to help people become confident living in Germany.

Instead of traditional vocabulary-first learning, CanGo focuses on realistic situations people actually experience:

- taking trains
- visiting doctors
- attending job interviews
- dealing with daily bureaucracy
- communicating in German society

The goal is not only to learn German.

The goal is:

> **"Prepare for real life in Germany."**

---

## 2. Problem Statement

Many German learners:

- know grammar rules but struggle in real situations
- cannot understand fast German speech
- panic during everyday conversations
- learn isolated vocabulary without context

Existing apps often focus on:

- gamification
- vocabulary repetition
- textbook sentences

**CanGo focuses on:**

- realistic listening
- practical scenarios
- confidence building

---

## 3. Target Users

### Primary users

**International students**

*Examples:* university students, Erasmus students, master's students in Germany

*Needs:*
- university life
- bureaucracy
- making friends
- daily communication

**Expats and professionals**

*Needs:*
- workplace German
- job interviews
- appointments
- professional communication

---

## 4. Product Positioning

**CanGo is:**

✅ Modern  
✅ Premium  
✅ Practical  
✅ Real-life focused  
✅ Designed for adults

**CanGo is NOT:**

❌ Cartoon learning  
❌ Children's gamification  
❌ Grammar textbook replacement  
❌ AI chatbot conversation app

---

## 5. Design Philosophy

### Visual Direction

Premium European startup aesthetic.

**Inspired by:**

- Airbnb
- Linear
- Revolut
- Apple Human Interface Guidelines
- Notion

**Avoid:**

- cartoon characters
- childish visuals
- excessive gamification
- bright playful colors

**Use:**

- authentic Germany photography
- realistic environments
- clean typography
- subtle animations
- elegant cards
- minimal interface

---

## 6. Core Product Concept

### My Germany

The main learning area.

Users practice German through real-world scenarios.

*Example:*

My Germany
├── Transportation
├── Doctor & Healthcare
├── Job Interview
├── Restaurant
├── Bank
├── Supermarket
├── Housing
└── Making Friends

yaml

**MVP scenarios:**

1. Transportation
2. Doctor & Healthcare
3. Job Interview

---

## 7. Learning Structure

The content hierarchy:

Language
↓
Scenario
↓
CEFR Level
↓
Module
↓
Experience
↓
Audio
↓
Questions
↓
Real Life Challenges

markdown

---

## 8. CEFR Level System

**Supported levels:**

- A2
- B1
- B2

There is **no global user level**. Each scenario has its own level.

*Example:*
- Transportation → B1
- Doctor → A2
- Job Interview → B2

### Changing Levels

Users can change level individually per scenario.

*Example:*

**Transportation:**

- Current: B1
- User switches: B2
- The content changes.
- Progress is tracked separately.

---

## 9. Onboarding Flow

### Screen 1: Welcome

**Purpose:** Introduce CanGo.

*Content:*

> Learn German for Real Life in Germany

**CTA:** Start Learning

### Screen 2: Select German Level

**Options:**
- A2
- B1
- B2

*Optional:* Take assessment later.

### Screen 3: Learning Goals

*Optional.*

**Options:**
- Study
- Work
- Daily life
- Social conversations

### Screen 4: Account Creation

**No guest mode.**

**Options:**
- Google login
- Email signup

### Screen 5: Welcome Reward

After signup:

**Starter:**
- 500 XP
- 7-day streak goal

**Purpose:** Motivate user immediately.

---

## 10. Main Navigation

**Mobile:**
- Home
- Vocabulary
- Progress
- Profile

**Desktop:** Left sidebar navigation.

---

## 11. Home Screen — My Germany

**Purpose:** Main dashboard.

**Shows:**
- XP
- streak
- today's activity
- scenario progress

*Example:*

> **My Germany 🇩🇪**  
> 🔥 7 day streak  
> ⭐ 540 XP
> 
> **Transportation** — B1 — 60% complete
> 
> **Doctor** — A2 — 30% complete
> 
> **Job Interview** — B2 — 10% complete

---

## 12. Scenario Detail Screen

*Example:*

### Transportation

**Header:** Transportation

**Current Level:** B1

Modules appear as accordion.

**Rules:**
- First incomplete module expanded
- Completed modules collapsed
- Future modules collapsed

*Example:*

▼ Understanding Announcements

✓ Platform Change
✓ Delay Announcement
→ Cancellation

▶ Buying Tickets

▶ Asking for Help

yaml

---

## 13. Experience Screen

Core learning screen.

*Example:*

> **Train Delay** — B1

**Contains:**

**Audio:**
- realistic German voice
- unlimited replay

**Transcript:**

Hidden by default.

Toggle: **Show Transcript**

**Modes:**
- German only
- German + English

Every German word is interactive.

- **Desktop:** Hover
- **Mobile:** Tap

**Shows:**
- German word
- English meaning

---

## 14. Question Types

Every experience contains:

### Type 1: Multiple Choice (2-3 per experience)

*Example:*

**Question (German):** Warum hatte der Zug Verspätung?
**Question (English):** Why was the train delayed?

**Answers:**
- Schlechtes Wetter (Weather)
- Technisches Problem (Technical problem) ✓
- Personalmangel (Staff shortage)

Each word in German text is hoverable/tappable for translation.
English text does not have word entries in the dictionary.

### Type 2: Matching (1 per experience)

*Example:*

**Match:**
- Verspätung → Delay
- Gleis → Platform

Stored in `question_options` table as German-English pairs. The `correct` boolean field is unused for matching questions.

### Type 3: Real Life Challenge (3 tabs always shown)

---

## 15. Real Life Challenges

**Purpose:** Apply knowledge differently.

**Available types:**

- **Best Response** — Choose the most appropriate German response.
- **Arrange Dialogue** — Put conversation sentences in correct order.
- **Vocabulary Match** — Match words and meanings.

**Rules:**
- All 3 challenge types are always visible as tabs in the sidebar
- User can freely toggle between them and check answers
- Each challenge has a check/submit mechanism with correct/incorrect feedback
- User can skip all challenges and submit the lesson for 50 XP
- Bonus XP (+20) is given for completing any one challenge
- Only one bonus completion gives XP per experience
- Replaying lessons does not give normal XP again

**Storage:** Challenges have their own dedicated tables (`challenges`, `challenge_items`). Each experience has exactly 1 challenge row (the 3 types are UI toggles, not separate DB records).

---

## 16. Lesson Completion

After finishing:

**Show:**

> Completed 🎉
> 
> +50 XP
> 
> Bonus available: +20 XP

If bonus already completed: No additional XP.

---

## 17. Vocabulary Kanban

**Important rule:** CanGo does **NOT** automatically add words. Users manually add words.

**Screen:**

Vocabulary

Learning | Review | Mastered

yaml

Users can:
- add words
- move cards
- review vocabulary

---

## 18. Progress Screen

**Shows:**
- XP
- streak
- completed experiences
- scenario progress

*Example:*

| Scenario | Level | Progress |
|---|---|---|
| Transportation | B1 | 12/20 experiences |
| Doctor | A2 | 5/20 experiences |

---

## 19. Streak System

CanGo uses a **forgiving streak system**.

Users have a **3-day grace period**.

*Example:*

**Miss:**
- Day 1
- Day 2
- Day 3

Streak remains.

**Day 4 missed:** Reset.

**Purpose:** Support real-life users.

---

## 20. MVP Features NOT Included

Not building initially:

- AI conversations
- speaking evaluation
- pronunciation scoring
- adaptive AI learning
- automatic vocabulary detection
- multiple languages
- C1/C2
---

# 21. Content Database Model

CanGo separates:

1. Content (same for all users)
2. User data (personal progress)

---

# 21.1 Content Structure

## Languages

Future-proofing only.

MVP:

German only.

Table:

languages

Fields:

- id
- name
- code


Example:


1
German
de


---

# 21.2 Scenarios

Represents real-life situations.

Table:

scenarios

Fields:

- id
- language_id
- name
- slug
- description
- image
- order (for display sorting)


Examples:


Transportation
Doctor
Job Interview


---

# 21.3 CEFR Levels

Table:

levels

Fields:

- id
- name
- order


Values:


A2
B1
B2


---

# 21.4 Scenario Levels

Connects scenarios with CEFR levels.

Example:

Transportation:

- A2
- B1
- B2


Table:

scenario_levels

Fields:

- id
- scenario_id
- level_id


---

# 21.5 Modules

Topics inside a scenario.

Example:

Transportation B1:

- Understanding announcements
- Asking staff
- Delays


Table:

modules

Fields:

- id
- scenario_level_id
- title
- description
- order


---

# 21.6 Experiences

The actual lesson unit.

Example:

"Train Delay Announcement"


Table:

experiences

Fields:

- id
- module_id
- title
- description
- audio_url
- image_url
- duration
- xp_reward
- order


Example:


Transportation

B1

Delays

Train cancelled


---

# 21.7 Transcript

Transcript supports:

- German text
- English translation
- word interaction


Table:

transcript_lines

Fields:

- id
- experience_id
- order
- german_text
- english_text


Example:

German:

"Mein Zug hat Verspätung."

English:

"My train is delayed."


---

# 21.8 Dictionary

Words are stored globally.

A word should not be duplicated.

Example:

"Termin"

can appear in:

- Doctor
- Bank
- Job Interview


Table:

words

Fields:

- id
- german_word
- english_translation
- article
- plural


Example:


die Rechnung

Bill


---

# 21.9 Experience Words

Connect words to experiences.

Table:

experience_words

Fields:

- experience_id
- word_id


Purpose:

Know which vocabulary appears in which lesson.

---

# 21.10 Questions

Every experience has questions.


Table:

questions

Fields:

- id
- experience_id
- type
- question_text
- english_translation
- order


Types (MVP):


MCQ — Uses `question_options` with `correct` boolean

MATCHING — Uses `question_options` as German-English pairs (`correct` field unused)


---

# 21.11 Question Options

For MCQ.

Table:

question_options

Fields:

- id
- question_id
- german_text
- english_text
- correct (boolean; used for MCQ, unused for MATCHING)


---

# 21.12 Challenges

Bonus activities.

Table:

challenges

Fields:

- id
- experience_id
- type


Types:


BEST_RESPONSE

ARRANGE_DIALOGUE

VOCAB_MATCH



---

# 21.13 Challenge Items

Generic storage for challenge data.

Table:

challenge_items

Fields:

- id
- challenge_id
- text
- translation
- order
- correct_value


Used for:

- dialogue ordering
- matching
- response choices


---

# 22. User Database Model

User data must sync across:

- phone
- laptop
- web


---

# 22.1 Users

Table:

users

Fields:

- id
- email
- password/auth provider
- created_at


---

# 22.2 Scenario Preferences

Each scenario has its own CEFR level.

Table:

user_scenario_settings

Fields:

- user_id
- scenario_id
- selected_level_id


Example:



Transportation → B1

Doctor → A2

Job Interview → B2


---

# 22.3 Experience Progress

Tracks lesson completion.


Table:

user_experience_progress


Fields:

- user_id
- experience_id
- completed
- completed_at
- lesson_xp_claimed
- bonus_xp_claimed


Example:


First completion:


completed = true

lesson_xp_claimed = true

bonus_xp_claimed = false



Later bonus:


bonus_xp_claimed = true


---

# 22.4 User Statistics

Table:

user_stats


Fields:

- user_id
- total_xp
- current_streak
- longest_streak
- last_activity_date


---

# 22.5 Activity History

Used for streak calculation.


Table:

user_activity


Fields:

- user_id
- date
- xp_earned


Example:


2026-07-01

70 XP


---

# 22.6 Vocabulary Kanban


Important rule:

Words are manually added by users.

CanGo does not automatically add vocabulary.


Table:

user_words


Fields:

- user_id
- word_id
- status
- added_at


Status:


Learning

Review

Mastered



---

# 23. Offline PWA Architecture


## Initial launch

User downloads:

- lesson content
- audio
- images


Content is stored locally.


After download:

The app works offline.


---

## Content storage

Example:


CanGo App

Content

├── Scenarios
├── Modules
├── Experiences
├── Questions
├── Challenges

Media

├── Audio
└── Images
---

## User data

Always belongs to the user account.


Offline changes:

Saved locally first.

Synced when internet returns.


---

# 24. Technical Architecture


## Frontend

Recommended:

- React
- Next.js or Vite
- TypeScript
- PWA support


---

## Backend

Recommended:

- FastAPI or Node.js

Responsibilities:

- Authentication
- User progress
- XP
- Sync
- Content management


---

## Database

Recommended:

PostgreSQL


Reason:

- relational content
- user progress
- vocabulary relationships


---

## Storage

Cloud object storage:

For:

- audio files
- images


Examples:

- AWS S3
- Cloudflare R2
- Supabase Storage


---

# 25. Content Creation Workflow


Each experience should be created as:


Scenario:

Transportation


Level:

B1


Module:

Train Problems


Experience:

Train Delay


Contains:


1. Realistic German dialogue

2. English translation

3. Vocabulary

4. MCQs

5. Matching

6. Real Life Challenge


---

# 26. AI Usage


AI can help generate:


- lesson drafts
- dialogues
- translations
- questions
- challenge exercises


Human review is required before publishing.


Audio generation should focus on:

- natural German voices
- realistic speed
- realistic situations


---

# 27. MVP Development Order


## Sprint 1

Foundation:

- project setup
- authentication
- database
- user model


---

## Sprint 2

Core learning:

- Home screen
- Scenario screen
- Module navigation
- Experience player


---

## Sprint 3

Exercises:

- MCQ
- Matching
- Challenges
- Completion


---

## Sprint 4

User features:

- XP
- streak
- vocabulary Kanban
- progress


---

## Sprint 5

Polish:

- animations
- responsive design
- PWA offline caching
- testing


---

# 28. MVP Success Criteria


CanGo MVP succeeds if:


A new user can:

1. Create account

2. Select German level

3. Choose a Germany scenario

4. Complete a realistic listening lesson

5. Understand unknown words

6. Complete exercises

7. Earn XP

8. Save vocabulary

9. Return the next day


The product should make users say:


"I can actually use this in Germany."

---

---

# Appendix: Final Schema Decisions (v0.1)

These decisions were finalized during schema review and override any earlier ambiguity.

## Content Tables

| Table | Decisions |
|---|---|
| **scenarios** | Added `order` field for display sorting |
| **modules** | Icons assigned by UI based on title (not stored in DB) |
| **experiences** | `duration` stored as string ("3:50"), `xp_reward` = 50 |
| **transcript_lines** | No `speaker` field (MVP simplification) |
| **words** | Duplicate `german_word` entries allowed with different `english_translation` per context; no `part_of_speech` field |
| **questions** | `type` = `MCQ` or `MATCHING` only. Each experience has 2-3 MCQ + 1 Matching |
| **question_options** | For MCQ: `correct` boolean indicates right answer. For MATCHING: each row is a German-English pair, `correct` unused |
| **challenges** | `instruction` field omitted — UI displays instruction text based on `type`. Each experience has 1 challenge row; the 3 tabs (Best Response / Arrange Dialogue / Vocabulary Match) are UI toggles |

## User Tables

| Table | Decisions |
|---|---|
| **user_experience_progress** | `lesson_xp_claimed` = 50 base XP, `bonus_xp_claimed` = 20 extra XP (hardcoded) |
| **user_activity** | Tracks daily XP for streak calculation (3-day grace period) |
| **user_vocabulary** | Only manual add — no auto-detection |

## Per-Experience Structure (Final)

Every experience contains:
- 1 audio file (generated via edge-tts, German neural voice)
- 4-6 transcript lines (German + English)
- 2-3 MCQ questions (bilingual, with hoverable German words)
- 1 Matching exercise (German-English pairs)
- 3 Real Life Challenge tabs (all visible, user chooses any one for bonus XP)

# End of CanGo PRD v0.1