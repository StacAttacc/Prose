import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import AssociationProfesseurEtudiant from '../../../components/gestionnaire-components/AssociationProfesseurEtudiant.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useYear } from '../../../context/YearContext';
import * as GestionnaireService from '../../../services/GestionnaireService';

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

vi.mock('../../../context/YearContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useYear: vi.fn()
  };
});

vi.mock('../../../components/display-components/ErrorBanner', () => ({
  default: ({ message }) => message ? <div data-testid="error-banner">{message}</div> : null
}));

vi.mock('../../../components/common/ScrollToTop', () => ({
  default: () => null
}));

describe('AssociationProfesseurEtudiant', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    token: 'mock-token-123'
  };

  const mockT = (key, defaultValue) => {
    const translations = {
      'Faire une demande': 'Association Professeur - Étudiant',
      'Veuillez entrer l\'email de l\'étudiant': 'Email de l\'étudiant',
      'etudiant': 'Email de l\'étudiant',
      'Veuillez entrer l\'email du professeur': 'Sélectionner un professeur',
      'Email du professeur': 'Email du professeur',
      'emailProfesseur': 'Email du professeur',
      'reinitialiser': 'Réinitialiser',
      'associer': 'Associer',
      'associationEnCours': 'Association en cours...',
      'associationReussie': 'Association réussie avec succès!',
      'selectionnerEtudiantEtProfesseur': 'Veuillez entrer l\'email de l\'étudiant et l\'email du professeur',
      'erreurAssociation': 'Erreur lors de l\'association',
      'associationsExistantes': 'Associations existantes',
      'professeur': 'Professeur',
      'chargement': 'Chargement des associations...'
    };
    return translations[key] || defaultValue || key;
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
      i18n: {},
      ready: true
    });

    vi.mocked(useYear).mockReturnValue({
      selectedYear: '2025',
      setSelectedYear: vi.fn()
    });

    // Mock getStageApplicantsManager pour retourner une liste vide par défaut
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);
  });

  it('devrait afficher le formulaire avec les champs email', async () => {
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      expect(screen.getByText('Association Professeur - Étudiant')).toBeInTheDocument();
    });

    const etudiantLabels = screen.getAllByText(/Email de l'étudiant/i);
    expect(etudiantLabels.length).toBeGreaterThan(0);
    
    // Vérifier que les inputs existent (le label du professeur peut être traduit différemment)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(2);
    
    // Vérifier que les deux sections sont présentes (utiliser getAllByText car il peut y avoir plusieurs occurrences)
    const etudiantTexts = screen.getAllByText(/Email de l'étudiant/i);
    expect(etudiantTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Sélectionner un professeur/i)).toBeInTheDocument();
  });

  it('devrait afficher les boutons Réinitialiser et Associer', async () => {
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Associer/i })).toBeInTheDocument();
    });
  });

  it('devrait désactiver le bouton Associer quand les champs sont vides', async () => {
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Associer/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('devrait activer le bouton Associer quand les deux emails sont remplis', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');

    expect(submitButton).not.toBeDisabled();
  });

  it('devrait appeler le service avec les bons paramètres lors de la soumission', async () => {
    const user = userEvent.setup();
    const mockAssocier = vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    const mockGetAssociations = vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAssocier).toHaveBeenCalledWith(
        'professeur@test.com',
        'etudiant@test.com',
        'mock-token-123'
      );
    });

    mockAssocier.mockRestore();
    mockGetAssociations.mockRestore();
  });

  it('devrait afficher un message de succès après une association réussie', async () => {
    const user = userEvent.setup();
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Association réussie avec succès!')).toBeInTheDocument();
    });
  });

  it('devrait vider les champs après une association réussie', async () => {
    const user = userEvent.setup();
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(etudiantInput).toHaveValue('');
      expect(professeurInput).toHaveValue('');
    });
  });

  it('devrait afficher un message d\'erreur si les champs sont vides lors de la soumission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });
    
    await user.type(etudiantInput, 'test');
    await user.clear(etudiantInput);
    await user.type(professeurInput, 'test');
    await user.clear(professeurInput);
    
    expect(submitButton).toBeDisabled();
  });

  it('devrait afficher un message d\'erreur si seulement l\'email de l\'étudiant est rempli', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    
    expect(submitButton).toBeDisabled();
  });

  it('devrait afficher un message d\'erreur si seulement l\'email du professeur est rempli', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    const inputs = screen.getAllByRole('textbox');
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(professeurInput, 'professeur@test.com');
    
    expect(submitButton).toBeDisabled();
  });

  it('devrait afficher une erreur du backend si l\'association échoue', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Un des utilisateurs n\'existe pas';
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockRejectedValue({
      response: {
        data: errorMessage,
        status: 404
      }
    });
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si l\'étudiant est déjà associé', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Etudiant already associated';
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockRejectedValue({
      response: {
        data: errorMessage,
        status: 409
      }
    });
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('devrait afficher "Association en cours..." pendant la soumission', async () => {
    const user = userEvent.setup();
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockReturnValue(promise);
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Association en cours...')).toBeInTheDocument();
    });

    resolvePromise({});
  });

  it('devrait réinitialiser le formulaire quand on clique sur Réinitialiser', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');

    expect(etudiantInput).toHaveValue('etudiant@test.com');
    expect(professeurInput).toHaveValue('professeur@test.com');

    await user.click(resetButton);

    expect(etudiantInput).toHaveValue('');
    expect(professeurInput).toHaveValue('');
  });

  it('devrait supprimer les espaces de l\'email de l\'étudiant avant l\'envoi', async () => {
    const user = userEvent.setup();
    const mockAssocier = vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, '  etudiant@test.com  ');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAssocier).toHaveBeenCalledWith(
        'professeur@test.com',
        'etudiant@test.com', // Les espaces doivent être supprimés
        'mock-token-123'
      );
    });

    mockAssocier.mockRestore();
  });

  it('devrait désactiver le bouton Réinitialiser pendant la soumission', async () => {
    const user = userEvent.setup();
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockReturnValue(promise);
    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue([]);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(resetButton).toBeDisabled();
    });

    resolvePromise({});
  });

  it('devrait charger et afficher les associations existantes', async () => {
    const user = userEvent.setup();
    const mockAssociations = [
      {
        etudiant: {
          id: 1,
          email: 'etudiant1@test.com',
          firstName: 'John',
          lastName: 'Doe',
          professeurResponsable: {
            email: 'prof1@test.com',
            firstName: 'Robert',
            lastName: 'Smith'
          }
        }
      },
      {
        etudiant: {
          id: 2,
          email: 'etudiant2@test.com',
          firstName: 'Jane',
          lastName: 'Doe',
          professeurResponsable: {
            email: 'prof2@test.com',
            firstName: 'Alice',
            lastName: 'Johnson'
          }
        }
      }
    ];

    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue(mockAssociations);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    // Attendre que le titre "Associations existantes" soit visible
    await waitFor(() => {
      expect(screen.getByText('Associations existantes')).toBeInTheDocument();
    });

    // Cliquer sur le bouton pour ouvrir le collapse
    const collapseButton = screen.getByRole('button', { name: /Associations existantes/i });
    await user.click(collapseButton);

    // Attendre que le contenu soit visible après l'ouverture
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('etudiant1@test.com')).toBeInTheDocument();
    expect(screen.getByText('Robert Smith')).toBeInTheDocument();
    expect(screen.getByText('prof1@test.com')).toBeInTheDocument();
  });

  it('devrait afficher une erreur si l\'email de l\'étudiant est invalide', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const form = etudiantInput.closest('form');

    await user.type(etudiantInput, 'email-invalide');
    await user.type(professeurInput, 'professeur@test.com');
    
    // Soumettre le formulaire directement pour contourner la validation HTML5
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("L'email de l'étudiant n'est pas valide")).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si l\'email du professeur est invalide', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const form = etudiantInput.closest('form');

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'email-invalide');
    
    // Soumettre le formulaire directement pour contourner la validation HTML5
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("L'email du professeur n'est pas valide")).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si l\'étudiant est déjà dans la liste des associations', async () => {
    const user = userEvent.setup();
    const mockAssociations = [
      {
        etudiant: {
          id: 1,
          email: 'etudiant@test.com',
          firstName: 'John',
          lastName: 'Doe',
          professeurResponsable: {
            email: 'prof@test.com',
            firstName: 'Robert',
            lastName: 'Smith'
          }
        }
      }
    ];

    vi.spyOn(GestionnaireService, 'getStageApplicantsManager').mockResolvedValue(mockAssociations);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByRole('textbox');
    const etudiantInput = inputs[0];
    const professeurInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.type(etudiantInput, 'etudiant@test.com');
    await user.type(professeurInput, 'professeur2@test.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cet étudiant.*est déjà associé/i)).toBeInTheDocument();
    });
  });
});

