# BuildTrack Client Portal

BuildTrack Client Portal is a full-stack web application designed for construction and infrastructure teams that need a simple client-facing portal for project updates, documents, task tracking, communication notes, and admin oversight.

The project is built to match a web developer internship environment involving HTML, CSS, JavaScript, .NET, MongoDB, IIS/AWS deployment awareness, documentation, debugging, and client-focused UX.

## Main Features

- Secure login with role-based access for admins and clients
- Client dashboard for project progress, status, milestones, documents, tasks, and comments
- Admin panel for creating client users, creating projects, assigning clients, and managing tasks
- Project status tracking with progress percentage, budget summary, location, BIM package reference, and safety notes
- Document upload, listing, and secure download through the .NET API
- Task assignment and status tracking
- Project comment timeline for admin/client communication
- MongoDB persistence for users, projects, documents, tasks, comments, and activity logs
- Clean responsive frontend using HTML, CSS, and vanilla JavaScript
- IIS, Docker, and AWS EC2 deployment notes included

## Tech Stack

| Area | Technology |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8) |
| Frontend | HTML, CSS, JavaScript |
| Database | MongoDB |
| Authentication | JWT bearer tokens with PBKDF2 password hashing |
| Local services | Docker Compose for MongoDB and optional API container |
| Deployment | IIS or AWS EC2 deployment notes |

## Demo Accounts

The app seeds these accounts on first run:

| Role | Email | Password |
|---|---|---|
| Admin | admin@buildtrack.local | Admin@12345 |
| Client | client@buildtrack.local | Client@12345 |

Change these credentials before using the project outside local development.

## Prerequisites

Install these tools:

- .NET 8 SDK
- Docker Desktop or Docker Engine
- Git
- A browser such as Chrome, Edge, or Firefox

No paid account, API key, AWS account, or external service is required for local development.

## Local Setup Option 1: MongoDB in Docker + API on Your Machine

Start MongoDB:

```bash
docker compose up -d mongo
```

Run the API and frontend:

```bash
cd src/ConstructionClientPortal.Api
dotnet restore
dotnet run
```

Open the application:

```text
http://localhost:5138
```

The API and frontend are served from the same .NET application.

## Local Setup Option 2: Full Docker Run

Run MongoDB and the API together:

```bash
docker compose --profile app up --build
```

Open:

```text
http://localhost:8080
```

## Project Structure

```text
buildtrack-client-portal/
├── docker-compose.yml
├── Dockerfile
├── README.md
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TEST_PLAN.md
└── src/
    └── ConstructionClientPortal.Api/
        ├── Controllers/
        ├── Data/
        ├── Dtos/
        ├── Models/
        ├── Services/
        ├── wwwroot/
        ├── Program.cs
        └── appsettings.Development.json
```

## Useful API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Read current user profile |
| GET | `/api/projects` | List visible projects |
| POST | `/api/projects` | Admin creates a project |
| GET | `/api/tasks?projectId={id}` | List tasks for a project |
| POST | `/api/tasks` | Admin creates a task |
| GET | `/api/comments?projectId={id}` | List project comments |
| POST | `/api/comments` | Add project comment |
| POST | `/api/documents/upload` | Upload project document |
| GET | `/api/documents/project/{projectId}` | List project documents |


