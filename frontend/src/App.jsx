import { Routes, Route, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Navbar from "../components/Navbar";
import Upload from "../pages/Upload";
import GetFiles from "../pages/GetFiles";
import Dashboard from "../pages/Dashboard";
import SharedFileView from "../pages/SharedFileView"; // Import the new public view
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  // Hide Navbar on Login, Signup, AND the public Share page
  // We use .startsWith() because the share URL has a random token at the end
  const hideNavbar = 
    location.pathname === "/login" || 
    location.pathname === "/signup" || 
    location.pathname.startsWith("/share/");

  return (
    <div className="min-h-screen bg-gray-100">
      
      {!hideNavbar && <Navbar />}

      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Secure Share Route (Publicly Accessible) */}
          <Route path="/share/:token" element={<SharedFileView />} />

          {/* User Routes (Protected) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/getfiles" element={<GetFiles />} />
      </Routes>
     
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;