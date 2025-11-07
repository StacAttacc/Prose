import React, { createContext, useContext, useState, useMemo } from 'react';

const I18nContext = createContext(null);

const translations = {
  fr: {
    // Dashboard
    year: 'Année',
    language: 'Langue',
    welcome: 'Bienvenue',
    logout: 'Logout',
    creerStage: 'Créer un stage',
    monCV: 'Mon CV',
    mesStages: 'Mes Stages',
    gestionCVs: 'Gestion des CVs',
    voirCandidaturesNav: 'Voir les candidature(s)',
    voirStages: 'Voir Stages',
    
    // GestionnaireEtuCandidature
    statusCandidatures: 'Statut des candidatures',
    aucuneCandidature: 'Aucune Candidature',
    candidatureSoumise: 'Candidature Soumise',
    stageTrouve: 'Stage Trouvé',
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
    
    // RechercheStages
    rechercheApprobationStages: 'Recherche/Approbation de Stages',
    rechercheStages: 'Recherche de stages',
    recherche: 'Recherche',
    lieu: 'Lieu',
    localisation: 'Localisation',
    compensation: 'Compensation',
    tousLesStatuts: 'Tous les statuts',
    effacerFiltres: 'Effacer les filtres',
    stagesTrouves: '{count} stage(s) trouvé(s) sur {total} au total',
    aucunStageDisponible: 'Aucun stage disponible pour le moment.',
    aucunStageCritere: 'Aucun stage ne correspond à vos critères de recherche.',
    chargementStages: 'Chargement des stages...',
    soumise: 'Soumise',
    approuvee: 'Approuvée',
    rejetee: 'Rejetée',
    recherchePlaceholder: 'Titre, description, employeur, entreprise...',
    lieuPlaceholder: 'Montréal, Québec, Télétravail...',
    compensationPlaceholder: '20$/h, 500$/semaine...',
    
    // Login
    connexion: 'Connexion',
    adresseCourriel: 'Adresse courriel',
    motDePasse: 'Mot de passe',
    seConnecter: 'Se connecter',
    connexionEnCours: 'Connexion...',
    pasEncoreCompte: 'Pas encore de compte ?',
    sinscrire: 'S\'inscrire',
    emailPlaceholder: 'Nom@exemple.com',
    passwordPlaceholder: 'Minimum 10 caractères',
    erreurConnexionInternet: 'Connexion Internet instable. Veuillez vérifier votre connexion.',
    emailDejaUtilise: 'Cet email est déjà utilisé. Veuillez en choisir un autre',
    serviceIndisponible: 'Service indisponible. Veuillez réessayer plus tard.',
    
    // SignUp
    creerCompte: 'Créez votre compte',
    employeur: 'Employeur',
    etudiant: 'Étudiant',
    prenom: 'Prénom',
    nom: 'Nom',
    entreprise: 'Entreprise',
    discipline: 'Discipline',
    selectionner: '— Sélectionner —',
    informatique: 'Informatique',
    infirmier: 'Infirmier',
    genieCivil: 'Génie Civil',
    comptabilite: 'Comptabilité',
    marketing: 'Marketing',
    mecanique: 'Mécanique',
    autre: 'Autre',
    prenomPlaceholder: 'Veuillez écrire votre prénom',
    nomPlaceholder: 'Veuillez écrire votre nom de famille',
    entreprisePlaceholder: 'Ma Compagnie Inc.',
    emailPlaceholderSignup: 'name@example.com',
    passwordPlaceholderSignup: 'Min 10 caractères',
    motDePasseRespecte: 'Mot de passe respecté!',
    min10Caracteres: 'Min 10 characters',
    creation: 'Création...',
    souscrire: 'Souscrire',
    dejaUnCompte: 'Déjà un compte ?',
    
    // Statuts
    periode: 'Période',
    dateCreation: 'Date de création',
    
    // PageAuthentification
    proseTagline: 'La rencontre simple entre étudiants et employeurs.',
    glauconQuote: 'La justice d\'un homme se mesure moins à ses actes publics qu\'à ce qu\'il ferait s\'il était certain de n\'être jamais vu.',
    glauconAuthor: 'Glaucon',
    
    // Notifications
    nouvellesOffresStage: 'nouvelles offre(s) de stage à approuver',
    nouvellesCandidatures: 'nouvelles candidature(s) reçue(s)',
    nouveauxCVs: 'nouveau(x) CV(s) à examiner',
    changementCV: 'changement sur votre CV',
    nouvellesConvocations: 'nouvelle(s) convocation(s)',
    notifications: 'notification(s)',
    noMessage: 'No message',
    unknownTime: 'Unknown time',
    
    // GestionCV
    rechercherParNom: 'Rechercher par nom d\'étudiant...',
    cvEnAttente: 'CV en attente d\'acceptation',
    cvAcceptesRefaire: 'CV Acceptés & À Refaire',
    aucunCV: 'Aucun CV',
    accepte: 'Accepté',
    aRefaire: 'À Refaire',
    nomEtudiant: 'Nom de l\'étudiant:',
    nomFichier: 'Nom du fichier:',
    noPreviewAvailable: 'No preview available. (Check if the CV is uploaded and valid.)',
    traitement: 'Traitement...',
    approuver: 'Approuver',
    rejeter: 'Rejeter',
    raisonRejet: 'Raison de rejet (obligatoire pour rejeter le CV) :',
    expliquerRejet: 'Expliquez pourquoi ce CV est rejeté...',
    confirmer: 'Confirmer',
    fermer: 'Fermer',
    
    // StageDetailsModal
    detailsStage: 'Détails du Stage',
    candidatureEnvoyee: 'Votre candidature a été envoyée avec succès !',
    employeurNotifie: 'L\'employeur sera notifié de votre intérêt pour ce stage.',
    informationsGenerales: 'Informations générales',
    titre: 'Titre :',
    dateDebut: 'Date de début :',
    dateFin: 'Date de fin :',
    modeTravail: 'Mode de travail :',
    description: 'Description',
    exigences: 'Exigences',
    competencesRequises: 'Compétences requises',
    raisonRejetStage: 'Raison du rejet',
    raisonRejetObligatoire: 'Raison de rejet (obligatoire pour rejeter le stage) :',
    expliquerRejetStage: 'Expliquez pourquoi ce stage est rejeté...',
    genererEntente: 'Générer entente',
    generationPDF: 'Génération du PDF…',
    postuler: 'Postuler',
    veuillezFournirRaison: 'Veuillez fournir une raison de rejet',
    erreurRejet: 'Erreur lors du rejet:',
    aucunIdCandidature: 'Aucun ID de candidature valide n\'a été fourni.',
    ententeGenereeSucces: 'Entente générée avec succès.',
    erreurGenerationEntente: 'Erreur lors de la génération de l\'entente:',
    erreurInconnue: 'Erreur inconnue',
    
    // PostedStages (Employeur)
    impossibleChargerStages: 'Impossible de charger les stages.',
    
    // StageListings (Étudiant)
    stagesDisponibles: 'Stages Disponibles',
    aucunStageTrouve: 'Aucun stage trouvé',
    aucunStageCritereRecherche: 'Aucun stage ne correspond à vos critères de recherche.',
    recherchePlaceholderEtudiant: 'Titre, description, employeur, compétences...',
    
    // StageCreation (Employeur)
    creationStage: 'Création de stage',
    titreEmploi: 'Titre d\'emploi',
    descriptionEmploi: 'Description de l\'emploi',
    prerequisNecessaires: 'Prérequis nécéssaires',
    competencesDemandees: 'Compétences demandées',
    ajouter: 'Ajouter',
    retirer: 'Retirer',
    creer: 'Créer',
    titreEmploiPlaceholder: 'Conducteur de camion',
    descriptionEmploiPlaceholder: 'Conduit des camions pour transporter de la marchandise, remplir l\'essence si nécessaire et changer un pneu si nécessaire.',
    prerequisPlaceholder: 'Diplômes d\'études Secondaires, Permis de Conduite',
    competencePlaceholder: 'assiduite',
    lieuPlaceholderEmployeur: 'Montréal, Québec, Télétravail...',
    modeTravailPlaceholder: 'Télétravail, Hybride, Présentiel',
    salairePlaceholder: '20$/h, 500$/semaine...',
    
    // MonCV (Étudiant)
    votreCVCourrant: 'Votre CV courrant',
    aucunCVTrouve: 'Aucun CV trouvé.',
    commentaire: 'Commentaire: ',
    enAttenteApprobation: 'En Attente d\'Approbation',
    rejete: 'Rejeté'
  },
  en: {
    // Dashboard
    year: 'Year',
    language: 'Language',
    welcome: 'Welcome',
    logout: 'Logout',
    creerStage: 'Create a stage',
    monCV: 'My CV',
    mesStages: 'My Stages',
    gestionCVs: 'CV Management',
    voirCandidaturesNav: 'View application(s)',
    voirStages: 'View Stages',
    
    // GestionnaireEtuCandidature
    statusCandidatures: 'Application Status',
    aucuneCandidature: 'No Application',
    candidatureSoumise: 'Application Submitted',
    stageTrouve: 'Stage Found',
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
    
    // RechercheStages
    rechercheApprobationStages: 'Stage Search/Approval',
    rechercheStages: 'Stage Search',
    recherche: 'Search',
    lieu: 'Location',
    localisation: 'Location',
    compensation: 'Compensation',
    tousLesStatuts: 'All statuses',
    effacerFiltres: 'Clear filters',
    stagesTrouves: '{count} stage(s) found out of {total} total',
    aucunStageDisponible: 'No stage available at the moment.',
    aucunStageCritere: 'No stage matches your search criteria.',
    chargementStages: 'Loading stages...',
    soumise: 'Submitted',
    approuvee: 'Approved',
    rejetee: 'Rejected',
    recherchePlaceholder: 'Title, description, employer, company...',
    lieuPlaceholder: 'Montreal, Quebec, Remote...',
    compensationPlaceholder: '20$/h, 500$/week...',
    
    // Login
    connexion: 'Login',
    adresseCourriel: 'Email address',
    motDePasse: 'Password',
    seConnecter: 'Sign in',
    connexionEnCours: 'Connecting...',
    pasEncoreCompte: 'Don\'t have an account yet?',
    sinscrire: 'Sign up',
    emailPlaceholder: 'Name@example.com',
    passwordPlaceholder: 'Minimum 10 characters',
    erreurConnexionInternet: 'Unstable Internet connection. Please check your connection.',
    emailDejaUtilise: 'This email is already in use. Please choose another one',
    serviceIndisponible: 'Service unavailable. Please try again later.',
    
    // SignUp
    creerCompte: 'Create your account',
    employeur: 'Employer',
    etudiant: 'Student',
    prenom: 'First name',
    nom: 'Last name',
    entreprise: 'Company',
    discipline: 'Discipline',
    selectionner: '— Select —',
    informatique: 'Computer Science',
    infirmier: 'Nursing',
    genieCivil: 'Civil Engineering',
    comptabilite: 'Accounting',
    marketing: 'Marketing',
    mecanique: 'Mechanical',
    autre: 'Other',
    prenomPlaceholder: 'Please enter your first name',
    nomPlaceholder: 'Please enter your last name',
    entreprisePlaceholder: 'My Company Inc.',
    emailPlaceholderSignup: 'name@example.com',
    passwordPlaceholderSignup: 'Min 10 characters',
    motDePasseRespecte: 'Password meets requirements!',
    min10Caracteres: 'Min 10 characters',
    creation: 'Creating...',
    souscrire: 'Subscribe',
    dejaUnCompte: 'Already have an account?',
    
    // Statuts
    periode: 'Period',
    dateCreation: 'Creation date',
    
    // PageAuthentification
    proseTagline: 'The simple meeting between students and employers.',
    glauconQuote: 'A man\'s justice is measured less by his public acts than by what he would do if he were certain he would never be seen.',
    glauconAuthor: 'Glaucon',
    
    // Notifications
    nouvellesOffresStage: 'new internship offer(s) to approve',
    nouvellesCandidatures: 'new application(s) received',
    nouveauxCVs: 'new CV(s) to review',
    changementCV: 'change on your CV',
    nouvellesConvocations: 'new interview invitation(s)',
    notifications: 'notification(s)',
    noMessage: 'No message',
    unknownTime: 'Unknown time',
    
    // GestionCV
    rechercherParNom: 'Search by student name...',
    cvEnAttente: 'CVs Pending Approval',
    cvAcceptesRefaire: 'Approved & To Redo CVs',
    aucunCV: 'No CV',
    accepte: 'Approved',
    aRefaire: 'To Redo',
    nomEtudiant: 'Student name:',
    nomFichier: 'File name:',
    noPreviewAvailable: 'No preview available. (Check if the CV is uploaded and valid.)',
    traitement: 'Processing...',
    approuver: 'Approve',
    rejeter: 'Reject',
    raisonRejet: 'Rejection reason (required to reject the CV):',
    expliquerRejet: 'Explain why this CV is rejected...',
    confirmer: 'Confirm',
    fermer: 'Close',
    
    // StageDetailsModal
    detailsStage: 'Stage Details',
    candidatureEnvoyee: 'Your application has been sent successfully!',
    employeurNotifie: 'The employer will be notified of your interest in this internship.',
    informationsGenerales: 'General Information',
    titre: 'Title:',
    dateDebut: 'Start date:',
    dateFin: 'End date:',
    modeTravail: 'Work mode:',
    description: 'Description',
    exigences: 'Requirements',
    competencesRequises: 'Required Skills',
    raisonRejetStage: 'Rejection Reason',
    raisonRejetObligatoire: 'Rejection reason (required to reject the stage):',
    expliquerRejetStage: 'Explain why this stage is rejected...',
    genererEntente: 'Generate agreement',
    generationPDF: 'Generating PDF…',
    postuler: 'Apply',
    veuillezFournirRaison: 'Please provide a rejection reason',
    erreurRejet: 'Error during rejection:',
    aucunIdCandidature: 'No valid application ID was provided.',
    ententeGenereeSucces: 'Agreement generated successfully.',
    erreurGenerationEntente: 'Error generating agreement:',
    erreurInconnue: 'Unknown error',
    
    // PostedStages (Employeur)
    impossibleChargerStages: 'Unable to load stages.',
    publiee: 'Published',
    chargementStagesEmployeur: 'Loading stages...',
    recherchePlaceholderEmployeur: 'Title, description...',
    voirCandidaturesBtn: 'View applications',
    voirDetails: 'View details',
    aucunStageApprouve: 'No approved stage available at the moment.',
    aucunStageEmployeur: 'You have no stages.',
    
    // StageListings (Étudiant)
    stagesDisponibles: 'Available Stages',
    aucunStageTrouve: 'No stage found',
    aucunStageCritereRecherche: 'No stage matches your search criteria.',
    recherchePlaceholderEtudiant: 'Title, description, employer, skills...',
    
    // StageCreation (Employeur)
    creationStage: 'Stage Creation',
    titreEmploi: 'Job Title',
    descriptionEmploi: 'Job Description',
    prerequisNecessaires: 'Required Prerequisites',
    competencesDemandees: 'Required Skills',
    ajouter: 'Add',
    retirer: 'Remove',
    creer: 'Create',
    titreEmploiPlaceholder: 'Truck Driver',
    descriptionEmploiPlaceholder: 'Drives trucks to transport goods, refuel if necessary and change a tire if necessary.',
    prerequisPlaceholder: 'High School Diploma, Driver\'s License',
    competencePlaceholder: 'diligence',
    lieuPlaceholderEmployeur: 'Montreal, Quebec, Remote...',
    modeTravailPlaceholder: 'Remote, Hybrid, On-site',
    salairePlaceholder: '20$/h, 500$/week...',
    location: 'Location',
    typeTravail: 'Work Type',
    remuneration: 'Compensation',
    annuler: 'Cancel',
    presentiel: 'on-site',
    retour: 'Back',
    
    // MonCV (Étudiant)
    votreCVCourrant: 'Your Current CV',
    aucunCVTrouve: 'No CV found.',
    commentaire: 'Comment: ',
    enAttenteApprobation: 'Pending Approval',
    rejete: 'Rejected'
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

