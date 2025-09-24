//import InscriptionEtudiant from './components/inscriptionEtudiant'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import PageLogin from './components/PageLogin'
import "./styles/tailwind.css"
import TeleversementCV from "./components/cv/TeleversementCV.jsx";
import PageSignUp from "./components/PageSignUp.jsx";
import PageLogin from "./components/PageLogin.jsx";
import "./style/index.css";
import {Route, Routes} from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLogin/>}/>
        <Route path="/signup" element={<PageSignUp/>}/>
        <Route path="/etudiant" element={<TeleversementCV />} />
      </Routes>
    </BrowserRouter>
  )
    return (
        <Routes>
            <Route path="/" element={<PageLogin/>}/>
            <Route path="/signup" element={<PageSignUp/>}/>
        </Routes>
    );
}

export default App
