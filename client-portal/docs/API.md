# API Reference

All protected endpoints require this header:

```text
Authorization: Bearer <token>
```

## Authentication

### POST `/api/auth/login`

Request:

```json
{
  "email": "admin@buildtrack.local",
  "password": "Admin@12345"
}
```

Response:

```json
{
  "token": "jwt-token",
  "email": "admin@buildtrack.local",
  "fullName": "BuildTrack Admin",
  "role": "Admin"
}
```

### GET `/api/auth/me`

Returns the logged-in user profile.

## Users

### GET `/api/admin/users`

Admin only. Lists users.

### POST `/api/admin/users`

Admin only. Creates a client or admin account.

Request:

```json
{
  "fullName": "Northside Client",
  "email": "northside@example.com",
  "password": "Client@12345",
  "role": "Client",
  "companyName": "Northside Developments"
}
```

## Projects

### GET `/api/projects`

Lists projects visible to the current user.

### GET `/api/projects/{id}`

Returns a project if the current user has access.

### POST `/api/projects`

Admin only. Creates a project.

```json
{
  "name": "North Melbourne Site Upgrade",
  "clientName": "Northside Developments",
  "location": "North Melbourne, VIC",
  "status": "InProgress",
  "progressPercent": 42,
  "budgetSummary": "$1.4M allocated",
  "bimPackageReference": "BIM-NM-2026-04",
  "safetySummary": "No open high-risk safety issues",
  "description": "Client portal rollout for construction project visibility.",
  "clientUserIds": ["mongo-user-id"]
}
```

### PUT `/api/projects/{id}`

Admin only. Updates project details.

## Tasks

### GET `/api/tasks?projectId={projectId}`

Lists tasks for a project.

### POST `/api/tasks`

Admin only. Creates a task.

### PUT `/api/tasks/{id}`

Admin only. Updates task details and status.

### DELETE `/api/tasks/{id}`

Admin only. Deletes a task.

## Comments

### GET `/api/comments?projectId={projectId}`

Lists project comments.

### POST `/api/comments`

Adds a project comment.

## Documents

### POST `/api/documents/upload`

Multipart form fields:

- `projectId`
- `file`

### GET `/api/documents/project/{projectId}`

Lists documents for a project.

### GET `/api/documents/download/{documentId}`

Downloads a document if the user has project access.
