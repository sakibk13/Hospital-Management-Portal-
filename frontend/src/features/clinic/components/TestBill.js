import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import '../../../components/styles/TestBill.css';
import { generateTestBillPDF } from '../../../features/shared/components/utils/PDFGenerator';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';
import { 
  FaFileInvoiceDollar, FaFlask, FaUserMd, FaCreditCard, 
  FaFilePdf, FaCheckCircle, FaExclamationCircle, FaTimes, 
  FaArrowLeft, FaReceipt, FaBarcode, FaCalendarAlt, FaShieldAlt 
} from 'react-icons/fa';

const TestBill = () => {
  const [bills, setBills] = useState([]);
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null);
  const [message, setMessage] = useState('');
  const email = storage.getItem('patientEmail');

  useEffect(() => {
    fetchBillsAndCard();
  }, [email]);

  const fetchBillsAndCard = async () => {
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [billsRes, cardRes] = await Promise.allSettled([
        axios.get(`/api/testAndServicesBill/bills/${email}`),
        axios.get(`/api/healthcards/${email}`)
      ]);

      if (billsRes.status === 'fulfilled') {
        setBills(billsRes.value.data || []);
      }
      if (cardRes.status === 'fulfilled') {
        setHealthCard(cardRes.value.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (billId, totalAmount) => {
    if (!healthCard) {
      toast.error('No active Health Card found. Please activate your Health Card first.');
      return;
    }

    if (healthCard.topUpAmount < totalAmount) {
      toast.error(`Insufficient points. Card balance: ${healthCard.topUpAmount} BDT, Required: ${totalAmount} BDT`);
      return;
    }

    setPayingBillId(billId);
    try {
      const response = await axios.put(`/api/testAndServicesBill/pay/${billId}`, {
        email,
        topUpAmount: healthCard.topUpAmount
      });
      const successText = response.data.message || 'Payment successful!';
      setMessage(successText);
      toast.success(successText, { title: 'Lab Bill Paid' });

      // Update local state
      setBills(prev => prev.map(b => (b._id === billId || b.id === billId) ? { ...b, paid: true } : b));
      if (response.data.balance !== undefined) {
        setHealthCard(prev => ({ ...prev, topUpAmount: response.data.balance }));
      } else {
        setHealthCard(prev => ({ ...prev, topUpAmount: prev.topUpAmount - totalAmount }));
      }
    } catch (error) {
      const errText = error.response?.data?.error || 'Payment failed';
      setMessage(errText);
      toast.error(errText);
    } finally {
      setPayingBillId(null);
    }
  };

  const handleRemoveBill = (billId) => {
    if (window.confirm("Are you sure you want to dismiss this invoice from view?")) {
      setBills(prev => prev.filter(bill => (bill._id !== billId && bill.id !== billId)));
    }
  };

  const handleDownloadPDF = (bill) => {
    generateTestBillPDF([bill], 'testAndServices');
  };

  return (
    <div className="diagnostic-invoices-page">
      <Helmet>
        <title>Diagnostic Test Invoices & Lab Bills | Medicare Hospital</title>
      </Helmet>

      {/* Top Navigation */}
      <div className="invoice-top-nav">
        <div className="nav-container">
          <Link href="/patient" className="back-link">
            <FaArrowLeft /> Back to Patient Portal
          </Link>
          <div className="nav-support-badge">
            <FaShieldAlt /> Medical Grade Billing
          </div>
        </div>
      </div>

      <div className="invoice-main-container">
        {/* Header Hero */}
        <div className="invoice-hero-row">
          <div>
            <div className="invoice-category-chip">
              <FaFlask /> Clinical Diagnostic & Pathology
            </div>
            <h1>Diagnostic Test Invoices & Service Bills</h1>
            <p>Review itemized clinical pathology, radiology investigation orders, and settle invoices seamlessly via your Health Card.</p>
          </div>

          {/* Quick Health Card Wallet Box */}
          {healthCard && (
            <div className="health-card-wallet-widget">
              <div className="wallet-header">
                <FaCreditCard className="wallet-card-icon" />
                <span>Medicare Health Card</span>
              </div>
              <div className="wallet-balance-num">
                {Number(healthCard.topUpAmount || 0).toLocaleString()} <span className="curr">BDT</span>
              </div>
              <div className="wallet-footer">
                <span className="card-num-masked">•••• {healthCard.cardNumber?.slice(-4) || '2026'}</span>
                <Link href="/patient/healthcard" className="topup-link">+ Top Up</Link>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="invoice-alert-banner">
            <FaCheckCircle /> {message}
          </div>
        )}

        {loading && (
          <div className="invoice-loading">
            <div className="invoice-spinner" />
            <p>Loading diagnostic invoices and laboratory bills...</p>
          </div>
        )}

        {!loading && bills.length === 0 && (
          <div className="invoice-empty-state">
            <FaReceipt className="empty-receipt-icon" />
            <h3>No Diagnostic Invoices Found</h3>
            <p>You have no pending pathology, imaging, or laboratory diagnostic bills on record.</p>
            <Link href="/patient" className="return-portal-btn">Return to Dashboard</Link>
          </div>
        )}

        {/* Invoices List */}
        <div className="invoices-list-column">
          {bills.map((bill, index) => {
            const billId = bill._id || bill.id || `BILL-${index + 1}`;
            const billTotal = Number(bill.totalBill || 0);
            const isPaid = !!bill.paid;
            const isPaying = payingBillId === billId;

            return (
              <div key={billId} className={`diagnostic-invoice-card ${isPaid ? 'paid-card' : 'unpaid-card'}`}>
                {/* Invoice Ribbon Header */}
                <div className="invoice-card-header">
                  <div className="invoice-id-block">
                    <span className="inv-badge">Official Lab Invoice</span>
                    <span className="inv-number">#{billId.slice(-8).toUpperCase()}</span>
                  </div>

                  <div className="invoice-header-status-strip">
                    {isPaid ? (
                      <span className="status-badge paid">
                        <FaCheckCircle /> PAID IN FULL
                      </span>
                    ) : (
                      <span className="status-badge unpaid">
                        <FaExclamationCircle /> PAYMENT PENDING
                      </span>
                    )}
                    <button 
                      className="dismiss-inv-btn"
                      onClick={() => handleRemoveBill(billId)}
                      title="Dismiss invoice"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {/* Doctor & Patient Info Strip */}
                <div className="invoice-meta-grid">
                  <div className="meta-box doctor">
                    <span className="meta-label"><FaUserMd /> Prescribing Consultant</span>
                    <h4 className="meta-name">{bill.doctorName || 'Attending Consultant'}</h4>
                    <p className="meta-sub">{bill.doctorEmail}</p>
                  </div>
                  <div className="meta-box patient">
                    <span className="meta-label">Patient Record</span>
                    <h4 className="meta-name">{bill.patientName || 'Registered Patient'}</h4>
                    <p className="meta-sub">{bill.patientEmail} • {bill.phone || 'Phone on File'}</p>
                  </div>
                </div>

                {/* Itemized Tests Table */}
                <div className="invoice-table-wrapper">
                  <table className="diagnostic-items-table">
                    <thead>
                      <tr>
                        <th className="th-idx">#</th>
                        <th className="th-desc">Diagnostic Test / Investigation</th>
                        <th className="th-type">Category</th>
                        <th className="th-price">Charge (BDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(bill.selectedItems) && bill.selectedItems.length > 0 ? (
                        bill.selectedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="td-idx">{idx + 1}</td>
                            <td className="td-desc">
                              <span className="item-name">{item.name}</span>
                            </td>
                            <td className="td-type">
                              <span className="type-pill">{item.type || 'Clinical Test'}</span>
                            </td>
                            <td className="td-price">
                              {Number(item.price || 0).toLocaleString()} BDT
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="td-no-items">Investigation package listed on prescription.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bill Summary and Actions */}
                <div className="invoice-card-bottom">
                  <div className="invoice-payment-method">
                    <span className="method-label">Billing Support:</span>
                    <p className="method-note">Cashless settlement supported via Medicare Patient Health Card balance or Hospital Reception Cash Desk.</p>
                  </div>

                  <div className="invoice-totals-and-actions">
                    <div className="invoice-total-line">
                      <span className="total-title">Total Net Payable:</span>
                      <span className="total-figure">{billTotal.toLocaleString()} BDT</span>
                    </div>

                    <div className="invoice-actions-row">
                      <button 
                        className="btn-download-inv" 
                        onClick={() => handleDownloadPDF(bill)}
                      >
                        <FaFilePdf /> Download Receipt (PDF)
                      </button>

                      {!isPaid && (
                        <button 
                          className="btn-pay-healthcard"
                          onClick={() => handlePay(billId, billTotal)}
                          disabled={isPaying}
                        >
                          <FaCreditCard /> {isPaying ? 'Processing...' : 'Pay with Health Card'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestBill;
