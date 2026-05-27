const sendEmail = async (options) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!emailFrom) {
      throw new Error('RESEND_FROM_EMAIL is not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [options.email],
        subject: options.subject,
        text: options.message,
        html: options.html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `Resend failed with ${response.status}`
      );
    }

    console.log('[Email Debug] Resend email sent. ID:', data.id);
  } catch (error) {
    console.error('[Email Debug] FATAL ERROR:', error.message);
    throw new Error(error.message);
  }
};

export { sendEmail };
