import PageAuthentification from "./pages/PageAuthentification";
import Dashboard from "./Dashboard.jsx"
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<PageAuthentification />}/>
            <Route path"/dashboard" element={<Dashboard />}/>
        </Routes>
    );
}

export default App;