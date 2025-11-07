import React, { useState, createContext } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CvProvider } from '../../context/CvContext';
import { vi } from 'vitest';

// Mock user pour les tests
const mockUser = {
  email: 'gestionnaire@test.com',
  firstName: 'Test',
  lastName: 'Gestionnaire',
  role: 'GESTIONNAIRE',
  token: 'mock-token-123'
};

// Créer un YearContext pour les tests (identique au vrai)
const YearContext = createContext(null);

// Export useYear pour que les composants puissent l'utiliser
export const useYear = () => {
  const context = React.useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

// Mock YearProvider avec selectedYear personnalisé
const MockYearProvider = ({ children, initialYear = '2025' }) => {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
};

// Mock AuthProvider pour les tests - utilise le vrai AuthProvider mais avec sessionStorage mocké

// Fonction helper pour render avec tous les providers
export function renderWithProviders(
  ui,
  {
    user = mockUser,
    selectedYear = '2025',
    ...renderOptions
  } = {}
) {
  // Mock sessionStorage
  const mockSessionStorage = {
    getItem: vi.fn(() => JSON.stringify(user)),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
  });

  function Wrapper({ children }) {
    // S'assurer que sessionStorage retourne l'utilisateur avant le rendu
    mockSessionStorage.getItem = vi.fn(() => JSON.stringify(user));
    
    return (
      <BrowserRouter>
        <AuthProvider>
          <CvProvider>
            <MockYearProvider initialYear={selectedYear}>
              {children}
            </MockYearProvider>
          </CvProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export tout depuis @testing-library/react
export * from '@testing-library/react';

