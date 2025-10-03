import axios from "axios";

const url = "http://localhost:8080/";

export async function createStage(stage, token) {
    await axios.post(url + "employeur/createStage", stage, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`}
    });
}