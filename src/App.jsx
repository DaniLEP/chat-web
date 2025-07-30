
import './App.css'
import { Outlet } from 'react-router-dom'
import { usePresence } from '../usePresence';

function App() {

usePresence();

  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  )
}

export default App
