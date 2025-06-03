import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URL here
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/send-pdf', async (req, res) => {
  console.log('Received request:', req.body);
  console.log('Environment variables:', {
    email: process.env.EMAIL,
    hasPassword: !!process.env.EMAIL_PASSWORD
  });
  const { email, pdfUrl, name } = req.body;

  if (!email || !pdfUrl || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Clean up the PDF URL by removing any leading slash
  const cleanPdfUrl = pdfUrl.replace(/^\//, '');
  const pdfPath = path.join(__dirname, 'public', cleanPdfUrl);
  console.log('PDF path:', pdfPath);

  // Verify if file exists
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF file not found:', pdfPath);
    return res.status(404).json({ error: 'PDF file not found' });
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your Requested PDF Document',
    text: `Dear ${name},\n\nThank you for your interest. Here's your requested PDF document.\n\nBest regards,\nYour Team`,
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath
      }
    ]
  };

  try {
    console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
    console.log('Attempting to send email with nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    res.status(500).json({ 
      error: error.message || 'Failed to send email',
      code: error.code,
      details: error.response
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
