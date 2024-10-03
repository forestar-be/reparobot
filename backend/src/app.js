const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./config/logger');
const authMiddleware = require('./middleware/auth');
const formRoutes = require('./routes/form');

// Load environment variables
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: 'POST',
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(bodyParser.json());

// Routes
app.use('/submit-form', authMiddleware, formRoutes);

// Démarrage du serveur
app.listen(port, () => {
  logger.info(`Serveur en écoute sur le port ${port}`);
});
