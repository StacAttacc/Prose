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
      'etudiant': 'Étudiant',
      'professeur': 'Professeur',
      'selectionnerEtudiant': 'Sélectionner un étudiant',
      'selectionnerProfesseur': 'Sélectionner un professeur',
      'reinitialiser': 'Réinitialiser',
      'associer': 'Associer',
      'associationEnCours': 'Association en cours...',
      'associationReussie': 'Association réussie avec succès!',
      'selectionnerEtudiantEtProfesseur': 'Veuillez sélectionner un étudiant et un professeur',
      'erreurAssociation': 'Erreur lors de l\'association',
      'associationsExistantes': 'Associations existantes',
      'chargement': 'Chargement...',
      'aucunEtudiant': 'Aucun étudiant disponible',
      'aucunProfesseur': 'Aucun professeur disponible'
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

    // Mock getAllEtudiants et getAllProfesseurs pour retourner des listes vides par défaut
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue([]);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue([]);
  });

  it('devrait afficher le formulaire avec les dropdowns', async () => {
    const mockEtudiants = [
      { id: 1, email: 'etudiant1@test.com', firstName: 'John', lastName: 'Doe' },
      { id: 2, email: 'etudiant2@test.com', firstName: 'Jane', lastName: 'Smith' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'prof1@test.com', firstName: 'Robert', lastName: 'Duval' },
      { id: 2, email: 'prof2@test.com', firstName: 'Alice', lastName: 'Johnson' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      expect(screen.getByText('Association Professeur - Étudiant')).toBeInTheDocument();
    });

    // Vérifier que les selects existent
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
    
    // Vérifier que les deux sections sont présentes (utiliser getAllByText car il peut y avoir plusieurs occurrences)
    const etudiantTexts = screen.getAllByText(/Étudiant/i);
    expect(etudiantTexts.length).toBeGreaterThan(0);
    const professeurTexts = screen.getAllByText(/Professeur/i);
    expect(professeurTexts.length).toBeGreaterThan(0);
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

  it('devrait activer le bouton Associer quand les deux sélections sont faites', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');

    expect(submitButton).not.toBeDisabled();
  });

  it('devrait appeler le service avec les bons paramètres lors de la soumission', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    const mockAssocier = vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAssocier).toHaveBeenCalledWith(
        'professeur@test.com',
        'etudiant@test.com',
        'mock-token-123'
      );
    });

    mockAssocier.mockRestore();
  });

  it('devrait afficher un message de succès après une association réussie', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Association réussie avec succès!')).toBeInTheDocument();
    });
  });

  it('devrait vider les sélections après une association réussie', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(etudiantSelect).toHaveValue('');
      expect(professeurSelect).toHaveValue('');
    });
  });

  it('devrait désactiver le bouton si les sélections sont vides', async () => {
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Associer/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('devrait désactiver le bouton si seulement l\'étudiant est sélectionné', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    
    expect(submitButton).toBeDisabled();
  });

  it('devrait désactiver le bouton si seulement le professeur est sélectionné', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(professeurSelect, '1');
    
    expect(submitButton).toBeDisabled();
  });

  it('devrait afficher une erreur du backend si l\'association échoue', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Un des utilisateurs n\'existe pas';
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockRejectedValue({
      response: {
        data: errorMessage,
        status: 404
      }
    });
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si l\'étudiant est déjà associé', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Etudiant already associated';
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockRejectedValue({
      response: {
        data: errorMessage,
        status: 409
      }
    });
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('devrait afficher "Association en cours..." pendant la soumission', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockReturnValue(promise);
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Association en cours...')).toBeInTheDocument();
    });

    resolvePromise({});
  });

  it('devrait réinitialiser le formulaire quand on clique sur Réinitialiser', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');

    expect(etudiantSelect).toHaveValue('1');
    expect(professeurSelect).toHaveValue('1');

    await user.click(resetButton);

    expect(etudiantSelect).toHaveValue('');
    expect(professeurSelect).toHaveValue('');
  });

  it('devrait utiliser les emails des sélections pour l\'association', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    const mockAssocier = vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockResolvedValue({});
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAssocier).toHaveBeenCalledWith(
        'professeur@test.com',
        'etudiant@test.com',
        'mock-token-123'
      );
    });

    mockAssocier.mockRestore();
  });

  it('devrait désactiver le bouton Réinitialiser pendant la soumission', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(GestionnaireService, 'associerProfesseurEtudiant').mockReturnValue(promise);
    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(resetButton).toBeDisabled();
    });

    resolvePromise({});
  });

  it('devrait charger et afficher les associations existantes', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      {
        id: 1,
        email: 'etudiant1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        professeurResponsable: {
          email: 'prof1@test.com',
          firstName: 'Robert',
          lastName: 'Smith'
        }
      },
      {
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
    ];
    const mockProfesseurs = [
      { id: 1, email: 'prof1@test.com', firstName: 'Robert', lastName: 'Smith' },
      { id: 2, email: 'prof2@test.com', firstName: 'Alice', lastName: 'Johnson' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

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

  it('devrait afficher une erreur si aucun étudiant ou professeur n\'est sélectionné', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      { id: 1, email: 'etudiant@test.com', firstName: 'John', lastName: 'Doe' }
    ];
    const mockProfesseurs = [
      { id: 1, email: 'professeur@test.com', firstName: 'Robert', lastName: 'Duval' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const form = selects[0].closest('form');
    
    // Soumettre le formulaire sans sélection
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si l\'étudiant est déjà dans la liste des associations', async () => {
    const user = userEvent.setup();
    const mockEtudiants = [
      {
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
    ];
    const mockProfesseurs = [
      { id: 1, email: 'prof@test.com', firstName: 'Robert', lastName: 'Smith' },
      { id: 2, email: 'professeur2@test.com', firstName: 'Alice', lastName: 'Johnson' }
    ];

    vi.spyOn(GestionnaireService, 'getAllEtudiants').mockResolvedValue(mockEtudiants);
    vi.spyOn(GestionnaireService, 'getAllProfesseurs').mockResolvedValue(mockProfesseurs);

    renderWithProviders(<AssociationProfesseurEtudiant />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    const selects = screen.getAllByRole('combobox');
    const etudiantSelect = selects[0];
    const professeurSelect = selects[1];
    const submitButton = screen.getByRole('button', { name: /Associer/i });

    await user.selectOptions(etudiantSelect, '1');
    await user.selectOptions(professeurSelect, '2');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cet étudiant.*est déjà associé/i)).toBeInTheDocument();
    });
  });
});

