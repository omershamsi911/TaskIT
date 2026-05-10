import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FindServices from "./pages/FindServices";
import NotFound from "./pages/Notfound";

import DashboardLayout from "./components/layouts/DashboardLayout";
import Profile from "./pages/Profile";
import ManageServices from "./pages/ManageServices";
import MyBookings from "./pages/MyBookings";
import BookService from "./pages/BookService";
import About from "./pages/About";

// Landing manages its own Ticker + Navbar + Footer.
// All other pages get the global Navbar wrapper.
const WithNav = ({ children }) => (
  <>
    <Navbar />
    <main style={{ marginTop: 64, minHeight: "calc(100vh - 64px)", width: "100%" }}>
      {children}
    </main>
  </>
);

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#F5F0E6", color: "#1A1A1A", fontFamily: "sans-serif" }}>
        <Routes>
          {/* Landing owns its own full layout (Ticker + Navbar + Footer) */}
          <Route path="/" element={<Landing />} />

          {/* Public pages */}
          <Route path="/services"  element={<WithNav><FindServices /></WithNav>} />
          <Route path="/login"     element={<WithNav><Login /></WithNav>} />
          <Route path="/register"  element={<WithNav><Register /></WithNav>} />
          <Route path="/about"     element={<WithNav><About /></WithNav>} />

          {/* Protected dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/profile"            element={<Profile />} />
            <Route path="/dashboard/services" element={<ManageServices />} />
            <Route path="/dashboard/bookings" element={<MyBookings />} />
            <Route path="/book"               element={<BookService />} />
          </Route>

          {/* 404 catch-all — must be last */}
          <Route path="*" element={<WithNav><NotFound /></WithNav>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;