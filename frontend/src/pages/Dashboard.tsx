import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  FileText,
  Smartphone,
  Box,
  Users,
  PlusCircle,
  BarChart3,
  Database,
  Printer,
  Calendar,
  CloudSun
} from 'lucide-react';

interface Stats {
  todaySales: number;
  todayBills: number;
  cashCollection: number;
  onlineCollection: number;
  productsCount: number;
  customersCount: number;
  databaseSize: string;
  storageUsed: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    todayBills: 0,
    cashCollection: 0,
    onlineCollection: 0,
    productsCount: 0,
    customersCount: 0,
    databaseSize: '0 KB',
    storageUsed: '0 KB'
  });
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchedStats = await api.getStats();
        setStats(fetchedStats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardData = [
    {
      title: "Today's Sales",
      value: `₹${stats.todaySales.toFixed(2)}`,
      desc: "Gross sales value",
      trend: "+12.4%",
      trendUp: true,
      color: "border-savora-brown text-savora-brown bg-savora-peach/20",
      icon: IndianRupee
    },
    {
      title: "Total Bills",
      value: String(stats.todayBills),
      desc: "Bills checked out today",
      trend: "+8.2%",
      trendUp: true,
      color: "border-savora-taupe text-savora-taupe bg-savora-card",
      icon: FileText
    },
    {
      title: "Cash Collection",
      value: `₹${stats.cashCollection.toFixed(2)}`,
      desc: "Collected via cash register",
      trend: "+4.1%",
      trendUp: true,
      color: "border-savora-success text-savora-success bg-green-50",
      icon: IndianRupee
    },
    {
      title: "Online Collection",
      value: `₹${stats.onlineCollection.toFixed(2)}`,
      desc: "UPI / Card payments",
      trend: "+18.9%",
      trendUp: true,
      color: "border-savora-info text-savora-info bg-cyan-50/50",
      icon: Smartphone
    },
    {
      title: "Products Catalog",
      value: String(stats.productsCount),
      desc: "Total active product codes",
      trend: "Synced",
      trendUp: true,
      color: "border-savora-warning text-savora-warning bg-orange-50/50",
      icon: Box
    },
    {
      title: "Total Customers",
      value: String(stats.customersCount),
      desc: "Footfall (unique bills)",
      trend: "+5.3%",
      trendUp: true,
      color: "border-savora-brown text-savora-brown bg-savora-peach/10",
      icon: Users
    }
  ];

  const quickActions = [
    { name: 'New Bill', path: '/billing', icon: ShoppingBag, color: 'bg-savora-brown text-white' },
    { name: 'Add Product', path: '/products', icon: PlusCircle, color: 'bg-savora-taupe text-white' },
    { name: 'View Reports', path: '/reports', icon: BarChart3, color: 'bg-savora-peach text-savora-brown border border-savora-border' },
    { name: 'Manage Users', path: '/users', icon: Users, color: 'bg-white text-savora-brown border border-savora-border' },
    { name: 'Database Admin', path: '/database', icon: Database, color: 'bg-white text-savora-brown border border-savora-border' },
    { name: 'Printer Settings', path: '/settings', icon: Printer, color: 'bg-white text-savora-brown border border-savora-border' },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        {/* Soft Background circles */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-savora-peach/15 rounded-full blur-2xl"></div>
        <div className="absolute right-10 -bottom-16 w-32 h-32 bg-savora-taupe/5 rounded-full blur-xl"></div>
        
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl md:text-2xl font-heading text-savora-brown font-semibold leading-tight">
            Good Morning, {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs text-savora-text-secondary">
            Welcome to SAVORA POS — Bakery & Ice Bay Ice Creams Management System.
          </p>
        </div>

        {/* Date and Weather mock */}
        <div className="flex items-center gap-3 bg-savora-card border border-savora-border/60 p-3 rounded-2xl shrink-0 z-10 text-xs">
          <CloudSun className="text-savora-taupe" size={24} />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-savora-text-primary">28°C Kochi</span>
            <span className="text-[10px] text-savora-text-secondary flex items-center gap-1">
              <Calendar size={10} /> Sunny Counter
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        // KPI Skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-28 bg-white border border-savora-border rounded-2xl animate-shimmer"></div>
          ))}
        </div>
      ) : (
        /* KPI Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cardData.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-savora-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-savora-text-secondary uppercase tracking-wider">
                    {card.title}
                  </span>
                  <span className={`p-1.5 rounded-lg border ${card.color}`}>
                    <Icon size={14} />
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-lg md:text-xl font-heading font-bold text-savora-text-primary">
                    {card.value}
                  </span>
                  <p className="text-[9px] text-savora-text-secondary mt-0.5 truncate">{card.desc}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-savora-border/40 flex items-center gap-1 text-[10px] font-semibold">
                  {card.trendUp ? (
                    <TrendingUp size={10} className="text-savora-success" />
                  ) : (
                    <TrendingDown size={10} className="text-savora-error" />
                  )}
                  <span className={card.trendUp ? 'text-savora-success' : 'text-savora-error'}>{card.trend}</span>
                  <span className="text-savora-text-secondary font-normal">prev day</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart Placeholder */}
        <div className="lg:col-span-8 bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-savora-border/60 pb-4">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Sales Overview
              </h3>
              <p className="text-[10px] text-savora-text-secondary mt-0.5">Billing summary performance charts</p>
            </div>
            
            {/* Chart Filter Tabs */}
            <div className="flex gap-1 bg-savora-card p-1 rounded-xl border border-savora-border select-none">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                    activeChartTab === tab
                      ? 'bg-savora-brown text-white shadow-sm'
                      : 'text-savora-text-secondary hover:text-savora-brown'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Graphical placeholder structure */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-full h-44 flex items-end justify-between px-6 gap-2 border-b border-savora-border/80">
              {/* Bars mockup */}
              {[40, 65, 35, 80, 50, 95, 75, 45, 60, 85, 30, 90].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-savora-brown to-savora-taupe rounded-t-md hover:opacity-85 transition-opacity cursor-pointer relative group"
                >
                  {/* Tooltip */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-savora-brown text-white text-[8px] font-semibold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{(h * 150).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-between px-6 text-[9px] text-savora-text-secondary font-mono pt-2">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>
        </div>

        {/* Top Product Standings & Payment distributions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Selling Products List Card */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Top Products
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Highest performing dessert items</p>
            </div>

            {/* List products */}
            <div className="space-y-3">
              {[
                { name: "Chocolate Fudge Cake", qty: "42 Sold", rev: "₹14,700", fill: "w-[85%]" },
                { name: "Vanilla Soft Cone", qty: "36 Sold", rev: "₹1,440", fill: "w-[72%]" },
                { name: "Veg Puff Pastry", qty: "29 Sold", rev: "₹870", fill: "w-[58%]" },
                { name: "Special Ice Bay Combo", qty: "18 Sold", rev: "₹2,160", fill: "w-[36%]" }
              ].map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-savora-text-primary text-[11px] truncate max-w-[150px]">{prod.name}</span>
                    <span className="text-savora-brown text-[10px]">{prod.rev}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-savora-text-secondary pb-1">
                    <span>{prod.qty}</span>
                    <span>Growth +15%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-savora-card rounded-full overflow-hidden">
                    <div className={`h-full bg-savora-taupe rounded-full ${prod.fill}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Distribution */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="border-b border-savora-border/60 pb-3">
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Payment Distribution
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Collection splits by channel</p>
            </div>

            {/* Circular Chart Placeholder / Indicators */}
            <div className="flex items-center gap-6 py-3">
              {/* Mock Ring */}
              <div className="w-16 h-16 rounded-full border-[10px] border-savora-brown border-t-savora-peach border-r-savora-taupe shrink-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-savora-brown">₹</span>
              </div>
              <div className="flex-1 space-y-2 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2.5 h-2.5 rounded bg-savora-brown inline-block"></span> Cash Collection
                  </span>
                  <span className="font-bold text-savora-text-primary">60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2.5 h-2.5 rounded bg-savora-taupe inline-block"></span> Online (UPI)
                  </span>
                  <span className="font-bold text-savora-text-primary">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2.5 h-2.5 rounded bg-savora-peach inline-block"></span> Card Swipe
                  </span>
                  <span className="font-bold text-savora-text-primary">10%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Action Tiles Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
          Quick Action Registry
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(act.path)}
                className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer ${act.color}`}
              >
                <span className="p-2 rounded-xl bg-black/5 group-hover:scale-105 transition-transform duration-200">
                  <Icon size={20} />
                </span>
                <span className="text-xs font-semibold tracking-wide">{act.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
