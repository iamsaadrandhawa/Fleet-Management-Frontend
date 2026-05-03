import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 w-full pt-10 overflow-x-hidden">
          <div className="p-4 md:p-6 w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}