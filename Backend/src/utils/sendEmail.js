import nodemailer from 'nodemailer';

export const sendEmail = async ({email, subject, message, html}) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Zaika Vault Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: message,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent Successfully");
    } catch (error) {
        console.log("Error sending email:", error);
    }
}