import PageSignUp from "./components/PageSignUp.jsx";
import PageLogin from "./components/PageLogin.jsx";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<PageLogin/>}/>
            <Route path="/signup" element={<PageSignUp/>}/>
        </Routes>
    );
}

export default App;