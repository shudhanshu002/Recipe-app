import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // 1. Create Transporter with explicit settings
    // This is more robust than service: 'gmail' for production
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587, // Use 587 (TLS) or 465 (SSL)
      secure: process.env.EMAIL_PORT == 465, // True for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password, not login password
      },
    });

    // 2. Define Email Options
    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        `"Zaika Vault Team" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Plain text fallback
      html: options.html, // HTML content
    };

    // 3. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    // CRITICAL: Re-throw error so the controller catches it
    throw new Error('Email could not be sent');
  }
};

export { sendEmail };
