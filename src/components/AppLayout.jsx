import { Outlet } from 'react-router-dom';
import AppNav from './AppNav.jsx';

// Shared chrome for the data-backed pages: the slim nameplate nav inside
// the same paper container the front page uses.
export default function AppLayout() {
  return (
    <div className="paper">
      <AppNav />
      <Outlet />
    </div>
  );
}
