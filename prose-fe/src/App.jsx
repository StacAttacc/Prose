import PageSignUp from "./components/PageSignUp.jsx";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";
import PageLogin from "./components/PageLogin.jsx";
import TeleversementCV from "./components/cv/TeleversementCV.jsx";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<PageLogin />} />
            <Route path="/" element={<PageSignUp />} />
            <Route path="/etudiant/televerser-cv" element={<TeleversementCV />} />
        </Routes>
    );
}

export default App;