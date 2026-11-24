import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: '',
    role: 'forfaitiste',
    telephone: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('role', form.role);
    formData.append('telephone', form.telephone || '');

    if (form.photoFile) {
      formData.append('photo', form.photoFile);
    }

    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Si on arrive ici, la création a réussi
    setMessage('Compte créé avec succès');
    setForm({
      nom: '',
      email: '',
      password: '',
      role: 'forfaitiste',
      telephone: '',
      photoFile: null,
    });

    // Recharger la liste (sans faire échouer toute la création)
    try {
      await fetchUsers();
    } catch (err) {
      console.error('Erreur lors du rechargement de la liste :', err);
    }

  } catch (err) {
    console.error('Erreur création :', err.response?.data || err.message);
    setError(err.response?.data?.message || 'Erreur lors de la création du compte');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Créer un compte</h1>

      {message && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Photo de profil <span className="text-gray-400">(optionnel)</span>
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      setForm({ ...form, photoFile: file || null });
    }}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-400 mt-1">
    Tu peux créer le compte sans photo
  </p>
</div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="forfaitiste">Forfaitiste</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
    </div>
  );
}

export default Register;