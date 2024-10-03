const SibApiV3Sdk = require('@sendinblue/client');

const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.API_KEY_BREVO;

module.exports = brevoClient;
