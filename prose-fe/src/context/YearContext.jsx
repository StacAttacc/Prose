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
  const [selectedYear, setSelectedYear] = useState((new Date()).getMonth() > 8 ? new Date().getFullYear() + 1 : new Date().getFullYear);

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
};

