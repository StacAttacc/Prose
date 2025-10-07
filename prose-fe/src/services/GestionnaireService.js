// src/services/GestionnaireService.js
import axios from "axios";

const BASE = "http://localhost:8080/gestionnaire";

export async function listStagesByStatus(status = "SOUMISE", token) {
  const res = await axios.get(`${BASE}/stages/status/${status}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.data.data;
}

/**
 * Soumission de la décision.
 */
export async function submitStageDecision(id, { approved, reason }, token) {
  const endpoint = approved ? `${BASE}/stages/${id}/approuver` : `${BASE}/stages/${id}/rejeter`;
  const body = approved ? {} : { reason };
  
  const res = await axios.put(endpoint, body, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}
