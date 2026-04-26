# Email Configuration Guide for PYP Website

## 📧 Setting Up Email for OTP and Notifications

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update backend/.env**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Option 2: Outlook/Hotmail

1. **Enable 2-Factor Authentication** on your Microsoft account
2. **Generate App Password**:
   - Go to: https://account.microsoft.com/security
   - Under "App passwords", click "Create a new app password"
   - Copy the generated password

3. **Update backend/.env**:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-app-password-here
```

### Option 3: Professional Email (Custom Domain)

For custom domain emails, you'll need SMTP credentials from your hosting provider.

**Example for Hostinger**:
```env
EMAIL_USER=info@yourdomain.com
EMAIL_PASSWORD=your-smtp-password
```

**Example for GoDaddy**:
```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-smtp-password
```

## 🔧 Email Service Configuration

### Using Nodemailer (Already configured in your backend)

Your backend already has nodemailer installed. The email service is in `backend/src/services/email.service.js`.

### Test Email Configuration

Create a test file `backend/test-email.js`:

```javascript
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', or your SMTP host
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'test@example.com', // Send to yourself for testing
  subject: 'PYP Website Test Email',
  text: 'This is a test email from your PYP website!'
}

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error)
  } else {
    console.log('Email sent:', info.response)
  }
})
```

Run with: `node backend/test-email.js`

## 🚀 Common Email Issues & Solutions

### Issue 1: "Invalid login" error
**Solution**: Make sure you're using an App Password, not your regular email password. Regular passwords won't work with 2FA enabled.

### Issue 2: "Connection timeout" error
**Solution**: Check your internet connection and ensure your email provider's SMTP servers are accessible.

### Issue 3: Emails going to spam
**Solution**: 
- Use a professional domain email
- Configure SPF and DKIM records
- Avoid spam trigger words in email content

### Issue 4: Rate limiting
**Solution**: Gmail has sending limits (500 emails/day for free accounts). Consider using a transactional email service for production:
- **SendGrid** (100 free emails/day)
- **Mailgun** (5,000 free emails/month)
- **AWS SES** (62,000 free emails/month from EC2)

## 📊 Production Email Services

### SendGrid (Recommended for Production)

1. **Sign up**: https://sendgrid.com
2. **Get API Key**: Settings → API Keys → Create API Key
3. **Update backend/.env**:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=your-verified-sender@example.com
```

### AWS SES

1. **Set up SES** in AWS Console
2. **Verify domain/email**
3. **Update backend/.env**:
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EMAIL_USER=your-verified-sender@example.com
```

## 🔒 Security Best Practices

1. **Never commit email credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable 2FA** on all email accounts
4. **Rotate passwords** regularly
5. **Monitor email usage** for suspicious activity

## 📝 Complete .env Configuration

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Configuration
PORT=8000

# Email Configuration (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# OneDrive Configuration
ONEDRIVE_CLIENT_ID=your-onedrive-client-id
ONEDRIVE_CLIENT_SECRET=your-onedrive-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback

# OpenAI Configuration (for AI predictions)
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Production Email Service
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key
```

## 🧪 Testing Email Functionality

After configuring email, test these features:

1. **User Registration** - Should receive OTP email
2. **Password Reset** - Should receive reset link email
3. **Contact Form** (if implemented) - Should receive notifications

## 📞 Support

If you continue having email issues:
1. Check your email provider's documentation
2. Verify your credentials are correct
3. Test with a different email provider
4. Check your firewall/antivirus isn't blocking SMTP

---

**Note**: For development, Gmail with App Password is the easiest option. For production, use a professional email service like SendGrid or AWS SES.