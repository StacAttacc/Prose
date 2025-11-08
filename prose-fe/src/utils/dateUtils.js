export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  let date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return null;
  }
  
  if (isNaN(date.getTime())) return null;
  return date;
};

export const getSessionFromDate = (startDate) => {
  const date = parseDate(startDate);
  if (!date) return null;
  
  const month = date.getMonth() + 1; 
  
  if (month >= 1 && month <= 4) {
    return 'HIVER';
  }
  else if (month >= 5 && month <= 8) {
    return 'ETE';
  }
  else if (month >= 9 && month <= 12) {
    return 'AUTOMNE';
  }
  
  return null;
};

// Vérifie si une date correspond à une session antérieure (date passée)
export const isSessionAnterieure = (stageDate) => {
  const date = parseDate(stageDate);
  if (!date) return false;
  
  const now = new Date();
  return date < now;
};

