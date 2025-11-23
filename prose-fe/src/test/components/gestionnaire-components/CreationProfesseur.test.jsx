import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import CreationProfesseur from '../../../components/gestionnaire-components/CreationProfesseur.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
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

vi.mock('../../../components/display-components/ErrorBanner', () => ({
  default: ({ message }) => message ? <div data-testid="error-banner">{message}</div> : null
}));

vi.mock('../../../components/common/ScrollToTop', () => ({
  default: () => null
}));

describe('CreationProfesseur', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    token: 'mock-token-123'
  };

  const mockT = (key) => {
    const translations = {
      creationProfesseur: 'Création de Professeur',
      informationsPersonnelles: 'Informations Personnelles',
      prenom: 'Prénom',
      nom: 'Nom',
      email: 'Email',
      motDePasse: 'Mot de passe',
      discipline: 'Discipline',
      selectionnerDiscipline: 'Choisir une Discipline',
      informatique: 'Informatique',
      infirmier: 'Infirmier',
      genieCivil: 'Génie Civil',
      comptabilite: 'Comptabilité',
      marketing: 'Marketing',
      mecanique: 'Mécanique',
      autre: 'Autre',
      emailInvalide: 'Email invalide',
      min10Caracteres: 'Le mot de passe doit contenir au moins 10 caractères',
      reinitialiser: 'Réinitialiser',
      creerUnProfesseur: 'Créer un Professeur',
      creationEnCours: 'Création en cours...',
      professeurCreeAvecSucces: 'Le professeur a été créé avec succès',
      erreurCreationProfesseur: 'Erreur lors de la création du professeur',
      emailDejaUtilise: 'Un compte avec cet email existe déjà',
      remplirTousLesChamps: 'Veuillez remplir tous les champs correctement',
      erreurAuthentification: 'Erreur d\'authentification. Veuillez vous reconnecter.'
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthed: true
    });
    
    vi.mocked(useI18n).mockReturnValue({
      t: mockT,
      language: 'fr',
      setLanguage: vi.fn()
    });
    
    // Mock du service
    vi.spyOn(GestionnaireService, 'createProfesseur').mockResolvedValue({
      message: 'Professeur créé avec succès',
      data: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le formulaire de création de professeur', () => {
    renderWithProviders(<CreationProfesseur />);

    expect(screen.getByText('Création de Professeur')).toBeInTheDocument();
    expect(screen.getByText('Informations Personnelles')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Prénom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Choisir une Discipline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer un Professeur/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
  });

  it('devrait afficher toutes les disciplines disponibles', () => {
    renderWithProviders(<CreationProfesseur />);

    // Trouver le select par son texte par défaut
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    expect(disciplineSelect).toBeInTheDocument();

    const options = disciplineSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1); // Au moins l'option par défaut + les disciplines
  });

  it('devrait valider que l\'email est valide', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'email-invalide');

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });

  it('devrait valider que le mot de passe a au moins 10 caractères', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    await user.type(passwordInput, 'short');

    await waitFor(() => {
      expect(screen.getByText(/Le mot de passe doit contenir au moins 10 caractères/i)).toBeInTheDocument();
    });
  });

  it('devrait désactiver le bouton de soumission si les champs ne sont pas valides', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    expect(submitButton).toBeDisabled();

    // Remplir partiellement le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'short'); // Mot de passe trop court

    expect(submitButton).toBeDisabled();
  });

  it('devrait permettre de remplir tous les champs du formulaire', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean.dupont@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jean.dupont@example.com')).toBeInTheDocument();
    expect(disciplineSelect.value).toBe('INFORMATIQUE');
  });

  it('devrait permettre de basculer la visibilité du mot de passe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    await user.type(passwordInput, 'password123');

    // Le mot de passe devrait être masqué par défaut
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Trouver le bouton de visibilité (icône) - il est dans le parent avec classe "relative"
    const passwordContainer = passwordInput.closest('.relative');
    const toggleButton = passwordContainer.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);

    // Le mot de passe devrait être visible
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('devrait créer un professeur avec succès', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean.dupont@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier que le service a été appelé avec les bonnes données
    await waitFor(() => {
      expect(GestionnaireService.createProfesseur).toHaveBeenCalledWith(
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          password: 'password123',
          discipline: 'INFORMATIQUE'
        },
        'mock-token-123'
      );
    });

    // Vérifier le message de succès
    await waitFor(() => {
      expect(screen.getByText('Le professeur a été créé avec succès')).toBeInTheDocument();
    });

    // Vérifier que le formulaire a été réinitialisé
    expect(screen.getByPlaceholderText('Prénom').value).toBe('');
    expect(screen.getByPlaceholderText('Nom').value).toBe('');
    expect(screen.getByPlaceholderText('Email').value).toBe('');
    expect(screen.getByPlaceholderText('Mot de passe').value).toBe('');
    expect(disciplineSelect.value).toBe('');
  });

  it('devrait afficher une erreur si l\'email est déjà utilisé', async () => {
    const user = userEvent.setup();
    
    // Mock une erreur 409 (Conflict)
    vi.spyOn(GestionnaireService, 'createProfesseur').mockRejectedValue({
      response: {
        status: 409,
        data: 'Un compte avec cet email existe déjà'
      }
    });

    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'existant@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier le message d'erreur
    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText('Un compte avec cet email existe déjà')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur en cas d\'erreur serveur', async () => {
    const user = userEvent.setup();
    
    // Mock une erreur serveur
    vi.spyOn(GestionnaireService, 'createProfesseur').mockRejectedValue({
      response: {
        status: 500,
        data: 'Erreur interne du serveur'
      }
    });

    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier le message d'erreur
    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });

  it('devrait réinitialiser le formulaire quand on clique sur Réinitialiser', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Cliquer sur Réinitialiser
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });
    await user.click(resetButton);

    // Vérifier que tous les champs sont vides
    expect(screen.getByPlaceholderText('Prénom').value).toBe('');
    expect(screen.getByPlaceholderText('Nom').value).toBe('');
    expect(screen.getByPlaceholderText('Email').value).toBe('');
    expect(screen.getByPlaceholderText('Mot de passe').value).toBe('');
    expect(disciplineSelect.value).toBe('');
  });

  it('devrait afficher "Création en cours..." pendant la soumission', async () => {
    const user = userEvent.setup();
    
    // Mock une réponse lente
    vi.spyOn(GestionnaireService, 'createProfesseur').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 100))
    );

    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier que le bouton affiche "Création en cours..."
    await waitFor(() => {
      expect(screen.getByText('Création en cours...')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si le token est manquant', async () => {
    const user = userEvent.setup();
    
    // Mock un utilisateur sans token
    vi.mocked(useAuth).mockReturnValue({ 
      user: { ...mockUser, token: null },
      isAuthed: true
    });

    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier le message d'erreur d'authentification
    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText(/Erreur d'authentification/i)).toBeInTheDocument();
    });

    // Vérifier que le service n'a pas été appelé
    expect(GestionnaireService.createProfesseur).not.toHaveBeenCalled();
  });

  it('devrait gérer les erreurs de validation du backend', async () => {
    const user = userEvent.setup();
    
    // Mock une erreur 400 avec message de validation
    vi.spyOn(GestionnaireService, 'createProfesseur').mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: 'Le prénom est requis'
        }
      }
    });

    renderWithProviders(<CreationProfesseur />);

    // Remplir le formulaire
    await user.type(screen.getByPlaceholderText('Prénom'), 'Jean');
    await user.type(screen.getByPlaceholderText('Nom'), 'Dupont');
    await user.type(screen.getByPlaceholderText('Email'), 'jean@example.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password123');
    
    const disciplineSelect = screen.getByDisplayValue('Choisir une Discipline');
    await user.selectOptions(disciplineSelect, 'INFORMATIQUE');

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /Créer un Professeur/i });
    await user.click(submitButton);

    // Vérifier le message d'erreur
    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText('Le prénom est requis')).toBeInTheDocument();
    });
  });
});

