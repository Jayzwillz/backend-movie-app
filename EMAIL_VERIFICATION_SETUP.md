# Email Verification Setup Instructions

## Environment Variables Configuration

To enable email verification, you need to update your `.env` file in the backend with the following variables:

### Required Email Settings

```env
# Email Verification Settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_VERIFICATION_SECRET=email_verification_secret_key_2025
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular password) in `EMAIL_PASSWORD`

### For Other Email Providers

If you're not using Gmail, update the email service configuration in `services/emailService.js`:

```javascript
// Replace this section in createTransporter()
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Common SMTP Settings

| Provider | Host | Port | Secure |
|----------|------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| Yahoo | smtp.mail.yahoo.com | 587 | false |
| SendGrid | smtp.sendgrid.net | 587 | false |

## Frontend URL Configuration

Make sure to update `FRONTEND_URL` based on your deployment:

- **Development**: `http://localhost:5173`
- **Production**: `https://yourdomain.com`

## Testing Email Verification

1. Start your backend server: `npm run dev`
2. Register a new user
3. Check your email for the verification link
4. Click the link to verify your account
5. Try logging in with the verified account

## Troubleshooting

### Email Not Sending
- Check that your email credentials are correct
- Verify that 2FA is enabled and you're using an app password (for Gmail)
- Check the backend console for error messages

### Verification Link Not Working
- Ensure `FRONTEND_URL` is correct
- Check that the token hasn't expired (24-hour limit)
- Verify that the routes are properly configured

### Users Can't Login
- Make sure Google users have `isVerified: true` automatically
- Check that existing users have verification status set correctly
- Consider running a migration script for existing users

## Migration for Existing Users

If you have existing users, you may want to set them as verified:

```javascript
// Run this in MongoDB or create a migration script
db.users.updateMany(
  { isVerified: { $exists: false } },
  { $set: { isVerified: true } }
)
```

Or create a script to send verification emails to all unverified users.
