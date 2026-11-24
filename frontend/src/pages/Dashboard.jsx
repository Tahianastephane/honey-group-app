function Dashboard() {
  const stats = [
    { label: 'Hôtels', value: '24', change: '+12% ce mois-ci', color: 'bg-blue-50 text-blue-600' },
    { label: 'Chambres', value: '86', change: '+8% ce mois-ci', color: 'bg-green-50 text-green-600' },
    { label: 'Avis', value: '152', change: '+15% ce mois-ci', color: 'bg-purple-50 text-purple-600' },
    { label: 'Promotions', value: '12', change: '3 nouvelles', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenue ! Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
            <p className={`text-xs mt-2 ${stat.color} inline-block px-2 py-0.5 rounded-full`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Derniers hôtels ajoutés</h3>
          <p className="text-sm text-gray-500">La liste des hôtels apparaîtra ici.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              + Ajouter un hôtel
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Gérer les promotions
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Voir l'historique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;