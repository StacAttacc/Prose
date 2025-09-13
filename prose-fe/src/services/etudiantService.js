import axios from "axios";

export const televerserCv = async (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    const { data } = await axios.post('/etudiant/televerser-cv', formData);
    return data;
};
