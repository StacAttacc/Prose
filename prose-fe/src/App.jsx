import PageSignUp from "./components/PageSignUp.jsx";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<PageSignUp/>}/>
        </Routes>
    );
}

export default App;
