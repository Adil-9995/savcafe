import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Tag,
  History,
  BarChart3,
  Users,
  Settings,
  Database,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Home
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto collapse sidebar on smaller laptop/tablet views
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // run initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const path = location.pathname.substring(1);
    if (!path) return ['Home'];
    return path.split('/').map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
  };

  // Nav menu schema
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Billing',
      path: '/billing',
      icon: ShoppingBag,
      roles: ['Super Admin', 'Shop Owner', 'Manager', 'Cashier']
    },
    {
      name: 'Products',
      path: '/products',
      icon: ChefHat,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: Tag,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Sales History',
      path: '/sales',
      icon: History,
      roles: ['Super Admin', 'Shop Owner', 'Manager', 'Cashier']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Users',
      path: '/users',
      icon: Users,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Database',
      path: '/database',
      icon: Database,
      roles: ['Super Admin', 'Shop Owner', 'Manager']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['Super Admin', 'Shop Owner', 'Manager', 'Cashier']
    },
    {
      name: 'Home Website',
      path: '/',
      icon: Home,
      roles: ['Super Admin', 'Shop Owner', 'Manager', 'Cashier']
    }
  ];

  // Filter menu based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen flex bg-savora-beige">
      
      {/* Sidebar for Desktop */}
      <aside
        className={`no-print hidden md:flex flex-col bg-savora-brown text-white transition-all duration-300 ease-in-out select-none border-r border-savora-border/20 ${
          sidebarExpanded ? 'w-[260px]' : 'w-[80px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-savora-border/10 bg-savora-brown">
          {sidebarExpanded ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-savora-peach flex items-center justify-center text-savora-brown font-heading font-bold text-lg shrink-0">
                S
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-semibold text-sm tracking-wide text-savora-peach">SAVORA POS</span>
                <span className="text-[10px] text-savora-beige/70">Bakery & Ice Bay</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-savora-peach flex items-center justify-center text-savora-brown font-heading font-bold text-xl mx-auto">
              S
            </div>
          )}
          
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden lg:block text-savora-beige hover:text-white p-1 rounded hover:bg-savora-taupe/40 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-savora-peach text-savora-brown font-semibold shadow-md'
                    : 'text-savora-beige hover:bg-savora-taupe hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-savora-brown' : 'text-savora-beige group-hover:text-white'} />
                {sidebarExpanded && <span className="text-sm tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-savora-border/10 bg-savora-brown">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-savora-beige hover:bg-savora-error/20 hover:text-red-300 transition-colors duration-200`}
          >
            <LogOut size={20} />
            {sidebarExpanded && <span className="text-sm tracking-wide font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          <aside className="w-[260px] bg-savora-brown flex flex-col text-white h-full relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md bg-savora-taupe text-white"
            >
              <X size={20} />
            </button>
            <div className="h-16 px-6 flex items-center border-b border-savora-border/10 bg-savora-brown gap-2">
              <div className="w-8 h-8 rounded-lg bg-savora-peach flex items-center justify-center text-savora-brown font-heading font-bold text-lg">
                S
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-semibold text-sm tracking-wide text-savora-peach">SAVORA POS</span>
                <span className="text-[10px] text-savora-beige/70">Bakery & Ice Bay</span>
              </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-savora-peach text-savora-brown font-semibold shadow-md'
                        : 'text-savora-beige hover:bg-savora-taupe hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-savora-border/10 bg-savora-brown">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-savora-beige hover:bg-savora-error/20 hover:text-red-300 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm tracking-wide font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <header className="no-print sticky top-0 z-40 bg-white border-b border-savora-border shadow-sm h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-savora-card text-savora-brown border border-savora-border"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb Navigation */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-savora-text-secondary select-none">
              <span className="hover:text-savora-brown cursor-pointer">SAVORA</span>
              {getBreadcrumbs().map((bc, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-savora-beige font-bold">/</span>
                  <span className={idx === getBreadcrumbs().length - 1 ? 'text-savora-brown font-semibold' : ''}>
                    {bc}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Quick Info & Action Center */}
          <div className="flex items-center gap-4">
            
            {/* Time Ticker */}
            <div className="hidden md:flex flex-col text-right pr-3 border-r border-savora-border">
              <span className="text-xs font-semibold text-savora-text-primary">
                {dateTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="text-[11px] text-savora-text-secondary font-mono tracking-wider">
                {dateTime.toLocaleTimeString('en-IN', { hour12: true })}
              </span>
            </div>

            {/* Role Badge */}
            <span
              className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user?.role === 'Super Admin' || user?.role === 'Shop Owner' || user?.role === 'Manager'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {user?.role || 'Guest'}
            </span>

            {/* Notification bell icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 rounded-full hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown transition-colors border border-savora-border/60 bg-savora-card/40"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-savora-warning"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-savora-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 bg-savora-card border-b border-savora-border flex justify-between items-center">
                    <span className="font-heading font-semibold text-xs text-savora-brown">Notifications</span>
                    <button className="text-[10px] text-savora-text-secondary hover:underline">Mark as read</button>
                  </div>
                  <div className="divide-y divide-savora-border max-h-60 overflow-y-auto">
                    <div className="p-3 text-xs hover:bg-savora-card/50 transition-colors">
                      <p className="font-medium text-savora-text-primary">System Booted</p>
                      <p className="text-savora-text-secondary text-[10px]">SAVORA POS successfully initialized database.</p>
                      <span className="text-[9px] text-savora-beige font-semibold">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Area */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 hover:bg-savora-card p-1 rounded-full border border-savora-border/60 pr-3 transition-colors bg-savora-card/30"
              >
                <div className="w-8 h-8 rounded-full bg-savora-brown text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-savora-text-primary">{user?.name}</span>
                  <span className="text-[9px] text-savora-text-secondary">{user?.email}</span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-savora-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-savora-border">
                  <div className="p-3 text-xs">
                    <p className="font-semibold text-savora-text-primary">{user?.name}</p>
                    <p className="text-savora-text-secondary text-[10px] truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-savora-text-primary hover:bg-savora-card"
                    >
                      <User size={14} /> My Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-savora-error hover:bg-red-50"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;
