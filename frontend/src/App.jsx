import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/common/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UserManagementPage from './pages/Users/UserManagementPage.jsx';
import ComplaintManagementPage from './pages/Complaints/ComplaintManagementPage.jsx';
import FeedbackManagementPage from './pages/Feedbacks/FeedbackManagementPage.jsx';
import ContactManagementPage from './pages/Contacts/ContactManagementPage.jsx';
import UserForm from './pages/Users/UserForm.jsx';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden flex-row">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isSidebarOpen ? 'ml-64' : 'ml-0 md:ml-16'}`}>
          <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg p-3 md:p-5 flex items-center justify-between border-b-4 border-blue-600 min-h-[60px] md:min-h-[70px] flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-colors flex-shrink-0 bg-slate-700 hover:bg-slate-600"
                aria-label="Toggle Sidebar"
              >
                {isSidebarOpen ? (
                  <i data-lucide="x" className="h-6 w-6"></i>
                ) : (
                  <i data-lucide="menu" className="h-6 w-6"></i>
                )}
              </button>
              <h1 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 ml-2 md:ml-4 truncate">Citizen Admin Dashboard</h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 w-full">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/edit/:id" element={<UserForm />} />
              <Route path="/complaints" element={<ComplaintManagementPage />} />
              <Route path="/feedbacks" element={<FeedbackManagementPage />} />
              <Route path="/contacts" element={<ContactManagementPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
