import {useI18n} from "../../../context/I18nContext.jsx";

let i18nInstance = null;

export function setI18nInstance(instance) {
    i18nInstance = instance;
}

export function labelForKey(key) {
    switch (key) {
        case "stage": return useI18n().t('nouvellesOffresStage');
        case "postulation": return useI18n().t('nouvellesCandidatures');
        case "etudiant_offre_decision": return useI18n().t('reponsesEtudiantsOffres');
        case "gestionnaire_cv": return useI18n().t('nouveauxCVs');
        case "etudiant_cv": return useI18n().t('changementCV');
        case "convocation": return useI18n().t('nouvellesConvocations');
        case "candidature_decision": return useI18n().t('candidaturesUpdates');
        default: return `${key} notification(s)`;
    }
}

export function shortText(notification, i18, max = 80) {
    if (!notification.messageFR && !notification.messageEN) return "";
    if (useI18n()) {
        if (useI18n().locale === 'en') {
            return notification.messageEN.length > max ? notification.messageEN.slice(0, max - 3) + "..." : notification.messageEN;
        } else {
            return notification.messageFR.length > max ? notification.messageFR.slice(0, max - 3) + "..." : notification.messageFR;
        }
    }
    return notification.messageFR.length > max ? notification.messageFR.slice(0, max - 3) + "..." : notification.messageFR;
}
