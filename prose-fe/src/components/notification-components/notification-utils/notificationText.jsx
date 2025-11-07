let i18nInstance = null;

export function setI18nInstance(instance) {
    i18nInstance = instance;
}

export function labelForKey(key) {
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