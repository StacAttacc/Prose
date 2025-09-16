import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
//import InscriptionEtudiant from './components/inscriptionEtudiant'
import PageLogin from './components/PageLogin'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<InscriptionEtudiant />} /> */}
        <Route path="/" element={<PageLogin />} />
        {/* ajouter d'autres routes ici */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
