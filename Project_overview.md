### ✅ What We’re Building Now

We’re updating the **entire project spec** to include:

* richer **friend/contact profiles**
* a **journal of interactions/events**
* a **relationship points system**
* **penalties for missed goals**
* a **garden visualization** that reflects relationship health over time

This turns the product into:

> a relationship memory app + ADHD support system + gentle gamified consistency tracker

---

### 🧠 Why It Matters

This is a strong extension.

The original product helped users:

* remember details
* save notes
* set reminders

This new layer helps users:

* stay consistent
* feel progress visually
* notice neglected relationships early
* build a habit loop without harsh productivity pressure

For ADHD users, this matters because:

* memory support alone is passive
* gamified visual feedback creates motivation
* a plant metaphor is easier to process than raw scores or charts
* regular intervals make follow-up expectations concrete

This is a very good direction.

---

### 🛠️ Implementation

# Updated Full Project Spec for Codex

You can share the below as the **new master product specification**.

---

# 1. Product overview

## Product name

Second Brain for Relationships

## Product concept

A mobile-first web app / PWA that helps users manage personal relationships by storing important details about people, journaling interactions, setting reminders, and maintaining relationship health through a gentle garden-based gamification system.

## Core user promise

Help users remember people, stay in touch consistently, and feel visually rewarded for maintaining relationships.

## Primary audience

* people with ADHD
* busy professionals
* users who forget details or follow-ups
* users who want a low-pressure relationship maintenance system

---

# 2. Core feature pillars

## Pillar 1: People profiles

Store useful details about a person:

* name
* birthday
* hobbies
* likes
* dislikes
* food preferences
* personality traits
* important dates
* contact context
* social notes

## Pillar 2: Interaction journal

Keep a journal of:

* meetings
* calls
* messages
* shared events
* emotional context
* follow-up items

## Pillar 3: Reminders and intervals

Let users define how often they want to stay in touch:

* daily
* weekly
* bi-weekly
* monthly or longer

## Pillar 4: Relationship points

Users gain points for healthy interaction consistency and lose points when they repeatedly miss follow-up goals.

## Pillar 5: Garden visualization

Each relationship is represented by a plant that grows, stays healthy, or weakens based on interaction consistency.

---

# 3. New core product loop

The new loop is:

1. Add a person
2. Set an ideal interaction interval
3. Log interactions/events
4. Earn points when staying consistent
5. Miss goals → lose points
6. Watch the plant/garden reflect relationship health
7. Use reminders and summaries to recover consistency

This is the central habit loop of the app.

---

# 4. Gamification model

## Interaction interval types and plants

Each person is assigned a target cadence and corresponding plant type.

### Daily

* Plant: **Sunflower**
* Use case: partner, child, best friend, close family member

### Weekly

* Plant: **Tulip**
* Use case: close friend, sibling, regular social contact

### Bi-weekly

* Plant: **Orchid**
* Use case: meaningful but less frequent relationships

### Monthly or longer

* Plant: **Cactus**
* Use case: distant friend, extended family, low-frequency but still important relationship

---

## Plant meaning

Each plant is the visual representation of relationship care.

* healthy interaction cadence → plant grows / blooms
* slightly overdue → plant droops slightly
* repeatedly missed → plant weakens
* good recovery streak → plant recovers

This should feel gentle, not punishing.

---

## Points system

### Positive actions that add points

* logging a meaningful interaction
* completing a reminder on time
* meeting a cadence goal within its interval
* maintaining streaks
* adding useful profile context after interaction

### Negative actions that reduce points

* missing a cadence goal multiple times
* ignoring overdue reminders repeatedly
* long periods with no interaction

### Important product rule

Do **not** punish heavily for one missed interval.
Penalty should happen only after:

* repeated misses
* sustained neglect
* multiple snoozes without action

That is important for ADHD friendliness.

---

# 5. Relationship health states

Each person should have a relationship health state derived from cadence + points + recency.

Suggested states:

* **Thriving**
* **Healthy**
* **Needs Attention**
* **At Risk**
* **Dormant**

These states can affect:

* plant stage
* home dashboard suggestions
* reminders priority
* garden sorting

---

# 6. Updated data model

We need to update the backend models to support profiles, journaling, intervals, points, and plant states.

---

## User

Use custom Django user.

Fields:

* id
* email
* name
* created_at
* updated_at

---

## Person

Represents a relationship.

Fields:

* id
* user
* name
* nickname
* relationship_type
* birthday
* avatar_url
* notes_summary
* is_favorite
* contact_frequency
* plant_type
* relationship_points
* relationship_health
* current_streak
* longest_streak
* last_interaction_at
* next_goal_due_at
* created_at
* updated_at

### `relationship_type` enum

* friend
* family
* work
* partner
* other

### `contact_frequency` enum

* daily
* weekly
* biweekly
* monthly

### `plant_type` enum

* sunflower
* tulip
* orchid
* cactus

### `relationship_health` enum

* thriving
* healthy
* needs_attention
* at_risk
* dormant

### Notes

* `plant_type` can be auto-derived from `contact_frequency`
* `relationship_points` starts at a neutral base, like 50
* `next_goal_due_at` is recalculated after interactions

---

## PersonProfileDetail

Stores structured profile details.

Fields:

* id
* person
* category
* value
* created_at
* updated_at

### `category` enum

* hobby
* like
* dislike
* food
* trait
* gift_idea
* important_date
* topic
* habit
* preference
* allergy
* other

This replaces or extends the earlier generic fact model more clearly.

Examples:

* hobby = climbing
* like = sushi
* dislike = loud restaurants
* food = vegetarian
* trait = introverted

---

## InteractionJournalEntry

This is now more important than the old Note model.

Fields:

* id
* user
* person
* interaction_type
* title
* body
* mood
* interaction_date
* duration_minutes nullable
* was_meaningful boolean
* follow_up_needed boolean
* created_at
* updated_at

### `interaction_type` enum

* in_person
* call
* text
* video_call
* event
* gift
* other

### `mood` enum

* positive
* neutral
* negative
* stressed
* happy
* sad
* anxious

This should power:

* timeline
* points
* health calculation
* summaries

---

## InteractionTag

Fields:

* id
* name
* slug

Examples:

* food
* work
* follow-up
* family
* travel
* birthday
* conflict
* celebration

---

## InteractionTagMap

Fields:

* id
* interaction
* tag

---

## Reminder

Fields:

* id
* user
* person
* interaction nullable
* text
* due_at
* repeat
* status
* completed_at
* snooze_count
* created_at
* updated_at

### `repeat` enum

* none
* daily
* weekly
* biweekly
* monthly

### `status` enum

* pending
* done
* snoozed
* missed

---

## RelationshipScoreEvent

Tracks why points changed.

Fields:

* id
* user
* person
* event_type
* points_delta
* reason
* created_at

### `event_type` enum

* interaction_logged
* cadence_goal_met
* reminder_completed
* streak_bonus
* profile_enriched
* missed_goal
* repeated_miss
* prolonged_inactivity
* recovery_bonus

This is important because:

* it makes points explainable
* it supports future analytics
* it helps users trust the system

---

## GardenPlantState

Optional separate model, or computed from Person.
Recommended for prototype: compute from Person fields.

If you want a table:

Fields:

* id
* person
* plant_type
* growth_stage
* hydration_level
* bloom_state
* last_updated_at

### `growth_stage` enum

* seed
* sprout
* growing
* blooming
* wilting

### `bloom_state` enum

* none
* budding
* blooming
* faded

For MVP, this can be derived and not stored.

---

# 7. Updated scoring rules

Keep the scoring gentle and understandable.

## Base idea

Each person has a score from **0 to 100**.

### Starting value

* default: **50**

---

## Positive point examples

* log meaningful interaction: `+5`
* complete due reminder on time: `+3`
* meet cadence within target interval: `+8`
* 3 successful intervals in a row: `+10`
* add useful profile detail: `+1`

---

## Negative point examples

* miss one cadence window: `0` or `-1`
* miss multiple cadence windows in a row: `-5`
* ignore overdue reminder repeatedly: `-3`
* no interaction for long beyond cadence: `-8`

### Rule

Do not apply meaningful penalties until a pattern exists.

That keeps it supportive instead of shame-based.

---

## Suggested thresholds

* `80–100` → Thriving
* `60–79` → Healthy
* `40–59` → Needs Attention
* `20–39` → At Risk
* `0–19` → Dormant

---

# 8. Plant visualization rules

Each person gets one plant based on cadence.

## Plant stage example mapping

### Score 80–100

* blooming healthy plant

### Score 60–79

* healthy grown plant

### Score 40–59

* stable but slightly less vibrant plant

### Score 20–39

* drooping / weak plant

### Score 0–19

* wilted / dormant plant

---

## Plant asset recommendation for prototype

Do **not** build complex game art first.

Prototype options:

1. use simple illustrated SVG states
2. use emoji/flat icons first
3. use a few CSS-driven plant cards

Best prototype approach:

* each plant has **4–5 visual states**
* use SVG or image assets
* keep it simple and readable

---

# 9. Updated screen architecture

The app now has these primary sections:

* Home
* People
* Garden
* Reminders
* Settings

This is a change from the earlier 4-tab version.

## Recommended bottom nav

* Home
* People
* Garden
* Reminders
* Settings

If 5 tabs feels crowded on mobile, merge Settings into profile menu and keep:

* Home
* People
* Garden
* Reminders

That is my recommendation for MVP.

---

# 10. Updated screen specs

## A. Home

Purpose:
Show users what needs attention and how their relationships are doing.

Sections:

* greeting
* global search
* today focus card
* relationship health summary
* suggested actions
* recent interactions
* mini garden preview
* floating add button

### New Home widgets

#### Relationship health summary

Show:

* thriving relationships count
* needs attention count
* overdue goals count

#### Mini garden preview

Show 3–4 plants needing attention or doing well.

---

## B. People List

Purpose:
Browse people and see their current relationship status.

Person card now includes:

* avatar
* name
* relationship type
* short summary
* current health state
* points
* plant icon
* last interaction
* next due badge if overdue

Filters:

* all
* thriving
* needs attention
* overdue
* friends
* family
* work

---

## C. Person Detail

This becomes the main relationship dashboard for one person.

Sections:

1. header
2. profile summary
3. cadence + plant card
4. profile details
5. recent journal timeline
6. reminders
7. points history snippet
8. sticky add interaction button

### New section: Cadence + Plant card

Show:

* plant type
* current health state
* points
* current streak
* next goal due date
* short explanation like:

  * “Weekly relationship: interact by Friday to keep tulip blooming”

This is extremely important.

---

## D. Add / Edit Person

New fields:

* interaction frequency
* relationship importance level optional
* birthday
* hobbies
* likes
* dislikes
* food preferences

Save rule:

* only name required
* frequency can default to weekly if not chosen

---

## E. Journal / Add Interaction

This replaces “Add Note” as a more meaningful feature.

Fields:

* person
* interaction type
* title
* body
* interaction date
* mood
* meaningful toggle
* follow-up needed toggle
* quick tags

This should still be fast.

Use one big text box with optional structure.

---

## F. Reminders

Now linked more clearly to cadence and follow-up goals.

Sections:

* overdue
* today
* upcoming
* done

Card fields:

* person
* reminder text
* due date
* plant icon
* health urgency indicator

---

## G. Garden

This is the major new screen.

Purpose:
Give users a motivating overview of relationship consistency.

### Garden screen options

For prototype, use a **grid of plant cards**, not a complex animated map.

Each plant card shows:

* plant visual
* person name
* cadence type
* health state
* points
* next due date

Sorting options:

* needs attention first
* thriving first
* by cadence type
* by recent interaction

Filters:

* all
* sunflower
* tulip
* orchid
* cactus
* needs attention
* overdue

### Later upgrade

In future versions, this can become an actual garden scene layout.

For MVP, grid/cards is enough.

---

## H. Settings

Add:

* default scoring visibility
* notifications
* gentle mode toggle
* hide points / show only plant mode

This is useful because some users may prefer softer gamification.

---

# 11. Updated main flows

## Flow 1: Add person with cadence

* Add person
* choose interaction frequency
* save
* person gets assigned plant type
* initial plant appears in garden

## Flow 2: Log interaction

* open person
* tap add interaction
* save journal entry
* points update
* plant state updates
* next goal due recalculates

## Flow 3: Miss goal

* reminder becomes overdue
* after repeated misses, score decreases
* plant weakens
* Home and Garden surface recovery suggestions

## Flow 4: Recover relationship

* log interaction
* complete follow-up
* earn recovery points
* plant improves
* streak resets positively

## Flow 5: Review all relationships visually

* open Garden
* scan for drooping plants
* tap plant card
* open person detail
* take action

---

# 12. Updated API spec

Base path:

* `/api/v1/`

## Auth

* `POST /api/v1/auth/signup`
* `POST /api/v1/auth/login`
* `POST /api/v1/auth/logout`
* `GET /api/v1/auth/me`

## Home

* `GET /api/v1/home`

Now returns:

* today_focus
* relationship_health_summary
* suggested_actions
* recent_interactions
* garden_preview

## People

* `GET /api/v1/people`
* `POST /api/v1/people`
* `GET /api/v1/people/:id`
* `PATCH /api/v1/people/:id`
* `DELETE /api/v1/people/:id`

## Profile details

* `POST /api/v1/people/:id/details`
* `PATCH /api/v1/profile-details/:id`
* `DELETE /api/v1/profile-details/:id`

## Journal

* `GET /api/v1/interactions?person=:id`
* `POST /api/v1/interactions`
* `GET /api/v1/interactions/:id`
* `PATCH /api/v1/interactions/:id`
* `DELETE /api/v1/interactions/:id`

## Reminders

* `GET /api/v1/reminders`
* `POST /api/v1/reminders`
* `GET /api/v1/reminders/:id`
* `PATCH /api/v1/reminders/:id`
* `DELETE /api/v1/reminders/:id`
* `POST /api/v1/reminders/:id/complete`
* `POST /api/v1/reminders/:id/snooze`

## Garden

* `GET /api/v1/garden`
  Returns all plants / person garden cards

## Relationship scoring

* `GET /api/v1/people/:id/score-events`

## Search

* `GET /api/v1/search?q=`

---

# 13. Example person detail API response

```json
{
  "id": 1,
  "name": "Anna",
  "relationship_type": "friend",
  "birthday": "1995-08-10",
  "contact_frequency": "weekly",
  "plant_type": "tulip",
  "relationship_points": 72,
  "relationship_health": "healthy",
  "current_streak": 3,
  "longest_streak": 7,
  "last_interaction_at": "2026-04-14T18:00:00Z",
  "next_goal_due_at": "2026-04-21T18:00:00Z",
  "summary": [
    "Likes sushi and quiet cafés",
    "Weekly connection target",
    "Ask about job interview next time"
  ],
  "profile_details": {
    "hobbies": ["reading", "yoga"],
    "likes": ["sushi", "cats"],
    "dislikes": ["loud restaurants"],
    "food": ["vegetarian"]
  },
  "plant": {
    "type": "tulip",
    "growth_stage": "growing",
    "bloom_state": "budding"
  },
  "recent_interactions": [
    {
      "id": 21,
      "interaction_type": "in_person",
      "title": "Coffee after work",
      "body": "She seemed stressed about the interview next week.",
      "mood": "stressed",
      "interaction_date": "2026-04-14T18:00:00Z"
    }
  ],
  "reminders": [
    {
      "id": 9,
      "text": "Ask about interview",
      "due_at": "2026-04-20T09:00:00Z",
      "status": "pending"
    }
  ],
  "score_events": [
    {
      "event_type": "cadence_goal_met",
      "points_delta": 8,
      "reason": "Weekly interaction logged within target window",
      "created_at": "2026-04-14T18:01:00Z"
    }
  ]
}
```

---

# 14. Updated frontend page list

Routes:

* `/login`
* `/signup`
* `/`
* `/people`
* `/people/new`
* `/people/:id`
* `/people/:id/edit`
* `/interactions/new?person=:id`
* `/interactions/:id/edit`
* `/reminders`
* `/reminders/new?person=:id`
* `/garden`
* `/settings`

---

# 15. Updated frontend components

Add these components to the architecture:

## Garden

* `GardenGrid`
* `PlantCard`
* `PlantStatusBadge`
* `MiniGardenPreview`

## Person detail

* `CadenceCard`
* `PointsHistoryList`
* `HealthBadge`

## Journal

* `InteractionForm`
* `InteractionCard`
* `InteractionTimeline`

---

# 16. Updated folder structure

```text
frontend/
  src/
    components/
      garden/
        GardenGrid.tsx
        PlantCard.tsx
        PlantStatusBadge.tsx
        MiniGardenPreview.tsx
      interactions/
        InteractionCard.tsx
        InteractionForm.tsx
        InteractionTimeline.tsx
      people/
        PersonCard.tsx
        PersonHeader.tsx
        CadenceCard.tsx
        HealthBadge.tsx
        ProfileDetailsSection.tsx
        PointsHistoryList.tsx
```

Backend apps can become:

* users
* people
* interactions
* reminders
* scoring
* core

This is slightly cleaner now than keeping “notes”.

---

# 17. Updated seed/demo data

Every seeded person should now include:

* profile details
* cadence type
* current points
* plant type
* journal entries
* reminders

Example seed set:

### Anna

* weekly
* tulip
* 72 points
* healthy
* likes sushi
* hobby yoga
* reminder about interview

### Tom

* biweekly
* orchid
* 48 points
* needs attention
* loves football
* overdue follow-up

### Sarah

* monthly
* cactus
* 85 points
* thriving
* likes cats and quiet places

### Dad

* weekly
* tulip
* 65 points
* healthy
* birthday upcoming

### Maya

* daily
* sunflower
* 34 points
* at risk
* recent missed interactions

This will make the Garden screen meaningful from day one.

---

# 18. Product rules for scoring engine

These rules should be codified clearly for Codex.

## On interaction logged

* update `last_interaction_at`
* recalculate `next_goal_due_at`
* optionally add points if interaction counts as meaningful
* if within cadence window, add cadence success points
* update streak

## On reminder completed

* add small bonus points
* set status done

## On missed goals

Run a periodic backend check:

* if current date passes `next_goal_due_at` without interaction, mark first miss
* after repeated misses, subtract stronger points
* downgrade health state if needed

## On profile enrichment

Optional small points when users add meaningful structured details

---

# 19. ADHD-friendly gamification rules

This part matters a lot.

The system must:

* encourage without shaming
* avoid harsh penalties for one miss
* surface recovery opportunities quickly
* reward effort and re-engagement
* allow users to hide scores if they find numbers stressful

That means:

* plants are the primary metaphor
* scores are secondary
* “Needs attention” is better copy than “failing”

---

# 20. Updated Codex prompt

Paste this as the new master prompt:

```text
Build a working prototype for a mobile-first PWA called "Second Brain for Relationships".

Goal:
Create a relationship memory and consistency assistant for people with ADHD. Users can store profiles about people, journal interactions, track reminders, maintain relationship cadence goals, earn points for healthy consistency, lose points for repeated missed goals, and visualize relationship health through a garden of plants.

Core idea:
Each relationship has a target interaction cadence and a matching plant:
- daily -> sunflower
- weekly -> tulip
- bi-weekly -> orchid
- monthly -> cactus

Healthy interaction consistency keeps the plant growing. Repeated missed goals weaken the plant. The Garden screen gives users a visual overview of relationship health.

Tech stack:
- Frontend: React + Vite + Tailwind CSS + React Router + TanStack Query
- Backend: Django + Django REST Framework
- Database: PostgreSQL
- PWA support with manifest and installability

Backend apps:
- users
- people
- interactions
- reminders
- scoring
- core

Models to implement:
1. Person
   - user
   - name
   - nickname
   - relationship_type
   - birthday
   - avatar_url
   - notes_summary
   - is_favorite
   - contact_frequency
   - plant_type
   - relationship_points
   - relationship_health
   - current_streak
   - longest_streak
   - last_interaction_at
   - next_goal_due_at
   - created_at
   - updated_at

2. PersonProfileDetail
   - person
   - category
   - value
   - created_at
   - updated_at

3. InteractionJournalEntry
   - user
   - person
   - interaction_type
   - title
   - body
   - mood
   - interaction_date
   - duration_minutes
   - was_meaningful
   - follow_up_needed
   - created_at
   - updated_at

4. InteractionTag
   - name
   - slug

5. InteractionTagMap
   - interaction
   - tag

6. Reminder
   - user
   - person
   - interaction
   - text
   - due_at
   - repeat
   - status
   - completed_at
   - snooze_count
   - created_at
   - updated_at

7. RelationshipScoreEvent
   - user
   - person
   - event_type
   - points_delta
   - reason
   - created_at

Enums:
relationship_type = friend, family, work, partner, other
contact_frequency = daily, weekly, biweekly, monthly
plant_type = sunflower, tulip, orchid, cactus
relationship_health = thriving, healthy, needs_attention, at_risk, dormant
profile_detail_category = hobby, like, dislike, food, trait, gift_idea, important_date, topic, habit, preference, allergy, other
interaction_type = in_person, call, text, video_call, event, gift, other
mood = positive, neutral, negative, stressed, happy, sad, anxious
repeat = none, daily, weekly, biweekly, monthly
reminder_status = pending, done, snoozed, missed
score_event_type = interaction_logged, cadence_goal_met, reminder_completed, streak_bonus, profile_enriched, missed_goal, repeated_miss, prolonged_inactivity, recovery_bonus

Product rules:
- Each person has a target interaction cadence
- Plant type is mapped from cadence
- Relationship points range from 0 to 100
- Default starting points = 50
- Logging meaningful interactions increases points
- Completing reminders increases points slightly
- Meeting cadence windows increases points and streaks
- One missed goal should not be punished heavily
- Repeated missed goals should reduce points
- Relationship health is derived from points thresholds
- Garden view should display each person as a plant card with visual state

Thresholds:
- 80 to 100 = thriving
- 60 to 79 = healthy
- 40 to 59 = needs_attention
- 20 to 39 = at_risk
- 0 to 19 = dormant

Pages to build:
- /login
- /signup
- /
- /people
- /people/new
- /people/:id
- /people/:id/edit
- /interactions/new?person=:id
- /interactions/:id/edit
- /reminders
- /reminders/new?person=:id
- /garden
- /settings

Navigation:
Bottom nav should include:
- Home
- People
- Garden
- Reminders
Settings can be in profile menu or separate page

Home page should show:
- greeting
- search
- today focus
- relationship health summary
- suggested actions
- recent interactions
- mini garden preview
- floating add button

People page should show:
- searchable/filterable people
- relationship health
- points
- plant type
- overdue status badge

Person detail page should show:
- profile header
- cadence + plant card
- profile details (birthday, hobbies, likes, dislikes, food, etc.)
- recent interaction timeline
- reminders
- score history snippet
- sticky add interaction button

Garden page should show:
- grid of plant cards
- each card contains plant visual, person name, cadence, health state, points, next due date
- filters by plant type and health state

Interaction form should support:
- person
- interaction type
- title
- body
- interaction date
- mood
- was_meaningful
- follow_up_needed
- tags

Scoring examples:
- meaningful interaction: +5
- cadence goal met: +8
- reminder completed: +3
- streak bonus: +10
- repeated miss: -5
- prolonged inactivity: -8

Important UX rules:
- mobile-first
- ADHD-friendly
- calm UI
- cards instead of dense tables
- visual encouragement instead of shame
- plants are primary metaphor
- scores are secondary
- allow creating person with only a name
- fast interaction logging

API endpoints:
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- GET /api/v1/home
- GET/POST /api/v1/people
- GET/PATCH/DELETE /api/v1/people/:id
- POST /api/v1/people/:id/details
- PATCH/DELETE /api/v1/profile-details/:id
- GET/POST /api/v1/interactions
- GET/PATCH/DELETE /api/v1/interactions/:id
- GET/POST /api/v1/reminders
- GET/PATCH/DELETE /api/v1/reminders/:id
- POST /api/v1/reminders/:id/complete
- POST /api/v1/reminders/:id/snooze
- GET /api/v1/garden
- GET /api/v1/people/:id/score-events
- GET /api/v1/search?q=

Frontend components to include:
- AppShell
- TopBar
- BottomNav
- FloatingActionButton
- SearchInput
- Card
- Chip
- Avatar
- EmptyState
- FocusCard
- HealthSummaryCard
- SuggestedActionCard
- MiniGardenPreview
- PersonCard
- PersonHeader
- CadenceCard
- HealthBadge
- ProfileDetailsSection
- InteractionCard
- InteractionTimeline
- ReminderCard
- PlantCard
- GardenGrid
- PointsHistoryList
- InteractionForm
- PersonForm
- ReminderForm

Implementation notes:
- use React Query
- include seeded demo data
- create one demo account
- make the garden visually meaningful even if simple
- use SVG or simple card-based plant visuals for prototype
- include README, .env.example, and docker-compose
- focus on a usable prototype, not production perfection
```

---

# 21. Recommended MVP prioritization after update

Build in this order:

1. auth
2. people + profile details
3. interaction journal
4. reminders
5. cadence + points engine
6. person detail with plant card
7. garden screen
8. home health summary
9. polish

This order keeps the product functional before the gamification layer becomes visible.

---

# 22. Product recommendation

One important product recommendation:

For MVP, make the **Garden screen card-based**, not a freeform animated farm like HayDay.

Why:

* much faster to build
* easier to make responsive
* still communicates the concept clearly
* easier for Codex to implement well

Later, you can evolve it into:

* actual garden map
* grouped plots
* drag-and-drop layout
* seasonal visuals

---

### 🚀 Next Step

Next, I can turn this into the **exact Django model definitions and DRF endpoint contracts**.
