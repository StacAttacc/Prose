import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import ListeCandidaturesProfesseur from '../../../components/professeur-components/ListeCandidaturesProfesseur.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useYear } from '../../../context/YearContext';

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

vi.mock('../../../context/YearContext', () => ({
  useYear: vi.fn()
}));

vi.mock('../../../components/display-components/ErrorBanner', () => ({
  default: ({ message }) => message ? <div data-testid="error-banner">{message}</div> : null
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('ListeCandidaturesProfesseur', () => {
  const mockUser = {
    email: 'professeur@test.com',
    firstName: 'Test',
    lastName: 'Professeur',
    role: 'PROFESSEUR',
    id: '1',
    token: 'mock-token-123'
  };

  const mockT = (key, params) => {
    const translations = {
      'professeur.candidaturesEtudiants': 'Candidatures de mes étudiants',
      'professeur.candidaturesDescription': 'Évaluez le milieu de travail pour les stages de vos étudiants',
      'professeur.aucuneCandidature': 'Aucune candidature',
      'professeur.aucuneCandidatureDescription': 'Aucune candidature trouvée pour vos étudiants cette année.',
      'professeur.stageId': 'Stage ID',
      'professeur.evaluationCompletee': 'Évaluation complétée',
      'professeur.evaluationEnAttente': 'Évaluation en attente',
      'professeur.voirEvaluation': 'Voir l\'évaluation',
      'professeur.evaluerMilieu': 'Évaluer le milieu',
      'erreurChargementCandidatures': 'Erreur lors du chargement des candidatures'
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

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

    vi.mocked(useYear).mockReturnValue({
      selectedYear: '2025',
      setSelectedYear: vi.fn()
    });
  });

  describe('Chargement des candidatures', () => {
    it('devrait charger et afficher les candidatures des étudiants', async () => {
      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Candidatures de mes étudiants')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('Marie Martin')).toBeInTheDocument();
      });
    });

    it('devrait afficher un message quand aucune candidature n\'est trouvée', async () => {
      server.use(
        http.get('http://localhost:8080/professeur/:professeurId/mes-etudiants-candidatures', () => {
          return HttpResponse.json({
            message: 'Candidatures trouvés',
            data: []
          });
        })
      );

      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Aucune candidature')).toBeInTheDocument();
      });
    });

    it('devrait afficher une erreur si le chargement échoue', async () => {
      server.use(
        http.get('http://localhost:8080/professeur/:professeurId/mes-etudiants-candidatures', () => {
          return HttpResponse.json(
            { message: 'Erreur serveur' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        const errorBanner = screen.getByTestId('error-banner');
        expect(errorBanner).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Affichage des candidatures', () => {
    it('devrait afficher les informations de chaque candidature', async () => {
      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('Marie Martin')).toBeInTheDocument();
      });
    });

    it('devrait afficher un indicateur pour les évaluations complétées', async () => {
      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        // Marie Martin a une évaluation complétée
        const marieCard = screen.getByText('Marie Martin').closest('.bg-white');
        expect(marieCard).toBeInTheDocument();
      });
    });

    it('devrait afficher le bouton "Évaluer le milieu" pour les candidatures sans évaluation', async () => {
      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        const evaluerButtons = screen.getAllByText('Évaluer le milieu');
        expect(evaluerButtons.length).toBeGreaterThan(0);
      });
    });

    it('devrait afficher le bouton "Voir l\'évaluation" pour les candidatures avec évaluation', async () => {
      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        const voirButtons = screen.getAllByText('Voir l\'évaluation');
        expect(voirButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation', () => {
    it('devrait naviguer vers la page d\'évaluation quand on clique sur "Évaluer le milieu"', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ListeCandidaturesProfesseur />, { selectedYear: '2025' });

      await waitFor(() => {
        const evaluerButton = screen.getAllByText('Évaluer le milieu')[0];
        expect(evaluerButton).toBeInTheDocument();
      });

      const evaluerButton = screen.getAllByText('Évaluer le milieu')[0];
      await user.click(evaluerButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/professeur/evaluations/evaluer/1');
      });
    });
  });
});

