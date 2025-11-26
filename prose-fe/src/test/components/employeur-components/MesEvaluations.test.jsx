import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MesEvaluations from '../../../components/employeur-components/MesEvaluations';
import * as EmployeurService from '../../../services/EmployeurService';
import { I18nProvider } from '../../../context/I18nContext';

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            token: 'fake-token',
            role: 'EMPLOYEUR'
        }
    })
}));

vi.mock('../../../context/YearContext', () => ({
    useYear: () => ({
        selectedYear: '2025'
    })
}));

vi.mock('../../../services/EmployeurService');


const mockEntentes = [
    {
        id: 1,
        etudiantId: 10,
        etudiantNom: 'Dupont',
        etudiantPrenom: 'Jean',
        stageId: 5,
        stageTitle: 'Stage Développeur Java',
        status: 'SIGNEE',
        hasEvaluation: false
    },
    {
        id: 2,
        etudiantId: 11,
        etudiantNom: 'Martin',
        etudiantPrenom: 'Marie',
        stageId: 6,
        stageTitle: 'Stage Développeur React',
        status: 'SIGNEE',
        hasEvaluation: true
    }
];

describe('MesEvaluations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <I18nProvider>
                <BrowserRouter>
                    <MesEvaluations />
                </BrowserRouter>
            </I18nProvider>
        );
    };

    it('affiche un spinner pendant le chargement', () => {
        EmployeurService.getEntentesForEvaluation.mockReturnValue(
            new Promise(() => {}) // Promise qui ne se résout jamais
        );

        renderComponent();

        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('affiche la liste des ententes après chargement', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
            expect(screen.getByText('Marie Martin')).toBeInTheDocument();
        });

        expect(screen.getByText('Stage Développeur Java')).toBeInTheDocument();
        expect(screen.getByText('Stage Développeur React')).toBeInTheDocument();
    });

    it('distingue les stagiaires évalués et non-évalués', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('En attente')).toBeInTheDocument();
            expect(screen.getByText('Évalué')).toBeInTheDocument();
        });
    });

    it('affiche un bouton "Évaluer" pour les non-évalués', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            const evaluateButtons = screen.getAllByText('Évaluer');
            expect(evaluateButtons.length).toBeGreaterThan(0);
        });
    });

    it('affiche un bouton "Voir l\'évaluation" pour les évalués', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            const viewButtons = screen.getAllByText('Voir l\'évaluation');
            expect(viewButtons.length).toBeGreaterThan(0);
        });
    });

    it('affiche un message quand il n\'y a pas d\'ententes', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Aucun stagiaire à évaluer')).toBeInTheDocument();
            expect(screen.getByText('Vous n\'avez pas de stagiaires avec des ententes signées pour le moment.')).toBeInTheDocument();
        });
    });

    it('affiche un message d\'erreur en cas d\'échec du chargement', async () => {
        EmployeurService.getEntentesForEvaluation.mockRejectedValue(
            new Error('Network error')
        );

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
        });
    });

    it('navigue vers le formulaire d\'évaluation au clic sur "Évaluer"', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        });

        const evaluateButton = screen.getAllByText('Évaluer')[0];
        fireEvent.click(evaluateButton);
    });

    it('appelle l\'API avec le bon employeurId', async () => {
        const spy = vi.spyOn(EmployeurService, 'getEntentesForEvaluation');
        spy.mockResolvedValue(mockEntentes);

        renderComponent();

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith(1, 'fake-token', '2025');
        });
    });

    it('affiche le titre de la page', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Mes Évaluations de Stagiaires')).toBeInTheDocument();
            expect(screen.getByText('Évaluez vos stagiaires pour leur stage complété')).toBeInTheDocument();
        });
    });

    it('utilise une grille responsive pour afficher les ententes', async () => {
        EmployeurService.getEntentesForEvaluation.mockResolvedValue(mockEntentes);

        const { container } = renderComponent();

        await waitFor(() => {
            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid).toHaveClass('md:grid-cols-2');
            expect(grid).toHaveClass('lg:grid-cols-3');
        });
    });
});