import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { ThemeProvider } from '../../../context/ThemeContext';
import { I18nProvider } from '../../../context/I18nContext';
import React from 'react';

function createLocalStorageMock(initialStore = {}) {
    let store = { ...initialStore };
    const mock = {
        getItem: vi.fn((key) => {
            return store[key] || null;
        }),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
            mock.getItem.mockImplementation((k) => store[k] || null);
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
            mock.getItem.mockImplementation((k) => store[k] || null);
        }),
        clear: vi.fn(() => {
            store = {};
            mock.getItem.mockImplementation(() => null);
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),
    };
    
    mock.getItem.mockImplementation((key) => store[key] || null);
    
    return mock;
}

describe('ThemeToggle', () => {
    let localStorageMock;
    
    beforeEach(() => {
        // Créer un nouveau mock pour chaque test
        localStorageMock = createLocalStorageMock();
        document.documentElement.classList.remove('dark');
        
        // Remplacer localStorage par le mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
            configurable: true,
        });
    });
    
    afterEach(() => {
        vi.clearAllMocks();
        document.documentElement.classList.remove('dark');
        
        // Restaurer localStorage original si possible
        try {
            delete window.localStorage;
        } catch (e) {
            // Ignorer les erreurs de suppression
        }
    });

    const renderWithProviders = (ui) => {
        return render(
            <I18nProvider>
                <ThemeProvider>
                    {ui}
                </ThemeProvider>
            </I18nProvider>
        );
    };

    it('devrait afficher le bouton de toggle du thème', () => {
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('devrait afficher "Mode sombre" quand le thème est light', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        expect(screen.getByText(/darkMode|Mode sombre/i)).toBeInTheDocument();
    });

    it('devrait afficher "Mode clair" quand le thème est dark', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        renderWithProviders(<ThemeToggle />);
        
        expect(screen.getByText(/lightMode|Mode clair/i)).toBeInTheDocument();
    });

    it('devrait basculer du thème light vers dark lors du clic', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        
        fireEvent.click(button);
        
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('devrait basculer du thème dark vers light lors du clic', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        
        fireEvent.click(button);
        
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('devrait avoir un aria-label approprié en mode light', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(/dark|sombre/i);
    });

    it('devrait avoir un aria-label approprié en mode dark', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(/light|clair/i);
    });

    it('devrait afficher l\'icône de lune en mode light', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        // L'icône de lune (dark mode) devrait être visible
        const button = screen.getByRole('button');
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('devrait afficher l\'icône de soleil en mode dark', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        renderWithProviders(<ThemeToggle />);
        
        // L'icône de soleil (light mode) devrait être visible
        const button = screen.getByRole('button');
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('devrait avoir les bonnes classes CSS pour le bouton', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('devrait permettre plusieurs bascules de thème', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        renderWithProviders(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        const initialCallCount = localStorageMock.setItem.mock.calls.length;
        
        // Première bascule: light -> dark
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        
        // Deuxième bascule: dark -> light
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        
        // Troisième bascule: light -> dark
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        
        // Vérifier que setItem a été appelé 3 fois de plus (pour les 3 bascules)
        expect(localStorageMock.setItem.mock.calls.length).toBe(initialCallCount + 3);
        // Vérifier les dernières valeurs appelées
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
});

