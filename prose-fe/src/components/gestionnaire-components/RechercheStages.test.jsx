import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils/testUtils';
import GestRechercheStages from './RechercheStages';
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

vi.mock('../display-components/ErrorBanner', () => ({
  default: ({ message }) => <div data-testid="error-banner">{message}</div>
}));

describe('RechercheStages - Filtrage par année', () => {
  const mockUser = {
    email: 'gestionnaire@test.com',
    firstName: 'Test',
    lastName: 'Gestionnaire',
    role: 'GESTIONNAIRE',
    token: 'mock-token-123'
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
  });

  it('devrait afficher les stages de l\'année 2025 par défaut', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    renderWithProviders(<GestRechercheStages />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur 2025')).toBeInTheDocument();
    });

    expect(screen.getByText('Stage Développeur 2025')).toBeInTheDocument();
    expect(screen.getByText('Stage Analyste 2025')).toBeInTheDocument();
    
    expect(screen.queryByText('Stage Développeur 2026')).not.toBeInTheDocument();
  });

  it('devrait filtrer les stages selon l\'année sélectionnée (2026)', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2026', setSelectedYear: vi.fn() });
    renderWithProviders(<GestRechercheStages />, { selectedYear: '2026' });

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur 2026')).toBeInTheDocument();
    });

    expect(screen.getByText('Stage Développeur 2026')).toBeInTheDocument();
    expect(screen.queryByText('Stage Développeur 2025')).not.toBeInTheDocument();
    expect(screen.queryByText('Stage Analyste 2025')).not.toBeInTheDocument();
  });

  it('devrait filtrer les stages selon l\'année sélectionnée (2027)', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2027', setSelectedYear: vi.fn() });
    renderWithProviders(<GestRechercheStages />, { selectedYear: '2027' });

    await waitFor(() => {
      expect(screen.getByText('Stage Designer 2027')).toBeInTheDocument();
    });

    // Vérifier que seuls les stages de 2027 sont affichés
    expect(screen.getByText('Stage Designer 2027')).toBeInTheDocument();
    expect(screen.queryByText('Stage Développeur 2025')).not.toBeInTheDocument();
    expect(screen.queryByText('Stage Développeur 2026')).not.toBeInTheDocument();
  });

  it('devrait afficher un message quand aucun stage n\'est trouvé pour une année', async () => {
    // Override le handler pour retourner une liste vide
    server.use(
      http.get('http://localhost:8080/gestionnaire/stages', () => {
        return HttpResponse.json({
          message: 'Liste des stages',
          data: []
        });
      })
    );

    vi.mocked(useYear).mockReturnValue({ selectedYear: '2030', setSelectedYear: vi.fn() });
    renderWithProviders(<GestRechercheStages />, { selectedYear: '2030' });

    await waitFor(() => {
      expect(screen.getByText(/Aucun stage disponible pour le moment/i)).toBeInTheDocument();
    });
  });

  it('devrait recharger les stages quand l\'année change', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    const { rerender } = renderWithProviders(<GestRechercheStages />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur 2025')).toBeInTheDocument();
    });

    vi.mocked(useYear).mockReturnValue({ selectedYear: '2026', setSelectedYear: vi.fn() });
    rerender(<GestRechercheStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur 2026')).toBeInTheDocument();
      expect(screen.queryByText('Stage Développeur 2025')).not.toBeInTheDocument();
    });
  });

  it('devrait afficher le nombre correct de stages trouvés', async () => {
    vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
    renderWithProviders(<GestRechercheStages />, { selectedYear: '2025' });

    await waitFor(() => {
      expect(screen.getByText(/2 stage\(s\) trouvé\(s\) sur 2 au total/i)).toBeInTheDocument();
    });
  });
});

