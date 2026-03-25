import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { ForgotPassword } from './pages/ForgotPassword'
import DashBoard from './pages/DashBoard'
import SharedContent from './pages/SharedContent'
import LandingPage from './pages/LandingPage'
import { AdminBugDashboard } from './pages/AdminBugDashboard'
import { NotFound } from './pages/NotFound'
import { ThemeProvider } from './context/ThemeProvider'
import { ThemedToaster } from './components/ThemedToaster'
import { PrivateRoute, AdminRoute } from './components/RouteGuards'


export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <ThemedToaster />
                <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={<PrivateRoute><DashBoard /></PrivateRoute>} />
                    <Route path="/admin/bugs" element={<AdminRoute><AdminBugDashboard /></AdminRoute>} />
                    <Route path="/share/:hash" element={<SharedContent />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>

        </ThemeProvider>
    )
}