# Nexus AI

A modern AI chat application built with React, Node.js, Express, MongoDB, and OpenAI.

## Features

- Real OpenAI streaming responses
- Conversation history
- Professional, casual, and concise tones
- Regenerate responses
- Search conversations
- Dark and light themes
- Responsive sidebar
- Copy chat responses

## Requirements

- Node.js 18 or newer
- MongoDB local installation or MongoDB Atlas
- OpenAI API key

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create the environment file:

```bash
Copy-Item server/.env.example server/.env
```

3. Add your credentials to `server/.env`:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=mongodb://127.0.0.1:27017/nexus-ai
PORT=5000
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, use its MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-ai
```

## Run

Start the frontend and backend together:

```bash
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/conversations` | Get conversations |
| GET | `/api/conversations/search?q=query` | Search conversations |
| GET | `/api/conversations/:id` | Get one conversation |
| POST | `/api/chat` | Send a message |
| POST | `/api/chat/regenerate` | Regenerate an answer |
| PATCH | `/api/conversations/:id/tone` | Change tone |
| DELETE | `/api/conversations/:id` | Delete a conversation |

## Folder Structure

```text
client/  React frontend
server/  Express backend
server/models/       MongoDB models
server/controllers/  API controllers
server/routes/       API routes
server/services/     OpenAI integration
```

Do not commit `server/.env` or expose the OpenAI API key.
