const pool = require('../config/db');

// ====================== LISTE DES HÔTELS ======================
const getAllHotels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, u.nom AS created_by_name
       FROM hotels h
       LEFT JOIN users u ON h.created_by = u.id
       ORDER BY h.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ====================== DÉTAIL D'UN HÔTEL ======================
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT h.*, u.nom AS created_by_name
       FROM hotels h
       LEFT JOIN users u ON h.created_by = u.id
       WHERE h.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ====================== CRÉER UN HÔTEL ======================
const createHotel = async (req, res) => {
  try {
    const {
      nom_hotel,
      type_hebergement = 'Hôtel',
      categorie,
      ville,
      region,
      adresse,
      latitude,
      longitude,
      telephone,
      email,
      site_web,
      description,
      wifi = false,
      piscine = false,
      parking = false,
      climatisation = false,
      restaurant = false,
      navette_aeroport = false,
      spa_bien_etre = false,
      distance_aeroport_km,
      duree_trajet_aeroport_min,
      heure_checkin = '14:00',
      heure_checkout = '11:00',
      devise_principale = 'EUR',
    } = req.body;

    if (!nom_hotel || !ville) {
      return res.status(400).json({ message: 'Le nom et la ville sont obligatoires' });
    }

    const result = await pool.query(
      `INSERT INTO hotels (
        nom_hotel, type_hebergement, categorie, ville, region, adresse,
        latitude, longitude, telephone, email, site_web, description,
        wifi, piscine, parking, climatisation, restaurant, navette_aeroport, spa_bien_etre,
        distance_aeroport_km, duree_trajet_aeroport_min, heure_checkin, heure_checkout,
        devise_principale, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *`,
      [
        nom_hotel,
        type_hebergement,
        categorie || null,
        ville,
        region || null,
        adresse || null,
        latitude || null,
        longitude || null,
        telephone || null,
        email || null,
        site_web || null,
        description || null,
        wifi,
        piscine,
        parking,
        climatisation,
        restaurant,
        navette_aeroport,
        spa_bien_etre,
        distance_aeroport_km || null,
        duree_trajet_aeroport_min || null,
        heure_checkin,
        heure_checkout,
        devise_principale,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'hôtel' });
  }
};

// ====================== MODIFIER UN HÔTEL ======================
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom_hotel,
      type_hebergement,
      categorie,
      ville,
      region,
      adresse,
      latitude,
      longitude,
      telephone,
      email,
      site_web,
      description,
      wifi,
      piscine,
      parking,
      climatisation,
      restaurant,
      navette_aeroport,
      spa_bien_etre,
      distance_aeroport_km,
      duree_trajet_aeroport_min,
      heure_checkin,
      heure_checkout,
      devise_principale,
      is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE hotels SET
        nom_hotel = COALESCE($1, nom_hotel),
        type_hebergement = COALESCE($2, type_hebergement),
        categorie = COALESCE($3, categorie),
        ville = COALESCE($4, ville),
        region = COALESCE($5, region),
        adresse = COALESCE($6, adresse),
        latitude = COALESCE($7, latitude),
        longitude = COALESCE($8, longitude),
        telephone = COALESCE($9, telephone),
        email = COALESCE($10, email),
        site_web = COALESCE($11, site_web),
        description = COALESCE($12, description),
        wifi = COALESCE($13, wifi),
        piscine = COALESCE($14, piscine),
        parking = COALESCE($15, parking),
        climatisation = COALESCE($16, climatisation),
        restaurant = COALESCE($17, restaurant),
        navette_aeroport = COALESCE($18, navette_aeroport),
        spa_bien_etre = COALESCE($19, spa_bien_etre),
        distance_aeroport_km = COALESCE($20, distance_aeroport_km),
        duree_trajet_aeroport_min = COALESCE($21, duree_trajet_aeroport_min),
        heure_checkin = COALESCE($22, heure_checkin),
        heure_checkout = COALESCE($23, heure_checkout),
        devise_principale = COALESCE($24, devise_principale),
        is_active = COALESCE($25, is_active)
      WHERE id = $26
      RETURNING *`,
      [
        nom_hotel,
        type_hebergement,
        categorie,
        ville,
        region,
        adresse,
        latitude,
        longitude,
        telephone,
        email,
        site_web,
        description,
        wifi,
        piscine,
        parking,
        climatisation,
        restaurant,
        navette_aeroport,
        spa_bien_etre,
        distance_aeroport_km,
        duree_trajet_aeroport_min,
        heure_checkin,
        heure_checkout,
        devise_principale,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
  }
};

// ====================== SUPPRIMER UN HÔTEL ======================
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete (recommandé)
    const result = await pool.query(
      `UPDATE hotels SET is_active = false WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    res.json({ message: 'Hôtel désactivé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};