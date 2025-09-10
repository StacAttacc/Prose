import { useState } from 'react'
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
