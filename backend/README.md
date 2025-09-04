# ft_transcendence Backend (Fastify + SQLite)

This README explains how to run the **backend** of the project using Fastify, SQLite and Prisma ORM.

---

## ✅ 1. Clone the Repository

```bash
git clone git@github.com:Best-transcendence/ft_transcendence.git
cd ft_transcendence
git checkout <name of the branch, probably develop>
cd backend
```

---

## ⚙️ 2. Install Dependencies

> You need: **Node.js v18+** and **npm**

```bash
npm install
```

This works on **macOS**, **Linux**, and **Windows (with WSL)**.
> For Windows without WSL: install Git Bash and Node.js manually.

---

## 🧬 3. Run Migrations & Seed the DB

This creates and populates the local SQLite database.

```bash
npx prisma migrate dev --name init
npm run seed
```

---

## 🚀 4. Start the Dev Server

```bash
npm run dev
```

You should see logs like:

```bash
Server listening at http://127.0.0.1:3001
```

---

## 📖 5. Open Swagger API Docs

Visit:

```
http://localhost:3001/api/docs
```

There you will see:

- `GET /users` – returns a list of all users

You can do there "Try it out" -> Execute -> Execute and you will see list of users with all the data

---

## 🔍 6. Test the Endpoint

You can test it in your browser or using curl:

```bash
curl http://localhost:3001/users
```

Expected response:

```json
[
  { "id": 1, "email": "yioffe@example.com", "name": "Yulia" },
  ...
]
```

---

## 🧪 7. Edit the DB (Optional)

To edit the database with a GUI:

```bash
npx prisma studio
```

This opens a visual DB editor in your browser at `http://localhost:5555`.

You can view and edit all tables (users, etc).

Name field is hidden by default but you can edit it if you want

---

## 🧠 Notes

- SQLite file is stored at: `backend/prisma/dev.db`
- Seed users are:
    - `yioffe@example.com`
    - `thy-ngu@example.com`
    - `juan-pma@example.com`
    - `cbouvet@example.com`

All have dummy password `"q"` (not hashed yet).

---
