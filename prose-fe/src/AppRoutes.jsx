import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import TeleversementCV from "./components/TeleversementCV.jsx";
import PageHomeGestionnaire from "./pages/PageHomeGestionnaire.jsx";

export default function AppRoutes() {
    const { user, loading } = useAuth();

    const defaultElement =
        user?.data.role === "ETUDIANT" ? <TeleversementCV /> :
            user?.data.role === "EMPLOYEUR" ? <div>Bienvenue Employeur</div> :
                user?.data.role === "PROFESSEUR" ? <div>Bienvenue Professeur</div> :
                    user?.data.role === "GESTIONNAIRE" ? <PageHomeGestionnaire /> :
                        <div>Rôle inconnu</div>;

    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement} />
                    <Route path="televersement-cv" element={<TeleversementCV />} />
                </Route>
            </Route>
        </Routes>
    );
}