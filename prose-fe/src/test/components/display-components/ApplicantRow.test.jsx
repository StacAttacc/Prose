import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import ApplicantRow from '../../../components/display-components/ApplicantRow.jsx';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => ({ pathname: '/test', state: null }),
    useNavigate: () => vi.fn()
  };
});

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

vi.mock('../../../components/display-components/PdfModal', () => ({
  default: ({ isOpen, onClose, title }) => 
    isOpen ? (
      <div data-testid="pdf-modal">
        <p>{title}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
}));

vi.mock('../../../components/display-components/EntenteSignatureModal', () => ({
  default: ({ isOpen, onClose, applicant }) => 
    isOpen ? (
      <div data-testid="entente-signature-modal">
        <p>Modal Entente pour {applicant?.id}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
}));

vi.mock('../../../components/display-components/InterviewConvocationModal', () => ({
  default: ({ isOpen, onClose }) => 
    isOpen ? (
      <div data-testid="interview-convocation-modal">
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
}));

describe('ApplicantRow', () => {
  const mockUser = {
    email: 'employeur@test.com',
    role: 'EMPLOYEUR',
    token: 'mock-token-123'
  };

  const mockT = (key) => {
    const translations = {
      voirLeCV: 'Voir le CV',
      voirLaLettre: 'Voir la lettre',
      cvNonDisponible: 'CV non disponible',
      emailNonDisponible: 'Email non disponible',
      aucuneLettreMotivation: 'Aucune lettre de motivation',
      soumise: 'Soumise',
      enAttenteReponseEtudiant: 'En attente de réponse de l\'étudiant',
      convoquee: 'Convoquée',
      refusee: 'Refusée',
      confirmeeParEtudiant: 'Confirmée par l\'étudiant',
      refuseeParEtudiant: 'Refusée par l\'étudiant',
      convoquer: 'Convoquer',
      refuser: 'Refuser',
      accepter: 'Accepter',
      traite: 'Traité',
      ouverture: 'Ouverture...',
      impossibleAfficherCV: 'Impossible d\'afficher le CV',
      impossibleAfficherLettre: 'Impossible d\'afficher la lettre',
      cvDe: ({ name }) => `CV de ${name}`
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
  });

  const mockApplicant = {
    id: 1,
    email: 'etudiant@test.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'CONFIRMER',
    dateDecision: null
  };

  it('devrait afficher les informations de l\'applicant', () => {
    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('etudiant@test.com')).toBeInTheDocument();
  });

  it('devrait afficher le bouton "Voir le CV"', () => {
    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Voir le CV')).toBeInTheDocument();
  });

  it('devrait vérifier l\'existence de l\'entente pour les candidatures confirmées', async () => {
    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    await waitFor(() => {
      expect(screen.getByText(/Entente signée par toutes les parties/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait afficher les deux boutons "Voir l\'entente" et "Télécharger" quand l\'entente est SIGNEE', async () => {
    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    await waitFor(() => {
      expect(screen.getByText(/Entente signée par toutes les parties/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Voir l'entente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('devrait ouvrir le modal d\'entente au clic sur "Voir l\'entente"', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    await waitFor(() => {
      expect(screen.getByText(/Entente signée par toutes les parties/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const viewButton = await screen.findByRole('button', { name: /Voir l'entente/i });
    await user.click(viewButton);

    await waitFor(() => {
      expect(screen.getByTestId('entente-signature-modal')).toBeInTheDocument();
    });
  });

  it('devrait afficher le statut correct pour une candidature SOUMISE', () => {
    const soumiseApplicant = {
      ...mockApplicant,
      status: 'SOUMISE'
    };

    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={soumiseApplicant} showActions={true} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Soumise')).toBeInTheDocument();
    expect(screen.getByText('Convoquer')).toBeInTheDocument();
    expect(screen.getByText('Refuser')).toBeInTheDocument();
  });

  it('devrait afficher le statut correct pour une candidature CONVOQUEE', () => {
    const convoqueeApplicant = {
      ...mockApplicant,
      status: 'CONVOQUEE',
      dateDecision: '2025-01-20T10:00:00Z'
    };

    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={convoqueeApplicant} showActions={true} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Convoquée')).toBeInTheDocument();
    expect(screen.getByText('Accepter')).toBeInTheDocument();
    expect(screen.getByText('Refuser')).toBeInTheDocument();
  });

  it('devrait afficher "En attente du gestionnaire" si l\'entente n\'existe pas', async () => {
    server.use(
      http.get('http://localhost:8080/employeur/candidatures/1/entente', () => {
        return HttpResponse.json({ message: 'Entente non trouvée' }, { status: 404 });
      })
    );

    renderWithProviders(
      <table>
        <tbody>
          <ApplicantRow applicant={mockApplicant} />
        </tbody>
      </table>
    );

    await waitFor(() => {
      expect(screen.getByText(/En attente du gestionnaire pour l'entente de stage/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

