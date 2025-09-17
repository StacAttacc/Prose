import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PageLogin from "./components/PageLogin";
import Dashboard from "./components/Dashboard";

function AppRoutes() {
    const { isAuthed } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<PageLogin />} />
            <Route element={<ProtectedRoute isAuthed={isAuthed} />}>
                <Route path="/" element={<Dashboard />} />
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
