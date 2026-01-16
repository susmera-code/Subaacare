import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./components/Admin";
import Professional from "./components/Professional";
import Patient from "./components/Patient";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import Home from './components/Home';
import Register from './components/Register';
import AdminProfessionalDetails from './components/AdminProfessionalDetails';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import ProfessionalStatusPopup from './components/ProfessionalStatus';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProfessionalsRegister from './components/Professional';
import ProfessionalStatus from './components/ProfessionalStatus';
import MyAppointments from './components/MyAppointments';
import PatientProfile from './components/PatientProfile';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className='pt-90'>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/professionalstatus" element={<ProfessionalStatus />} />
            <Route path="/professional" element={<ProfessionalsRegister />} />
            <Route path="/myappointments" element={<MyAppointments />} />
            <Route path="/patientprofile" element={<PatientProfile />} />
            {/* Professional dashboard */}
            <Route
              path="/professionaldashboard"
              element={
                <ProtectedRoute allowedRoles={["professional"]}>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/professionalstatus" element={<ProfessionalStatusPopup />} />
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <Patient />
                </ProtectedRoute>
              }
            />
            {/* Admin dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/professionaldashboard" element={<ProfessionalDashboard />} />
            <Route path="/admin/professional/:id" element={<AdminProfessionalDetails />} />
          </Routes>
        </Router>
      </div>
    </>
  )

}

export default App
