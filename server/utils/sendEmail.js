const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: process.env.BREVO_PORT,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS, 
      },
    });

    const info = await transporter.sendMail({
      from: `"PantryAI Security" <${process.env.BREVO_SENDER}>`,
      to: email,
      subject: 'Verify Your PantryAI Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #059669; text-align: center;">Welcome to PantryAI! 🥗</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #555;">Please use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="color: #059669; letter-spacing: 8px; margin: 0; font-size: 32px;">${otp}</h1>
          </div>

          <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Verification email sent via Brevo. Message ID:", info.messageId);
  } catch (error) {
    console.error("Brevo Email Error:", error);
  }
};

module.exports = sendEmail;