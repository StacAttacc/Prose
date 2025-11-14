import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import MesCandidature from '../../../components/etudiant-components/MesCandidature.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

vi.mock('../../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn()
  };
});

vi.mock('../../../context/I18nContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: vi.fn()
  };
});

vi.mock('../../../components/display-components/StageDetailsModal', () => ({
  default: ({ isOpen, onClose, stage }) => 
    isOpen ? (
      <div data-testid="stage-details-modal">
        <p>{stage?.title}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
}));

vi.mock('../../../components/display-components/EntenteSignatureModal', () => ({
  default: ({ isOpen, onClose, applicant }) => 
    isOpen ? (
      <div data-testid="entente-signature-modal">
        <p>Modal Entente pour {applicant?.stage?.title}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
}));

describe('MesCandidature', () => {
  const mockUser = {
    email: 'etudiant@test.com',
    role: 'ETUDIANT',
    token: 'mock-token-123'
  };

  const mockT = (key, params) => {
    const translations = {
      mesCandidatures: 'Mes Candidatures',
      recherche: 'Recherche',
      recherchePlaceholderEtudiant: 'Titre, description, employeur, compétences...',
      lieu: 'Lieu',
      lieuPlaceholder: 'Montréal, Québec, Télétravail...',
      compensation: 'Compensation',
      compensationPlaceholder: '20$/h, 500$/semaine...',
      statut: 'Statut',
      tousLesStatuts: 'Tous les statuts',
      enAttente: 'En attente',
      acceptee: 'Acceptée',
      refusee: 'Refusée',
      effacerFiltres: 'Effacer les filtres',
      candidaturesTrouvees: (p) => `${p?.count || 0} candidature(s) trouvée(s) sur ${p?.total || 0} au total`,
      chargementCandidatures: 'Chargement de vos candidatures...',
      erreurChargementCandidatures: 'Erreur lors du chargement des candidatures',
      aucuneCandidature: 'Aucune candidature',
      pasEncorePostule: 'Vous n\'avez pas encore postulé à des stages.',
      consultezStagesDisponibles: 'Consultez les stages disponibles pour commencer à postuler.',
      titreNonDisponible: 'Titre non disponible',
      stageAccepte: 'Stage Accepté',
      offreRefusee: 'Offre Refusée',
      raisonRefus: 'Raison du refus',
      entreprise: 'Entreprise',
      dateCandidature: 'Date de candidature',
      decisionPriseLe: 'Décision prise le',
      commentaire: 'Commentaire',
      entrevuePrevueLe: 'Entrevue prévue le',
      felicitationsEmployeurSelectionne: 'Félicitations ! L\'employeur vous a sélectionné pour ce stage.',
      offreOfficielleRecue: 'Vous avez maintenant reçu une offre officielle. Souhaitez-vous l\'accepter ou la refuser ?',
      accepterOffre: '✓ Accepter l\'offre',
      refuserOffre: '✗ Refuser l\'offre',
      surPointRefuserOffre: 'Vous êtes sur le point de refuser cette offre.',
      expliquerRaisonRefusOptionnel: 'Veuillez expliquer brièvement votre raison (optionnel mais recommandé pour maintenir une bonne relation professionnelle).',
      raisonRefusOptionnel: 'Raison du refus (optionnel)',
      exempleRaisonRefus: 'Ex: J\'ai accepté une autre opportunité, Les conditions ne correspondent pas à mes attentes...',
      annuler: 'Annuler',
      confirmerRefus: 'Confirmer le refus',
      envoi: 'Envoi...',
      voirDetails: 'Voir détails',
      enAttenteApprobationEmployeur: 'En attente d\'approbation par l\'employeur',
      accepteeParEmployeur: 'Acceptée Par L\'Employeur',
      refuseeParEmployeur: 'Refusée Par L\'Employeur',
      convoqueeEntrevue: 'Convoquée à une entrevue',
      confirmee: 'Confirmée',
      offreAccepteeSucces: 'Vous avez accepté l\'offre avec succès',
      offreRefuseeSucces: 'Vous avez refusé l\'offre avec succès',
      erreurEnvoiReponse: 'Erreur lors de l\'envoi de votre réponse. Veuillez réessayer.',
      // Entente translations
      verificationEntente: 'Vérification de l\'entente...',
      ententeSigneeParToutesLesParties: '✓ Entente signée par toutes les parties',
      voirEntenteStage: 'Voir l\'entente de stage',
      telechargerEntenteStage: 'Télécharger l\'entente de stage',
      voirEtSignerEntenteStage: 'Voir et signer l\'entente de stage',
      enAttenteGestionnaireEntente: 'En attente du gestionnaire pour l\'entente de stage',
      erreurLorsSignature: 'Erreur lors de la signature'
    };
    const translation = translations[key];
    if (typeof translation === 'function') {
      return translation(params);
    }
    return translation || key;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthed: true,
      login: vi.fn(),
      registerEmployeur: vi.fn(),
      registerEtudiant: vi.fn(),
      logout: vi.fn()
    });
    vi.mocked(useI18n).mockReturnValue({
      t: mockT,
      locale: 'fr',
      setLocale: vi.fn()
    });
  });

  it('devrait afficher le titre "Mes Candidatures"', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Mes Candidatures')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message de chargement initialement', () => {
    renderWithProviders(<MesCandidature />);
    
    expect(screen.getByText(/Chargement de vos candidatures/i)).toBeInTheDocument();
  });

  it('devrait charger et afficher les candidatures', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    // Il y a plusieurs "Stage Accepté" (titre et h4), on vérifie qu'il y en a au moins un
    const stageAccepteElements = screen.getAllByText('Stage Accepté');
    expect(stageAccepteElements.length).toBeGreaterThan(0);
  });

  it('devrait afficher les filtres de recherche', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Titre, description, employeur/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Montréal, Québec/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/20\$\/h/i)).toBeInTheDocument();
    expect(screen.getByText('Effacer les filtres')).toBeInTheDocument();
  });

  it('devrait filtrer les candidatures par recherche', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Titre, description, employeur/i);
    await user.type(searchInput, 'Data Science');

    await waitFor(() => {
      expect(screen.queryByText('Développeur Web Full Stack')).not.toBeInTheDocument();
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les candidatures par statut', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'ACCEPTEE');

    await waitFor(() => {
      expect(screen.queryByText('Développeur Web Full Stack')).not.toBeInTheDocument();
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations de candidature', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Montréal/i)).toBeInTheDocument();
  });

  it('devrait afficher le statut de chaque candidature', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText(/En attente d'approbation/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher "Stage Accepté" pour les candidatures confirmées', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      // Il y a plusieurs "Stage Accepté" (titre et h4), on vérifie qu'il y en a au moins un
      const stageAccepteElements = screen.getAllByText('Stage Accepté');
      expect(stageAccepteElements.length).toBeGreaterThan(0);
    });
  });

  it('devrait afficher les boutons accepter/refuser pour les offres acceptées', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });

    expect(screen.getByText(/Accepter l'offre/i)).toBeInTheDocument();
    expect(screen.getByText(/Refuser l'offre/i)).toBeInTheDocument();
  });

  it('devrait permettre d\'accepter une offre', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });

    const acceptButton = screen.getByText(/Accepter l'offre/i);
    await user.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText(/Vous avez accepté l'offre avec succès/i)).toBeInTheDocument();
    });
  });

  it('devrait permettre de refuser une offre avec un commentaire', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });

    const refuseButton = screen.getByText(/Refuser l'offre/i);
    await user.click(refuseButton);

    await waitFor(() => {
      expect(screen.getByText(/Vous êtes sur le point de refuser/i)).toBeInTheDocument();
    });

    const commentTextarea = screen.getByPlaceholderText(/J'ai accepté une autre opportunité/i);
    await user.type(commentTextarea, 'J\'ai trouvé une meilleure opportunité');

    const confirmButton = screen.getByText(/Confirmer le refus/i);
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Vous avez refusé l'offre avec succès/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton "Voir détails" pour chaque candidature', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByText(/Voir détails/i);
    expect(viewDetailsButtons.length).toBeGreaterThan(0);
  });

  it('devrait ouvrir la modal de détails au clic sur "Voir détails"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    const viewDetailsButton = screen.getAllByText(/Voir détails/i)[0];
    await user.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId('stage-details-modal')).toBeInTheDocument();
    });
  });

  it('devrait vérifier l\'existence de l\'entente pour les candidatures confirmées', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      // Maintenant que l'entente est SIGNEE, on cherche les deux boutons
      expect(screen.getByRole('button', { name: /Voir l'entente de stage/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger l'entente de stage/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait afficher les deux boutons "Voir l\'entente de stage" et "Télécharger" quand l\'entente est SIGNEE', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      // Utiliser getAllByText car il y a plusieurs "Stage Accepté" (h3 et h4)
      const stageAccepteElements = screen.getAllByText('Stage Accepté');
      expect(stageAccepteElements.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Voir l'entente de stage/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger l'entente de stage/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait afficher un message si l\'entente n\'existe pas encore', async () => {
    server.use(
      http.get('http://localhost:8080/etudiant/candidatures/3/entente', () => {
        return HttpResponse.json({ message: 'Entente non trouvée' }, { status: 404 });
      })
    );

    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      // Il y a plusieurs "Stage Accepté", on vérifie qu'il y en a au moins un
      const stageAccepteElements = screen.getAllByText('Stage Accepté');
      expect(stageAccepteElements.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByText(/En attente du gestionnaire pour l'entente de stage/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait afficher le compteur de candidatures filtrées', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText(/candidature\(s\) trouvée\(s\)/i)).toBeInTheDocument();
    });
  });

  it('devrait effacer tous les filtres au clic sur "Effacer les filtres"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Titre, description, employeur/i);
    await user.type(searchInput, 'Data Science');

    await waitFor(() => {
      expect(screen.queryByText('Développeur Web Full Stack')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByText('Effacer les filtres');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si le chargement échoue', async () => {
    server.use(
      http.get('http://localhost:8080/etudiant/candidatures', () => {
        return HttpResponse.json({ message: 'Erreur serveur' }, { status: 500 });
      })
    );

    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des candidatures/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher "Aucune candidature" si la liste est vide', async () => {
    server.use(
      http.get('http://localhost:8080/etudiant/candidatures', () => {
        return HttpResponse.json({ data: [] });
      })
    );

    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Aucune candidature')).toBeInTheDocument();
      expect(screen.getByText(/Vous n'avez pas encore postulé/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher la date de décision pour les candidatures acceptées', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Stage en Data Science')).toBeInTheDocument();
    });

    expect(screen.getByText(/Décision prise le/i)).toBeInTheDocument();
  });

  it('devrait afficher la date de candidature', async () => {
    renderWithProviders(<MesCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Développeur Web Full Stack')).toBeInTheDocument();
    });

    // Le texte est traduit via t('dateCandidature') qui retourne 'Date de candidature'
    // On cherche dans le contexte de la candidature "SOUMISE"
    const candidatureCard = screen.getByText('Développeur Web Full Stack').closest('.rounded-lg');
    expect(candidatureCard).toBeInTheDocument();
    expect(candidatureCard).toHaveTextContent(/Date de candidature/i);
  });
});

