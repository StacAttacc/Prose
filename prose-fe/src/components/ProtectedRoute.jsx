import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
    const { isAuthed, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
}