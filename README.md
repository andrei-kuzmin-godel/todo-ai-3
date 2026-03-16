# My Todos

A modern, responsive todo app built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Features

- Add, edit (double-click), delete, and toggle todos
- Filter by All / Active / Completed
- Clear all completed todos with one click
- Persistent storage via `localStorage`
- Fully responsive  mobile-first design
- Light & dark mode (system preference)
- Accessible markup (ARIA labels, roles)

---

## Running Locally

### Prerequisites

- Node.js 20+ and npm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build and run the production server locally:

```bash
npm run build
npm start
```

---

## Running with Docker

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

To stop:

```bash
docker compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t todo-app .

# Run the container
docker run -p 3000:3000 todo-app
```

---

## Project Structure

```
.
 app/
    globals.css        # Global styles (Tailwind v4 import)
    layout.tsx         # Root layout with metadata
    page.tsx           # Main page (assembles all components)
 components/
    TodoFilter.tsx     # All / Active / Completed filter bar
    TodoInput.tsx      # Add-todo input form
    TodoItem.tsx       # Individual todo item (toggle / edit / delete)
 hooks/
    useTodos.ts        # State management + localStorage persistence
 types/
    todo.ts            # TypeScript type definitions
 Dockerfile             # Multi-stage production Docker build
 docker-compose.yml     # Docker Compose configuration
 .gitattributes         # Consistent line endings across platforms
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework |
| TypeScript | Static typing |
| Tailwind CSS v4 | Utility-first styling |
| localStorage | Client-side persistence |

---

## Development

```bash
npm run lint    # ESLint
npm run build   # Production build
```
