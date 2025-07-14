# Admin Setup Guide for XZMovies

## How to Become an Admin

### Method 1: Create Admin User (Easiest)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend-movie-app
   ```

2. Run the admin creation script:
   ```bash
   npm run create-admin
   ```

3. This will create an admin user with:
   - **Email**: admin@xzmovies.com
   - **Password**: admin123
   - **Role**: admin

4. Login with these credentials to access admin features.

### Method 2: Promote Existing User
If you already have an account, you can promote it to admin:
1. Run this command (replace with your email):
   ```bash
   npm run promote-user your-email@example.com
   ```

### Method 3: Manual Database Update
If the scripts don't work, you can manually update your user in MongoDB:
1. Connect to your MongoDB database
2. Find your user document
3. Add or update the `role` field to `"admin"`

## Admin Features

Once you're logged in as an admin, you'll have access to:

### 🎯 Admin Dashboard (`/admin`)
- **User Statistics**: Total users, admins, reviews, and recent registrations
- **Top Reviewers**: See who's most active in the community

### 👥 User Management
- **View All Users**: Paginated list of all registered users
- **Promote/Demote**: Change user roles between 'user' and 'admin'
- **Delete Users**: Remove user accounts and all their data
- **User Details**: See watchlist counts, join dates, and activity

### 📝 Review Management
- **View All Reviews**: See every review in the system
- **Delete Reviews**: Remove inappropriate or spam reviews
- **User Context**: See which user wrote each review

### 📊 Advanced Features
- **Pagination**: All admin views support pagination for better performance
- **Safety Checks**: Can't delete yourself or demote yourself
- **Data Integrity**: Deleting users also removes their reviews

## Security Notes

### Default Admin Credentials
- 🔴 **IMPORTANT**: Change the default admin password immediately after first login
- The default credentials are only for initial setup

### Admin Access Control
- Regular users cannot access admin features (403 Forbidden)
- Admin status is checked on both frontend and backend
- JWT tokens include role information

### User Registration
- **No**: Regular users do NOT get admin access when signing up
- **Default Role**: All new users get 'user' role by default
- **Admin Creation**: Only existing admins can promote users or manual intervention

## Admin Email List (Fallback)
The system also checks for these hardcoded admin emails as a fallback:
- admin@xzmovies.com
- jayzwillz@admin.com

If your email is in this list, you'll automatically get admin privileges.

## Troubleshooting

### Can't Access Admin Dashboard?
1. Make sure you're logged in
2. Check that your user role is 'admin' in the database
3. Try logging out and back in to refresh your token

### Scripts Not Working?
1. Make sure MongoDB is running and accessible
2. Check your .env file has the correct MONGODB_URI
3. Try running the backend server first: `npm run dev`

### Need to Reset Everything?
You can always directly modify the database or restart with a fresh database and run the admin creation script again.

## Admin Route Protection

The admin system has multiple layers of protection:
- **Frontend**: React components check user role
- **Backend**: Admin middleware validates JWT and role
- **Database**: User model enforces role enum values

This ensures only legitimate admins can access admin features!
