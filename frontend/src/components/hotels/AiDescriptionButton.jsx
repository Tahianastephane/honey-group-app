import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';

function AiDescriptionButton({ hotelData, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    if (!hotelData.nom_hotel || !hotelData.ville) {
      setError('Renseignez d\'abord le nom de l\'hôtel et la ville.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/generate-description', hotelData);
      onGenerated(res.data.description);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Impossible de générer la description.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Description de l'établissement
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Génération IA...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Générer par IA</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default AiDescriptionButton;
