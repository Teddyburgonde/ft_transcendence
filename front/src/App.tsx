import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import MyApp from './pages/home'



function App() {
  const [count, setCount] = useState(0)

  return (
        <BrowserRouter><Routes> <Route path="/home" element={<MyApp />}>
            
        </Route>

        </Routes></BrowserRouter>

  );
}

export default App
