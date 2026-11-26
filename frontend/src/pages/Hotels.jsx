import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AiDescriptionButton from '../components/hotels/AiDescriptionButton';


function Hotels() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const initialForm = {
    nom_hotel: '',
    type_hebergement: 'Hôtel',
    categorie: '',
    ville: '',
    region: '',
    adresse: '',
    telephone: '',
    email: '',
    site_web: '',
    description: '',
    wifi: false,
    piscine: false,
    parking: false,
    climatisation: false,
    restaurant: false,
    navette_aeroport: false,
    spa_bien_etre: false,
    distance_aeroport_km: '',
    duree_trajet_aeroport_min: '',
    heure_checkin: '14:00',
    heure_checkout: '11:00',
    devise_principale: 'EUR',
  };

  const [form, setForm] = useState(initialForm);

  // Charger les hôtels
  const fetchHotels = async () => {
    try {
      const res = await api.get('/hotels');
      setHotels(res.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Filtrage
  const filteredHotels = hotels.filter(
    (h) =>
      h.nom_hotel?.toLowerCase().includes(search.toLowerCase()) ||
      h.ville?.toLowerCase().includes(search.toLowerCase()) ||
      h.region?.toLowerCase().includes(search.toLowerCase())
  );

  // Ouvrir modal de création
  const openCreate = () => {
    setEditingHotel(null);
    setForm(initialForm);
    setShowModal(true);
    setMessage('');
    setError('');
  };

  // Ouvrir modal d'édition
  const openEdit = (hotel) => {
    setEditingHotel(hotel);
    setForm({
      nom_hotel: hotel.nom_hotel || '',
      type_hebergement: hotel.type_hebergement || 'Hôtel',
      categorie: hotel.categorie || '',
      ville: hotel.ville || '',
      region: hotel.region || '',
      adresse: hotel.adresse || '',
      telephone: hotel.telephone || '',
      email: hotel.email || '',
      site_web: hotel.site_web || '',
      description: hotel.description || '',
      wifi: hotel.wifi || false,
      piscine: hotel.piscine || false,
      parking: hotel.parking || false,
      climatisation: hotel.climatisation || false,
      restaurant: hotel.restaurant || false,
      navette_aeroport: hotel.navette_aeroport || false,
      spa_bien_etre: hotel.spa_bien_etre || false,
      distance_aeroport_km: hotel.distance_aeroport_km || '',
      duree_trajet_aeroport_min: hotel.duree_trajet_aeroport_min || '',
      heure_checkin: hotel.heure_checkin?.slice(0, 5) || '14:00',
      heure_checkout: hotel.heure_checkout?.slice(0, 5) || '11:00',
      devise_principale: hotel.devise_principale || 'EUR',
    });
    setShowModal(true);
    setMessage('');
    setError('');
  };

  // Soumettre création ou modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingHotel) {
        await api.put(`/hotels/${editingHotel.id}`, form);
        setMessage('Hôtel modifié avec succès');
      } else {
        await api.post('/hotels', form);
        setMessage('Hôtel créé avec succès');
      }

      setShowModal(false);
      fetchHotels();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  // Supprimer 
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment désactiver cet hôtel ?')) return;

    try {
      await api.delete(`/hotels/${id}`);
      setMessage('Hôtel désactivé');
      fetchHotels();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement des hôtels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hôtels</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredHotels.length} hôtel{filteredHotels.length > 1 ? 's' : ''} trouvé
            {filteredHotels.length > 1 ? 's' : ''}
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Ajouter un hôtel
          </button>
        )}
      </div>

      
      {message && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom, ville ou région..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nom</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium">Ville</th>
                <th className="text-left px-4 py-3 font-medium">Région</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                {user?.role === 'admin' && (
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Aucun hôtel trouvé
                  </td>
                </tr>
              ) : (
                filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {hotel.nom_hotel}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{hotel.type_hebergement}</td>
                    <td className="px-4 py-3">
                      {hotel.categorie ? (
                        <span className="inline-flex items-center gap-1">
                          {hotel.categorie} ★
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{hotel.ville}</td>
                    <td className="px-4 py-3 text-gray-600">{hotel.region || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          hotel.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {hotel.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(hotel)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                            title="Désactiver"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODAL CRÉATION / ÉDITION ========== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingHotel ? 'Modifier l\'hôtel' : 'Ajouter un hôtel'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'hôtel *
                  </label>
                  <input
                    type="text"
                    name="nom_hotel"
                    value={form.nom_hotel}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'hébergement
                  </label>
                  <select
                    name="type_hebergement"
                    value={form.type_hebergement}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hôtel">Hôtel</option>
                    <option value="Lodge">Lodge</option>
                    <option value="Écolodge">Écolodge</option>
                    <option value="Resort">Resort</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Maison d'hôtes">Maison d'hôtes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie (étoiles)
                  </label>
                  <select
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">—</option>
                    <option value="1">1 ★</option>
                    <option value="2">2 ★</option>
                    <option value="3">3 ★</option>
                    <option value="4">4 ★</option>
                    <option value="5">5 ★</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={form.ville}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Région
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="site_web"
                    value={form.site_web}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'wifi', label: 'Wi-Fi' },
                    { name: 'piscine', label: 'Piscine' },
                    { name: 'parking', label: 'Parking' },
                    { name: 'climatisation', label: 'Climatisation' },
                    { name: 'restaurant', label: 'Restaurant' },
                    { name: 'navette_aeroport', label: 'Navette aéroport' },
                    { name: 'spa_bien_etre', label: 'Spa / Bien-être' },
                  ].map((eq) => (
                    <label key={eq.name} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name={eq.name}
                        checked={form[eq.name]}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {eq.label}
                    </label>
                  ))}
                </div>
              </div>

              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingHotel ? 'Enregistrer' : 'Créer l\'hôtel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hotels;