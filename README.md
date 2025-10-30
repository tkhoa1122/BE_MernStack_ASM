# Perfume Store REST API

Node.js REST API backend cho ứng dụng quản lý nước hoa, sử dụng Express + MongoDB + JWT Authentication.

## 🚀 Features

- **Authentication**: JWT-based auth with httpOnly cookies
- **Public Endpoints**: Browse perfumes, view details, add comments
- **Admin API**: Full CRUD operations for brands and perfumes
- **Swagger Documentation**: Interactive API docs at `/api-docs`
- **Cascade Check**: Prevents deletion of referenced entities
- **Security**: Password hashing with bcryptjs, XSS protection

## 📦 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Documentation**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Validation**: Mongoose schema validation

## 🛠️ Setup

### 1. Environment Variables

Create `.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/as1
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
# Optional: Enable admin seed helper
ALLOW_SELF_ADMIN_SEED=true
```

### 2. Install & Run

```bash
npm install
npm run dev
```

Server runs at: http://localhost:3000
Swagger docs: http://localhost:3000/api-docs

### 3. Create Admin User

**Option 1**: Enable `ALLOW_SELF_ADMIN_SEED=true`, register, then POST to `/make-me-admin`

**Option 2**: Use MongoDB directly:
```javascript
db.members.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

## 📚 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API info | No |
| GET | `/perfumes` | List perfumes (search + filter) | No |
| GET | `/perfumes/:id` | Get perfume details | No |
| POST | `/perfumes/:id/comments` | Add/update comment | Yes (Member) |
| DELETE | `/perfumes/:id/comments` | Delete own comment | Yes (Member) |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (sets JWT cookie) |
| POST | `/auth/logout` | Logout (clears cookie) |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/me/password` | Change password |

### Admin API - Brands

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/brands` | List all brands | Admin |
| POST | `/api/brands` | Create brand | Admin |
| PUT | `/api/brands/:id` | Update brand | Admin |
| DELETE | `/api/brands/:id` | Delete brand* | Admin |

*Cannot delete brand if used by any perfume (cascade check)

### Admin API - Perfumes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/perfumes` | List all perfumes | Admin |
| POST | `/api/perfumes` | Create perfume | Admin |
| PUT | `/api/perfumes/:id` | Update perfume | Admin |
| DELETE | `/api/perfumes/:id` | Delete perfume | Admin |

## 📖 Response Format

All endpoints return JSON with consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔒 Authentication

JWT token is stored in **httpOnly cookie** named `token`. Frontend should:
- Include credentials in fetch: `credentials: 'include'`
- Let browser handle cookies automatically
- Check `/auth/me` to verify logged-in status

**Example Login:**
```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
```

## 🗂️ Data Models

### Member
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  YOB: Number,
  gender: Boolean, // true=male, false=female
  isAdmin: Boolean (default: false)
}
```

### Brand
```javascript
{
  brandName: String (unique, required)
}
```

### Perfume
```javascript
{
  perfumeName: String (required),
  brand: ObjectId -> Brand (required),
  category: String,
  concentration: String (enum),
  description: String,
  price: Number (required),
  fragranceNotes: String,
  image: String (URL),
  comments: [
    {
      member: ObjectId -> Member,
      comment: String,
      createdAt: Date
    }
  ]
}
```

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Connect Render to your repo
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

## 📝 Project Structure

```
├── app.js              # Express app setup
├── models/             # Mongoose schemas
│   ├── Member.js
│   ├── Brand.js
│   └── Perfume.js
├── routes/             # API routes
│   ├── index.js        # Public endpoints
│   ├── auth.js         # Auth endpoints
│   └── api/
│       ├── brands.js   # Admin brand CRUD
│       └── perfumes.js # Admin perfume CRUD
├── middleware/
│   ├── auth.js         # JWT authentication
│   └── cascadeCheck.js # Referential integrity
├── swagger.js          # Swagger configuration
└── bin/www             # Server entry point
```

## 📄 License

MIT

