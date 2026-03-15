
import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom' 
import { Home } from './pages/Home'
import { UpdatePersonalInformation } from './pages/UpdatePersonalInformation'
import { CreateAccount } from './pages/CreateAccount'
import { SignIn } from './pages/SignIn'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'

function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/UpdatePersonalInformation" element={<UpdatePersonalInformation/>} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
    
  )
}

export default App
