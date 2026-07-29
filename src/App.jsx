import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Faq from "./pages/Faq";
import ServicePlaceholder from "./pages/ServicePlaceholder";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import ProtectedRoute from "./admin/ProtectedRoute";
import EventManager from "./admin/components/EventManager";
import FaqManager from "./admin/components/FaqManager";
import LayoutManager from "./admin/components/LayoutManager";

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><Faq /></PublicLayout>} />
      <Route
        path="/services/:slug"
        element={<PublicLayout><ServicePlaceholder /></PublicLayout>}
      />

      {/* Admin */}
      <Route path="/admin-portal/login" element={<Login />} />
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="events" replace />} />
        <Route path="events" element={<EventManager />} />
        <Route path="faqs" element={<FaqManager />} />
        <Route path="layout" element={<LayoutManager />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
