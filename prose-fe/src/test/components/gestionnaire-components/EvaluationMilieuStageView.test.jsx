import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import EvaluationMilieuStageView from '../../../components/gestionnaire-components/EvaluationMilieuStageView.jsx';
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

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ candidatureId: '1' }),
    useNavigate: () => vi.fn()
  };
});

describe('EvaluationMilieuStageView', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    id: '1',
    token: 'mock-token-123'
  };

  const mockT = (key, params) => {
    const translations = {
      'gestionnaire.evaluationMilieuStage': 'Évaluation de milieu de Stage',
      'gestionnaire.stagiaire': 'Stagiaire',
      'gestionnaire.entreprise': 'Entreprise',
      'gestionnaire.evalueLe': 'Évalué le',
      'gestionnaire.informationsEntreprise': 'Informations sur l\'entreprise',
      'gestionnaire.nomEntreprise': 'Nom de l\'entreprise',
      'gestionnaire.personneContact': 'Personne contact',
      'gestionnaire.addresse': 'Adresse',
      'gestionnaire.ville': 'Ville',
      'gestionnaire.codePostal': 'Code postal',
      'gestionnaire.numeroTelephone': 'Numéro de téléphone',
      'gestionnaire.informationsStage': 'Informations sur le stage',
      'gestionnaire.nomStagiaire': 'Nom du stagiaire',
      'gestionnaire.dateStage': 'Date du stage',
      'gestionnaire.numeroStage': 'Numéro de stage',
      'gestionnaire.evaluations': 'Évaluations',
      'gestionnaire.informationsSupplementaires': 'Informations supplémentaires',
      'gestionnaire.desireAutreStagiaires': 'Désire d\'autres stagiaires',
      'gestionnaire.quartsVariables': 'Quarts variables',
      'gestionnaire.candidatureNonTrouvee': 'Candidature non trouvée',
      'gestionnaire.evaluationNonTrouvee': 'Évaluation non trouvée',
      'gestionnaire.erreurChargement': 'Erreur lors du chargement de l\'évaluation',
      'common.yes': 'Oui',
      'common.no': 'Non',
      'common.error': 'Erreur',
      'common.back': 'Retour'
    };
    return translations[key] || key;
  };

  const mockTEnglish = (key, params) => {
    const translations = {
      'gestionnaire.evaluationMilieuStage': 'Internship Environment Evaluation',
      'gestionnaire.stagiaire': 'Intern',
      'gestionnaire.entreprise': 'Company',
      'gestionnaire.evalueLe': 'Evaluated on',
      'gestionnaire.informationsEntreprise': 'Company Information',
      'gestionnaire.nomEntreprise': 'Company Name',
      'gestionnaire.personneContact': 'Contact Person',
      'gestionnaire.addresse': 'Address',
      'gestionnaire.ville': 'City',
      'gestionnaire.codePostal': 'Postal Code',
      'gestionnaire.numeroTelephone': 'Phone Number',
      'gestionnaire.informationsStage': 'Internship Information',
      'gestionnaire.nomStagiaire': 'Intern Name',
      'gestionnaire.dateStage': 'Internship Date',
      'gestionnaire.numeroStage': 'Internship Number',
      'gestionnaire.evaluations': 'Evaluations',
      'gestionnaire.informationsSupplementaires': 'Additional Information',
      'gestionnaire.desireAutreStagiaires': 'Desires other interns',
      'gestionnaire.quartsVariables': 'Variable shifts',
      'gestionnaire.candidatureNonTrouvee': 'Application not found',
      'gestionnaire.evaluationNonTrouvee': 'Evaluation not found',
      'gestionnaire.erreurChargement': 'Error loading the evaluation',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.error': 'Error',
      'common.back': 'Back'
    };
    return translations[key] || key;
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

    vi.mocked(useYear).mockReturnValue({
      selectedYear: '2025',
      setSelectedYear: vi.fn()
    });
  });

  const createMockCandidature = (evaluationData) => {
    return {
      id: 1,
      status: 'CONFIRMER',
      etudiant: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        professeurResponsable: {
          id: 1,
          firstName: 'Prof',
          lastName: 'Test',
          email: 'prof@test.com'
        }
      },
      stage: {
        id: 1,
        title: 'Stage Développeur',
        startDate: '2025-01-15',
        endDate: '2025-04-30'
      },
      evaluationMillieu: evaluationData
    };
  };

  describe('Affichage des valeurs null/undefined pour desireAutreStagiaires et quartsVariables', () => {
    it('devrait afficher "-" quand desireAutreStagiaires est null', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: null,
        quartsVariables: true
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // Chercher le texte "-" dans la section des informations supplémentaires
        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThan(0);
        // Vérifier que "Désire d'autres stagiaires" est présent
        expect(screen.getByText('Désire d\'autres stagiaires')).toBeInTheDocument();
      });
    });

    it('devrait afficher "-" quand desireAutreStagiaires est undefined', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: undefined,
        quartsVariables: false
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // Chercher le texte "-" dans la section des informations supplémentaires
        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThan(0);
        // Vérifier que "Désire d'autres stagiaires" est présent
        expect(screen.getByText('Désire d\'autres stagiaires')).toBeInTheDocument();
      });
    });

    it('devrait afficher "-" quand quartsVariables est null', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: true,
        quartsVariables: null
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // Chercher le texte "-" dans la section des informations supplémentaires
        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThan(0);
        // Vérifier que "Quarts variables" est présent
        expect(screen.getByText('Quarts variables')).toBeInTheDocument();
      });
    });

    it('devrait afficher "-" quand quartsVariables est undefined', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: false,
        quartsVariables: undefined
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // Chercher le texte "-" dans la section des informations supplémentaires
        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThan(0);
        // Vérifier que "Quarts variables" est présent
        expect(screen.getByText('Quarts variables')).toBeInTheDocument();
      });
    });
  });

  describe('Affichage des valeurs true/false pour desireAutreStagiaires et quartsVariables', () => {
    it('devrait afficher "Oui" quand desireAutreStagiaires est true', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: true,
        quartsVariables: false
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Oui')).toBeInTheDocument();
      });
    });

    it('devrait afficher "Non" quand desireAutreStagiaires est false', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: false,
        quartsVariables: true
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        const nonElements = screen.getAllByText('Non');
        expect(nonElements.length).toBeGreaterThan(0);
      });
    });

    it('devrait afficher "Oui" quand quartsVariables est true', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: false,
        quartsVariables: true
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Oui')).toBeInTheDocument();
      });
    });

    it('devrait afficher "Non" quand quartsVariables est false', async () => {
      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: true,
        quartsVariables: false
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Évaluation de milieu de Stage')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        const nonElements = screen.getAllByText('Non');
        expect(nonElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Traductions en anglais', () => {
    it('devrait afficher les traductions en anglais correctement', async () => {
      vi.mocked(useI18n).mockReturnValue({
        t: mockTEnglish,
        locale: 'en',
        setLocale: vi.fn()
      });

      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: true,
        quartsVariables: false
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Internship Environment Evaluation')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Additional Information')).toBeInTheDocument();
        expect(screen.getByText('Desires other interns')).toBeInTheDocument();
        expect(screen.getByText('Variable shifts')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
      });
    });

    it('devrait afficher "-" en anglais quand les valeurs sont null', async () => {
      vi.mocked(useI18n).mockReturnValue({
        t: mockTEnglish,
        locale: 'en',
        setLocale: vi.fn()
      });

      const evaluation = {
        id: 1,
        nomEntreprise: 'Tech Corp',
        nomStagiaire: 'John Doe',
        desireAutreStagiaires: null,
        quartsVariables: null
      };

      const candidature = createMockCandidature(evaluation);

      server.use(
        http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
          return HttpResponse.json({
            message: 'Trouvés',
            data: [{
              etudiant: {
                ...candidature.etudiant,
                professeurResponsable: candidature.etudiant.professeurResponsable
              },
              candidatures: [candidature]
            }]
          });
        })
      );

      renderWithProviders(<EvaluationMilieuStageView />, { selectedYear: '2025' });

      await waitFor(() => {
        expect(screen.getByText('Internship Environment Evaluation')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // Vérifier que "-" est affiché (devrait être présent deux fois)
        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

