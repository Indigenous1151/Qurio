
import './App.css'
import {HashRouter as Router, Routes, Route} from 'react-router-dom' 
import { Home } from './pages/Home'
import { UpdatePersonalInformation } from './pages/UpdatePersonalInformation'
import { UpdatePublicInformation } from './pages/UpdatePublicInformation'
import { ResultScreen } from './pages/ResultScreen'
import { TriviaGame } from './pages/TriviaGame'
import { ClassicGame } from './pages/ClassicGame'
import { DailyGame } from './pages/DailyGame'
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
      </Routes>
    </Router>
    
  )
}

export default App
