import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import GestionCV from './GestionCV';
import { renderWithProviders } from '../../test/utils/testUtils';
import { useYear } from '../../context/YearContext';
import { useAuth } from '../../context/AuthContext';
import { fetchAllCVs } from '../../services/GestionnaireService.js';

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

vi.mock('../../services/GestionnaireService.js', () => ({
    fetchAllCVs: vi.fn(),
    approveCv: vi.fn(),
    rejectCv: vi.fn()
}));

vi.mock('@react-pdf-viewer/core', () => ({
    Worker: ({ children }) => <div>{children}</div>,
    Viewer: () => <div data-testid="pdf-viewer" />
}));

describe('GestionCV - Filtrage par année', () => {
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
        vi.mocked(fetchAllCVs).mockResolvedValue([]);
    });

    it('charge les CVs pour l’année sélectionnée', async () => {
        vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });

        renderWithProviders(<GestionCV />, { selectedYear: '2025' });

        await waitFor(() => {
            expect(fetchAllCVs).toHaveBeenCalledWith('mock-token-123', '2025');
        });
    });

    it('recharge les CVs lorsque l’année change', async () => {
        vi.mocked(useYear).mockReturnValue({ selectedYear: '2025', setSelectedYear: vi.fn() });
        const { rerender } = renderWithProviders(<GestionCV />, { selectedYear: '2025' });

        await waitFor(() => {
            expect(fetchAllCVs).toHaveBeenCalledWith('mock-token-123', '2025');
        });

        vi.mocked(useYear).mockReturnValue({ selectedYear: '2026', setSelectedYear: vi.fn() });
        rerender(<GestionCV />);

        await waitFor(() => {
            expect(fetchAllCVs).toHaveBeenCalledWith('mock-token-123', '2026');
        });
    });
});

