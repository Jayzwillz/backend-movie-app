# Database Setup Guide

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ⭐
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)
4. Create a database user:
   - Go to Database Access → Add New Database User
   - Create username and password
5. Whitelist your IP:
   - Go to Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow access from anywhere) for development
6. Get connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
7. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/movie-app?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation
1. **Windows:**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Install MongoDB Community Server
   - Start MongoDB service:
     ```powershell
     net start MongoDB
     ```
   - Or run manually:
     ```powershell
     mongod --dbpath C:\data\db
     ```

2. **Using Chocolatey (Windows):**
   ```powershell
   choco install mongodb
   mongod --dbpath C:\data\db
   ```

3. **Update .env file for local MongoDB:**
   ```
   MONGODB_URI=mongodb://localhost:27017/movie-app
   ```

### Option 3: Docker (If you have Docker installed)
```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

## After Database Setup
1. Update your `.env` file with the correct MONGODB_URI
2. Restart the server:
   ```bash
   npm run dev
   ```

## Verify Connection
The server should show:
```
Server running on port 5000
MongoDB Connected: <your-mongodb-host>
```

## Test the API
Use the health endpoint to verify everything is working:
```
GET http://localhost:5000/api/health
```

## Recommended: Use MongoDB Atlas
- ✅ No local installation required
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Easy to scale
- ✅ Works from anywhere
