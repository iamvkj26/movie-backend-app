# 🎬 HelloHood - Public Movie & Series API (Discontinued)

**Status:** 🛑 Discontinued  
**Reason:** Project has been split for security and scalability.  
**This repository now serves only as the public read-only movie/series API.**

---

## 📖 About the Project

HelloHood was designed as a lightweight movie and web series tracking system for personal and community use.

This public-facing API allows users to:
- 🎞️ View all movies and web series
- 🔎 Search and filter by genre, industry, format
- ✅ Check watched/unwatched status
- 📅 Browse content sorted by release year
- ℹ️ Access static "About" info
- 📬 Submit contact queries

This version of the API **does not support** authentication or data modifications (add/edit/delete). Those operations are now handled by a separate, secure admin API.

---

## 🚧 Why It Was Split

To improve security and performance, the project was **refactored into two separate servers**:
- 🔓 **Public API** — This project (for open read-only data)
- 🔐 **Admin & Auth API** — Moved to a private, secured backend

---

## 🚀 Endpoints Overview

### ✅ `GET /movieseries/get`
Returns filtered movie/series list with optional query params:
- `?search=` — Search by title  
- `?genre=` — Filter by genre  
- `?format=` — movie or series  
- `?industry=` — bollywood, hollywood, etc.  
- `?watched=` — true or false  

### ℹ️ `GET /movieseries/about`
Returns app details like stack, roles, and data info.

### 📬 `POST /movieseries/contact`
Submit contact form with:
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "mobile": "1234567890",
  "message": "Your message"
}

```

## 📦 Installation

```bash
git clone https://github.com/iamvkj26/movie-backend-app.git
cd movie-backend-app
npm install

PORT=5000
MONGO_URI=your_mongodb_connection_string

node server.js

```

## 🪦 RIP Project

![RIP Project](./assets/image/project.png)

> This project has been discontinued due to security reasons.  
> Authentication & Admin APIs have been migrated to a separate secured backend.