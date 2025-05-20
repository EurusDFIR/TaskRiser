# Database Setup Guide for TaskRiser

This guide will help you set up the PostgreSQL database required for TaskRiser to function properly.

## Prerequisites

1. Install PostgreSQL from [the official website](https://www.postgresql.org/download/)
2. Make sure PostgreSQL is running on localhost:5432 (default port)

## Setup Instructions

### 1. Start PostgreSQL Server

Make sure your PostgreSQL server is running:

- **Windows**: Open Services (services.msc) and check if "postgresql-x64-XX" service is running
- **Mac**: Run `brew services start postgresql`
- **Linux**: Run `sudo service postgresql start` or `sudo systemctl start postgresql`

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database (inside psql)
CREATE DATABASE taskriser;

# Exit psql
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the root of your project with the following content:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/taskriser?schema=public"
JWT_SECRET="your_jwt_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Replace:
- `your_password` with your PostgreSQL password
- `your_jwt_secret_key` with a secure random string
- Google OAuth credentials (if using Google login)

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

This will create all necessary tables according to the schema in `prisma/schema.prisma`.

### 5. Test Database Connection

```bash
node test-db.js
```

You should see "Database connection successful" if everything is working properly.

## Troubleshooting

### Error: Can't reach database server at localhost:5432

This means PostgreSQL is not running or not accessible. Check the following:

1. Is PostgreSQL installed?
2. Is the PostgreSQL service running?
3. Is it running on the default port (5432)?
4. Is your DATABASE_URL correct in the .env file?

### Error: authentication failed for user

Your username or password in the DATABASE_URL is incorrect. Double-check these details.

### Error: database "taskriser" does not exist

Run the CREATE DATABASE command shown above in psql.

## Need Further Help?

Consult the official PostgreSQL documentation or seek help from your database administrator. 