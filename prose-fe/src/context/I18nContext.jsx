import React, { createContext, useContext, useState, useMemo } from 'react';

const I18nContext = createContext(null);

const translations = {
  fr: {
    year: 'Année',
    language: 'Langue',
    
    statusCandidatures: 'Statut des candidatures',
    aucuneCandidature: 'Aucune Candidature',
    candidatureSoumise: 'Candidature Soumise',
    stageTrouve: 'Stage Trouvé',
    etudiant: 'Étudiant',
    email: 'Email',
    candidatures: 'Candidatures',
    statut: 'Statut',
    action: 'Action',
    voirCandidatures: 'Voir ses candidatures',
    detailsEntente: 'Détails & entente',
    aucunEtudiantCategorie: 'Aucun étudiant dans cette catégorie.',
    aucunEtudiantAnnee: 'Aucun étudiant trouvé pour l\'année {year}.',
    chargement: 'Chargement…',
    erreurChargement: 'Erreur lors du chargement des candidatures.',
    aucuneDonnee: 'Aucune donnée reçue du serveur.',
    
    rechercheStages: 'Recherche de stages',
    recherche: 'Recherche',
    localisation: 'Localisation',
    compensation: 'Compensation',
    tousLesStatuts: 'Tous les statuts',
    effacerFiltres: 'Effacer les filtres',
    stagesTrouves: '{count} stage(s) trouvé(s) sur {total} au total',
    aucunStageDisponible: 'Aucun stage disponible pour le moment.',
    aucunStageCritere: 'Aucun stage ne correspond à vos critères de recherche.'
  },
  en: {
    year: 'Year',
    language: 'Language',
    
    statusCandidatures: 'Application Status',
    aucuneCandidature: 'No Application',
    candidatureSoumise: 'Application Submitted',
    stageTrouve: 'Stage Found',
    etudiant: 'Student',
    email: 'Email',
    candidatures: 'Applications',
    statut: 'Status',
    action: 'Action',
    voirCandidatures: 'View applications',
    detailsEntente: 'Details & agreement',
    aucunEtudiantCategorie: 'No student in this category.',
    aucunEtudiantAnnee: 'No student found for year {year}.',
    chargement: 'Loading…',
    erreurChargement: 'Error loading applications.',
    aucuneDonnee: 'No data received from server.',
    
    rechercheStages: 'Stage Search',
    recherche: 'Search',
    localisation: 'Location',
    compensation: 'Compensation',
    tousLesStatuts: 'All statuses',
    effacerFiltres: 'Clear filters',
    stagesTrouves: '{count} stage(s) found out of {total} total',
    aucunStageDisponible: 'No stage available at the moment.',
    aucunStageCritere: 'No stage matches your search criteria.'
  }
};

export const I18nProvider = ({ children, defaultLocale = 'fr' }) => {
  const [locale, setLocale] = useState(defaultLocale);

  const t = useMemo(() => {
    return (key, params = {}) => {
      let translation = translations[locale]?.[key] || key;
      
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
      
      return translation;
    };
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

