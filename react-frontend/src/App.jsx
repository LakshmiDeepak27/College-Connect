import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Main from "./pages/Main";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import EventsPage from "./pages/EventsPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./routes/ProtectedRoutes.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/profile/:id?" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
