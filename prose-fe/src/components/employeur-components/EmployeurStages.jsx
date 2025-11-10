import { Outlet } from "react-router-dom";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function EmployeurStages() {
    return (
        <div>
            <Outlet />

            <ScrollToTop />
        </div>
    );
}

