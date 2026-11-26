const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const hotelsRoutes = require('./routes/hotels');
const aiRoutes = require('./routes/ai');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Honey Group API is running' });
});

// Route pour hotel
app.use('/api/hotels', hotelsRoutes);

// Route IA
app.use('/api/ai', aiRoutes);

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});