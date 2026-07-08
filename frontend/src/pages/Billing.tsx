import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ThermalReceipt from '../components/receipt/ThermalReceipt';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  RotateCcw,
  Printer,
  X,
  CreditCard,
  CircleDollarSign
} from 'lucide-react';

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  status: string;
  category_name?: string;
}

interface BillItem {
  id: number;
  code: string;
  name: string;
  quantity: number;
  price: number;
}

interface RecentBill {
  id: number;
  bill_number: string;
  date: string;
  grand_total: number;
  payment_type: string;
  status: string;
}

const Billing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  
  // Cart & Calculation States
  const [cart, setCart] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'Cash' | 'Online' | 'Mixed'>('Cash');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Keyboard navigation focus indexes
  const [activeCartIndex, setActiveCartIndex] = useState<number>(-1);

  // Inputs refs & states
  const [codeVal, setCodeVal] = useState('');
  const [qtyVal, setQtyVal] = useState('1');
  const [searchVal, setSearchVal] = useState('');

  // Modals & Receipts
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);
  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm'>('80mm');
  const [shopSettings, setShopSettings] = useState({
    name: 'SAVORA Bakery',
    subtitle: 'Bakery & Ice Bay Ice Creams',
    address: 'Shop No 14, Beach Road, Kochi',
    phone: '+91 98765 43210',
    gstin: '32AAAAA1111A1Z1',
    footer: 'Thank you for visiting! Come back soon.'
  });

  // Focus Refs
  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Double space tracker
  const lastSpaceTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchProducts();
    fetchRecentBills();

    // Auto-focus code input on mount
    codeRef.current?.focus();

    // Load configurations
    const saved = localStorage.getItem('savora_shop_settings');
    if (saved) setShopSettings(JSON.parse(saved));

    // Keyboard global listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Double Space for Payment Modal
      if (e.key === ' ') {
        const now = Date.now();
        if (now - lastSpaceTimeRef.current < 250) {
          e.preventDefault();
          setShowPaymentModal(true);
        }
        lastSpaceTimeRef.current = now;
      }

      // 2. F-Keys Shortcuts
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showPaymentModal) {
          setShowPaymentModal(false);
          codeRef.current?.focus();
        } else {
          clearBill();
        }
      }
      if (e.key === 'F1') {
        e.preventDefault();
        reprintLastOrder();
      }
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        navigate('/sales');
      }

      // 3. Ctrl combinations
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        triggerDBBackup();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate('/reports');
      }

      // 4. Cart Navigations (Arrow Up / Down / Delete)
      if (cart.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveCartIndex((prev) => (prev < cart.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveCartIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === 'Delete' && activeCartIndex >= 0) {
          e.preventDefault();
          const targetItem = cart[activeCartIndex];
          if (targetItem) {
            removeItem(targetItem.code);
            setActiveCartIndex((prev) => (prev >= cart.length - 1 ? cart.length - 2 : prev));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, activeCartIndex, showPaymentModal]);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts({ status: 'Available' });
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentBills = async () => {
    try {
      const data = await api.getBills('today');
      setRecentBills(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStatus = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerDBBackup = async () => {
    try {
      await api.clearDatabase('backup', ''); // triggers mock or server backup
      triggerStatus('success', 'Database backup copy saved successfully.');
    } catch (e) {
      triggerStatus('error', 'Failed database backup.');
    }
  };

  // Keyboard workflow additions
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!codeVal.trim()) return;

      const matched = products.find(p => p.code.toLowerCase() === codeVal.trim().toLowerCase());
      if (matched) {
        qtyRef.current?.focus();
        qtyRef.current?.select();
      } else {
        triggerStatus('error', `Product code "${codeVal}" is invalid.`);
      }
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matched = products.find(p => p.code.toLowerCase() === codeVal.trim().toLowerCase());
      if (matched) {
        const qty = parseInt(qtyVal) || 1;
        addItemToCart(matched, qty);
        setCodeVal('');
        setQtyVal('1');
        codeRef.current?.focus();
      }
    }
  };

  const addItemToCart = (prod: Product, qty: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(item => item.code === prod.code);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, { id: prod.id, code: prod.code, name: prod.name, quantity: qty, price: prod.price }];
    });
    setActiveCartIndex(0);
    triggerStatus('success', `Added ${prod.name}`);
  };

  const adjustQty = (code: string, delta: number) => {
    setCart((prev) =>
      prev
        .map(item => item.code === code ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (code: string) => {
    setCart(prev => prev.filter(item => item.code !== code));
    triggerStatus('success', 'Removed item from cart.');
  };

  const clearBill = () => {
    setCart([]);
    setDiscount(0);
    setPaymentType('Cash');
    setActiveCartIndex(-1);
    triggerStatus('success', 'Billing session cleared.');
    codeRef.current?.focus();
  };

  // Checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) {
      triggerStatus('error', 'Add items before checkout.');
      return;
    }

    const payload = {
      cashierName: user?.name || 'Cashier Counter',
      items: cart,
      discount: discount,
      paymentType: paymentType
    };

    try {
      const savedBill = await api.createBill(payload);
      setLastBill(savedBill);
      setShowPaymentModal(false);
      setShowPrintModal(true);
      
      // Reset Counter
      setCart([]);
      setDiscount(0);
      setPaymentType('Cash');
      setActiveCartIndex(-1);
      fetchRecentBills();
    } catch (err: any) {
      triggerStatus('error', err.message || 'Checkout failed.');
    }
  };

  const reprintLastOrder = async () => {
    if (recentBills.length === 0) {
      triggerStatus('error', 'No orders checked out today.');
      return;
    }
    try {
      const details = await api.getBillDetails(recentBills[0].id);
      setLastBill(details);
      setShowPrintModal(true);
    } catch (e) {
      triggerStatus('error', 'Failed loading reprint receipt.');
    }
  };

  // Maths
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const discValue = parseFloat(String(discount)) || 0;
  const totalBeforeRound = subtotal - discValue + tax;
  const grandTotal = Math.round(totalBeforeRound);
  const roundOff = parseFloat((grandTotal - totalBeforeRound).toFixed(2));

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col font-sans select-none space-y-4 text-xs">
      
      {/* Toast popup */}
      {toast && (
        <div className={`fixed top-18 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-semibold ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-savora-success' : 'bg-red-50 border-red-200 text-savora-error'
        }`}>
          <i className="w-4 h-4" />
          <span>{toast.text}</span>
        </div>
      )}

      <div className="no-print flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* LEFT PANEL (Product Scan Codes) */}
        <div className="lg:col-span-3 bg-white border border-savora-border rounded-3xl p-5 flex flex-col min-h-0 shadow-sm">
          <div className="border-b border-savora-border/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-heading font-semibold text-savora-brown uppercase tracking-wider text-xs">Enter Product</h3>
              <p className="text-[9px] text-savora-text-secondary">Scan barcode or type code</p>
            </div>
            <span className="bg-green-50 text-savora-success border border-green-200 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Counter active</span>
          </div>

          <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[9px] font-bold text-savora-text-secondary uppercase mb-1">Product Code</label>
              <input
                ref={codeRef}
                type="text"
                value={codeVal}
                onChange={(e) => setCodeVal(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                placeholder="Type code [Enter]"
                className="w-full h-10 px-3 border border-savora-border rounded-xl font-bold bg-savora-card/25 focus:bg-white outline-none focus:ring-1 focus:ring-savora-brown"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-savora-text-secondary uppercase mb-1">Quantity</label>
              <input
                ref={qtyRef}
                type="number"
                min="1"
                value={qtyVal}
                onChange={(e) => setQtyVal(e.target.value)}
                onKeyDown={handleQtyKeyDown}
                placeholder="1 [Enter]"
                className="w-full h-10 px-3 border border-savora-border rounded-xl font-bold bg-savora-card/25 focus:bg-white outline-none focus:ring-1 focus:ring-savora-brown"
              />
            </div>
          </form>

          {/* Quick Shortcuts text catalog */}
          <div className="mt-4 pt-4 border-t border-savora-border/60 flex-1 flex flex-col min-h-0 space-y-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary"><Search size={14} /></span>
              <input
                ref={searchRef}
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Catalog search... [F2]"
                className="w-full pl-8 pr-3 py-1.5 border border-savora-border rounded-lg bg-savora-card/40 focus:bg-white outline-none text-[11px]"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-savora-border/40 pr-1 space-y-1">
              {products
                .filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.code.toLowerCase().includes(searchVal.toLowerCase()))
                .map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => addItemToCart(prod)}
                    className="w-full p-2 hover:bg-savora-card rounded-lg flex items-center justify-between text-left transition-colors border border-transparent hover:border-savora-border/60 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-savora-text-primary truncate">{prod.name}</p>
                      <span className="text-[8px] font-mono text-savora-text-secondary">Code: #{prod.code}</span>
                    </div>
                    <span className="font-bold text-savora-brown bg-savora-peach/30 px-1.5 py-0.5 rounded text-[9px]">₹{prod.price}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL (Checkout cart table) */}
        <div className="lg:col-span-6 bg-white border border-savora-border rounded-3xl p-5 flex flex-col min-h-0 shadow-sm justify-between">
          <div className="flex-grow flex flex-col min-h-0">
            <div className="border-b border-savora-border/60 pb-3 flex justify-between items-center select-none">
              <div>
                <h3 className="font-heading font-semibold text-savora-brown uppercase tracking-wider text-xs">Checkout Cart</h3>
                <p className="text-[9px] text-savora-text-secondary">Navigate rows using Arrow Up/Down</p>
              </div>
              <span className="text-[10px] font-bold bg-savora-card border border-savora-border px-3 py-1 rounded-xl text-savora-brown">Items: {cart.length}</span>
            </div>

            <div className="flex-grow overflow-y-auto mt-4 border border-savora-border/60 rounded-2xl relative bg-savora-card/10">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-savora-card border-b border-savora-border z-10 text-[9px] uppercase font-bold text-savora-text-secondary">
                  <tr>
                    <th className="p-3 pl-4">Code</th>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-savora-border/60">
                  {cart.map((item, idx) => (
                    <tr
                      key={item.code}
                      className={`transition-colors ${
                        activeCartIndex === idx ? 'bg-savora-peach/25 border-y-2 border-savora-brown' : 'hover:bg-savora-card/40'
                      }`}
                    >
                      <td className="p-3 pl-4 font-mono font-bold text-savora-text-secondary">#{item.code}</td>
                      <td className="p-3 font-semibold text-savora-text-primary">{item.name}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => adjustQty(item.code, -1)} className="p-0.5 rounded border border-savora-border bg-white text-savora-text-primary"><Minus size={10} /></button>
                          <span className="w-4 text-center font-bold font-mono">{item.quantity}</span>
                          <button type="button" onClick={() => adjustQty(item.code, 1)} className="p-0.5 rounded border border-savora-border bg-white text-savora-text-primary"><Plus size={10} /></button>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold font-mono text-savora-brown">₹{(item.quantity * item.price).toFixed(2)}</td>
                      <td className="p-3 text-center pr-4">
                        <button type="button" onClick={() => removeItem(item.code)} className="text-savora-error hover:bg-red-50 p-1 rounded-lg border border-transparent hover:border-red-200"><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {cart.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                  <div className="w-12 h-12 rounded-full bg-white border border-savora-border flex items-center justify-center text-savora-beige mb-3 shadow-sm"><Receipt size={24} /></div>
                  <h4 className="font-heading font-semibold text-savora-brown">No items on this bill</h4>
                  <p className="text-[9px] text-savora-text-secondary">Press keys or enter barcode code to add.</p>
                </div>
              )}
            </div>
          </div>

          {/* Keyboard Badge Guidelines */}
          <div className="mt-4 pt-3 border-t border-savora-border/60 bg-savora-card/30 p-2.5 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-widest text-savora-taupe block mb-1.5">Counter Shortcuts Panel</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px] font-semibold text-savora-text-secondary select-none">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.2 bg-white border border-savora-border rounded font-mono text-[9px]">Dbl Space</kbd>
                <span>Payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.2 bg-white border border-savora-border rounded font-mono text-[9px]">ESC</kbd>
                <span>Cancel bill</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.2 bg-white border border-savora-border rounded font-mono text-[9px]">F1</kbd>
                <span>Reprint Last</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.2 bg-white border border-savora-border rounded font-mono text-[9px]">F2</kbd>
                <span>Search</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Billing computations & checkouts) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-4 min-h-0">
          <div className="bg-white border border-savora-border rounded-3xl p-5 shadow-sm space-y-3 shrink-0">
            <h3 className="text-[10px] uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border pb-2">Bill Summary</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-savora-text-secondary">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-savora-text-secondary">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-16 px-1.5 py-0.5 text-right border border-savora-border rounded outline-none font-mono"
                />
              </div>

              <div className="flex justify-between text-savora-text-secondary">
                <span>GST Tax (5%)</span>
                <span className="font-mono">₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-savora-text-secondary pb-2 border-b border-savora-border/40">
                <span>Round Off</span>
                <span className="font-mono">₹{roundOff >= 0 ? `+${roundOff}` : roundOff}</span>
              </div>

              <div className="bg-savora-brown text-white p-3 rounded-2xl flex justify-between items-center font-bold">
                <span className="uppercase text-[9px] tracking-wider">Grand Total</span>
                <span className="text-base font-heading font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Type */}
          <div className="bg-white border border-savora-border rounded-3xl p-5 shadow-sm space-y-2.5 shrink-0">
            <h3 className="text-[10px] uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border pb-1.5">Payment Method</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Cash', 'Online', 'Mixed'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  className={`py-2 border rounded-xl font-bold text-[9px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                    paymentType === type ? 'border-savora-brown bg-savora-peach/30 text-savora-brown' : 'border-savora-border bg-white text-savora-text-secondary'
                  }`}
                >
                  {type === 'Cash' ? <CircleDollarSign size={14} className="mb-0.5" /> : <CreditCard size={14} className="mb-0.5" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 select-none shrink-0 pt-2 border-t border-savora-border/45">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-2.5 rounded-2xl bg-savora-brown hover:bg-savora-taupe text-white font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
            >
              <Printer size={15} /> Save & Checkout
            </button>
            <button
              onClick={clearBill}
              className="w-full py-2 rounded-xl bg-white border border-savora-border hover:bg-savora-card text-savora-brown font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Terminal
            </button>
          </div>
        </div>

      </div>

      {/* 1. PAYMENT CHANNELS DIALOG MODAL (Double Space workflow) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-savora-border rounded-3xl max-w-sm w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center select-none font-heading font-semibold text-savora-brown text-xs">
              <span>Payment Confirmation Terminal</span>
              <button onClick={() => setShowPaymentModal(false)}><X size={16} /></button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <p className="text-savora-text-secondary leading-relaxed">
                Billing checkout summary. Choose payment key:
              </p>

              {/* Mock visual numeric triggers */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: '1', label: 'Cash', value: 'Cash' },
                  { key: '2', label: 'Online', value: 'Online' },
                  { key: '3', label: 'Mixed', value: 'Mixed' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPaymentType(item.value as any)}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      paymentType === item.value ? 'border-savora-brown bg-savora-peach/30 text-savora-brown font-bold' : 'border-savora-border bg-white text-savora-text-secondary'
                    }`}
                  >
                    <kbd className="px-1.5 py-0.2 bg-savora-card border border-savora-border rounded font-mono font-bold text-[9px] mb-1">{item.key}</kbd>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="bg-savora-card p-3.5 rounded-2xl space-y-2 border border-savora-border/60">
                <div className="flex justify-between font-medium"><span>Gross total value:</span><span className="font-bold text-savora-brown font-mono">₹{grandTotal.toFixed(2)}</span></div>
                <div className="flex justify-between font-medium"><span>Cashier Name:</span><span className="font-semibold text-savora-text-primary">{user?.name}</span></div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-savora-border flex justify-end gap-2 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold shadow cursor-pointer"
                >
                  Confirm Checkout [Enter]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINT RECEIPT PREVIEW MODAL */}
      {showPrintModal && lastBill && (
        <div className="print-modal-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          
          <div className="print-modal-content bg-white rounded-3xl shadow-2xl border border-savora-border max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="no-print p-4 bg-savora-card border-b border-savora-border flex justify-between items-center shrink-0">
              <span className="font-heading font-semibold text-sm text-savora-brown">Thermal Receipt Print preview</span>
              <button onClick={() => setShowPrintModal(false)} className="text-savora-text-secondary hover:text-savora-brown"><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-savora-card/10">
              <div className="no-print bg-white p-3 rounded-2xl border border-savora-border space-y-2">
                <label className="block text-[10px] font-bold text-savora-text-secondary uppercase">Receipt Sizing Width</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setReceiptSize('58mm')} className={`py-1.5 border rounded-xl text-xs font-bold ${receiptSize === '58mm' ? 'border-savora-brown bg-savora-peach/30 text-savora-brown' : 'border-savora-border hover:bg-savora-card'}`}>58mm paper</button>
                  <button onClick={() => setReceiptSize('80mm')} className={`py-1.5 border rounded-xl text-xs font-bold ${receiptSize === '80mm' ? 'border-savora-brown bg-savora-peach/30 text-savora-brown' : 'border-savora-border hover:bg-savora-card'}`}>80mm paper</button>
                </div>
              </div>

              {/* Receipt markup paper container */}
              <div className="flex justify-center">
                <ThermalReceipt bill={lastBill} paperSize={receiptSize} shopSettings={shopSettings} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print p-4 bg-savora-card border-t border-savora-border flex justify-end gap-3 shrink-0 select-none">
              <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary">Close [ESC]</button>
              <button onClick={() => { window.print(); setShowPrintModal(false); codeRef.current?.focus(); }} className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold flex items-center gap-1 shadow cursor-pointer"><Printer size={14} /> Print Receipt [Enter]</button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Billing;
