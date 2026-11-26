const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendResetPasswordEmail } = require('../services/emailService');

// ====================== LOGIN ======================
const login = async (req, res) => {
  const { email, password } = req.body;
  const fs = require('fs');
  const path = require('path');


  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteOldPhoto = (photoPath) => {
  try {
    if (!photoPath || typeof photoPath !== 'string') return;
    const relativePath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    const fullPath = path.join(__dirname, '../../', relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Erreur suppression ancienne photo (ignorée):', err);
  }
};

// ====================== CRÉER UN COMPTE ======================
const createUser = async (req, res) => {
  const { nom, email, password, role, telephone } = req.body;

  try {
    if (!['admin', 'forfaitiste'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const hash = await bcrypt.hash(password, 10);

    // Si une image a été envoyée, on récupère le chemin
    const photo = req.file ? `/uploads/users/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO users (nom, email, password, role, telephone, photo, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nom, email, role, telephone, photo, is_active, created_at`,
      [nom, email, hash, role, telephone || null, photo, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  }
};

// ====================== MOT DE PASSE OUBLIÉ ======================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await pool.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expires = $2 
       WHERE id = $3`,
      [resetToken, resetTokenExpires, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(user.email, resetLink);

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

// ====================== MODIFIER UN UTILISATEUR ======================
// ====================== MODIFIER UN UTILISATEUR ======================
const updateUser = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const { nom, email, password, role, telephone, is_active } = req.body;

  try {
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      if (req.file) deleteOldPhoto(`/uploads/users/${req.file.filename}`);
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const existingResult = await pool.query('SELECT * FROM users WHERE id = $1', [targetUserId]);
    const existingUser = existingResult.rows.at(0);

    if (!existingUser) {
      if (req.file) deleteOldPhoto(`/uploads/users/${req.file.filename}`);
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const updatedNom =
      typeof nom === 'string' && nom.trim() !== '' ? nom.trim() : existingUser.nom;
    const updatedEmail =
      typeof email === 'string' && email.trim() !== '' ? email.trim() : existingUser.email;
    const updatedTelephone =
      telephone !== undefined
        ? (String(telephone).trim() === '' ? null : String(telephone).trim())
        : existingUser.telephone;

    let updatedPassword = existingUser.password;
    if (typeof password === 'string' && password.trim() !== '') {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    let updatedRole = existingUser.role;
    let updatedIsActive = existingUser.is_active;

    if (req.user.role === 'admin') {
      if (role && ['admin', 'forfaitiste'].includes(role)) {
        updatedRole = role;
      }
      if (is_active !== undefined) {
        updatedIsActive = is_active === true || is_active === 'true';
      }
    }

    let updatedPhoto = existingUser.photo;
    if (req.file) {
      updatedPhoto = `/uploads/users/${req.file.filename}`;
      if (existingUser.photo) {
        deleteOldPhoto(existingUser.photo);
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET nom = $1, email = $2, password = $3, role = $4, telephone = $5, photo = $6, is_active = $7
       WHERE id = $8
       RETURNING id, nom, email, role, telephone, photo, is_active, created_at, last_login`,
      [
        updatedNom,
        updatedEmail,
        updatedPassword,
        updatedRole,
        updatedTelephone,
        updatedPhoto,
        updatedIsActive,
        targetUserId,
      ]
    );

    res.json({
      message: 'Utilisateur mis à jour',
      user: result.rows.at(0),
    });
  } catch (error) {
    if (req.file) deleteOldPhoto(`/uploads/users/${req.file.filename}`);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    console.error('Erreur updateUser :', error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
  }
};

// ====================== SUPPRIMER UN UTILISATEUR (ADMIN) ======================
const deleteUser = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);

  try {
    if (req.user.id === targetUserId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const existingResult = await pool.query('SELECT id, photo FROM users WHERE id = $1', [targetUserId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const userToDelete = existingResult.rows;

    await pool.query('UPDATE users SET created_by = NULL WHERE created_by = $1', [targetUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    deleteOldPhoto(userToDelete.photo);

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteUser :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

// ====================== RÉINITIALISER LE MOT DE PASSE ======================
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    const user = result.rows[0];
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = $2`,
      [hash, user.id]
    );

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation' });
  }
};
// ====================== LOGOUT ======================
const logoutUser = async (req, res) => {
  try {
    
    await pool.query(
      'UPDATE users SET last_login = NULL WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};

// ====================== LISTE DES UTILISATEURS ======================
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nom, email, role, telephone, photo, is_active, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  login,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  logoutUser,
};