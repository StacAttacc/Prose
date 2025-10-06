import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import StageCreation from "./components/employeur-components/StageCreation.jsx";
import PostedStages from "./components/employeur-components/PostedStages.jsx";
import {useEffect, useState} from "react";
import GestionCV from "./components/gestionnaire-components/GestionCV.jsx";
import {telechargerCv} from "./services/EtudiantService.js";
import MonCV from "./components/etudiant-components/MonCV.jsx";

export default function AppRoutes() {
    const { user, loading } = useAuth();
    const [hasCv, setHasCv] = useState(null);

    useEffect(() => {
        if (user?.role === "ETUDIANT") {
            telechargerCv(user.email, user)
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
        user?.role === "ETUDIANT" ? defaultPathStudent() :
            user?.role === "EMPLOYEUR" ? <PostedStages /> :
                user?.role === "PROFESSEUR" ? <div>Bienvenue Professeur</div> :
                    user?.role === "GESTIONNAIRE" ? <GestionCV /> :
                        <div>Rôle inconnu</div>;

    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="etudiant/mon-cv" element={<MonCV />} />
                    <Route path="etudiant/offres-emplois" element={<div>Offres d'emplois</div>} />
                    <Route path="gestion-cv" element={<GestionCV />}/>
                    <Route path="creation-stage" element={<StageCreation />} />
                </Route>
            </Route>
        </Routes>
    );
}