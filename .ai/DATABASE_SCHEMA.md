# PeerPod - Database Schema

## Overview

PeerPod uses **PostgreSQL** via **Supabase** with the following tables:

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────────┐       ┌─────────────┐
│    users    │       │  freelancer_profiles │       │   projects  │
├─────────────┤       ├──────────────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ user_id (PK, FK)     │       │ id (PK)     │
│ email       │       │ personality[]        │       │ client_id   │──┐
│ name        │       │ quiz_result (JSONB)  │       │ title       │  │
│ role        │       │ skills (JSONB)       │       │ description │  │
│ created_at  │       │ hours_per_week       │       │ team_size   │  │
└─────────────┘       │ timezone             │       │ due_date    │  │
       │              │ onboarding_complete  │       │ join_code   │  │
       │              └──────────────────────┘       │ is_open     │  │
       │                                             │ job_type    │  │
       │                                             │ ...         │  │
       │                                             └─────────────┘  │
       │                                                    │         │
       │              ┌──────────────────────┐              │         │
       │              │     applications     │              │         │
       │              ├──────────────────────┤              │         │
       │              │ id (PK)              │              │         │
       └──────────────│ freelancer_id (FK)   │              │         │
                      │ project_id (FK)      │──────────────┘         │
                      │ applied_at           │                        │
                      └──────────────────────┘                        │
                                                                      │
       ┌──────────────────────────────────────────────────────────────┘
       │
       │              ┌──────────────────────┐
       │              │       groups         │
       │              ├──────────────────────┤
       │              │ id (PK)              │
       └──────────────│ project_id (FK)      │
                      │ members (UUID[])     │──────┐
                      │ status               │      │
                      │ created_at           │      │
                      └──────────────────────┘      │
                             │                      │
                             │                      │
              ┌──────────────┴──────────────┐       │
              │                             │       │
              ▼                             ▼       │
       ┌─────────────┐             ┌──────────────┐ │
       │    tasks    │             │ chat_messages│ │
       ├─────────────┤             ├──────────────┤ │
       │ id (PK)     │             │ id (PK)      │ │
       │ group_id(FK)│             │ group_id(FK) │ │
       │ title       │             │ user_id (FK) │◄┘
       │ description │             │ message      │
       │ assigned_to │             │ timestamp    │
       │ completed   │             └──────────────┘
       └─────────────┘
```

## Table Definitions

### users
Primary user table for both clients and freelancers.

| Column     | Type        | Constraints                              | Description           |
| ---------- | ----------- | ---------------------------------------- | --------------------- |
| id         | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()  | Unique identifier     |
| email      | TEXT        | UNIQUE, NOT NULL                         | User email address    |
| name       | TEXT        | NOT NULL                                 | Display name          |
| role       | TEXT        | NOT NULL, CHECK ('client', 'freelancer') | User type             |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                            | Account creation time |

### freelancer_profiles
Extended profile data for freelancer users.

| Column              | Type        | Constraints                       | Description                   |
| ------------------- | ----------- | --------------------------------- | ----------------------------- |
| user_id             | UUID        | PRIMARY KEY, REFERENCES users(id) | Links to users table          |
| personality         | INTEGER[]   | DEFAULT '{}'                      | Legacy personality scores     |
| quiz_result         | JSONB       | -                                 | Comprehensive quiz data       |
| skills              | JSONB       | DEFAULT '[]'                      | Array of {skill, proficiency} |
| hours_per_week      | INTEGER     | DEFAULT 20                        | Weekly availability           |
| timezone            | TEXT        | DEFAULT 'UTC'                     | User's timezone               |
| onboarding_complete | BOOLEAN     | DEFAULT FALSE                     | Quiz completion status        |
| created_at          | TIMESTAMPTZ | DEFAULT NOW()                     | Profile creation time         |

### projects
Client-created project listings.

| Column             | Type          | Constraints                    | Description                     |
| ------------------ | ------------- | ------------------------------ | ------------------------------- |
| id                 | UUID          | PRIMARY KEY                    | Unique identifier               |
| client_id          | UUID          | REFERENCES users(id), NOT NULL | Project owner                   |
| title              | TEXT          | NOT NULL                       | Project name                    |
| description        | TEXT          | NOT NULL                       | Full description                |
| required_skills    | TEXT[]        | DEFAULT '{}'                   | Skills needed                   |
| team_size          | INTEGER       | DEFAULT 3                      | Target team size                |
| due_date           | DATE          | NOT NULL                       | Project deadline                |
| join_code          | TEXT          | UNIQUE, NOT NULL               | Team join code                  |
| is_open            | BOOLEAN       | DEFAULT TRUE                   | Accepting applications          |
| job_type           | TEXT          | CHECK values                   | contract, freelance, etc.       |
| experience_level   | TEXT          | CHECK values                   | entry, intermediate, etc.       |
| payment_type       | TEXT          | CHECK values                   | hourly, fixed, etc.             |
| payment_amount     | DECIMAL(10,2) | -                              | Payment amount/rate             |
| payment_max        | DECIMAL(10,2) | -                              | Maximum (for ranges)            |
| work_location      | TEXT          | CHECK values                   | remote, hybrid, onsite          |
| location           | TEXT          | -                              | Physical location if applicable |
| estimated_duration | TEXT          | -                              | Project timeline                |
| responsibilities   | TEXT[]        | DEFAULT '{}'                   | Job responsibilities            |
| requirements       | TEXT[]        | DEFAULT '{}'                   | Job requirements                |
| benefits           | TEXT[]        | DEFAULT '{}'                   | Benefits offered                |
| created_at         | TIMESTAMPTZ   | DEFAULT NOW()                  | Creation time                   |

### groups
Formed teams for projects.

| Column     | Type        | Constraints                        | Description        |
| ---------- | ----------- | ---------------------------------- | ------------------ |
| id         | UUID        | PRIMARY KEY                        | Unique identifier  |
| project_id | UUID        | REFERENCES projects(id), NOT NULL  | Associated project |
| members    | UUID[]      | DEFAULT '{}'                       | Array of user IDs  |
| status     | TEXT        | CHECK ('ACTIVE', 'OPEN', 'CLOSED') | Group status       |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                      | Formation time     |

### applications
Freelancer applications to projects.

| Column        | Type        | Constraints                       | Description       |
| ------------- | ----------- | --------------------------------- | ----------------- |
| id            | UUID        | PRIMARY KEY                       | Unique identifier |
| project_id    | UUID        | REFERENCES projects(id), NOT NULL | Target project    |
| freelancer_id | UUID        | REFERENCES users(id), NOT NULL    | Applicant         |
| applied_at    | TIMESTAMPTZ | DEFAULT NOW()                     | Application time  |

**Unique constraint**: (project_id, freelancer_id) - one application per user per project

### tasks
Project tasks assigned to team members.

| Column      | Type        | Constraints                     | Description         |
| ----------- | ----------- | ------------------------------- | ------------------- |
| id          | UUID        | PRIMARY KEY                     | Unique identifier   |
| group_id    | UUID        | REFERENCES groups(id), NOT NULL | Parent group        |
| title       | TEXT        | NOT NULL                        | Task name           |
| description | TEXT        | NOT NULL                        | Task details        |
| assigned_to | UUID        | REFERENCES users(id)            | Assignee (nullable) |
| completed   | BOOLEAN     | DEFAULT FALSE                   | Completion status   |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()                   | Creation time       |

### chat_messages
Group chat messages.

| Column    | Type        | Constraints                     | Description       |
| --------- | ----------- | ------------------------------- | ----------------- |
| id        | UUID        | PRIMARY KEY                     | Unique identifier |
| group_id  | UUID        | REFERENCES groups(id), NOT NULL | Chat group        |
| user_id   | UUID        | REFERENCES users(id), NOT NULL  | Message author    |
| message   | TEXT        | NOT NULL                        | Message content   |
| timestamp | TIMESTAMPTZ | DEFAULT NOW()                   | Send time         |

## Indexes

| Index Name                     | Table         | Columns       | Purpose                    |
| ------------------------------ | ------------- | ------------- | -------------------------- |
| idx_projects_client_id         | projects      | client_id     | Fast client project lookup |
| idx_projects_is_open           | projects      | is_open       | Filter open projects       |
| idx_applications_project_id    | applications  | project_id    | Project applicants         |
| idx_applications_freelancer_id | applications  | freelancer_id | User applications          |
| idx_tasks_group_id             | tasks         | group_id      | Group tasks                |
| idx_chat_messages_group_id     | chat_messages | group_id      | Group messages             |
| idx_groups_project_id          | groups        | project_id    | Project groups             |

## Row Level Security (RLS)

Currently using permissive policies for development:

```sql
-- All tables have RLS enabled with permissive policies
CREATE POLICY "Allow all" ON [table] FOR ALL USING (true) WITH CHECK (true);
```

**Production recommendations:**
- Users can only read/write their own data
- Freelancers can view open projects
- Clients can manage their own projects
- Group members can access group data
- Chat messages visible only to group members

## JSONB Structures

### quiz_result
```json
{
  "personality": {
    "leadership": 4,
    "traditionalism": 2,
    "peacekeeper": 5,
    "brainstormer": 4,
    "calmUnderPressure": 3,
    "listener": 2,
    "adaptable": 4,
    "controlNeed": 2,
    "challenger": 3
  },
  "workStyle": {
    "gradeExpectation": "A",
    "deadlineStyle": "early",
    "vagueTaskResponse": "initiative",
    "missingWorkResponse": "checkIn",
    "teamRole": "leader"
  },
  "scheduling": {
    "responseTime": "sameDay",
    "meetingFormat": "hybrid",
    "commitments": {...},
    "availabilityGrid": {...},
    "flexibility": "somewhat"
  },
  "bigFiveScores": {
    "openness": 75,
    "conscientiousness": 80,
    "extraversion": 60,
    "agreeableness": 70,
    "neuroticism": 30
  }
}
```

### skills
```json
[
  {"skill": "React", "proficiency": 5},
  {"skill": "TypeScript", "proficiency": 4},
  {"skill": "Node.js", "proficiency": 3}
]
```

## Seed Data

The schema includes seed data for testing:
- 4 users (3 freelancers, 1 client)
- 3 freelancer profiles with quiz data
- 2 projects with full details
- Sample applications
- 1 active group with tasks
