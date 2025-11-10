import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import PostedStages from '../../../components/employeur-components/PostedStages.jsx';
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

vi.mock('../../../components/display-components/ErrorBanner', () => ({
  default: ({ message }) => <div data-testid="error-banner">{message}</div>
}));

vi.mock('../../../components/common/ScrollToTop', () => ({
  default: () => null
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('PostedStages', () => {
  const mockUser = {
    email: 'employeur@test.com',
    firstName: 'Test',
    lastName: 'Employeur',
    role: 'EMPLOYEUR',
    token: 'mock-token-123'
  };

  const mockT = (key, params) => {
    const translations = {
      mesStages: 'Mes Stages',
      recherche: 'Recherche',
      recherchePlaceholderEmployeur: 'Titre, description...',
      lieu: 'Lieu',
      lieuPlaceholder: 'Montréal, Québec, Télétravail...',
      compensation: 'Compensation',
      compensationPlaceholder: '20$/h, 500$/semaine...',
      statut: 'Statut',
      tousLesStatuts: 'Tous les statuts',
      soumise: 'Soumise',
      approuvee: 'Approuvée',
      rejetee: 'Rejetée',
      publiee: 'Publiée',
      sessionsAnterieures: 'Sessions',
      sessionsActuellesFutures: 'Sessions actuelles/futures',
      toutesLesSessions: 'Toutes les sessions',
      effacerFiltres: 'Effacer les filtres',
      stagesTrouves: (p) => `${p?.count || 0} stage(s) trouvé(s) sur ${p?.total || 0} au total`,
      chargementStagesEmployeur: 'Chargement des stages...',
      impossibleChargerStages: 'Impossible de charger les stages.',
      voirDetails: 'Voir détails',
      voirCandidaturesBtn: 'Voir les candidatures',
      aucunStageEmployeur: 'Vous n\'avez aucun stage.',
      aucunStageCritereRecherche: 'Aucun stage ne correspond à vos critères de recherche.',
      periode: 'Période',
      dateCreation: 'Date de création'
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

  it('devrait afficher le titre "Mes Stages"', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Mes Stages')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message de chargement initialement', () => {
    renderWithProviders(<PostedStages />);
    
    expect(screen.getByText(/Chargement des stages/i)).toBeInTheDocument();
  });

  it('devrait charger et afficher les stages', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    expect(screen.getByText('Stage Analyste Données')).toBeInTheDocument();
    expect(screen.getByText('Stage Designer UI/UX')).toBeInTheDocument();
  });

  it('devrait afficher les filtres de recherche', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Titre, description/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Montréal, Québec/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/20\$\/h/i)).toBeInTheDocument();
    expect(screen.getByText('Effacer les filtres')).toBeInTheDocument();
  });

  it('devrait afficher le filtre de sessions', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    });

    const sessionSelect = screen.getAllByRole('combobox').find(select => 
      select.querySelector('option[value="current"]')
    );
    expect(sessionSelect).toBeInTheDocument();
    expect(screen.getByText('Sessions actuelles/futures')).toBeInTheDocument();
  });

  it('devrait filtrer les stages par recherche', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Titre, description/i);
    await user.type(searchInput, 'Analyste');

    await waitFor(() => {
      expect(screen.queryByText('Stage Développeur Web')).not.toBeInTheDocument();
      expect(screen.getByText('Stage Analyste Données')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les stages par lieu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText(/Montréal, Québec/i);
    await user.type(locationInput, 'Québec');

    await waitFor(() => {
      expect(screen.queryByText('Stage Développeur Web')).not.toBeInTheDocument();
      expect(screen.getByText('Stage Analyste Données')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les stages par statut', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects.find(select => 
      select.querySelector('option[value="SOUMISE"]')
    );
    
    if (statusSelect) {
      await user.selectOptions(statusSelect, 'SOUMISE');

      await waitFor(() => {
        expect(screen.queryByText('Stage Développeur Web')).not.toBeInTheDocument();
        expect(screen.getByText('Stage Designer UI/UX')).toBeInTheDocument();
      });
    }
  });

  it('devrait filtrer les stages par sessions antérieures', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    expect(screen.queryByText('Stage Développeur Backend')).not.toBeInTheDocument();

    const sessionSelects = screen.getAllByRole('combobox');
    const sessionSelect = sessionSelects.find(select => 
      select.querySelector('option[value="all"]')
    );
    
    if (sessionSelect) {
      await user.selectOptions(sessionSelect, 'all');

      await waitFor(() => {
        expect(screen.getByText('Stage Développeur Backend')).toBeInTheDocument();
        expect(screen.getByText('Stage Data Analyst')).toBeInTheDocument();
      });
    }
  });

  it('devrait afficher les informations de chaque stage', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const montrealElements = screen.getAllByText(/Montréal/i);
    expect(montrealElements.length).toBeGreaterThan(0);
    
    const compensationElements = screen.getAllByText(/25\$\/h/i);
    expect(compensationElements.length).toBeGreaterThan(0);
  });

  it('devrait afficher le statut de chaque stage', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const approuveeElements = screen.getAllByText('Approuvée');
    expect(approuveeElements.length).toBeGreaterThan(0);
    
    const publieeElements = screen.getAllByText('Publiée');
    expect(publieeElements.length).toBeGreaterThan(0);
    
    const soumiseElements = screen.getAllByText('Soumise');
    expect(soumiseElements.length).toBeGreaterThan(0);
  });

  it('devrait afficher le bouton "Voir détails" pour chaque stage', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByText(/Voir détails/i);
    expect(viewDetailsButtons.length).toBeGreaterThan(0);
  });

  it('devrait ouvrir la modal de détails au clic sur "Voir détails"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const viewDetailsButton = screen.getAllByText(/Voir détails/i)[0];
    await user.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId('stage-details-modal')).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton "Voir les candidatures" pour les stages approuvés ou publiés', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const viewCandidaturesButtons = screen.getAllByText(/Voir les candidatures/i);
    expect(viewCandidaturesButtons.length).toBeGreaterThan(0);
  });

  it('devrait afficher le compteur de stages filtrés', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText(/stage\(s\) trouvé\(s\)/i)).toBeInTheDocument();
    });
  });

  it('devrait effacer tous les filtres au clic sur "Effacer les filtres"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Titre, description/i);
    await user.type(searchInput, 'Analyste');

    await waitFor(() => {
      expect(screen.queryByText('Stage Développeur Web')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByText('Effacer les filtres');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si le chargement échoue', async () => {
    server.use(
      http.get('http://localhost:8080/employeur/:email/stages', () => {
        return HttpResponse.json({ message: 'Erreur serveur' }, { status: 500 });
      })
    );

    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });

  it('devrait afficher "Aucun stage" si la liste est vide', async () => {
    server.use(
      http.get('http://localhost:8080/employeur/:email/stages', () => {
        return HttpResponse.json({
          message: 'Trouvés',
          data: []
        });
      })
    );

    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText(/Vous n'avez aucun stage/i)).toBeInTheDocument();
    });
  });

  it('devrait exclure les stages antérieurs par défaut', async () => {
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    // Les stages antérieurs ne devraient pas être affichés
    expect(screen.queryByText('Stage Développeur Backend')).not.toBeInTheDocument();
    expect(screen.queryByText('Stage Data Analyst')).not.toBeInTheDocument();
  });

  it('devrait inclure les stages antérieurs quand le filtre est activé', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostedStages />);

    await waitFor(() => {
      expect(screen.getByText('Stage Développeur Web')).toBeInTheDocument();
    });

    // Sélectionner "Toutes les sessions"
    const sessionSelects = screen.getAllByRole('combobox');
    const sessionSelect = sessionSelects.find(select => 
      select.querySelector('option[value="all"]')
    );
    
    if (sessionSelect) {
      await user.selectOptions(sessionSelect, 'all');

      await waitFor(() => {
        // Vérifier que les stages antérieurs sont maintenant affichés
        expect(screen.getByText('Stage Développeur Backend')).toBeInTheDocument();
        expect(screen.getByText('Stage Data Analyst')).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });
});

