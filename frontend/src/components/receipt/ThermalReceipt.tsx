import React from 'react';

interface ThermalReceiptProps {
  bill: any;
  paperSize: '58mm' | '80mm';
  shopSettings: {
    name: string;
    subtitle: string;
    address: string;
    phone: string;
    gstin: string;
    footer: string;
  };
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill, paperSize, shopSettings }) => {
  if (!bill) return null;

  return (
    <div
      id="print-receipt-paper-wrapper"
      style={{ width: paperSize === '58mm' ? '240px' : '320px', display: 'block' }}
      className="bg-white border border-dashed border-gray-400 p-4 shadow-lg text-black font-mono text-[11px] leading-relaxed mx-auto text-left"
    >
      <div className="text-center space-y-0.5 mb-3">
        <h2 className="font-bold text-sm tracking-wide uppercase">{shopSettings.name}</h2>
        <p className="text-[9px]">{shopSettings.subtitle}</p>
        <p className="text-[9px] max-w-[250px] mx-auto">{shopSettings.address}</p>
        <p className="text-[9px]">Ph: {shopSettings.phone}</p>
        {shopSettings.gstin && <p className="text-[9px]">GST: {shopSettings.gstin}</p>}
      </div>

      <div className="border-t border-b border-dashed border-gray-400 py-1.5 my-2 space-y-0.5 text-[9px]">
        <div className="flex justify-between">
          <span>BILL NO: {bill.billNumber || bill.bill_number}</span>
          <span>DATE: {new Date(bill.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>CASHIER: {bill.cashier_name}</span>
          <span>TIME: {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <table className="w-full text-left my-2 text-[9px]">
        <thead>
          <tr className="border-b border-dashed border-gray-400 font-bold">
            <th>ITEM</th>
            <th className="text-center">QTY</th>
            <th className="text-right">AMT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-gray-200">
          {bill.items?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="py-1 truncate max-w-[120px]">{item.name || item.product_name}</td>
              <td className="py-1 text-center font-bold">{item.quantity}</td>
              <td className="py-1 text-right font-bold">₹{item.quantity * (item.price || item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-400 pt-1.5 my-2 space-y-0.5 text-[9px] text-right font-bold">
        <div className="flex justify-between"><span>Subtotal:</span><span>₹{bill.subtotal?.toFixed(2)}</span></div>
        {bill.discount > 0 && <div className="flex justify-between"><span>Discount:</span><span>-₹{bill.discount?.toFixed(2)}</span></div>}
        <div className="flex justify-between"><span>GST Tax (5%):</span><span>₹{bill.tax?.toFixed(2)}</span></div>
        <div className="flex justify-between border-t border-dashed border-gray-400 pt-1 text-[11px]"><span>GRAND TOTAL:</span><span>₹{bill.grand_total?.toFixed(2)}</span></div>
        <div className="flex justify-between font-normal text-[8px] italic pt-1 border-b border-dashed border-gray-400 pb-1">
          <span>PAYMENT MODE:</span><span className="uppercase font-bold">{bill.payment_type}</span>
        </div>
      </div>

      <p className="text-center text-[9px] mt-4 italic">{shopSettings.footer}</p>
    </div>
  );
};

export default ThermalReceipt;
