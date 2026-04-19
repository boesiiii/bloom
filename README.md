# Bloom

A mobile-first PWA prototype for remembering relationship context, logging interactions, tracking gentle reminders, and visualizing relationship health as a plant garden.

## Stack

- Backend: Django, Django REST Framework, token auth
- Frontend: React, Vite, Tailwind CSS, React Router, TanStack Query
- Database: PostgreSQL in Docker, SQLite fallback for quick local backend runs
- PWA: web manifest, installable display mode, and a small service worker

## Demo Account

- Email: `demo@example.com`
- Password: `demo12345`

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1
- Admin: http://localhost:8000/admin

The backend container runs migrations and seeds demo data automatically.

## Run Locally

Backend:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Main API Endpoints

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/home`
- `GET/POST /api/v1/people`
- `GET/PATCH/DELETE /api/v1/people/:id`
- `POST /api/v1/people/:id/details`
- `PATCH/DELETE /api/v1/profile-details/:id`
- `GET/POST /api/v1/interactions`
- `GET/PATCH/DELETE /api/v1/interactions/:id`
- `GET/POST /api/v1/reminders`
- `GET/PATCH/DELETE /api/v1/reminders/:id`
- `POST /api/v1/reminders/:id/complete`
- `POST /api/v1/reminders/:id/snooze`
- `GET /api/v1/garden`
- `GET /api/v1/people/:id/score-events`
- `GET /api/v1/search?q=`

## Product Notes

- People can be created with only a name.
- Cadence maps to plants: daily sunflower, weekly tulip, bi-weekly orchid, monthly cactus.
- Plants now grow from connection streaks instead of points:
  - `0/100`: seed
  - `1..24`: sprout
  - `25..49`: growing
  - `50..74`: budding
  - `75..99`: blooming
  - `100`: fully bloomed
- Missed cadence windows increment `disconnection_streak`, reduce `plant_growth` by 10, and reset the plant to seed after `10/10` disconnections.
- Relationship points stay within `0..100`.
- Health thresholds:
  - `80..100`: thriving
  - `60..79`: healthy
  - `40..59`: needs attention
  - `20..39`: at risk
  - `0..19`: dormant
- Scoring is intentionally gentle: one missed goal creates only a small nudge, while repeated misses reduce points more noticeably.
