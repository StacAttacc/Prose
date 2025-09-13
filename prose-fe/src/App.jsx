import { useState } from 'react'
import "./styles/tailwind.css"
import TeleversementCV from "./components/cv/TeleversementCV.jsx";
import { BrowserRouter, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
        <TeleversementCV />
    </BrowserRouter>
  )
}

export default App
