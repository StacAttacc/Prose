import {useI18n} from "../../../context/I18nContext.jsx";

export function labelForKey(key) {
    switch (key) {
        case "stage": return useI18n().t('nouvellesOffresStage');
        case "postulation": return useI18n().t('nouvellesCandidatures');
        case "etudiant_offre_decision": return useI18n().t('reponsesEtudiantsOffres');
        case "gestionnaire_cv": return useI18n().t('nouveauxCVs');
        case "etudiant_cv": return useI18n().t('changementCV');
        case "convocation": return useI18n().t('nouvellesConvocations');
        case "candidature_decision": return useI18n().t('candidaturesUpdates');
        case "signature_entente": return useI18n().t('signatureEntenteNotification');
        default: return `${key} notification(s)`;
    }
}

export function shortText(notification, max = Infinity) {
    if (!notification.messageFR && !notification.messageEN) return "";
    const message = useI18n().locale === 'en' 
        ? (notification.messageEN || "") 
        : (notification.messageFR || "");
    
    // Si max est Infinity ou si le message est plus court que max, retourner le message complet
    if (max === Infinity || message.length <= max) {
        return message;
    }
    
    // Sinon, tronquer le message
    return message.slice(0, max - 3) + "...";
}
