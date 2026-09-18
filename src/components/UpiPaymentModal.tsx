import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { PurchaseItem } from '../types';
import { formatINR } from '../data/initialData';
import {
  X,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PurchaseItem | null;
  onPaymentSuccess: (itemId: string, method: 'GPay' | 'PhonePe' | 'Paytm' | 'BHIM', upiTxnId: string) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onPaymentSuccess,
}) => {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM'>('GPay');
  const [txnRefInput, setTxnRefInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      const defaultVpa = item.dealerUpiId || 'pacs.agri.thanjavur@sbi';
      const name = item.dealerName || 'வேளாண் இடுபொருள் அங்காடி';
      setUpiId(defaultVpa);
      setPayeeName(name);
      setTxnRefInput(`UPI-${Date.now().toString().slice(-8)}`);
      setIsCompleted(false);

      // Generate UPI Deep Link for NPCI QR specification
      generateUpiQr(defaultVpa, name, item.totalCostINR, item.tamilName || item.itemName);
    }
  }, [item, isOpen]);

  const generateUpiQr = async (vpa: string, payee: string, amount: number, note: string) => {
    try {
      const sanitizedNote = (note || 'Vivasaigalin Uzhaippu Agri Input').slice(0, 30);
      const upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
        payee
      )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(sanitizedNote)}`;

      const dataUrl = await QRCode.toDataURL(upiUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0e381f',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating UPI QR code:', err);
    }
  };

  const handleVpaChange = (newVpa: string) => {
    setUpiId(newVpa);
    if (item) {
      generateUpiQr(newVpa, payeeName, item.totalCostINR, item.tamilName || item.itemName);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleOpenUpiApp = (app: 'GPay' | 'PhonePe' | 'Paytm' | 'BHIM') => {
    if (!item) return;
    setSelectedApp(app);
    const sanitizedNote = (item.tamilName || item.itemName).slice(0, 30);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${item.totalCostINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent(sanitizedNote)}`;

    // Trigger intent URL
    window.location.href = upiUrl;
  };

  const handleConfirmPaid = () => {
    if (!item) return;

    // Trigger celebratory confetti animation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#166534', '#eab308', '#22c55e', '#15803d', '#facc15'],
    });

    setIsCompleted(true);
    onPaymentSuccess(item.id, selectedApp, txnRefInput || `UPI-${Date.now().toString().slice(-8)}`);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-800/30 space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-green-600 flex items-center justify-center text-amber-300 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-950 font-tamil">
                  UPI & GPay கட்டணம் (Instant Pay)
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  NPCI 2.0
                </span>
              </div>
              <p className="text-xs text-stone-500">விவசாயிகளின் உழைப்பு • நேரடி யுபிஐ பணப் பரிவர்த்தனை</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-amber-50/50 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
                பொருள் / Product Name
              </span>
              <h4 className="text-sm font-bold text-stone-900 font-tamil">
                {item.tamilName || item.itemName}
              </h4>
              <p className="text-xs text-stone-500">
                {item.quantity} {item.unit} @ {formatINR(item.unitPriceINR)}/{item.unit}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                செலுத்த வேண்டிய தொகை
              </span>
              <span className="text-xl font-extrabold text-emerald-900 font-mono">
                {formatINR(item.totalCostINR)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs text-stone-600">
            <span>வணிகர் / Dealer: <strong className="text-stone-800">{item.dealerName}</strong></span>
            <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 text-[11px] font-semibold">
              ரசீது: {item.invoiceNumber || 'INV-DIRECT'}
            </span>
          </div>
        </div>

        {/* Successful confirmation view */}
        {isCompleted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-emerald-950 font-tamil">
              கட்டணம் வெற்றிகரமாக பதிவு செய்யப்பட்டது!
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Paid via <strong>{selectedApp}</strong>. பரிவர்த்தனை எண் <strong>{txnRefInput}</strong> கணக்குப் பதிவேட்டில் இணைக்கப்பட்டுள்ளது.
            </p>
          </div>
        ) : (
          <>
            {/* Quick UPI App Launch Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block font-tamil">
                விருப்பமான யுபிஐ செயலியைத் தேர்ந்தெடுக்கவும் (Choose UPI App):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp('GPay')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedApp === 'GPay'
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                      : 'border-stone-200 hover:border-blue-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-600 mb-1">
                    G
                  </div>
                  <span className="text-xs font-bold text-stone-900">Google Pay</span>
                  <span className="text-[10px] text-blue-700 font-semibold">GPay App</span>
                </button>

                {/* PhonePe */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp('PhonePe')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedApp === 'PhonePe'
                      ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                      : 'border-stone-200 hover:border-purple-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-700 text-white shadow-xs flex items-center justify-center text-xs font-bold mb-1">
                    पे
                  </div>
                  <span className="text-xs font-bold text-stone-900">PhonePe</span>
                  <span className="text-[10px] text-purple-700 font-semibold">போன்பே</span>
                </button>

                {/* Paytm */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp('Paytm')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedApp === 'Paytm'
                      ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                      : 'border-stone-200 hover:border-sky-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#002e6e] text-white shadow-xs flex items-center justify-center text-[11px] font-extrabold mb-1">
                    Pay
                  </div>
                  <span className="text-xs font-bold text-stone-900">Paytm</span>
                  <span className="text-[10px] text-sky-700 font-semibold">பேடிஎம்</span>
                </button>

                {/* BHIM UPI */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp('BHIM')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedApp === 'BHIM'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-amber-300 shadow-xs flex items-center justify-center text-xs font-bold mb-1">
                    भीम
                  </div>
                  <span className="text-xs font-bold text-stone-900">BHIM UPI</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">பீம் யுபிஐ</span>
                </button>
              </div>
            </div>

            {/* QR Code & Scan Section */}
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/70 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative p-2 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="UPI QR Code"
                    className="w-36 h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-36 h-36 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                    QR Code Loading...
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-1 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-white text-[9px] font-bold">
                    Scan & Pay ₹{item.totalCostINR}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs w-full">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>நேரடி கியூஆர் குறியீடு (Scan via any UPI App)</span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  உங்கள் மொபைலில் Google Pay, PhonePe அல்லது Paytm செயலியை திறந்து இந்த QR-ஐ ஸ்கேன் செய்து உடனடியாக பணம் செலுத்தலாம்.
                </p>

                {/* Dealer UPI VPA */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-medium text-stone-600 block">
                    வணிகர் யுபிஐ ஐடி (Merchant UPI ID):
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => handleVpaChange(e.target.value)}
                      placeholder="dealer@upi"
                      className="w-full bg-white border border-stone-300 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      title="Copy UPI ID"
                      className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg cursor-pointer transition-colors shrink-0"
                    >
                      {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Launch Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleOpenUpiApp(selectedApp)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-tamil"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>{selectedApp} செயலியில் நேரடியாக செலுத்தவும் (Pay {formatINR(item.totalCostINR)})</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>
            </div>

            {/* Confirm Paid Offline/Online */}
            <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">பணம் செலுத்திய பின் உறுதிப்படுத்தவும்:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <input
                  type="text"
                  value={txnRefInput}
                  onChange={(e) => setTxnRefInput(e.target.value)}
                  placeholder="UPI Txn Ref (optional)"
                  className="bg-white border border-stone-300 px-2 py-1.5 rounded-lg text-[11px] font-mono w-32 outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-colors shrink-0 flex items-center gap-1 font-tamil"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>செலுத்திவிட்டேன் (Paid)</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
