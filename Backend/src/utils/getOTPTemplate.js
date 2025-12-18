export const getOtpTemplate = (otp) => {
  const logoUrl =
    'https://res.cloudinary.com/df3y3pc1t/image/upload/v1765227353/wrriten_dark1_qqmy1c.png';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your account</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px; text-align: center;">
          
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="background-color: #f97316; padding: 30px 20px; text-align: center;">
              
              <img src="${logoUrl}" alt="Zaika Vault Logo" width="60" height="60" style="display: block; margin: 0 auto 15px auto; border-radius: 50%; background-color: #ffffff; padding: 8px; border: 2px solid rgba(255,255,255,0.3);" />
              
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: bold;">Zaika Vault</h1>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #18181b; font-size: 20px; margin-bottom: 10px; font-weight: 600;">Verify your email address</h2>
              <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                Welcome to the kitchen! Please use the verification code below to complete your registration.
              </p>

              <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ea580c; display: block;">${otp}</span>
              </div>

              <p style="color: #71717a; font-size: 13px; margin-top: 25px;">
                This code will expire in <strong>10 minutes</strong>.<br>
                If you didn't request this, please ignore this email.
              </p>
            </div>

            <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Zaika Vault. All rights reserved.
              </p>
            </div>

          </div>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
