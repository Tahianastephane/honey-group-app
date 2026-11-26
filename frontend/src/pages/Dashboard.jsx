import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hotel, BedDouble, Star, Tag, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    hotels: 0,
    hotelsActifs: 0,
    derniersHotels: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/hotels');
        const hotels = res.data || [];

        setStats({
          hotels: hotels.length,
          hotelsActifs: hotels.filter((h) => h.is_active).length,
          derniersHotels: hotels.slice(0, 5), // les 5 derniers
        });
      } catch (err) {
        console.error('Erreur chargement dashboard :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      label: 'Hôtels',
      value: stats.hotels,
      sub: `${stats.hotelsActifs} actifs`,
      icon: Hotel,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Chambres',
      value: '—',
      sub: 'Bientôt disponible',
      icon: BedDouble,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Avis',
      value: '—',
      sub: 'Bientôt disponible',
      icon: Star,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Promotions',
      value: '—',
      sub: 'Bientôt disponible',
      icon: Tag,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenue{user?.nom ? `, ${user.nom}` : ''} ! Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{card.label}</p>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derniers hôtels ajoutés */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Derniers hôtels ajoutés</h3>
            <Link
              to="/hotels"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {stats.derniersHotels.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun hôtel enregistré pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.derniersHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{hotel.nom_hotel}</p>
                    <p className="text-xs text-gray-500">
                      {hotel.ville}
                      {hotel.region ? ` • ${hotel.region}` : ''}
                      {hotel.categorie ? ` • ${hotel.categorie}★` : ''}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      hotel.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {hotel.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            {user?.role === 'admin' && (
              <Link
                to="/hotels"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={16} />
                Ajouter un hôtel
              </Link>
            )}
            <Link
              to="/hotels"
              className="block w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Voir tous les hôtels
            </Link>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Gérer les promotions
            </button>
            <button
              disabled
              className="w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Voir l'historique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;