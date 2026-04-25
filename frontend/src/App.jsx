import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './common/pages/Login'
import Signup from './common/pages/Signup'
import LandingPage from './common/pages/LandingPage'
import ProfilePage from './common/pages/ProfilePage'
import DiscoveryPage from './user/pages/DiscoveryPage'
import BookingDetailPage from './user/pages/BookingDetail'
import BookingList from './user/pages/BookingList'
import ProviderDetail from './user/pages/ProviderDetail'
import BookingNew from './user/pages/BookingNew'
import ProviderDashboard from './provider/pages/ProviderDashboard'
import ProviderJobs from './provider/pages/ProviderJobs'
import ProviderJobDetail from './provider/pages/ProviderJobDetail'
import ProviderRequests from './provider/pages/ProviderRequests'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── COMMON ──────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* <Route path="/wallet" element={<Wallet />} /> */}
        {/* <Route path="/chat" element={<Chat />} /> */}
        {/* <Route path="/chat/:roomId" element={<ChatRoom />} /> */}
        {/* <Route path="/notifications" element={<Notifications />} /> */}

        {/* ─── USER / CUSTOMER ────────────────────────────────── */}
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/provider/:providerId" element={<ProviderDetail />} />
        <Route path="/booking/new" element={<BookingNew />} />
        <Route path="/bookings" element={<BookingList />} />
        <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
        {/* <Route path="/bookings/:bookingId/review" element={<PostReview />} /> */}
        {/* <Route path="/payments" element={<Payments />} /> */}

        {/* ─── PROVIDER ───────────────────────────────────────── */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/requests" element={<ProviderRequests />} />
        <Route path="/provider/requests/:requestId" element={<ProviderJobDetail />} />
        <Route path="/provider/jobs" element={<ProviderJobs />} />
        <Route path="/provider/jobs/:jobId" element={<ProviderJobDetail />} />
        {/* <Route path="/provider/profile/edit" element={<ProviderProfileEdit />} /> */}
        {/* <Route path="/provider/earnings" element={<ProviderEarnings />} /> */}
        {/* <Route path="/provider/reviews" element={<ProviderReviews />} /> */}
        {/* <Route path="/provider/availability" element={<ProviderAvailability />} /> */}
      </Routes>
    </BrowserRouter>
  )
}