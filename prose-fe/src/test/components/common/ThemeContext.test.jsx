import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../../context/ThemeContext';
import React from 'react';

// Mock localStorage
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
    
    // Configurer getItem pour retourner les valeurs du store
    mock.getItem.mockImplementation((key) => store[key] || null);
    
    return mock;
}

describe('ThemeContext', () => {
    let localStorageMock;
    
    beforeEach(() => {
        // Créer un nouveau mock pour chaque test
        localStorageMock = createLocalStorageMock();
        
        // Retirer la classe dark de l'élément html
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

    it('devrait initialiser avec le thème "light" par défaut', () => {
        // S'assurer que localStorage retourne null ou 'light'
        localStorageMock.getItem.mockReturnValue(null);
        
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('devrait initialiser avec le thème "dark" depuis localStorage', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('devrait basculer du thème light vers dark', () => {
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('devrait basculer du thème dark vers light', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('devrait sauvegarder le thème dans localStorage lors du changement', () => {
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('devrait appliquer la classe "dark" sur document.documentElement quand le thème est dark', () => {
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('devrait retirer la classe "dark" de document.documentElement quand le thème est light', () => {
        // Configurer localStorage AVANT de rendre le composant
        localStorageMock.getItem.mockReturnValue('dark');
        localStorageMock.setItem('theme', 'dark');
        
        const wrapper = ({ children }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );
        
        const { result } = renderHook(() => useTheme(), { wrapper });
        
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        
        act(() => {
            result.current.toggleTheme();
        });
        
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('devrait lancer une erreur si useTheme est utilisé en dehors de ThemeProvider', () => {
        // Supprimer console.error pour éviter le bruit dans les tests
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => {
            renderHook(() => useTheme());
        }).toThrow('useTheme must be used within ThemeProvider');
        
        consoleSpy.mockRestore();
    });
});

