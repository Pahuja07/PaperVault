import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
    const passwordWithSpaces = process.env.EMAIL_PASSWORD;
    // Strip spaces just in case
    const passwordClean = passwordWithSpaces ? passwordWithSpaces.replace(/\s+/g, '') : undefined;
    
    console.log('User:', process.env.EMAIL_USER);
    console.log('Password exists:', !!passwordClean);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: passwordClean
        }
    });

    try {
        await transporter.verify();
        console.log("Transporter verification successful!");
    } catch (error) {
        console.error("Transporter verification failed:", error);
    }
}

testEmail();
