
import './App.css'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom' 
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
import { AddFriend } from './pages/AddFriend'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicOnlyRoute } from './components/PublicOnlyRoute'
import { Groups } from "./pages/Groups";
import { GroupDetails } from "./pages/GroupDetails";
import { AdminPayment } from './pages/PaymentConfig'
import { GetCurrency } from './pages/GetCurrency'
import { GetCurrencyPayment } from './pages/GetCurrencyPayment'
import { ViewNotification } from './pages/ViewNotification'
import { AdminPaymentLogs } from './pages/AdminPaymentLogs'
function App() {
 

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public-only routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home/>} />
          <Route path="/UpdatePersonalInformation" element={<UpdatePersonalInformation/>} />
          <Route path="/UpdatePublicInformation" element={<UpdatePublicInformation/>} />
          <Route path="/game/setup" element={<ClassicGame />} />
          <Route path="/game/play" element={<TriviaGame />} />
          <Route path="/game/score" element={<ResultScreen />} />
          <Route path="/game/daily" element={<DailyGame />} />
          <Route path= "/Logout" element={<Logout/>} />
          <Route path= "/personal-statistics" element={<PersonalStatistics/>} />
          <Route path= "/view-friend-list" element={<ViewFriendList/>} />
          <Route path= "/add-friend" element={<AddFriend/>} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetails />} />
          <Route path="/admin/payment" element={<AdminPayment />} />
          <Route path="/admin/payment-logs" element={<AdminPaymentLogs />} />
          <Route path="/get-currency" element={<GetCurrency />} />
          <Route path = "/get-currency-payment" element={<GetCurrencyPayment />} />
          <Route path="/view-notifications" element={<ViewNotification />} />
        </Route>

        <Route path="*" element={<Navigate to="/sign-in" replace />} />

      </Routes>
    </Router>
    
  )
}

export default App
