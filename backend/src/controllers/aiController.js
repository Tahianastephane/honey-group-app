const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====================== GÉNÉRER DESCRIPTION HÔTEL PAR IA ======================
const generateHotelDescription = async (req, res) => {
  const {
    nom_hotel,
    type_hebergement,
    categorie,
    ville,
    region,
    wifi,
    piscine,
    parking,
    climatisation,
    restaurant,
    navette_aeroport,
    spa_bien_etre,
    distance_aeroport_km,
    duree_trajet_aeroport_min,
    ton = 'professionnel', // 'professionnel', 'vendeur', ou 'concis'
  } = req.body;

  try {
    if (!nom_hotel || !ville) {
      return res.status(400).json({
        message: 'Veuillez renseigner au moins le nom de l\'hôtel et la ville avant de générer la description.',
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: 'Clé API OpenAI manquante dans le fichier .env du serveur.',
      });
    }

    // Construire la liste des équipements actifs
    const equipements = [];
    if (wifi) equipements.push('Wi-Fi gratuit');
    if (piscine) equipements.push('piscine');
    if (parking) equipements.push('parking sécurisé');
    if (climatisation) equipements.push('climatisation');
    if (restaurant) equipements.push('restaurant sur place');
    if (navette_aeroport) equipements.push('navette aéroport');
    if (spa_bien_etre) equipements.push('spa et espace bien-être');

    const listeEquipements =
      equipements.length > 0 ? equipements.join(', ') : 'services hôteliers standards';

    const infosAcces =
      distance_aeroport_km || duree_trajet_aeroport_min
        ? `Accès aéroport : ${distance_aeroport_km ? `${distance_aeroport_km} km` : ''} ${
            duree_trajet_aeroport_min ? `(${duree_trajet_aeroport_min} min de trajet)` : ''
          }.`
        : '';

    const systemPrompt = `Tu es un expert en ingénierie touristique et cotation B2B chez Honey Group Madagascar (tour-opérateur réceptif). 
Rédige une description commerciale et informative en français pour une fiche hôtel destinée aux forfaitistes et aux programmes de voyage.
Règles strictes :
- N'invente AUCUNE donnée chiffrée ou équipement non fourni.
- Style : ${ton}, fluide, attractif et crédible pour le tourisme à Madagascar.
- Longueur : 1 à 2 paragraphes courts (environ 70 à 110 mots maximum).
- Ne mets pas de titre ni de guillemets autour du texte.`;

    const userPrompt = `Rédige la description de cet établissement :
- Nom : ${nom_hotel}
- Type : ${type_hebergement || 'Hôtel'}
- Catégorie : ${categorie ? `${categorie} étoile(s)` : 'Non classé'}
- Localisation : ${ville}${region ? `, région ${region}` : ''}, Madagascar
- Équipements disponibles : ${listeEquipements}
${infosAcces}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const description = completion.choices.at(0)?.message?.content?.trim();

    if (!description) {
      return res.status(500).json({ message: 'Aucune description générée par l\'IA.' });
    }

    res.json({ description });
  } catch (error) {
    console.error('Erreur OpenAI generateHotelDescription :', error);
    res.status(500).json({
      message: error.message || 'Erreur lors de la génération de la description par IA',
    });
  }
};

module.exports = {
  generateHotelDescription,
};
