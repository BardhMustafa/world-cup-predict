import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Predict from './pages/Predict.jsx';
import Groups from './pages/Groups.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import Liga from './pages/Liga.jsx';
import JoinLeague from './pages/JoinLeague.jsx';
import MVP from './pages/MVP.jsx';

// `/` is the public marketing homepage for visitors; signed-in users are sent
// straight to their dashboard at /ballina.
function Root() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/ballina" replace /> : <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public front door + auth (no app shell) */}
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* app pages share the sidebar shell */}
          <Route element={<AppShell />}>
            <Route path="/ballina" element={<Dashboard />} />
            <Route path="/grupet" element={<Groups />} />
            <Route path="/renditja" element={<Leaderboard />} />
            <Route path="/fixtures" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/liga" element={<ProtectedRoute><Liga /></ProtectedRoute>} />
            <Route path="/bashkohu/:code" element={<JoinLeague />} />
            <Route path="/mvp" element={<ProtectedRoute><MVP /></ProtectedRoute>} />
            <Route path="/profili" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            {/* legacy English paths → Albanian */}
            <Route path="/leaderboard" element={<Navigate to="/renditja" replace />} />
            <Route path="/groups" element={<Navigate to="/grupet" replace />} />
            <Route path="/profile" element={<Navigate to="/profili" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
