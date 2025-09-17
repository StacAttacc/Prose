import axios from "axios";

const CV_UPLOAD_URL = "http://localhost:8080/etudiant/televerser-cv";

export const televerserCv = async (cv) => {
    try{
        const cvPDF = new FormData();
        cvPDF.append('cv', cv);
        const { data } = await axios.post(CV_UPLOAD_URL, cvPDF);
        return data;
    } catch (e) {
        throw e;
    }
};
