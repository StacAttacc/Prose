import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import StageCreation from "./components/employeur-components/StageCreation.jsx";
import PostedStages from "./components/employeur-components/PostedStages.jsx";
import StageApproving from "./components/gestionnaire-components/StageApproving.jsx";
import StageListings from "./components/etudiant-components/StageListings.jsx";
import {useEffect, useState} from "react";
import GestionCV from "./components/gestionnaire-components/GestionCV.jsx";
import MonCV from "./components/etudiant-components/MonCV.jsx";
import GestRechercheStages from "./components/gestionnaire-components/RechercheStages.jsx";
import StageApplicants from "./components/employeur-components/StageApplicants.jsx";



export default function AppRoutes() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [defaultElement, setDefaultElement] = useState(<div />);


    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }


        if (user.role === 'EMPLOYEUR') setDefaultElement(<PostedStages />);
        else if (user.role === 'ETUDIANT') setDefaultElement(<StageListings />);
        else setDefaultElement(<GestRechercheStages />);
        setLoading(false);
    }, [authLoading, user]);


    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="employeur/creation-stage" element={<StageCreation />} />
                    <Route path="employeur/posted-stages" element={<PostedStages />} />
                    <Route path="employeur/stages/:id/candidatures" element={<StageApplicants />} />
                    <Route path="etudiant/mon-cv" element={<MonCV />} />
                    <Route path="etudiant/stage-listings" element={<StageListings />} />
                    <Route path="gestionnaire/gestion-cv" element={<GestionCV />} />
                    <Route path="gestionnaire/list-stages" element={<GestRechercheStages />} />
                    <Route path="gestionnaire/stage-approval" element={<StageApproving />} />
                    <Route path="employeur/modifier-stage/:id" element={<StageCreation mode="edit" />} />
                </Route>
            </Route>
        </Routes>
    );
}