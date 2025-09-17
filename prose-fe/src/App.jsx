import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
//import InscriptionEtudiant from './components/inscriptionEtudiant'
import PageLogin from './components/PageLogin'
import "./styles/tailwind.css"
import TeleversementCV from "./components/cv/TeleversementCV.jsx";
import { BrowserRouter, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<InscriptionEtudiant />} /> */}
        <Route path="/" element={<PageLogin />} />
        {/* ajouter d'autres routes ici */}
        <Route path="/etudiant" element={<TeleversementCV />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
