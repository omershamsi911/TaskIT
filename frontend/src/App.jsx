import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Landing           from "./pages/Landing";
import FindServices      from "./pages/FindServices";
import BookService       from "./pages/BookService";
import MyBookings        from "./pages/MyBookings";
import Profile           from "./pages/Profile";
import ProviderDashboard from "./pages/Providerdashboard";
import ManageServices    from "./pages/ManageServices";
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/Notfound";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Howitworks from "./pages/Howitworks";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Pricing from "./pages/Pricing"
import { Provider } from "react-redux";
import {store} from "./store/store"
import ChatPage from "./pages/ChatPage";


// ── Auth guard helpers ────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};
const isLoggedIn  = () => !!localStorage.getItem("access_token");
const isProvider  = () => { const u = getUser(); return u?.role === "provider" || u?.role === "both"; };

// Redirect to /login if not authenticated
const RequireAuth = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login" replace />;

// Redirect to / if not a provider
const RequireProvider = ({ children }) =>
  isProvider() ? children : <Navigate to="/" replace />;

// ── App ───────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
  <Provider store={store}>
    <Routes>
      {/* Public */}
      <Route path="/"        element={<Landing />} />
      <Route path="/services" element={<FindServices />} />
      <Route path="/about" element={<About />}/>
      <Route path="/privacy" element={<Privacy />}/>
      <Route path="/terms" element={<Terms />}/>
      <Route path="/contact" element={<Contact />}/>
      <Route path="/how-it-works" element={<Howitworks />}/>
      <Route path="/help" element={<Help />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/chat"        element={<ChatPage />} />
      <Route path="/chat/:roomId" element={<ChatPage />} /> 

      {/* Auth routes — replace these with your actual Login/Register components */}
       <Route path="/login"    element={<Login />} /> 
       <Route path="/register" element={<Register />} /> 

      {/* Customer + Provider (login required) */}
      <Route path="/book-service" element={<RequireAuth><BookService /></RequireAuth>} />
      <Route path="/my-bookings"  element={<RequireAuth><MyBookings /></RequireAuth>} />
      <Route path="/profile"      element={<RequireAuth><Profile /></RequireAuth>} />

      {/* Provider only */}
      <Route path="/provider-dashboard" element={<RequireAuth><RequireProvider><ProviderDashboard /></RequireProvider></RequireAuth>} />
      <Route path="/manage-services"    element={<RequireAuth><RequireProvider><ManageServices /></RequireProvider></RequireAuth>} />


      {/* Catch-all */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Provider>
  </BrowserRouter>
);

export default App;