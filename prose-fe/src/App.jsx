import PageLogin from "./components/PageLogin.jsx";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<PageLogin/>}/>
        </Routes>
    );
}

export default App;
