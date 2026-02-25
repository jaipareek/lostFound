# Lost & Found Management System

A role-based web application for managing lost and found items on a college campus.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT

## Project Structure
```
lostFoundNew/
├── client/          # React frontend
│   ├── src/
│   │   ├── context/ # AuthContext
│   │   ├── lib/     # Supabase client, Axios
│   │   ├── pages/   # Student, Authority, Admin pages
│   │   └── components/
│   └── ...
└── server/          # Node.js backend
    ├── controllers/
    ├── middleware/
    ├── routes/
    └── index.js
```

## Getting Started

### 1. Setup Supabase
- Create a project at [supabase.com](https://supabase.com)
- Run the SQL schema (see `server/db/schema.sql` — coming Day 2)
- Copy your `URL` and `anon key`

### 2. Configure Environment Variables

**`client/.env`**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**`server/.env`**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 3. Install & Run

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Run client (port 3000)
cd ../client && npm run dev

# Run server (port 5000)
cd ../server && npm run dev
```

## Roles
| Role | Access |
|------|--------|
| Student | Inventory, Lost Reports, Claims, My Reports |
| Authority | All reports, Found items, Claims, Disputes |
| Admin | User management, Categories, Logs |
