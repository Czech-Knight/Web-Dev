# Test Plan

## Local Smoke Test

1. Start MongoDB:

```bash
docker compose up -d mongo
```

2. Start API:

```bash
cd src/ConstructionClientPortal.Api
dotnet run
```

3. Open `http://localhost:5138`.
4. Login as admin.
5. Confirm the seeded project is visible.
6. Create a client user.
7. Create a project assigned to the new client.
8. Add a task to the project.
9. Upload a PDF or image document.
10. Add a comment.
11. Logout and login as the seeded client.
12. Confirm the client only sees assigned projects.
13. Confirm the client can view tasks, view documents, download documents, and add comments.

## API Checks

- Invalid login returns `401`.
- Unauthenticated access to protected routes returns `401`.
- Client users cannot create projects, tasks, or users.
- Clients cannot access projects they are not assigned to.
- Admin can access all projects.
- Document download only works for users with project access.

## Browser Checks

- Dashboard layout works on desktop and mobile widths.
- Empty task/document/comment states display clearly.
- Form validation prevents missing required values.
- Error messages are displayed without exposing server internals.

## Regression Checks

After changing API or UI code, run:

```bash
dotnet build
```

Then repeat the smoke test.
