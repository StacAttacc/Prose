import axios from "axios";

const CV_UPLOAD_URL = "http://localhost:8080/etudiant/televerser-cv";

export const televerserCv = async (cv, user) => {
    try{
        console.log(user);
        console.log(user.data.email);

        const dataToSend = new FormData();
        dataToSend.append('cv', cv);
        dataToSend.append("email", user.data.email);

        const { data } = await axios.post(CV_UPLOAD_URL, dataToSend);
        return data;
    } catch (e) {
        if (e.response) {
            console.error('Erreur:', e.response.data);
            throw new Error(e.response.data);
        } else if (e.request) {
            console.error('Requête erronée:', e.request);
            throw new Error('Aucune réponse du serveur. Veuillez réessayer plus tard.');
        } else {
            console.error('Erreur inconnue:', e.message);
            throw new Error(e.message || 'Une erreur inconue est survenue');
        }
    }
};

