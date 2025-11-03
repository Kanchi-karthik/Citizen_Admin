import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'Users', path: '/users', icon: 'Users' },
    { name: 'Complaints', path: '/complaints', icon: 'ClipboardList' },
    { name: 'Feedback', path: '/feedbacks', icon: 'MessageSquareText' },
    { name: 'Contacts', path: '/contacts', icon: 'Mail' },
  ];

  const MenuIcon = LucideIcons.Menu;
  const XIcon = LucideIcons.X;

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white z-40 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        } ${!isOpen && 'hidden md:block'}`}
      >
        <div className={`flex items-center justify-center p-3 bg-gradient-to-r from-slate-900 to-slate-950 shadow-lg min-h-[60px] ${
          isOpen ? 'justify-between' : 'justify-center'
        }`}>
          <div className={`${!isOpen && 'md:hidden'} flex items-center gap-2 w-full`}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">Citizen</span>
          </div>
          <button
            onClick={toggleSidebar}
            className={`text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-2 transition-colors flex-shrink-0 ${
              isOpen ? 'absolute right-4' : 'bg-slate-700 hover:bg-slate-600 shadow-md h-10 w-10 flex items-center justify-center'
            }`}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        <nav className="mt-5">
          <ul>
            {navItems.map((item) => {
              const IconComponent = LucideIcons[item.icon];
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center py-3 px-4 text-sm transition-all duration-200 rounded-lg mx-2 ${
                      isActive 
                        ? 'bg-blue-600 font-semibold shadow-md text-white' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={window.innerWidth < 768 ? toggleSidebar : undefined} // Close sidebar on mobile after click
                  >
                    {IconComponent && <IconComponent className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mr-0 md:mr-0 md:h-6 md:w-6'}`} />}
                    <span className={`${!isOpen && 'md:hidden'} whitespace-nowrap`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
