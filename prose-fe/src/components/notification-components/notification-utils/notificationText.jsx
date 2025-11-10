let i18nInstance = null;

export function setI18nInstance(instance) {
    i18nInstance = instance;
}

export function labelForKey(key) {
    if (key === "stage") return `nouvelles offre(s) de stage à approuver`;
    if (key === "postulation") return `nouvelles candidature(s) reçue(s)`;
    if (key === "employeur_response") return `réponse(s) d'étudiant(s) à vos offres`;
    if (key === "gestionnaire_cv") return `nouveau(x) CV(s) à examiner`;
    if (key === "etudiant_cv") return `changement sur votre CV`;
    if (key === "convocation") return `nouvelle(s) convocation(s)`;
    if (key === "candidature_decision") return `nouvelles(s) candidatures mise(s) à jour`;
    return `${key} notification(s)`;
    if (!i18nInstance) {
        // Fallback si i18n n'est pas encore initialisé
        if (key === "stage") return `nouvelles offre(s) de stage à approuver`;
        if (key === "postulation") return `nouvelles candidature(s) reçue(s)`;
        if (key === "gestionnaire_cv") return `nouveau(x) CV(s) à examiner`;
        if (key === "etudiant_cv") return `changement sur votre CV`;
        if (key === "convocation") return `nouvelle(s) convocation(s)`;
        return `${key} notification(s)`;
    }
    
    const t = i18nInstance.t;
    if (key === "stage") return t('nouvellesOffresStage');
    if (key === "postulation") return t('nouvellesCandidatures');
    if (key === "gestionnaire_cv") return t('nouveauxCVs');
    if (key === "etudiant_cv") return t('changementCV');
    if (key === "convocation") return t('nouvellesConvocations');
    return `${key} ${t('notifications')}`;
}

export function shortText(text, max = 80) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 3) + "..." : text;
}

export function translateNotificationMessage(message) {
    if (!i18nInstance || !message) return message;
    
    const t = i18nInstance.t;
    const locale = i18nInstance.locale;
    
    // Si on est déjà en français, pas besoin de traduire
    if (locale === 'fr') return message;
    
    // Traductions des messages de notification de CV
    const translations = {
        'Votre CV a été approuvé.': t('cvApprouve'),
        'Votre CV a été rejeté.': t('cvRejete'),
        'Votre CV a été rejeté': t('cvRejete'),
    };
    
    // Chercher une correspondance exacte
    if (translations[message]) {
        return translations[message];
    }
    
    // Chercher une correspondance partielle pour les messages qui peuvent varier
    if (message.includes('Votre CV a été approuvé')) {
        return t('cvApprouve');
    }
    if (message.includes('Votre CV a été rejeté')) {
        return t('cvRejete');
    }
    
    // Traduire les messages de type "{nom} a soumis un nouveau CV"
    const aSoumisPattern = /^(.+?)\s+a soumis un nouveau CV$/;
    let match = message.match(aSoumisPattern);
    if (match) {
        const studentName = match[1];
        return `${studentName} ${t('aSoumisNouveauCV')}`;
    }
    
    // Traduire les messages de type "{nom} a postulé pour le stage {titre}"
    const aPostulePattern = /^(.+?)\s+a postulé pour le stage (.+)$/;
    match = message.match(aPostulePattern);
    if (match) {
        const studentName = match[1];
        const stageTitle = match[2];
        return `${studentName} ${t('aPostulePourLeStage')} ${stageTitle}`;
    }
    
    // Traduire les messages de type "{entreprise} a convoqué {nom} pour une entrevue"
    const aConvouquePattern = /^(.+?)\s+a convoqué (.+?)\s+pour une entrevue$/;
    match = message.match(aConvouquePattern);
    if (match) {
        const companyName = match[1];
        const studentName = match[2];
        return `${companyName} ${t('aConvouquePourEntrevue')} ${studentName} ${t('pourUneEntrevue')}`;
    }
    
    // Traduire les messages de type "{nom} a créé le stage {titre}"
    const aCreeLeStagePattern = /^(.+?)\s+a créé le stage (.+)$/;
    match = message.match(aCreeLeStagePattern);
    if (match) {
        const employerName = match[1];
        const stageTitle = match[2];
        return `${employerName} ${t('aCreeLeStage')} ${stageTitle}`;
    }
    
    return message;
}