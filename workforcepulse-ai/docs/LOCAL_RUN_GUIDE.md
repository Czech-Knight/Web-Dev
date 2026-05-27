# Local Run Guide

## Option 1: Normal npm Run

```bash
npm install
npm run install:all
npm run dev
```

Open:

```txt
http://localhost:5173
```

Check API:

```txt
http://localhost:4000/api/health
```

## Option 2: Run Backend and Frontend Separately

Terminal 1:

```bash
cd server
npm install
npm run dev
```

Terminal 2:

```bash
cd client
npm install
npm run dev
```

## Option 3: Docker Compose

```bash
docker compose up --build
```

## Troubleshooting

### Port already in use

Change `PORT` in `server/.env` or stop the process using port `4000`.

### Frontend cannot load data

Make sure the backend is running and `http://localhost:4000/api/health` returns JSON.

### npm command not found

Install Node.js 20 or later from the official Node.js website.
