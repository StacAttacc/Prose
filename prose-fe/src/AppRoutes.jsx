import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import TeleversementCV from "./components/TeleversementCV.jsx";
import PendingCVs from "./components/PendingCVs.jsx";
import {useEffect, useState} from "react";
import { telechargerCv } from "./services/EtudiantService.js";
import StudentStatus from "./components/StudentStatus.jsx";

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
                <StudentStatus />;
    }

    const defaultElement =
        user?.data.role === "ETUDIANT" ? defaultPathStudent() :
            user?.data.role === "EMPLOYEUR" ? <div>Bienvenue Employeur</div> :
                user?.data.role === "PROFESSEUR" ? <div>Bienvenue Professeur</div> :
                    user?.data.role === "GESTIONNAIRE" ? <PendingCVs /> :
                        <div>Rôle inconnu</div>;


    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="etudiant/mes-statuts" element={<StudentStatus />} />
                    <Route path="etudiant/offres-emplois" element={<div>Offres d'emplois</div>} />
                    <Route path="attente-acceptation-cv" element={<PendingCVs />}/>
                </Route>
            </Route>
        </Routes>
    );
}