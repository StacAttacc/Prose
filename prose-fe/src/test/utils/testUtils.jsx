import React, { useState, createContext } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CvProvider } from '../../context/CvContext';
import { I18nProvider } from '../../context/I18nContext';
import { vi } from 'vitest';

const mockUser = {
  email: 'gestionnaire@test.com',
  firstName: 'Test',
  lastName: 'Gestionnaire',
  role: 'GESTIONNAIRE',
  token: 'mock-token-123'
};

const YearContext = createContext(null);

export const useYear = () => {
  const context = React.useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

const MockYearProvider = ({ children, initialYear = '2025' }) => {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
};


export function renderWithProviders(
  ui,
  {
    user = mockUser,
    selectedYear = '2025',
    ...renderOptions
  } = {}
) {
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
    mockSessionStorage.getItem = vi.fn(() => JSON.stringify(user));
    
    return (
      <BrowserRouter>
        <I18nProvider>
          <AuthProvider>
            <CvProvider>
              <MockYearProvider initialYear={selectedYear}>
                {children}
              </MockYearProvider>
            </CvProvider>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';

