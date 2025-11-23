import {Route, Routes, Navigate} from "react-router-dom";
import {useAuth} from "./context/AuthContext.jsx";
import {useCv} from "./context/CvContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import StageCreation from "./components/employeur-components/StageCreation.jsx";
import PostedStages from "./components/employeur-components/PostedStages.jsx";
import MesCandidaturesEmployeur from "./components/employeur-components/MesCandidaturesEmployeur.jsx";
import MesEvaluations from "./components/employeur-components/MesEvaluations.jsx";
import EvaluationForm from "./components/employeur-components/EvaluationForm.jsx";
import EvaluationView from "./components/employeur-components/EvaluationView.jsx";
import StageListings from "./components/etudiant-components/StageListings.jsx";
import Stages from "./components/etudiant-components/Stages.jsx";
import MesCandidature from "./components/etudiant-components/MesCandidature.jsx";
import GestionCV from "./components/gestionnaire-components/GestionCV.jsx";
import MonCV from "./components/etudiant-components/MonCV.jsx";
import GestRechercheStages from "./components/gestionnaire-components/RechercheStages.jsx";
import StageApplicants from "./components/employeur-components/StageApplicants.jsx";

import GestionnaireEtuCandidature from "./components/gestionnaire-components/GestionnaireEtuCandidature.jsx";
import GenererEntente from "./components/gestionnaire-components/GenererEntente.jsx";
import AssociationProfesseurEtudiant from "./components/gestionnaire-components/AssociationProfesseurEtudiant.jsx";
import CreationProfesseur from "./components/gestionnaire-components/CreationProfesseur.jsx";

export default function AppRoutes() {
    const {user, loading} = useAuth();
    const {hasCV, loading: cvLoading} = useCv();

    const defaultPathStudent = () => {
        return (hasCV === null || cvLoading) ? (
            <div>Loading...</div>
        ) : hasCV ? (
            <Navigate to="/etudiant/stages/disponibles" replace/>
        ) : (
            <Navigate to="/etudiant/mon-cv" replace/>
        );
    };

    const defaultElement =
        user?.role === "ETUDIANT"
            ? defaultPathStudent()
            : user?.role === "EMPLOYEUR"
                ? <Navigate to="/employeur/stages/posted-stages" replace/>
                : user?.role === "PROFESSEUR"
                    ? <div>Bienvenue Professeur</div>
                    : user?.role === "GESTIONNAIRE"
                        ? <GestionnaireEtuCandidature/>
                        : <div>Rôle inconnu</div>;
    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification/>}/>
            <Route element={<ProtectedRoute/>}>
                <Route path="/" element={<Dashboard/>}>
                    <Route index element={loading ? <div>Loading...</div> : defaultElement}/>

                    <Route path="employeur/creation-stage" element={<StageCreation/>}/>
                    <Route path="employeur/stages" element={<Navigate to="/employeur/stages/posted-stages" replace/>}/>
                    <Route path="employeur/stages/posted-stages" element={<PostedStages/>}/>
                    <Route path="employeur/stages/mes-candidatures" element={<MesCandidaturesEmployeur/>}/>
                    <Route path="employeur/evaluations" element={<MesEvaluations/>}/>
                    <Route path="employeur/evaluations/evaluer/:ententeId" element={<EvaluationForm/>}/>
                    <Route path="employeur/evaluations/voir/:ententeId" element={<EvaluationView/>}/>
                    <Route path="employeur/posted-stages" element={<Navigate to="/employeur/stages/posted-stages" replace/>}/>
                    <Route path="employeur/stages/:id/candidatures" element={<StageApplicants/>}/>
                    <Route path="employeur/modifier-stage/:id" element={<StageCreation mode="edit"/>}/>

                    <Route path="etudiant/mon-cv" element={<MonCV/>}/>
                    <Route path="etudiant/stages" element={
                        user?.role === "ETUDIANT" && hasCV === false ? (
                            <Navigate to="/etudiant/mon-cv" replace/>
                        ) : (
                            <Stages/>
                        )
                    }>
                        <Route index element={<StageListings/>}/>
                        <Route path="disponibles" element={<StageListings/>}/>
                        <Route path="candidatures" element={<MesCandidature/>}/>
                    </Route>

                    <Route path="gestionnaire/gestion-cv" element={<GestionCV/>}/>
                    <Route path="gestionnaire/list-stages" element={<GestRechercheStages/>}/>
                    <Route path="gestionnaire/candidatures" element={<GestionnaireEtuCandidature/>}/>
                    <Route path="gestionnaire/entente" element={<GenererEntente/>}/>
                    <Route path="gestionnaire/association-professeur-etudiant" element={<AssociationProfesseurEtudiant/>}/>
                    <Route path="gestionnaire/creer-professeur" element={<CreationProfesseur/>}/>
                </Route>
            </Route>
        </Routes>
    );
}
