import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PageWeb from "./PageWeb.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
        <PageWeb/>
    </div>
  )
}

export default App
