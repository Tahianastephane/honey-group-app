const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (to, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Réinitialisation de votre mot de passe - Honey Group',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Honey Group</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #2563eb; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #64748b; font-size: 14px;">
          Ce lien est valable pendant 1 heure.<br>
          Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };