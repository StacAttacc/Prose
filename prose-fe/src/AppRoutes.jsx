import {useAuth} from "./context/AuthContext.jsx";
import {Route, Routes} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageAuthentification from "./pages/PageAuthentification.jsx";
import TeleversementCV from "./components/TeleversementCV.jsx";

export default function AppRoutes() {
    const {isAuthed} = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<PageAuthentification/>}/>
            <Route element={<ProtectedRoute isAuthed={isAuthed}/>}>
                <Route path="/" element={<Dashboard/>}>
                    <Route path="televersement-cv" element={<TeleversementCV />} />
                </Route>
            </Route>
        </Routes>
    )
}