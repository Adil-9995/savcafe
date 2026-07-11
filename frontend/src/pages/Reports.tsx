import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, Printer } from 'lucide-react';

interface Stats {
  todaySales: number;
  todayBills: number;
  cashCollection: number;
  onlineCollection: number;
}

const Reports: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching reports stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportStats();
  }, []);

  const reportCards = [
    { name: 'Daily Sales Report', desc: 'Summary of transactions executed today.', period: 'Today' },
    { name: 'Weekly Revenue Report', desc: 'Summary of the past 7 days of sales.', period: '7 Days' },
    { name: 'Monthly Inventory Report', desc: 'Product performance and cost valuations.', period: '30 Days' },
    { name: 'Yearly Financial Audit', desc: 'Audit report containing taxes and sales splits.', period: 'Yearly' },
    { name: 'Payment Breakdown Summary', desc: 'Cash versus digital collection rates.', period: 'Customizable' }
  ];

  const handleDownload = (format: string, reportName: string) => {
    if (format === 'PDF') {
      window.print();
    } else {
      alert(`Downloading "${reportName}" in ${format} format. (Stage 2 Integration).`);
    }
  };

  // Determine if database has bills
  const hasBills = stats ? stats.todayBills > 0 : false;

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Module Header */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Business Reports
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Generate, export, and download shop analytics.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl shadow cursor-pointer transition-colors flex items-center gap-1.5 no-print"
        >
          <Printer size={14} /> Print Audit Page
        </button>
      </div>

      {loading ? (
        <div className="h-40 bg-white border border-savora-border rounded-3xl animate-shimmer"></div>
      ) : !hasBills ? (
        /* Empty State */
        <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-4">
            <BarChart3 size={32} />
          </div>
          <h3 className="font-heading font-semibold text-base text-savora-brown">No report data available</h3>
          <p className="text-xs text-savora-text-secondary mt-1 max-w-xs">
            Billing history is currently empty. Process transactions at the cashier terminal to populate audit records.
          </p>
        </div>
      ) : (
        /* Active reports list */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2">
                Available Report Bundles
              </h3>

              <div className="divide-y divide-savora-border/60 space-y-3">
                {reportCards.map((report, idx) => (
                  <div key={idx} className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-savora-text-primary text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-savora-brown"></span> {report.name}
                      </h4>
                      <p className="text-[10px] text-savora-text-secondary">{report.desc}</p>
                    </div>
                    
                    {/* Action Download Buttons */}
                    <div className="flex gap-1.5 shrink-0 select-none">
                      <button
                        onClick={() => handleDownload('PDF', report.name)}
                        className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      >
                        <FileText size={12} /> PDF
                      </button>
                      <button
                        onClick={() => handleDownload('Excel', report.name)}
                        className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      >
                        <FileSpreadsheet size={12} /> Excel
                      </button>
                      <button
                        onClick={() => handleDownload('CSV', report.name)}
                        className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      >
                        <Download size={12} /> CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Summary card */}
          <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2">
              Billing Stats Highlights
            </h3>
            
            {stats && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-savora-border/40 pb-2">
                  <span className="text-savora-text-secondary">Today Sales Revenue:</span>
                  <span className="font-bold text-savora-brown font-mono">₹{stats.todaySales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-savora-border/40 pb-2">
                  <span className="text-savora-text-secondary">Total Bills Logged:</span>
                  <span className="font-bold text-savora-text-primary font-mono">{stats.todayBills}</span>
                </div>
                <div className="flex justify-between border-b border-savora-border/40 pb-2">
                  <span className="text-savora-text-secondary">Cash Drawer Share:</span>
                  <span className="font-bold text-savora-text-primary font-mono">₹{stats.cashCollection.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-savora-border/40 pb-2">
                  <span className="text-savora-text-secondary">UPI Online Share:</span>
                  <span className="font-bold text-savora-text-primary font-mono">₹{stats.onlineCollection.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-2xl flex gap-2 text-[10px] text-savora-success font-semibold items-center select-none leading-relaxed">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Audit calculations synced with SQLite database records.</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Reports;
