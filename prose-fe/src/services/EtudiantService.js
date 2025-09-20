import axios from "axios";
import {login} from "./AuthService.js";

const CV_UPLOAD_URL = "http://localhost:8080/etudiant/televerser-cv";

export const televerserCv = async (cv) => {
    try{
        //const user = JSON.parse(localStorage.getItem("user"));
        const dataToSend = new FormData();
        dataToSend.append('cv', cv);
        dataToSend.append("studentId", "999");
        console.log("here");
        const { data } = await axios.post(CV_UPLOAD_URL, dataToSend);
        return data;
    } catch (e) {
        if (error.response) {
            console.error('Error:', error.response.data); // This should show your custom message
        }
    }
};
