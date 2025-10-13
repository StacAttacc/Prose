import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkCvStatus, checkIfAlreadyApplied, submitCandidature } from '../../services/EtudiantService.js';

export default function CandidatureForm({ stage, onClose, onSuccess }) {
  const { user } = useAuth();
  const [motivationLetter, setMotivationLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cvStatus, setCvStatus] = useState('loading'); // 'loading', 'available', 'notFound'
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    // Vérifier si l'étudiant a un CV disponible et s'il a déjà postulé
    const fetchStatus = async () => {
      try {
        // Vérifier le CV
        const cvResponse = await checkCvStatus();
        if (cvResponse.available) {
          setCvStatus('available');
        } else {
          setCvStatus('notFound');
        }

        // Vérifier si déjà postulé
        const applicationResponse = await checkIfAlreadyApplied(stage.id);
        setHasAlreadyApplied(applicationResponse.hasApplied);
      } catch (err) {
        console.error("Erreur lors de la vérification:", err);
        setCvStatus('notFound');
        if (err.response?.status === 401) {
          setError("Erreur d'authentification. Veuillez vous reconnecter.");
        }
      } finally {
        setCheckingApplication(false);
      }
    };

    fetchStatus();
  }, [stage.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitCandidature({
        stageId: stage.id,
        motivationLetter: motivationLetter
      });

      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      console.error("Erreur lors de la candidature:", err);

      if (err.response?.status === 401) {
        setError("Erreur d'authentification. Votre session a peut-être expiré.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data || "Vous avez déjà postulé à ce stage.");
      } else {
        setError(err.response?.data || "Une erreur s'est produite lors de l'envoi de votre candidature.");
      }
    }
  };

  if (checkingApplication) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Postuler au stage</h2>
        <div className="my-4 text-center">
          <p>Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Postuler au stage</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p>{error}</p>
          {(error.includes("CV") || error.includes("cv")) && (
            <p className="mt-2 text-sm">
              → Assurez-vous d'avoir téléversé votre CV dans votre profil et qu'il a été approuvé par un gestionnaire.
            </p>
          )}
        </div>
      )}

      {hasAlreadyApplied && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
          <p className="font-medium">✓ Candidature déjà soumise</p>
          <p className="mt-1 text-sm">
            Vous avez déjà postulé à ce stage. Vous ne pouvez pas soumettre une nouvelle candidature.
          </p>
          <button
            onClick={onClose}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fermer
          </button>
        </div>
      )}

      {!hasAlreadyApplied && (
        <>
          {cvStatus === 'loading' && (
            <div className="my-4 text-center">
              <p>Vérification de votre CV...</p>
            </div>
          )}

          {cvStatus === 'notFound' && !error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
              <p className="font-medium">CV non disponible</p>
              <p className="mt-1 text-sm">
                Vous devez d'abord téléverser votre CV dans votre profil et le faire approuver avant de pouvoir postuler à ce stage.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Fermer
              </button>
            </div>
          )}

          {cvStatus === 'available' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="motivationLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Lettre de motivation
                </label>
                <textarea
                  id="motivationLetter"
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Expliquez pourquoi vous êtes intéressé par ce stage et quelles sont vos compétences pertinentes..."
                  value={motivationLetter}
                  onChange={(e) => setMotivationLetter(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}