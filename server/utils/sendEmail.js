const nodemailer = require('nodemailer');

const sendEmail = async (email, otp, subject = 'Verification Code', title = 'PantryAI') => {
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

    await transporter.sendMail({
      from: `"PantryAI" <${process.env.BREVO_SENDER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #059669; text-align: center;">${title}</h2>
          <p style="font-size: 16px; color: #555;">Use the code below to complete your request.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="color: #059669; letter-spacing: 8px; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">Valid for 10 minutes.</p>
        </div>
      `,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Email Error:", error);
  }
};

module.exports = sendEmail;