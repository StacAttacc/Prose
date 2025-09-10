import { useState } from 'react'
import "./styles/tailwind.css"
import TeleversementCV from "./components/cv/TeleversementCV.jsx";
import { BrowserRouter, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
        <TeleversementCV />
    </BrowserRouter>
  )
}

export default App
