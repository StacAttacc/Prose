const REST_API_BASE_URL = "http://localhost:8080/employeur";

// REQUETE CLIENT POST REST
export const createEmployee = (employeur) => axios.post(REST_API_BASE_URL, employeur);