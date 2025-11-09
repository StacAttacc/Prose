export function labelForKey(key) {
    if (key === "stage") return `nouvelles offre(s) de stage à approuver`;
    if (key === "postulation") return `nouvelles candidature(s) reçue(s)`;
    if (key === "employeur_response") return `réponse(s) d'étudiant(s) à vos offres`;
    if (key === "gestionnaire_cv") return `nouveau(x) CV(s) à examiner`;
    if (key === "etudiant_cv") return `changement sur votre CV`;
    if (key === "convocation") return `nouvelle(s) convocation(s)`;
    return `${key} notification(s)`;
}

export function shortText(text, max = 80) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 3) + "..." : text;
}