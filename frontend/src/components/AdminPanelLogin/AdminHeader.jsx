import { FaBars, FaSearch } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { Link } from "react-router-dom";
import AdminNotificationBell from './adminNotificationBell';

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 p-4 md:p-6">
        
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-all"
        >
          <FaBars className="text-2xl" />
        </button>

        {/* Search Input */}
        <div className="flex-1 max-w-2xl w-full">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notification Bell + Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <AdminNotificationBell />
          
          {/* Profile with Dropdown */}
          <div className="flex items-center space-x-1 group cursor-pointer relative">
            <div className="text-right">
              <p className="font-bold text-gray-800">Admin</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
            <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
            
            {/* Dropdown Menu */}
            <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 hidden group-hover:block border border-gray-200">
              <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-100 transition-colors">Profile</Link>
              <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-100 transition-colors">Settings</Link>
              <Link to="/logout" className="block px-4 py-2 text-red-500 hover:bg-red-100 transition-colors">Logout</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}