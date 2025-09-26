import {Navigate} from "react-router-dom";
import {Outlet} from "react-router";

export default function ProtectedRoute({ isAuthed }) {
    return isAuthed ? <Outlet/> : <Navigate to="/login" replace/>
}
