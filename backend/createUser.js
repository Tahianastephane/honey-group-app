const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function createUser() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (nom, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, email, role`,
      ['Administrateur', 'admin@honeygroup.mg', hash, 'admin']
    );

    console.log('Utilisateur admin créé avec succès :');
    console.log(result.rows[0]);
    console.log('---------------------------');
    console.log('Email        : admin@honeygroup.mg');
    console.log('Mot de passe : admin123');
  } catch (error) {
    console.error('Erreur complète :');
    console.error(error);
  } finally {
    await pool.end();
  }
}

createUser();