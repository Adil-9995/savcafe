import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Search, IndianRupee, FileText, CheckCircle2, Eye, Printer, X } from 'lucide-react';

interface Bill {
  id: number;
  bill_number: string;
  date: string;
  cashier_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  round_off: number;
  grand_total: number;
  payment_type: string;
  status: string;
}

const SalesHistory: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [search, setSearch] = useState('');

  // Selected Bill for Reprint Modal
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm'>('80mm');
  const [shopSettings, setShopSettings] = useState({
    name: 'Savora Cafe & Bakers',
    subtitle: 'Bakery & Ice Bay Ice Creams',
    address: 'Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002',
    phone: '+91 98765 43210',
    gstin: '32AAAAA1111A1Z1',
    footer: 'Thank you for visiting! Come back soon.'
  });

  useEffect(() => {
    fetchBills();
  }, [filter]);

  useEffect(() => {
    // Load shop layout settings if saved
    const savedSettings = localStorage.getItem('savora_shop_settings');
    if (savedSettings && !savedSettings.includes('Beach Road') && !savedSettings.includes('Kochi')) {
      setShopSettings(JSON.parse(savedSettings));
    } else {
      setShopSettings({
        name: 'Savora Cafe & Bakers',
        subtitle: 'Bakery & Ice Bay Ice Creams',
        address: 'Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002',
        phone: '+91 98765 43210',
        gstin: '32AAAAA1111A1Z1',
        footer: 'Thank you for visiting! Come back soon.'
      });
    }
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await api.getBills(filter === 'all' ? undefined : filter);
      setBills(data);
    } catch (err) {
      console.error('Failed fetching billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReprintModal = async (billId: number) => {
    try {
      const data = await api.getBillDetails(billId);
      setSelectedBill(data);
      setShowPrintModal(true);
    } catch (err) {
      alert('Failed loading bill receipt details.');
    }
  };

  const executePrint = () => {
    window.print();
  };

  // Computations
  const totalSales = bills.reduce((sum, b) => sum + b.grand_total, 0);
  const totalBillsCount = bills.length;
  const avgBillValue = totalBillsCount > 0 ? totalSales / totalBillsCount : 0;
  
  const cashCollection = bills.filter((b) => b.payment_type === 'Cash').reduce((sum, b) => sum + b.grand_total, 0);
  const onlineCollection = bills.filter((b) => b.payment_type === 'Online').reduce((sum, b) => sum + b.grand_total, 0);

  // Search filter
  const filteredBills = bills.filter(
    (b) =>
      b.bill_number.toLowerCase().includes(search.toLowerCase()) ||
      b.cashier_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-savora-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Sales & Billing Logs
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Browse historical store bills, reprints, and totals.</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex gap-1 bg-savora-card p-1 rounded-xl border border-savora-border shrink-0">
          {([
            { id: 'today', name: 'Today' },
            { id: 'week', name: '7 Days' },
            { id: 'month', name: '30 Days' },
            { id: 'all', name: 'All Time' }
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                filter === t.id ? 'bg-savora-brown text-white shadow-sm' : 'text-savora-text-secondary'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-savora-peach/30 text-savora-brown rounded-xl"><IndianRupee size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-text-primary">₹{totalSales.toFixed(2)}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Net Sales</p>
          </div>
        </div>
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-savora-card text-savora-brown rounded-xl"><FileText size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-text-primary">{totalBillsCount}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5 font-sans">Bills Count</p>
          </div>
        </div>
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-green-50 text-savora-success rounded-xl"><IndianRupee size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-success">₹{avgBillValue.toFixed(2)}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Avg Bill Value</p>
          </div>
        </div>
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-cyan-50 text-savora-info rounded-xl"><IndianRupee size={20} /></span>
          <div>
            <span className="text-xs font-bold text-savora-text-primary block">C: ₹{cashCollection}</span>
            <span className="text-xs font-bold text-savora-text-primary block">O: ₹{onlineCollection}</span>
            <p className="text-[9px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Cash / Online Splits</p>
          </div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="bg-white border border-savora-border rounded-3xl p-4 shadow-sm">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill Number or Cashier Name..."
            className="w-full pl-9 pr-4 py-2.5 border border-savora-border rounded-xl text-xs outline-none bg-savora-card/20 focus:bg-white focus:ring-1 focus:ring-savora-brown"
          />
        </div>
      </div>

      {loading ? (
        // Log skeletal loader
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-12 bg-savora-card border border-savora-border rounded-xl animate-shimmer"></div>
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-4">
            <History size={32} />
          </div>
          <h3 className="font-heading font-semibold text-base text-savora-brown">No billing logs found</h3>
          <p className="text-xs text-savora-text-secondary mt-1 max-w-xs">
            Open the cashier counter billing workspace to process sales and log receipts.
          </p>
        </div>
      ) : (
        /* Table Registry */
        <div className="bg-white border border-savora-border rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-savora-card border-b border-savora-border text-xs uppercase font-bold text-savora-text-secondary">
                <tr>
                  <th className="p-4 pl-6">Bill Number</th>
                  <th className="p-4">Date Time</th>
                  <th className="p-4">Cashier</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-right">Tax (5%)</th>
                  <th className="p-4 text-right">Net Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-savora-border/60 text-xs">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-savora-card/25 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-savora-text-primary">{bill.bill_number}</td>
                    <td className="p-4 font-mono text-savora-text-secondary">
                      {new Date(bill.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-semibold text-savora-text-primary">{bill.cashier_name}</td>
                    <td className="p-4 text-right font-mono font-semibold text-savora-text-secondary">₹{bill.subtotal.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono font-semibold text-savora-text-secondary">₹{bill.tax.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold font-heading text-savora-brown">₹{bill.grand_total.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg border border-savora-border bg-savora-card text-savora-text-secondary font-bold font-mono text-[9px] uppercase">
                        {bill.payment_type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-green-50 text-savora-success border border-green-200 px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center justify-center gap-1 w-16 mx-auto">
                        <CheckCircle2 size={10} /> PAID
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <button
                        onClick={() => handleOpenReprintModal(bill.id)}
                        className="px-3 py-1.5 border border-savora-border hover:bg-savora-card text-savora-brown font-semibold rounded-xl flex items-center justify-center gap-1 transition-all mx-auto cursor-pointer"
                      >
                        <Eye size={12} /> View/Reprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {showPrintModal && selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-savora-border max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <History className="text-savora-brown" size={18} />
                <span className="font-heading font-semibold text-sm text-savora-brown">Historical Receipt view</span>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-full hover:bg-savora-border text-savora-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-savora-card/10">
              {/* Size Selectors */}
              <div className="bg-white p-3 rounded-2xl border border-savora-border space-y-2">
                <label className="block text-[10px] font-bold text-savora-text-secondary uppercase tracking-wider">
                  Paper Layout Size
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 p-2 border border-savora-border rounded-xl cursor-pointer hover:bg-savora-card text-xs font-semibold">
                    <input
                      type="radio"
                      name="receiptSize"
                      checked={receiptSize === '58mm'}
                      onChange={() => setReceiptSize('58mm')}
                      className="text-savora-brown"
                    />
                    58 mm Thermal
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2 border border-savora-border rounded-xl cursor-pointer hover:bg-savora-card text-xs font-semibold">
                    <input
                      type="radio"
                      name="receiptSize"
                      checked={receiptSize === '80mm'}
                      onChange={() => setReceiptSize('80mm')}
                      className="text-savora-brown"
                    />
                    80 mm Thermal
                  </label>
                </div>
              </div>

              {/* Receipt mockup */}
              <div className="flex justify-center">
                <div
                  id="print-receipt-container"
                  style={{ width: receiptSize === '58mm' ? '240px' : '320px', display: 'block' }}
                  className="bg-white border border-dashed border-gray-400 p-4 shadow-lg text-black font-mono text-[11px] leading-relaxed mx-auto text-left"
                >
                  <div className="text-center space-y-0.5 mb-3">
                    <h2 className="font-bold text-sm tracking-wide uppercase">{shopSettings.name}</h2>
                    <p className="text-[9px]">{shopSettings.subtitle}</p>
                    <p className="text-[9px] max-w-[250px] mx-auto">{shopSettings.address}</p>
                    <p className="text-[9px]">Ph: {shopSettings.phone}</p>
                    {shopSettings.gstin && <p className="text-[9px]">GSTIN: {shopSettings.gstin}</p>}
                  </div>

                  <div className="border-t border-b border-dashed border-gray-400 py-1.5 my-2 space-y-0.5 text-[9px]">
                    <div className="flex justify-between">
                      <span>BILL NO: {selectedBill.bill_number}</span>
                      <span>DATE: {new Date(selectedBill.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CASHIER: {selectedBill.cashier_name}</span>
                      <span>TIME: {new Date(selectedBill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <table className="w-full text-left my-2 text-[9px]">
                    <thead>
                      <tr className="border-b border-dashed border-gray-400 font-bold">
                        <th className="py-1">ITEM</th>
                        <th className="py-1 text-center">QTY</th>
                        <th className="py-1 text-right">RATE</th>
                        <th className="py-1 text-right">AMT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-200">
                      {selectedBill.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1 max-w-[120px] truncate">{item.product_name}</td>
                          <td className="py-1 text-center font-bold">{item.quantity}</td>
                          <td className="py-1 text-right">₹{item.rate}</td>
                          <td className="py-1 text-right font-bold">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-dashed border-gray-400 pt-1.5 my-2 space-y-0.5 text-[9px] text-right font-bold">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedBill.subtotal?.toFixed(2)}</span>
                    </div>
                    {selectedBill.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₹{selectedBill.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST Tax (5%):</span>
                      <span>₹{selectedBill.tax?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Round Off:</span>
                      <span>₹{selectedBill.round_off}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-gray-400 pt-1 text-[11px]">
                      <span>GRAND TOTAL:</span>
                      <span>₹{selectedBill.grand_total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-normal text-[8px] italic pt-1 border-b border-dashed border-gray-400 pb-1">
                      <span>PAYMENT MODE:</span>
                      <span className="uppercase font-bold">{selectedBill.payment_type}</span>
                    </div>
                  </div>

                  <div className="text-center text-[9px] mt-4 italic">
                    <p>{shopSettings.footer}</p>
                    <p className="text-[7px] text-gray-500 mt-1">Reprinted Copy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-savora-card border-t border-savora-border flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-savora-border rounded-xl text-xs font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
              >
                Close Window
              </button>
              <button
                onClick={executePrint}
                className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <Printer size={14} /> Trigger Print
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SalesHistory;
