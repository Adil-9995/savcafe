import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  FileText,
  Smartphone,
  Users,
  PlusCircle,
  BarChart3,
  Database,
  Printer,
  Calendar,
  CloudSun,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface SalesOverviewPoint {
  label: string;
  sublabel?: string;
  value: number;
}

interface SalesOverview {
  today: SalesOverviewPoint[];
  week: SalesOverviewPoint[];
  month: SalesOverviewPoint[];
  year: SalesOverviewPoint[];
}

interface TopProduct {
  name: string;
  quantitySold: number;
  revenue: number;
}

interface RecentSale {
  id: number;
  billNo: string;
  time: string;
  customer: string;
  items: string;
  paymentMode: string;
  total: number;
  status: string;
}

interface LowStockItem {
  name: string;
  currentStock: number;
  minimumStock: number;
}

interface DashboardStats {
  todaySales: number;
  todayBills: number;
  cashCollection: number;
  onlineCollection: number;
  upiCollection: number;
  cardCollection: number;
  mixedCollection: number;
  averageBillValue: number;
  totalDiscount: number;
  totalGstCollected: number;
  
  salesTrend: string;
  billsTrend: string;
  cashTrend: string;
  onlineTrend: string;
  customersTrend: string;

  productsCount: number;
  availableProducts: number;
  outOfStock: number;
  disabledProducts: number;

  categoriesCount: number;
  customersCount: number;

  salesOverview: SalesOverview;
  topProducts: TopProduct[];
  paymentDistribution: {
    cash: number;
    upi: number;
    card: number;
    online: number;
    mixed: number;
  };
  recentSales: RecentSale[];
  lowStock: LowStockItem[];
  bestCategory: {
    name: string;
    revenue: number;
    unitsSold: number;
  };
  fastSellingProduct: {
    name: string;
    quantity: number;
  };
  slowMovingProducts: string[];
  hourlySales: SalesOverviewPoint[];
  peakSalesHour: string;

  databaseStatus: string;
  serverTime: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const fetchedStats = await api.getStats();
      setStats(fetchedStats);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Supabase Real-time subscriptions
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        () => {
          console.log('Supabase Realtime: New bill checkout detected!');
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          console.log('Supabase Realtime: Product inventory change detected!');
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          console.log('Supabase Realtime: Product category change detected!');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 select-none font-sans">
        <div className="h-28 bg-white border border-savora-border rounded-3xl animate-shimmer"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-28 bg-white border border-savora-border rounded-2xl animate-shimmer"></div>
          ))}
        </div>
        <div className="h-64 bg-white border border-savora-border rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  // 6 KPI Cards Grid Mapping
  const cardData = [
    {
      title: "Today's Sales",
      value: `₹${stats.todaySales.toFixed(2)}`,
      desc: "Gross sales value",
      trend: stats.salesTrend,
      trendUp: !stats.salesTrend.startsWith('-'),
      color: "border-savora-brown text-savora-brown bg-savora-peach/20",
      icon: IndianRupee
    },
    {
      title: "Total Bills",
      value: String(stats.todayBills),
      desc: "Bills checked out today",
      trend: stats.billsTrend,
      trendUp: !stats.billsTrend.startsWith('-'),
      color: "border-savora-taupe text-savora-taupe bg-savora-card",
      icon: FileText
    },
    {
      title: "Cash Collection",
      value: `₹${stats.cashCollection.toFixed(2)}`,
      desc: "Collected via cash register",
      trend: stats.cashTrend,
      trendUp: !stats.cashTrend.startsWith('-'),
      color: "border-savora-success text-savora-success bg-green-50",
      icon: IndianRupee
    },
    {
      title: "Online (UPI + Card)",
      value: `₹${(stats.onlineCollection + stats.upiCollection + stats.cardCollection + stats.mixedCollection).toFixed(2)}`,
      desc: "Digital payments totals",
      trend: stats.onlineTrend,
      trendUp: !stats.onlineTrend.startsWith('-'),
      color: "border-savora-info text-savora-info bg-cyan-50/50",
      icon: Smartphone
    },
    {
      title: "UPI Collection",
      value: `₹${stats.upiCollection.toFixed(2)}`,
      desc: "UPI QR scan collections",
      trend: "Live",
      trendUp: true,
      color: "border-savora-warning text-savora-warning bg-orange-50/50",
      icon: Smartphone
    },
    {
      title: "Card Collection",
      value: `₹${stats.cardCollection.toFixed(2)}`,
      desc: "POS swipe terminal totals",
      trend: "Live",
      trendUp: true,
      color: "border-savora-brown text-savora-brown bg-savora-peach/10",
      icon: IndianRupee
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

  // Sales Overview Chart points mapping
  const chartPoints = stats.salesOverview[activeChartTab === 'daily' ? 'today' : activeChartTab === 'weekly' ? 'week' : activeChartTab === 'monthly' ? 'month' : 'year'] || [];
  const maxChartVal = Math.max(...chartPoints.map(p => p.value), 1);

  // Hourly Line Chart coordinates mapping
  const linePoints = stats.hourlySales || [];
  const maxLineVal = Math.max(...linePoints.map(p => p.value), 1);
  const svgWidth = 500;
  const svgHeight = 130;
  const padding = 15;
  const lineCoords = linePoints.map((pt, idx) => {
    const x = padding + (idx * (svgWidth - 2 * padding)) / (linePoints.length - 1);
    const y = svgHeight - padding - (pt.value * (svgHeight - 2 * padding)) / maxLineVal;
    return { x, y, label: pt.label, value: pt.value };
  });
  const lineDPath = lineCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  // Payment Distribution Conic Gradient
  const pDist = stats.paymentDistribution || { cash: 0, upi: 0, card: 0, online: 0, mixed: 0 };
  const pCash = pDist.cash || 0;
  const pUpi = pDist.upi || 0;
  const pCard = pDist.card || 0;
  const pOnline = pDist.online || 0;
  const pMixed = pDist.mixed || 0;
  const p1 = pCash;
  const p2 = p1 + pUpi;
  const p3 = p2 + pCard;
  const p4 = p3 + pOnline;
  const p5 = p4 + pMixed;
  const conicGradient = (pCash === 0 && pUpi === 0 && pCard === 0 && pOnline === 0 && pMixed === 0)
    ? '#E8E1DA'
    : `conic-gradient(
      #664930 0% ${p1}%, 
      #997E67 ${p1}% ${p2}%, 
      #FFDBBB ${p2}% ${p3}%, 
      #4F6D7A ${p3}% ${p4}%, 
      #B54B4B ${p4}% ${p5}%
    )`;

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Welcome Banner + Store Information widget */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-savora-peach/15 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-2 flex-1">
          <h2 className="text-xl md:text-2xl font-heading text-savora-brown font-semibold leading-tight">
            Good Morning, {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs text-savora-text-secondary font-medium">
            Welcome to SAVORA POS — Bakery & Ice Bay Ice Creams Management System.
          </p>
          {/* Store information address block */}
          <div className="pt-2 flex items-start gap-2 text-xs text-savora-text-secondary border-t border-savora-border/40 mt-3 max-w-lg">
            <MapPin className="text-savora-brown shrink-0 mt-0.5" size={14} />
            <div>
              <span className="font-bold text-savora-brown">Savora Cafe & Bakers</span>
              <p className="text-[10px] mt-0.5 leading-relaxed">
                Asramam, Near Younis Convention Centre, Kollam, Kerala. Pincode: 691002
              </p>
            </div>
          </div>
        </div>

        {/* Date, Weather & Server Time */}
        <div className="flex items-center gap-3 bg-savora-card border border-savora-border/60 p-3 rounded-2xl shrink-0 z-10 text-xs">
          <CloudSun className="text-savora-taupe" size={24} />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-savora-text-primary">28°C Kollam</span>
            <span className="text-[10px] text-savora-text-secondary flex items-center gap-1 mt-0.5">
              <Calendar size={10} /> Sunny Counter
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
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
                <span className="text-lg md:text-xl font-heading font-bold text-savora-text-primary font-mono">
                  {card.value}
                </span>
                <p className="text-[9px] text-savora-text-secondary mt-0.5 truncate">{card.desc}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-savora-border/40 flex items-center gap-1 text-[10px] font-semibold">
                {card.trend === "Live" ? (
                  <span className="text-savora-success flex items-center gap-1">
                    <Activity size={10} className="animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    {card.trendUp ? (
                      <TrendingUp size={10} className="text-savora-success" />
                    ) : (
                      <TrendingDown size={10} className="text-savora-error" />
                    )}
                    <span className={card.trendUp ? 'text-savora-success' : 'text-savora-error'}>{card.trend}</span>
                  </span>
                )}
                <span className="text-savora-text-secondary font-normal">prev day</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Metrics Overview (Average Bill, Discounts, Product levels, etc.) */}
      <div className="bg-white border border-savora-border rounded-3xl p-5 shadow-sm">
        <h3 className="text-xs font-heading font-semibold text-savora-brown uppercase tracking-wider mb-4">
          Core Operations Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Avg Bill Value</span>
            <div className="text-sm font-bold text-savora-text-primary mt-1 font-mono">₹{stats.averageBillValue.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Discounts Today</span>
            <div className="text-sm font-bold text-savora-error mt-1 font-mono">₹{stats.totalDiscount.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">GST Collected</span>
            <div className="text-sm font-bold text-savora-success mt-1 font-mono">₹{stats.totalGstCollected.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Unique Customers</span>
            <div className="text-sm font-bold text-savora-text-primary mt-1 font-mono">{stats.customersCount}</div>
          </div>
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Total Categories</span>
            <div className="text-sm font-bold text-savora-text-primary mt-1 font-mono">{stats.categoriesCount}</div>
          </div>
          <div className="p-3 bg-savora-card/50 rounded-2xl border border-savora-border/60">
            <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Products Catalog</span>
            <div className="text-[10px] text-savora-text-primary mt-1 space-y-0.5">
              <div>Total: <span className="font-bold font-mono">{stats.productsCount}</span></div>
              <div className="text-[9px] text-savora-text-secondary font-medium">
                Avail: <span className="text-savora-success font-bold font-mono">{stats.availableProducts}</span> | OOS: <span className="text-savora-error font-bold font-mono">{stats.outOfStock}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Overview Bar Chart Widget */}
        <div className="lg:col-span-8 bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-savora-border/60 pb-4">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Sales Overview
              </h3>
              <p className="text-[10px] text-savora-text-secondary mt-0.5">Live aggregated bill summary charts</p>
            </div>
            
            {/* Chart Filter Tabs */}
            <div className="flex gap-1 bg-savora-card p-1 rounded-xl border border-savora-border select-none">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
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

          {/* Dynamic Sales Overview Bar Chart */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-full h-44 flex items-end justify-between px-6 gap-1.5 border-b border-savora-border/80">
              {chartPoints.map((pt, i) => {
                const hPercent = (pt.value / maxChartVal) * 100;
                return (
                  <div
                    key={i}
                    style={{ height: `${Math.max(4, hPercent)}%` }}
                    className="flex-1 bg-gradient-to-t from-savora-brown to-savora-taupe rounded-t-md hover:opacity-85 transition-opacity cursor-pointer relative group"
                  >
                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-savora-brown text-white text-[8px] font-semibold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-mono">
                      ₹{pt.value.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Dynamic labels representation */}
            <div className="w-full flex justify-between px-6 text-[9px] text-savora-text-secondary font-mono pt-2">
              {activeChartTab === 'daily' ? (
                <>
                  <span>08:00 AM</span>
                  <span>12:00 PM</span>
                  <span>04:00 PM</span>
                  <span>08:00 PM</span>
                </>
              ) : activeChartTab === 'weekly' ? (
                chartPoints.map((p, idx) => <span key={idx} className="text-[8px]">{p.label}</span>)
              ) : activeChartTab === 'monthly' ? (
                <>
                  <span>{chartPoints[0]?.label || ''}</span>
                  <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.label || ''}</span>
                  <span>{chartPoints[chartPoints.length - 1]?.label || ''}</span>
                </>
              ) : (
                chartPoints.filter((_, idx) => idx % 2 === 0).map((p, idx) => <span key={idx} className="text-[8px]">{p.label}</span>)
              )}
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
            <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1">
              {stats.topProducts.map((prod, idx) => {
                const maxTopRev = stats.topProducts[0]?.revenue || 1;
                const fillPercent = (prod.revenue / maxTopRev) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-savora-text-primary text-[11px] truncate max-w-[150px]">{prod.name}</span>
                      <span className="text-savora-brown text-[10px] font-mono">₹{prod.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-savora-text-secondary pb-1">
                      <span>{prod.quantitySold} Sold</span>
                      <span>Growth +{Math.max(5, 30 - idx * 3)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-savora-card rounded-full overflow-hidden">
                      <div style={{ width: `${fillPercent}%` }} className="h-full bg-savora-taupe rounded-full transition-all duration-300"></div>
                    </div>
                  </div>
                );
              })}
              {stats.topProducts.length === 0 && (
                <div className="text-xs text-savora-text-secondary py-6 text-center font-medium">No sales registered yet.</div>
              )}
            </div>
          </div>

          {/* Payment Distribution Pie/Donut Chart */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="border-b border-savora-border/60 pb-3">
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Payment Distribution
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Collection splits by channel</p>
            </div>

            <div className="flex items-center gap-6 py-3">
              {/* Donut Chart */}
              <div
                style={{ background: conicGradient }}
                className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center relative shadow-sm border border-savora-border"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[9px] font-bold text-savora-brown">₹</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2 h-2 rounded bg-savora-brown inline-block"></span> Cash
                  </span>
                  <span className="font-bold text-savora-text-primary font-mono">{pCash.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2 h-2 rounded bg-savora-taupe inline-block"></span> UPI
                  </span>
                  <span className="font-bold text-savora-text-primary font-mono">{pUpi.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2 h-2 rounded bg-savora-peach inline-block"></span> Card
                  </span>
                  <span className="font-bold text-savora-text-primary font-mono">{pCard.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2 h-2 rounded bg-[#4F6D7A] inline-block"></span> Online
                  </span>
                  <span className="font-bold text-savora-text-primary font-mono">{pOnline.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-savora-text-secondary font-medium">
                    <span className="w-2 h-2 rounded bg-[#B54B4B] inline-block"></span> Mixed
                  </span>
                  <span className="font-bold text-savora-text-primary font-mono">{pMixed.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Hourly Sales Chart & Peak Hour highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Sales Line Chart */}
        <div className="lg:col-span-8 bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-savora-border/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Hourly Sales Trend
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Line chart of sales activity throughout today</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-savora-brown bg-savora-peach/30 px-3 py-1 rounded-xl border border-savora-border">
              <Clock size={12} className="text-savora-taupe" />
              <span>Realtime Timestamps</span>
            </div>
          </div>

          <div className="w-full h-36 mt-4 flex items-center justify-center">
            {lineCoords.length > 0 ? (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#664930" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#664930" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#f3f4f6" strokeWidth={1} />
                <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#f3f4f6" strokeWidth={1} />
                <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#e5e7eb" strokeWidth={1} />

                {lineCoords.length > 0 && (
                  <path
                    d={`${lineDPath} L ${lineCoords[lineCoords.length - 1].x} ${svgHeight - padding} L ${lineCoords[0].x} ${svgHeight - padding} Z`}
                    fill="url(#line-grad)"
                  />
                )}

                <path
                  d={lineDPath}
                  fill="none"
                  stroke="#664930"
                  strokeWidth={2}
                  strokeLinecap="round"
                />

                {lineCoords.map((c, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={3}
                      fill="white"
                      stroke="#664930"
                      strokeWidth={1.5}
                    />
                    <title>{`${c.label}: ₹${c.value}`}</title>
                  </g>
                ))}
              </svg>
            ) : (
              <span className="text-xs text-savora-text-secondary">No hourly records.</span>
            )}
          </div>
        </div>

        {/* Peak Hour details */}
        <div className="lg:col-span-4 bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-savora-border/60 pb-3">
            <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
              Peak Traffic Hour
            </h3>
            <p className="text-[10px] text-savora-text-secondary">Highest billing load of the day</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-14 h-14 bg-savora-brown text-white rounded-full flex items-center justify-center shadow-md">
              <Zap size={24} />
            </div>
            <div className="text-lg font-bold text-savora-text-primary font-mono uppercase">
              {stats.peakSalesHour}
            </div>
            <p className="text-[10px] text-savora-text-secondary max-w-[200px] leading-relaxed">
              This period registered the highest sales receipts across today's bills database.
            </p>
          </div>
        </div>

      </div>

      {/* Row 4: Recent Sales & Low Stock / Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Sales Table Widget */}
        <div className="lg:col-span-8 bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-savora-border/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Recent Sales
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Last 10 orders processed in real time</p>
            </div>
            <span className="bg-green-50 text-savora-success border border-green-200 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Realtime Feed</span>
          </div>

          <div className="overflow-x-auto mt-4 border border-savora-border/60 rounded-2xl relative max-h-[250px] overflow-y-auto bg-savora-card/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-savora-card border-b border-savora-border z-10 text-[9px] uppercase font-bold text-savora-text-secondary">
                <tr>
                  <th className="p-3 pl-4">Bill No</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3 text-center">Mode</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-savora-border/60">
                {stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-savora-card/30 transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-savora-text-secondary">#{sale.billNo}</td>
                    <td className="p-3 text-[10px] text-savora-text-secondary whitespace-nowrap">
                      {new Date(sale.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-savora-text-primary font-semibold">{sale.customer}</td>
                    <td className="p-3 text-[10px] text-savora-text-secondary truncate max-w-[180px]" title={sale.items}>
                      {sale.items}
                    </td>
                    <td className="p-3 text-center font-bold text-[10px] text-savora-taupe">{sale.paymentMode}</td>
                    <td className="p-3 text-right font-bold font-mono text-savora-brown">₹{sale.total.toFixed(2)}</td>
                    <td className="p-3 text-center pr-4">
                      <span className="bg-green-50 text-savora-success border border-green-200 text-[9px] font-bold px-2.5 py-0.5 rounded-xl uppercase">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-savora-text-secondary">
                      No recent sales found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Operations Highlights widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Alert Widget */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                  Low Stock Inventory
                </h3>
                <p className="text-[10px] text-savora-text-secondary">Below minimum stock levels</p>
              </div>
              {stats.lowStock.length > 0 && (
                <AlertTriangle className="text-savora-error shrink-0 animate-bounce" size={16} />
              )}
            </div>

            <div className="space-y-3 max-h-[110px] overflow-y-auto pr-1">
              {stats.lowStock.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-savora-border/40 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-savora-text-primary">{prod.name}</span>
                    <div className="text-[9px] text-savora-text-secondary">Min Stock Limit: {prod.minimumStock}</div>
                  </div>
                  <span className="bg-red-50 text-savora-error border border-red-100 font-bold font-mono text-[10px] px-2 py-0.5 rounded-lg">
                    {prod.currentStock} left
                  </span>
                </div>
              ))}
              {stats.lowStock.length === 0 && (
                <div className="text-xs text-savora-success font-medium py-3 text-center">
                  All products satisfy minimum stock limits.
                </div>
              )}
            </div>
          </div>

          {/* Performance & Highlights (Best Category, Fast Selling, Slow Moving) */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-heading font-semibold text-savora-brown uppercase tracking-wider">
                Business Highlights
              </h3>
              <p className="text-[10px] text-savora-text-secondary">Derived operational highlights</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-savora-card/50 border border-savora-border rounded-2xl flex items-start gap-2.5">
                <Award className="text-savora-brown mt-0.5 shrink-0" size={16} />
                <div>
                  <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Best Category</span>
                  <div className="font-bold text-savora-text-primary mt-0.5 text-xs truncate max-w-[180px]">{stats.bestCategory.name}</div>
                  <p className="text-[9px] text-savora-text-secondary mt-0.5 font-mono">
                    ₹{stats.bestCategory.revenue.toFixed(0)} ({stats.bestCategory.unitsSold} units)
                  </p>
                </div>
              </div>
              <div className="p-3 bg-savora-card/50 border border-savora-border rounded-2xl flex items-start gap-2.5">
                <Sparkles className="text-savora-warning mt-0.5 shrink-0" size={16} />
                <div>
                  <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Fast Selling Today</span>
                  <div className="font-bold text-savora-text-primary mt-0.5 text-xs truncate max-w-[180px]">{stats.fastSellingProduct.name}</div>
                  <p className="text-[9px] text-savora-text-secondary mt-0.5 font-mono">
                    {stats.fastSellingProduct.quantity} units checked out today
                  </p>
                </div>
              </div>
              <div className="p-3 bg-savora-card/50 border border-savora-border rounded-2xl flex items-start gap-2.5">
                <TrendingDown className="text-savora-error mt-0.5 shrink-0" size={16} />
                <div>
                  <span className="text-[9px] font-bold text-savora-text-secondary uppercase">Slow Moving Products</span>
                  <div className="text-[10px] text-savora-text-primary font-semibold mt-0.5">
                    {stats.slowMovingProducts.length > 0 ? (
                      <span className="truncate block max-w-[180px] text-[10px] text-savora-error" title={stats.slowMovingProducts.join(', ')}>
                        {stats.slowMovingProducts.slice(0, 2).join(', ')} {stats.slowMovingProducts.length > 2 ? `+${stats.slowMovingProducts.length - 2} more` : ''}
                      </span>
                    ) : (
                      'None'
                    )}
                  </div>
                  <p className="text-[9px] text-savora-text-secondary mt-0.5">No transactions in last 30 days</p>
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

      {/* Dashboard Footer (Store Status, sync time, database status) */}
      <footer className="mt-8 border-t border-savora-border/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-savora-text-secondary font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="text-savora-success" size={12} />
            Store Status: <span className="font-bold text-savora-text-primary uppercase">Online</span>
          </span>
          <span className="h-3 w-[1px] bg-savora-border hidden sm:inline-block"></span>
          <span className="flex items-center gap-1">
            <Database className="text-savora-brown" size={12} />
            Database: <span className="font-bold text-savora-text-primary">Connected (Realtime)</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-savora-text-secondary">
          <span>Last Synced: {lastSync.toLocaleTimeString()}</span>
          <span>|</span>
          <span>Server Time: {new Date(stats.serverTime).toLocaleString()}</span>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
