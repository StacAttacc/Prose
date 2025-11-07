import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils/testUtils';
import GestionnaireEtuCandidature from './GestionnaireEtuCandidature';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { useYear } from '../../context/YearContext';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/YearContext', () => ({
  useYear: vi.fn()
}));

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn()
  };
});

vi.mock('../display-components/StageDetailsModal', () => ({
  default: () => <div data-testid="stage-details-modal">Stage Details Modal</div>
}));

vi.mock('../display-components/ApplicationsModal', () => ({
  default: () => <div data-testid="applications-modal">Applications Modal</div>
}));

vi.mock('../display-components/ErrorBanner', () => ({
  default: ({ message }) => message ? <div data-testid="error-banner">{message}</div> : null
}));

describe('GestionnaireEtuCandidature - Filtrage par année', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    token: 'mock-token-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useAuth pour retourner un utilisateur par défaut
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthed: true,
      login: vi.fn(),
      registerEmployeur: vi.fn(),
      registerEtudiant: vi.fn(),
      logout: vi.fn()
    });
  });

  it('devrait afficher les étudiants de l\'année 2025 par défaut', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    
    expect(screen.queryByText('Pierre Bernard')).not.toBeInTheDocument();
  });

  it('devrait filtrer les étudiants selon l\'année sélectionnée (2026)', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2026', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2026' });

    await waitFor(() => {
      expect(screen.getByText('Pierre Bernard')).toBeInTheDocument();
    });

    expect(screen.getByText('Pierre Bernard')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    expect(screen.queryByText('Marie Martin')).not.toBeInTheDocument();
  });

  it('devrait filtrer les étudiants selon l\'année sélectionnée (2027)', async () => {
    const user = userEvent.setup();
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2027', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2027' });

    await waitFor(() => {
      expect(screen.getByText(/Stage Trouvé \(1\)/)).toBeInTheDocument();
    });


    const buttons = screen.getAllByRole('button');
    const stageTrouveButton = buttons.find(btn => btn.textContent.includes('Stage Trouvé'));
    expect(stageTrouveButton).toBeTruthy();
    await user.click(stageTrouveButton);

    await waitFor(() => {
      expect(screen.getByText('Sophie Lefebvre')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('Sophie Lefebvre')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    expect(screen.queryByText('Pierre Bernard')).not.toBeInTheDocument();
  });

  it('devrait afficher un message quand aucun étudiant n\'est trouvé pour une année', async () => {
    server.use(
      http.get('http://localhost:8080/gestionnaire/getCandidatures', () => {
        return HttpResponse.json({
          message: 'Trouvés',
          data: []
        });
      })
    );

    vi.mocked(useYear).mockReturnValue({ selectedYear: '2030', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2030' });

    await waitFor(() => {
      expect(screen.getByText(/Aucun étudiant trouvé pour l'année 2030/i)).toBeInTheDocument();
    });
  });

  it('devrait recharger les étudiants quand l\'année change', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    const { rerender } = renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    vi.mocked(useYear).mockReturnValue({ selectedYear: '2026', setSelectedYear: vi.fn() });
    rerender(<GestionnaireEtuCandidature />);

    await waitFor(() => {
      expect(screen.getByText('Pierre Bernard')).toBeInTheDocument();
      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    });
  });

  it('devrait afficher les compteurs corrects pour chaque onglet', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    expect(screen.getByText(/Aucune Candidature \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Candidature Soumise \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Stage Trouvé \(\d+\)/)).toBeInTheDocument();
  });

  it('devrait afficher les emails des étudiants', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    renderWithProviders(<GestionnaireEtuCandidature />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('jean.dupont@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('jean.dupont@example.com')).toBeInTheDocument();
    expect(screen.getByText('marie.martin@example.com')).toBeInTheDocument();
  });
});

