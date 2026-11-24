import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  Image,
  Star,
  CalendarDays,
  Tag,
  Map,
  History,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const menuItems = [
  { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Hôtels', path: '/hotels', icon: Hotel },
  { name: 'Chambres & Tarifs', path: '/rooms', icon: BedDouble },
  { name: 'Photos', path: '/photos', icon: Image },
  { name: 'Avis Clients', path: '/reviews', icon: Star },
  { name: 'Disponibilités', path: '/disponibilites', icon: CalendarDays },
  { name: 'Promotions', path: '/promotions', icon: Tag },
  { name: 'Activités', path: '/activites', icon: Map },
  { name: 'Historique', path: '/historique', icon: History },
];

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [usersOpen, setUsersOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      api
        .get('/auth/users')
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // En ligne si connecté il y a moins de 15 minutes
  const isOnline = (lastLogin) => {
    if (!lastLogin) return false;
    const last = new Date(lastLogin);
    const now = new Date();
    const diffMinutes = (now - last) / 1000 / 60;
    return diffMinutes <= 15;
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-semibold tracking-tight">Honey Group</h1>
        <p className="text-xs text-slate-400 mt-0.5">Hospitality Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* ===== UTILISATEURS (Admin uniquement) ===== */}
        {user?.role === 'admin' && (
          <div>
            {/* Bouton Utilisateurs (déroulant uniquement pour Créer un compte) */}
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users size={18} strokeWidth={1.8} />
                <span>Utilisateurs</span>
              </div>
              {usersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Section déroulante : UNIQUEMENT "Créer un compte" */}
            {usersOpen && (
              <div className="ml-4 mt-1">
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  + Créer un compte
                </NavLink>
              </div>
            )}

            {/* Liste des comptes créés — EN BAS de Utilisateurs (section séparée) */}
           {/* Liste des comptes créés — EN BAS de Utilisateurs (section séparée) */}
<div className="ml-4 mt-2 space-y-1 border-l border-slate-700 pl-2">
  {users.map((u) => (
    <div
      key={u.id}
      className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400"
    >
      {/* Photo ou initiale */}
      {u.photo ? (
        <img
          src={`http://localhost:5000${u.photo}`}
          alt={u.nom}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
          {u.nom?.charAt(0)?.toUpperCase()}
        </div>
      )}

      {/* Point vert = en ligne / gris = hors ligne */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOnline(u.last_login) ? 'bg-green-500' : 'bg-gray-500'
        }`}
      />

      <span className="truncate flex-1">{u.nom}</span>
      <span className="text-xs text-slate-500 capitalize">
        {u.role === 'admin' ? 'Admin' : 'Forfaitiste'}
      </span>
    </div>
  ))}
</div>
          </div>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;