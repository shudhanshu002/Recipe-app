import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const emailHost = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    // FIX: Default to 2525 as it works best in Cloud environments (bypasses 587 blocks)
    const emailPort = Number(process.env.EMAIL_PORT) || 2525;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom = process.env.EMAIL_FROM;

    console.log(`[Email Debug] Host: ${emailHost}`);
    console.log(`[Email Debug] Port: ${emailPort}`);

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: false, // Must be false for ports 2525 and 587
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        // Fix for handshake failures in some cloud environments
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
      // FIX: Add timeouts to prevent the server from hanging indefinitely
      connectionTimeout: 10000, // 10 seconds to connect
      greetingTimeout: 10000, // 10 seconds to wait for greeting
      socketTimeout: 10000, // 10 seconds for socket inactivity
    });

    // Verify connection before attempting to send
    await transporter.verify();
    console.log('[Email Debug] SMTP Connection Verified ✅');

    const mailOptions = {
      from: emailFrom,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Debug] Sent. ID:', info.messageId);
  } catch (error) {
    console.error('[Email Debug] FATAL ERROR:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error(
        'TIP: Your cloud provider might be blocking this port. Ensure EMAIL_PORT is set to 2525.'
      );
    }
    throw new Error(error.message);
  }
};

export { sendEmail };
