const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Vérification des rôles
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide' });
    }
  };
};

module.exports = auth;