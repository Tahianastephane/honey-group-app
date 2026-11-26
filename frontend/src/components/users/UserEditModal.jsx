import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function UserEditModal({ targetUser, onClose }) {
  const { user: currentUser, refreshUsers, updateCurrentUser } = useAuth();

  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'forfaitiste',
    is_active: true,
    password: '',
    photoFile: null,
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetUser) {
      setForm({
        nom: targetUser.nom || '',
        email: targetUser.email || '',
        telephone: targetUser.telephone || '',
        role: targetUser.role || 'forfaitiste',
        is_active: targetUser.is_active ?? true,
        password: '',
        photoFile: null,
      });
      setConfirmDelete(false);
      setError('');
    }
  }, [targetUser]);

  if (!targetUser) return null;

  const isSelf = currentUser?.id === targetUser.id;
  const isAdmin = currentUser?.role === 'admin';

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('email', form.email);
      formData.append('telephone', form.telephone);

      if (isAdmin) {
        formData.append('role', form.role);
        formData.append('is_active', form.is_active);
      }

      if (form.password.trim() !== '') {
        formData.append('password', form.password);
      }
      if (form.photoFile) {
        formData.append('photo', form.photoFile);
      }

      const res = await api.put(`/auth/users/${targetUser.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (isSelf && updateCurrentUser) {
        updateCurrentUser(res.data.user);
      }

      await refreshUsers();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      await api.delete(`/auth/users/${targetUser.id}`);
      await refreshUsers();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du compte');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      translate="no"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-gray-900"
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg w-full max-w-lg overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {targetUser.photo ? (
              <img
                src={`http://localhost:5000${targetUser.photo}`}
                alt={targetUser.nom}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {targetUser.nom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isSelf ? 'Mon profil' : 'Modifier le compte'}
              </h2>
              <p className="text-xs text-gray-500">{targetUser.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

       
        <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo de profil <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, photoFile: e.target.files.item(0) || null })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="text"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={isSelf}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="forfaitiste">Forfaitiste</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={form.is_active ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                  disabled={isSelf}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="true">Actif</option>
                  <option value="false">Désactivé</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Laisser vide pour conserver l'actuel"
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Zone confirmation suppression (Admin uniquement) */}
          {confirmDelete && isAdmin && !isSelf && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 space-y-2">
              <p className="text-sm text-red-700">
                Supprimer définitivement le compte de <strong>{targetUser.nom}</strong> ?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Suppression...' : 'Oui, supprimer'}
                </button>
              </div>
            </div>
          )}

          {/* Bouton principal identique à Register.jsx + bouton Supprimer Admin */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            {isAdmin && !isSelf && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 bg-red-50/50 py-2 rounded-lg hover:bg-red-50 transition text-sm font-medium"
              >
                <Trash2 size={16} />
                <span>Supprimer ce compte</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
