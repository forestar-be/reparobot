const express = require('express');
const brevoClient = require('../config/brevo');
const logger = require('../config/logger');

const router = express.Router();

router.post('/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    logger.info(`Formulaire reçu: ${JSON.stringify(formData)} de ${req.ip}`);

    let emailContent = '<h1>Nouveau formulaire reçu</h1><ul>';
    for (const [key, value] of Object.entries(formData)) {
      emailContent += `<li><strong>${key}</strong>: ${value}</li>`;
    }
    emailContent += '</ul>';

    const emailData = {
      sender: { email: process.env.SENDER_EMAIL},
      to: [{ email: process.env.TO_EMAIL}],
      subject: 'Nouveau formulaire soumis',
      htmlContent: emailContent,
    };

    await brevoClient.sendTransacEmail(emailData);
    logger.info(`Email envoyé avec succès à l'admin pour le formulaire de ${req.ip}`);
    res.status(200).send('Formulaire reçu et email envoyé.');
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    res.status(500).send('Erreur lors de l\'envoi de l\'email.');
  }
});

module.exports = router;
