import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const emailHost = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    const emailPort = Number(process.env.EMAIL_PORT) || 587;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom = process.env.EMAIL_FROM;

    // 1. Critical Debugging: Check if Env Vars are actually loaded in Production
    console.log(`[Email Debug] ------------- Configuration -------------`);
    console.log(`[Email Debug] Host: ${emailHost}`);
    console.log(`[Email Debug] Port: ${emailPort}`);
    // Hide actual credentials in logs, just check existence
    console.log(
      `[Email Debug] User: ${emailUser ? "Loaded (Check if it is 'apikey')" : 'MISSING!'}`
    );
    console.log(`[Email Debug] Pass: ${emailPass ? 'Loaded' : 'MISSING!'}`);
    console.log(`[Email Debug] From: ${emailFrom ? emailFrom : 'MISSING!'}`);
    console.log(`[Email Debug] ---------------------------------------`);

    if (!emailUser || !emailPass || !emailFrom) {
      throw new Error(
        'Missing required Email Environment Variables on Server.'
      );
    }

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // True for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // FIX: Relax TLS constraints for cloud environments (Render/AWS) to prevent handshake failures
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
    });

    // 2. Verify Connection before sending
    try {
      await transporter.verify();
      console.log('[Email Debug] SMTP Connection Verified ✅');
    } catch (connError) {
      console.error('[Email Debug] SMTP Connection Failed ❌');
      console.error(connError);
      throw new Error('Could not connect to SendGrid. Check API Key or Port.');
    }

    const mailOptions = {
      from: emailFrom,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Debug] Email Sent Successfully. ID:', info.messageId);
  } catch (error) {
    console.error('[Email Debug] FATAL ERROR:', error.message);
    throw new Error(error.message);
  }
};

export { sendEmail };
