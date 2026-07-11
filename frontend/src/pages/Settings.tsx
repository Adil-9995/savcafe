import React, { useState, useEffect } from 'react';
import { Save, Printer, FileText, CheckCircle2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  // Business Profile Form
  const [shopName, setShopName] = useState('Savora Cafe & Bakers');
  const [subtitle, setSubtitle] = useState('Bakery & Ice Bay Ice Creams');
  const [address, setAddress] = useState('Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gstin, setGstin] = useState('32AAAAA1111A1Z1');
  const [footerMessage, setFooterMessage] = useState('Thank you for visiting! Come back soon.');

  // Printer Settings
  const [printerName, setPrinterName] = useState('Thermal Receipt-58');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [fontSize, setFontSize] = useState('11px');
  const [margins, setMargins] = useState('10px');
  const [autoPrint, setAutoPrint] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load existing settings if available
    const saved = localStorage.getItem('savora_shop_settings');
    if (saved && !saved.includes('Beach Road') && !saved.includes('Kochi')) {
      const data = JSON.parse(saved);
      setShopName(data.name || 'Savora Cafe & Bakers');
      setSubtitle(data.subtitle || 'Bakery & Ice Bay Ice Creams');
      setAddress(data.address || 'Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002');
      setPhone(data.phone || '+91 98765 43210');
      setGstin(data.gstin || '32AAAAA1111A1Z1');
      setFooterMessage(data.footer || 'Thank you for visiting! Come back soon.');
    } else {
      // Migrate / reset defaults
      setShopName('Savora Cafe & Bakers');
      setAddress('Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002');
      const shopData = {
        name: 'Savora Cafe & Bakers',
        subtitle: 'Bakery & Ice Bay Ice Creams',
        address: 'Asramam, Near Younis Convention Centre, Kollam, Kerala, Pincode: 691002',
        phone: '+91 98765 43210',
        gstin: '32AAAAA1111A1Z1',
        footer: 'Thank you for visiting! Come back soon.'
      };
      localStorage.setItem('savora_shop_settings', JSON.stringify(shopData));
    }

    const savedPrinter = localStorage.getItem('savora_printer_settings');
    if (savedPrinter) {
      const data = JSON.parse(savedPrinter);
      setPrinterName(data.printerName || '');
      setPaperWidth(data.paperWidth || '80mm');
      setFontSize(data.fontSize || '11px');
      setMargins(data.margins || '10px');
      setAutoPrint(data.autoPrint || false);
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shopData = {
      name: shopName,
      subtitle,
      address,
      phone,
      gstin,
      footer: footerMessage
    };
    localStorage.setItem('savora_shop_settings', JSON.stringify(shopData));

    const printerData = {
      printerName,
      paperWidth,
      fontSize,
      margins,
      autoPrint
    };
    localStorage.setItem('savora_printer_settings', JSON.stringify(printerData));

    setStatusMessage('Settings saved and synchronized successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleTestPrint = () => {
    alert('Simulating receipt test print command to thermal layout...');
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl">
      
      {/* Module Header */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            POS System Settings
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Customize shop receipts and configure thermal hardware.</p>
        </div>

        {statusMessage && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 text-savora-success text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 size={14} />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* LEFT CARD: Business Information */}
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2 flex items-center gap-1">
            <FileText size={14} /> Business Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Shop Name *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown font-semibold text-savora-text-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Subtitle Banner</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Contact Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={2}
                className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary leading-relaxed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Receipt Footer Announcement</label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
              />
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Printer Configurations */}
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2 flex items-center gap-1">
              <Printer size={14} /> Printer Layout & Sizing
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Receipt Printer Name</label>
                <input
                  type="text"
                  value={printerName}
                  onChange={(e) => setPrinterName(e.target.value)}
                  placeholder="e.g. POS-58 Thermal"
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Paper Layout Width *</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      paperWidth === '58mm'
                        ? 'border-savora-brown bg-savora-peach/30 text-savora-brown font-bold'
                        : 'border-savora-border bg-white text-savora-text-secondary hover:bg-savora-card'
                    }`}
                  >
                    58 mm Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      paperWidth === '80mm'
                        ? 'border-savora-brown bg-savora-peach/30 text-savora-brown font-bold'
                        : 'border-savora-border bg-white text-savora-text-secondary hover:bg-savora-card'
                    }`}
                  >
                    80 mm Receipt
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Font Size (CSS)</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white text-savora-text-primary"
                  >
                    <option value="9px">9px (Compact)</option>
                    <option value="11px">11px (Normal)</option>
                    <option value="12px">12px (Readable)</option>
                    <option value="14px">14px (Large)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Page Margin (CSS)</label>
                  <select
                    value={margins}
                    onChange={(e) => setMargins(e.target.value)}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/35 outline-none focus:bg-white text-savora-text-primary"
                  >
                    <option value="0">None (0px)</option>
                    <option value="5px">Narrow (5px)</option>
                    <option value="10px">Default (10px)</option>
                    <option value="15px">Wide (15px)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <label className="font-semibold text-savora-text-primary">Auto-Print receipts on checkout</label>
                  <p className="text-[10px] text-savora-text-secondary">Triggers system print automatically on checkout.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="rounded text-savora-brown focus:ring-savora-brown border-savora-border w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-savora-border flex justify-end gap-3 select-none">
            <button
              type="button"
              onClick={handleTestPrint}
              className="px-4 py-2.5 border border-savora-border bg-white text-savora-brown font-semibold rounded-xl hover:bg-savora-card flex items-center gap-1 transition-all cursor-pointer"
            >
              <Printer size={14} /> Send Test Print
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl shadow-md shadow-savora-brown/10 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Save size={14} /> Save Configuration
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default SettingsPage;
