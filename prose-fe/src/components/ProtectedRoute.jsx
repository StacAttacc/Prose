import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PageSignUp from "./PageSignUp.jsx";
import TeleversementCV from "./cv/TeleversementCV.jsx";
import PageLogin from "./PageLogin.jsx";

function AppRoutes() {
    const { isAuthed } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<PageLogin />} />
            <Route element={<ProtectedRoute isAuthed={isAuthed} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/etudiant/televerser-cv" element={<TeleversementCV />} />
            </Route>
        </Routes>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);