
import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom' 
import { Home } from './pages/Home'
import { UpdatePersonalInformation } from './pages/UpdatePersonalInformation'
import { UpdatePublicInformation } from './pages/UpdatePublicInformation'
import { ResultScreen } from './pages/ResultScreen'
import { TriviaGame } from './pages/TriviaGame'
import { ClassicGame } from './pages/ClassicGame'
import { DailyGame } from './pages/DailyGame'
import { CreateAccount } from './pages/CreateAccount'
import { SignIn } from './pages/SignIn'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Logout } from './pages/Logout'
import { PersonalStatistics } from './pages/PersonalStatistics'
import { ViewFriendList } from './pages/ViewFriendList'

function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/UpdatePersonalInformation" element={<UpdatePersonalInformation/>} />
        <Route path="/UpdatePublicInformation" element={<UpdatePublicInformation/>} />
        <Route path="/game/setup" element={<ClassicGame />} />
        <Route path="/game/play" element={<TriviaGame />} />
        <Route path="/game/score" element={<ResultScreen />} />
        <Route path="/game/daily" element={<DailyGame />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path= "/Logout" element={<Logout/>} />
        <Route path= "/personal-statistics" element={<PersonalStatistics/>} />
        <Route path= "/view-friend-list" element={<ViewFriendList/>} />
      </Routes>
    </Router>
    
  )
}

export default App
