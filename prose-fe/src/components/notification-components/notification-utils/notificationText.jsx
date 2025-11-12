import {useI18n} from "../../../context/I18nContext.jsx";

let i18nInstance = null;

export function setI18nInstance(instance) {
    i18nInstance = instance;
}

export function labelForKey(key) {
    switch (key) {
        case "stage": return useI18n().t('nouvellesOffresStage');
        case"postulation": return useI18n().t('nouvellesCandidatures');
        case "employeur_response": return useI18n().t('reponsesEtudiantsOffres');
        case "gestionnaire_cv": return useI18n().t('nouveauxCVs');
        case "etudiant_cv": return useI18n().t('changementCV');
        case "convocation": return useI18n().t('nouvellesConvocations');
        case "candidature_decision": return useI18n().t('nouvellesCandidaturesMisesAJour');
        default: return `${key} notification(s)`;
    }
}

export function shortText(notification, i18, max = 80) {
    if (!notification.messageFR && !notification.messageEN) return "";
    if (i18) {
        if (i18.locale == 'en') {
            return notification.messageEN.length > max ? notification.messageEN.slice(0, max - 3) + "..." : notification.messageEN;
        } else {
            return notification.messageFR.length > max ? notification.messageFR.slice(0, max - 3) + "..." : notification.messageFR;
        }
    }
    return notification.messageFR.length > max ? notification.messageFR.slice(0, max - 3) + "..." : notification.messageFR;
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