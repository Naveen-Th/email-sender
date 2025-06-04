import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, phone, resourceTitle, pdfUrl } = req.body;

  try {
    // Email to user
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `Your Resource Download from RareMinds - ${resourceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src=${`https://rareminds.in/assets/RareMinds-6d5e630e.png`} alt="RareMinds Logo" style="max-width: 200px;">
          </div>
          <h2 style="color: #e11d48; text-align: center;">Thank you for downloading our resource!</h2>
          <p style="color: #374151;">Dear ${name},</p>
          <p style="color: #374151;">Thank you for your interest in ${resourceTitle}. We're excited to help you transform your educational approach.</p>
          <p style="color: #374151;">You can download your resource using the link below:</p>
          <p style="color: #374151;">Resource Link: <a href="${pdfUrl}" style="color: #e11d48; text-decoration: underline;">${pdfUrl}</a></p>
          <p style="text-align: center;">
            <a href="${pdfUrl}" style="display: inline-block; background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Download Resource</a>
          </p>
          <p>Here are the details we received:</p>
          <ul>
            <li>Name: ${name}</li>
            <li>Email: ${email}</li>
            <li>Phone: ${phone}</li>
            <li>Resource: ${resourceTitle}</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The RareMinds Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
