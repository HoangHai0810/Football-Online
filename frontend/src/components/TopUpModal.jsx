import React, { useState } from 'react';
import { CreditCard, X, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
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
        
        <div className="topup-header" style={{ textAlign: 'center' }}>
          <div className="topup-icon-wrapper" style={{ margin: '0 auto 16px', width: '64px', height: '64px', background: 'var(--gold-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={32} style={{ color: 'var(--gold)' }} />
          </div>
          <h2>BANK & STORE</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Upgrade your squad with premium FC Coins via PayOS Secure Banking
          </p>
          
          <div className="current-balance" style={{ display: 'inline-flex', padding: '10px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: '#aaa', marginRight: '10px', fontSize: '13px' }}>Current Balance:</span>
            <span style={{ color: 'var(--gold)', fontWeight: '800' }}>
              ₡ {user?.coins?.toLocaleString()}
            </span>
          </div>
        </div>

        {isProcessing ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={56} className="spinner" style={{ margin: '0 auto 24px', color: 'var(--gold)' }} />
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px' }}>ROUTING TO SECURE GATEWAY...</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Securing your connection to PayOS VietQR...</p>
          </div>
        ) : (
          <div className="topup-packages">
            {PACKAGES.map(pkg => (
              <div key={pkg.id} className={`package-card ${pkg.isBest ? 'popular popular-card-glow' : ''}`}>
                {pkg.isBest && <div className="popular-badge">BEST VALUE</div>}
                {pkg.bonus > 0 && <div className="bonus-badge">+{pkg.bonus}% BONUS</div>}
                
                <div className="pack-coins">
                  <div className="coin-icon-gold">₡</div>
                  <h3>{pkg.coins.toLocaleString()}</h3>
                </div>
                
                <button 
                  className="btn btn-gold buy-btn"
                  onClick={() => handlePayment(pkg)}
                >
                  {pkg.vnd.toLocaleString()} VND
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="topup-footer" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#555', fontSize: '12px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
          <span>Secured by PayOS Open Banking. Transactions are instant and encrypted.</span>
        </div>
      </div>
    </div>
  );
}
