# MERN Assignment Backend (Express + Mongoose)

This project implements the assignment requirements with an Express server, Mongoose models, JWT auth, server-rendered Jade views, and admin-protected APIs.

## Features

- Members: register, login, logout, view/update profile, change password.
- Password hashing: bcryptjs.
- JWT auth stored in httpOnly cookie; auto-attached for views.
- Models:
  - Members (email, password, name, YOB, gender, isAdmin)
  - Brands (brandName)
  - Perfumes (fields per spec + embedded comments)
  - Comments embedded in Perfumes with one-per-member rule.
- Public pages:
  - `/` list perfumes with search (q) and brand filter; populated brandName.
  - `/perfumes/:id` detail with comments and comment form (login required).
- Admin-only APIs:
  - `/api/brands` and `/api/brands/:brandId` CRUD (including GET) admin-only.
  - `/api/perfumes` and `/api/perfumes/:perfumeId` CRUD (including GET) admin-only.
- Collectors:
  - `/collectors` returns all members (admin-only); renders HTML or JSON.
- UI/UX: Extrait concentration highlighted with a gradient badge.

## Setup

1. Create `.env` or edit defaults:

```
MONGODB_URI=mongodb://127.0.0.1:27017/as1
JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=7d
PORT=3000
# Optional development helper to promote the first user to admin
# ALLOW_SELF_ADMIN_SEED=true
```

2. Install and run:

```powershell
npm install
npm run dev
```

Open http://localhost:3000

## Admin access

Admin-only APIs require at least one admin user. Create one using MongoDB directly, or enable the development helper by setting `ALLOW_SELF_ADMIN_SEED=true` in `.env`, then:

- Register an account.
- Send a POST request to `/make-me-admin` while logged in (use REST client or a small HTML form) to promote yourself. Be sure to remove this flag after seeding.

## API Notes

- `/api/brands` and `/api/perfumes` are admin-only for GET/POST/PUT/DELETE per assignment Task 2.
- Public GETs for listing and viewing perfumes are through the server-rendered pages `/` and `/perfumes/:id`.

## Data rules

- Comment: one feedback per perfume per member. Posting again updates the same comment. You can delete your own comment from the detail page.
- Only members can edit their own information. Not even admins can edit other members via public UI.

## Folder overview

- `models/` Mongoose schemas and models
- `routes/` Express routes (public pages, auth, members, and admin APIs)
- `views/` Jade templates
- `public/` static assets and CSS

