import axios from 'axios';

const BASE_URL = 'http://localhost:8080/gestionnaire';

export const fetchAllPendingCvs = async () => {
    axios.get(BASE_URL + '/cv/pending')
        .then(response => {
            response.data;
            console.log(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the pending CVs!', error);
        })
}
