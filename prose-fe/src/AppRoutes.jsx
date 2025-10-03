import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import GestionnaireCV from "./components/GestionnaireCV.jsx";
import {useEffect, useState} from "react";
import { telechargerCv } from "./services/EtudiantService.js";
import MonCV from "./components/MonCV.jsx";

export default function AppRoutes() {
    const { user, loading } = useAuth();
    const [hasCv, setHasCv] = useState(null);

    useEffect(() => {
        if (user?.data.role === "ETUDIANT") {
            telechargerCv(user.data.email, user)
                .then(() => setHasCv(true))
                .catch(() => setHasCv(false));
        }
    }, [user]);

    const defaultPathStudent = () => {
        return hasCv === null ? <div>Loading...</div> :
            hasCv ? <div>Offres d'emplois</div> :
                <MonCV />;
    }

    const defaultElement =
        user?.data.role === "ETUDIANT" ? defaultPathStudent() :
            user?.data.role === "EMPLOYEUR" ? <div>Bienvenue Employeur</div> :
                user?.data.role === "PROFESSEUR" ? <div>Bienvenue Professeur</div> :
                    user?.data.role === "GESTIONNAIRE" ? <GestionnaireCV /> :
                        <div>Rôle inconnu</div>;


    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="etudiant/mon-cv" element={<MonCV />} />
                    <Route path="etudiant/offres-emplois" element={<div>Offres d'emplois</div>} />
                    <Route path="gestion-cv" element={<GestionnaireCV />}/>
                </Route>
            </Route>
        </Routes>
    );
}