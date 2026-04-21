import React, { useState } from 'react';
import { CreditCard, X, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/globals.css';

const PACKAGES = [
  { id: 1, vnd: 10000, coins: 100000, isBest: false, bonus: 0 },
  { id: 2, vnd: 20000, coins: 220000, isBest: false, bonus: 10 },
  { id: 3, vnd: 50000, coins: 600000, isBest: true, bonus: 20 },
  { id: 4, vnd: 100000, coins: 1500000, isBest: false, bonus: 50 },
  { id: 5, vnd: 200000, coins: 3500000, isBest: false, bonus: 75 },
  { id: 6, vnd: 500000, coins: 10000000, isBest: false, bonus: 100 },
];

export default function TopUpModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (pkg) => {
    try {
      setIsProcessing(true);
      toast('Generating PayOS QR Code...', { icon: '🔄', duration: 2000 });
      
      const res = await api.post(`/payments/payos/create?packageId=${pkg.id}`);
      if (res.status === 200 && res.data.checkoutUrl) {
        // Redirect to PayOS secure checkout portal
        window.location.href = res.data.checkoutUrl;
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to initialize payment gateway.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-content topup-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>
          <X size={24} />
        </button>
        
        <div className="topup-header">
          <div className="topup-icon-wrapper">
            <CreditCard size={32} className="topup-icon" />
          </div>
          <h2>BANK & STORE (PAYOS)</h2>
          <p>Scan VietQR securely via PayOS Open Banking.</p>
          <div className="current-balance">
            <span>Balance:</span>
            <span className="balance-value">
              <span className="coin-icon">₡</span> 
              {user?.coins?.toLocaleString()}
            </span>
          </div>
        </div>

        {isProcessing ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={48} className="spinner" style={{ margin: '0 auto 20px', color: '#ffba00' }} />
            <h3>Routing to Secure Gateway...</h3>
            <p style={{ color: '#aaa' }}>Please wait while we prepare your VietQR code.</p>
          </div>
        ) : (
          <div className="topup-packages">
            {PACKAGES.map(pkg => (
              <div key={pkg.id} className={`package-card ${pkg.isBest ? 'popular' : ''}`}>
                {pkg.isBest && <div className="popular-badge"><Zap size={14} /> BEST VALUE</div>}
                {pkg.bonus > 0 && <div className="bonus-badge">+{pkg.bonus}% BONUS</div>}
                
                <div className="pack-coins">
                  <span className="coin-icon" style={{ fontSize: '24px' }}>₡</span>
                  <h3>{pkg.coins.toLocaleString()}</h3>
                </div>
                
                <button 
                  className="btn btn-gold btn-full buy-btn"
                  onClick={() => handlePayment(pkg)}
                >
                  {pkg.vnd.toLocaleString()} VND
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="topup-footer">
          <ShieldCheck size={16} />
          <span>Transactions are automatically processed and verified by PayOS.</span>
        </div>
      </div>
    </div>
  );
}
