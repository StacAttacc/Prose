import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import TeleversementCV from "./components/TeleversementCV.jsx";
import StageCreation from "./components/employeur-components/StageCreation.jsx";
import PostedStages from "./components/employeur-components/PostedStages.jsx";
import HomeGestionnaire from "./components/gestionnaire-components/HomeGestionnaire.jsx";
import StageListings from "./components/etudiant-components/StageListings.jsx";

export default function AppRoutes() {
    const { user, loading } = useAuth();

    const defaultElement =
        user?.role === "ETUDIANT" ? <TeleversementCV /> :
            user?.role === "EMPLOYEUR" ? <PostedStages /> :
                user?.role === "PROFESSEUR" ? <div>Bienvenue Professeur</div> :
                    user?.role === "GESTIONNAIRE" ? <div>Bienvenue Gestionnaire</div>:
                    <div>Rôle inconnu</div>;

    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="televersement-cv" element={<TeleversementCV />} />
                    <Route path="creation-stage" element={<StageCreation />} />
                    <Route path="stage-listings" element={<StageListings />} />
                    <Route path="home-gestionnaire" element={<HomeGestionnaire />} />
                </Route>
            </Route>
        </Routes>
    );
}