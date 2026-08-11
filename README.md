# Scriptoria

A full-stack blog platform built with Next.js, Prisma, and TailwindCSS.

## Features

- Rich text editor (Tiptap) with formatting, images, and links
- User authentication (credentials + GitHub/Google OAuth)
- Create, edit, publish/draft, and delete posts
- Category/tag filtering on the home feed
- Likes and threaded comments
- User profile management
- Responsive layout

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (credentials + OAuth)
- **Styling**: TailwindCSS
- **Editor**: Tiptap

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `DATABASE_URL` and `NEXTAUTH_SECRET`. To generate a secret:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
npm run db:push
npm run db:generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Management

```bash
npm run db:studio   # Open Prisma Studio (visual DB editor)
npm run db:push     # Push schema changes to DB
```

## Deployment

- **Frontend + API**: Vercel (works out of the box with Next.js)
- **Database**: Neon, Supabase, or Railway (all provide free PostgreSQL)

Set the environment variables in your hosting dashboard and deploy.
