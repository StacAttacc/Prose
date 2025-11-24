import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import StageDetailsModal from '../../../components/display-components/StageDetailsModal.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

// Mock des contextes
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

// Mock de CandidatureForm
vi.mock('../../../components/etudiant-components/CandidatureForm', () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="candidature-form">
      <button onClick={onClose}>Fermer</button>
      <button onClick={onSuccess}>Envoyer</button>
    </div>
  )
}));

// Mock de ErrorBanner
vi.mock('../../../components/display-components/ErrorBanner', () => ({
  default: ({ message }) => message ? <div data-testid="error-banner">{message}</div> : null
}));

// Mock de window.alert pour éviter les alertes dans les tests
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock de window.URL.createObjectURL et revokeObjectURL pour le téléchargement PDF
const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('StageDetailsModal - Attribution de stage par gestionnaire', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    token: 'mock-token-123'
  };

  const mockStage = {
    id: 1,
    title: 'Stage Développeur Web',
    description: 'Développement d\'applications web modernes',
    location: 'Montréal',
    compensation: '25$/h',
    status: 'APPROUVEE',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    workMode: 'Hybride',
    requirements: 'Baccalauréat en informatique',
    skills: ['React', 'Node.js', 'TypeScript'],
    employeur: {
      company: 'Tech Corp',
      email: 'tech@example.com'
    }
  };

  const mockT = (key, params) => {
    const translations = {
      'detailsStage': 'Détails du stage',
      'informationsGenerales': 'Informations générales',
      'titre': 'Titre',
      'employeur': 'Employeur',
      'dateDebut': 'Date de début',
      'dateFin': 'Date de fin',
      'lieu': 'Lieu',
      'modeTravail': 'Mode de travail',
      'compensation': 'Compensation',
      'description': 'Description',
      'exigences': 'Exigences',
      'competencesRequises': 'Compétences requises',
      'fermer': 'Fermer',
      'approuver': 'Approuver',
      'rejeter': 'Rejeter',
      'traitement': 'Traitement...',
      'veuillezFournirRaison': 'Veuillez fournir une raison',
      'raisonRejetObligatoire': 'Raison du rejet (obligatoire)',
      'expliquerRejetStage': 'Expliquer pourquoi ce stage est rejeté...',
      'confirmer': 'Confirmer',
      'erreurRejet': 'Erreur lors du rejet: ',
      'raisonRejetStage': 'Raison du rejet du stage',
      'candidatureEnvoyee': 'Candidature envoyée avec succès',
      'employeurNotifie': 'L\'employeur a été notifié',
      'postuler': 'Postuler'
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();

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
      language: 'fr',
      changeLanguage: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Affichage du formulaire d\'attribution', () => {
    it('devrait afficher le bouton "Attribuer le stage" pour un stage approuvé', async () => {
      const { container } = renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Attribuer le stage')).toBeInTheDocument();
      });
    });

    it('ne devrait pas afficher le bouton "Attribuer le stage" pour un stage non approuvé', () => {
      const stageNonApprouve = { ...mockStage, status: 'SOUMISE' };
      renderWithProviders(
        <StageDetailsModal
          stage={stageNonApprouve}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      expect(screen.queryByText('Attribuer le stage')).not.toBeInTheDocument();
    });

    it('devrait afficher le formulaire d\'attribution quand on clique sur "Attribuer le stage"', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        expect(screen.getByText('Attribuer le stage à un étudiant')).toBeInTheDocument();
        expect(screen.getByText('Commentaire (optionnel)')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Vérifier que le label "Sélectionner un étudiant" est présent (il peut y en avoir plusieurs)
      const labels = screen.getAllByText(/Sélectionner un étudiant/i);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Chargement des étudiants', () => {
    it('devrait charger la liste des étudiants quand le formulaire s\'ouvre', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      // Attendre que le select soit disponible (les étudiants sont chargés)
      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('devrait afficher les étudiants dans le select', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont (jean.dupont@example.com)')).toBeInTheDocument();
        expect(screen.getByText('Marie Martin (marie.martin@example.com)')).toBeInTheDocument();
        expect(screen.getByText('Pierre Bernard (pierre.bernard@example.com)')).toBeInTheDocument();
      });
    });

    it('devrait afficher un message d\'erreur si le chargement des étudiants échoue', async () => {
      server.use(
        http.get('http://localhost:8080/gestionnaire/etudiants/all', () => {
          return HttpResponse.json(
            { message: 'Erreur serveur' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const errorBanner = screen.getByTestId('error-banner');
        expect(errorBanner).toBeInTheDocument();
        expect(errorBanner.textContent).toMatch(/erreur/i);
      }, { timeout: 3000 });
    });
  });

  describe('Sélection d\'un étudiant', () => {
    it('devrait permettre de sélectionner un étudiant', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'jean.dupont@example.com');

      expect(select.value).toBe('jean.dupont@example.com');
    });

    it('devrait activer le bouton "Attribuer" quand un étudiant est sélectionné', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      // Utiliser getAllByRole et prendre le dernier (celui du formulaire, pas celui qui ouvre le formulaire)
      const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
      const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
      
      expect(attribuerSubmitButton).toBeDisabled();

      await user.selectOptions(select, 'jean.dupont@example.com');

      await waitFor(() => {
        expect(attribuerSubmitButton).not.toBeDisabled();
      });
    });

    it('devrait permettre d\'ajouter un commentaire optionnel', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('Ajouter un commentaire pour cette attribution...');
        expect(textarea).toBeInTheDocument();
      }, { timeout: 3000 });

      const textarea = screen.getByPlaceholderText('Ajouter un commentaire pour cette attribution...');
      await user.type(textarea, 'Excellent candidat, très motivé');

      expect(textarea.value).toBe('Excellent candidat, très motivé');
    });
  });

  describe('Attribution complète du stage', () => {
    it('devrait attribuer le stage et générer l\'entente avec succès', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={onClose}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'jean.dupont@example.com');

      const textarea = screen.getByPlaceholderText('Ajouter un commentaire pour cette attribution...');
      await user.type(textarea, 'Commentaire test');

      // Utiliser getAllByRole et prendre le dernier (celui du formulaire)
      const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
      const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
      await user.click(attribuerSubmitButton);

      await waitFor(() => {
        expect(screen.getByText('Stage attribué avec succès et entente générée !')).toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('devrait afficher un message d\'erreur si l\'attribution échoue', async () => {
      server.use(
        http.post('http://localhost:8080/gestionnaire/stages/assign', () => {
          return HttpResponse.json(
            { message: 'Erreur lors de l\'attribution' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'jean.dupont@example.com');

      // Utiliser getAllByRole et prendre le dernier (celui du formulaire)
      const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
      const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
      await user.click(attribuerSubmitButton);

      await waitFor(() => {
        const errorBanner = screen.getByTestId('error-banner');
        expect(errorBanner).toBeInTheDocument();
        expect(errorBanner.textContent).toMatch(/erreur/i);
      }, { timeout: 3000 });
    });

    it('devrait afficher un message d\'erreur si la génération d\'entente échoue', async () => {
      server.use(
        http.post('http://localhost:8080/gestionnaire/candidatures/:candidatureId/generer-entente', () => {
          return HttpResponse.json(
            { message: 'Erreur lors de la génération de l\'entente' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'jean.dupont@example.com');

      // Utiliser getAllByRole et prendre le dernier (celui du formulaire)
      const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
      const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
      await user.click(attribuerSubmitButton);

      await waitFor(() => {
        const errorBanner = screen.getByTestId('error-banner');
        expect(errorBanner).toBeInTheDocument();
        expect(errorBanner.textContent).toMatch(/erreur/i);
      }, { timeout: 3000 });
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait afficher une erreur si aucun étudiant n\'est sélectionné', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        // Utiliser getAllByRole et prendre le dernier (celui du formulaire)
        const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
        const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
        // Le bouton devrait être désactivé si aucun étudiant n'est sélectionné
        expect(attribuerSubmitButton).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('devrait permettre d\'annuler l\'attribution', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={vi.fn()}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const annulerButton = screen.getByRole('button', { name: /Annuler/i });
        expect(annulerButton).toBeInTheDocument();
      }, { timeout: 3000 });

      const annulerButton = screen.getByRole('button', { name: /Annuler/i });
      await user.click(annulerButton);

      await waitFor(() => {
        expect(screen.queryByText('Attribuer le stage à un étudiant')).not.toBeInTheDocument();
      });
    });
  });

  describe('Réinitialisation du formulaire', () => {
    it('devrait réinitialiser le formulaire après une attribution réussie', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      renderWithProviders(
        <StageDetailsModal
          stage={mockStage}
          isOpen={true}
          onClose={onClose}
          showManagementButtons={true}
        />
      );

      const attribuerButton = screen.getByText('Attribuer le stage');
      await user.click(attribuerButton);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      }, { timeout: 3000 });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'jean.dupont@example.com');

      const textarea = screen.getByPlaceholderText('Ajouter un commentaire pour cette attribution...');
      await user.type(textarea, 'Commentaire test');

      // Utiliser getAllByRole et prendre le dernier (celui du formulaire)
      const attribuerButtons = screen.getAllByRole('button', { name: /Attribuer/i });
      const attribuerSubmitButton = attribuerButtons[attribuerButtons.length - 1];
      await user.click(attribuerSubmitButton);

      await waitFor(() => {
        expect(screen.getByText('Stage attribué avec succès et entente générée !')).toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});

