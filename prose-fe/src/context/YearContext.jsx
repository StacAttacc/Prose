import React, { createContext, useContext, useState } from 'react';

const YearContext = createContext(null);

export const useYear = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

export const YearProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState('2025');

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
};

