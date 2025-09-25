import PageAuthentification from "./pages/PageAuthentification";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<PageAuthentification/>}/>
        </Routes>
    );
}

export default App;