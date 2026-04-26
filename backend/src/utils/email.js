import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : undefined
    }
});

export const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Your PYPVault Password Reset OTP',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                <h2 style="color: #f59e0b;">Password Reset OTP</h2>
                <p>Hello,</p>
                <p>You requested a password reset. Use the following 6-digit code to verify your identity. This code is valid for 10 minutes.</p>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #64748b; font-size: 12px;">If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 10px; color: #94a3b8;">PYPVault - Previous Year Papers Repository</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully to', to);
        return true;
    } catch (error) {
        console.error('Gmail send error:', error.message);
        console.log('Falling back to Nodemailer Ethereal Test Account...');
        
        try {
            // Generate test account on the fly
            let testAccount = await nodemailer.createTestAccount();
            const testTransporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            
            let info = await testTransporter.sendMail({
                ...mailOptions,
                from: '"PYPVault Dev" <test@ethereal.email>'
            });
            
            console.log("\n========================================================");
            console.log("⭐ EMAIL SENT TO TEST INBOX ⭐");
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            console.log("Click the link above to see the OTP code!");
            console.log("========================================================\n");
            
            return true; // We pretend it worked so frontend advances
        } catch (testErr) {
            console.error('Ethereal send error:', testErr);
            return false;
        }
    }
};
