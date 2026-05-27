import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import SvgDefs from './components/SvgDefs.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Predict from './pages/Predict.jsx';
import Groups from './pages/Groups.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';

// The Prediction Post — Kosovo's World Cup prediction league.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* shared SVG defs so crests/illustrations resolve on every page */}
        <SvgDefs />

        <Routes>
          <Route path="/" element={<Landing />} />

          {/* data-backed pages share the nameplate nav + paper container */}
          <Route element={<AppLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/fixtures" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
