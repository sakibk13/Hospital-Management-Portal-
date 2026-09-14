import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../components/styles/BuyMedicine.css';
import {
  FaSearch,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaTrash,
  FaCheckCircle,
  FaShieldAlt,
  FaReceipt,
  FaPills,
  FaBuilding
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';

const CART_STORAGE_KEY = 'hw_pharmacy_cart';

const playAudio = (path) => {
  try {
    const audio = new Audio(path);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch (e) {}
};

const BuyMedicine = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [patientDetails, setPatientDetails] = useState({
    name: storage.getItem('patientName') || '',
    email: storage.getItem('patientEmail') || '',
    phoneNumber: '',
    address: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const medicinesPerPage = 8;
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const getMedId = (m) => m?._id || m?.id;

  const resolveMedImg = (img) => {
    if (!img) return '/default-image.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.startsWith('/') ? img : `/${img}`;
  };

  // Fetch medicines and sync initial cart
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('/api/medicines');
        const list = Array.isArray(response.data) ? response.data : [];
        setMedicines(list);
        setFilteredMedicines(list);

        // Load cart from storage
        const savedCartStr = storage.getItem(CART_STORAGE_KEY);
        if (savedCartStr) {
          try {
            const parsed = JSON.parse(savedCartStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSelectedMedicines(
                parsed.map((item) => ({
                  medicineId: item.medicineId,
                  quantity: item.quantity,
                }))
              );
            }
          } catch (e) {}
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        toast.error('Could not load medicines inventory.');
      }
    };

    fetchMedicines();
  }, []);

  // Update localStorage whenever selectedMedicines changes
  useEffect(() => {
    if (medicines.length === 0) return;
    const cartFormat = selectedMedicines.map((item) => {
      const med = medicines.find((m) => getMedId(m) === item.medicineId);
      return {
        medicineId: item.medicineId,
        medicine: med,
        quantity: item.quantity,
      };
    });
    try {
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(cartFormat));
      window.dispatchEvent(new Event('hw-cart-updated'));
    } catch (e) {}
  }, [selectedMedicines, medicines]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = medicines.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        (m.genericName || '').toLowerCase().includes(term) ||
        (m.manufacturer || '').toLowerCase().includes(term)
    );
    setFilteredMedicines(filtered);
    setCurrentPage(1);
  };

  const handleQuantityChange = (medicineId, change) => {
    setSelectedMedicines((prev) => {
      const index = prev.findIndex((item) => item.medicineId === medicineId);
      if (index === -1) return prev;

      const newQuantity = Math.max(prev[index].quantity + change, 0);
      if (newQuantity === 0) {
        return prev.filter((item) => item.medicineId !== medicineId);
      }

      const med = medicines.find((m) => getMedId(m) === medicineId);
      if (med && newQuantity > (med.strip || 999)) {
        toast.info(`Max available stock is ${med.strip} units.`);
        return prev;
      }

      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQuantity };
      return updated;
    });
  };

  const handleAddMedicine = (medicine) => {
    const medId = getMedId(medicine);
    if (!medId) return;

    if (medicine.strip <= 0) {
      toast.error(`${medicine.name} is currently out of stock.`);
      return;
    }

    setSelectedMedicines((prev) => {
      const existingItem = prev.find((item) => item.medicineId === medId);
      if (existingItem) {
        if (existingItem.quantity >= medicine.strip) {
          toast.info(`Only ${medicine.strip} units available.`);
          return prev;
        }
        return prev.map((item) =>
          item.medicineId === medId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { medicineId: medId, quantity: 1 }];
    });
    toast.success(`Added ${medicine.name} to checkout cart!`);
    playAudio('/assets/success.mp3');
  };

  const handleRemoveMedicine = (medicineId) => {
    setSelectedMedicines((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  useEffect(() => {
    const total = selectedMedicines.reduce((acc, item) => {
      const medicine = medicines.find((med) => getMedId(med) === item.medicineId);
      return acc + (medicine ? Number(medicine.price || 0) * item.quantity : 0);
    }, 0);
    setTotalBill(total);
  }, [selectedMedicines, medicines]);

  const deliveryFee = totalBill >= 300 || totalBill === 0 ? 0 : 30;
  const grandTotal = totalBill + deliveryFee;

  const handleSubmit = async () => {
    if (selectedMedicines.length === 0) {
      toast.error('Your cart is empty. Please add medicines first.');
      return;
    }
    if (
      !patientDetails.name ||
      !patientDetails.email ||
      !patientDetails.phoneNumber ||
      !patientDetails.address
    ) {
      toast.error('Please fill in all recipient and delivery details.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/medicineBill/buy', {
        ...patientDetails,
        selectedMedicines,
      });

      const orderReceipt = {
        billId: response.data?.bill?._id || `ORD-${Date.now().toString().slice(-6)}`,
        name: patientDetails.name,
        address: patientDetails.address,
        phoneNumber: patientDetails.phoneNumber,
        total: grandTotal,
        itemsCount: selectedMedicines.reduce((a, b) => a + b.quantity, 0),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setConfirmedOrder(orderReceipt);
      setSelectedMedicines([]);
      try {
        storage.removeItem(CART_STORAGE_KEY);
      } catch (e) {}

      playAudio('/assets/success.mp3');
      toast.success('Order placed successfully!', { title: 'Order Completed' });
    } catch (error) {
      console.error('Error submitting purchase:', error);
      const errText = error.response?.data?.message || 'Error processing purchase.';
      toast.error(errText);
      playAudio('/assets/error.mp3');
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastMedicine = currentPage * medicinesPerPage;
  const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstMedicine, indexOfLastMedicine);
  const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);

  return (
    <div className="buy-medicine">
      <Helmet>
        <title>Express Checkout - HealingWave Pharmacy</title>
      </Helmet>

      <div style={{ width: '100%', maxWidth: '1280px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <Link to="/pharmacy" className="back-home-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>
            <FaArrowLeft /> Back to Pharmacy Catalog
          </Link>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            <FaShieldAlt style={{ color: '#0f766e', marginRight: '6px' }} />
            Hospital Verified E-Prescription Dispatch
          </span>
        </div>

        <div className="buy-medicine-header">
          <h1>Express Pharmacy Checkout</h1>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 24px' }}>
            Review your selected medications, enter patient delivery address, and confirm direct doorstep dispatch.
          </p>
        </div>

        <div className="buy-medicine-container">
          {/* Left Column: Quick Catalog Browser & Selector */}
          <div className="medicine-search-section">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px', color: '#0f172a' }}>
              Add More Medicines to Order
            </h3>

            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by brand name, generic formulation, or manufacturer..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="medicine-list">
              {currentMedicines.map((medicine) => {
                const medId = getMedId(medicine);
                const isSelected = selectedMedicines.find((item) => item.medicineId === medId);
                const isOutOfStock = medicine.strip <= 0;

                return (
                  <div key={medId} className="medicine-item">
                    {medicine.image && (
                      <div
                        className="medicine-thumb-wrap"
                        style={{
                          width: '100%',
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <img
                          src={resolveMedImg(medicine.image)}
                          alt={medicine.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.src = '/default-image.png'; }}
                        />
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 2px', color: '#0f172a' }}>
                        {medicine.name}
                        {medicine.strength && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px', fontWeight: 600 }}>
                            {medicine.strength}
                          </span>
                        )}
                      </h4>
                      <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#0f766e', fontWeight: 600 }}>
                        {medicine.genericName || medicine.dosageForm}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                        {medicine.manufacturer}
                      </p>
                    </div>

                    <div className="medicine-price-row">
                      <span className="medicine-price-tag">৳ {Number(medicine.price).toFixed(2)}</span>
                      {isOutOfStock ? (
                        <button className="add-btn" disabled style={{ background: '#cbd5e1', cursor: 'not-allowed' }}>
                          Out of Stock
                        </button>
                      ) : isSelected ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(medId, -1)}
                          >
                            <FaMinus size={10} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{isSelected.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(medId, 1)}
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => handleAddMedicine(medicine)}>
                          + Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={`page-btn ${index + 1 === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Cart Breakdown and Checkout Info */}
          <div className="cart-details-section">
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaShoppingCart style={{ color: '#0f766e' }} />
                Your Order ({selectedMedicines.reduce((a, b) => a + b.quantity, 0)})
              </span>
              {selectedMedicines.length > 0 && (
                <button
                  onClick={() => setSelectedMedicines([])}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear All
                </button>
              )}
            </h2>

            <div className="selected-medicines" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {selectedMedicines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                  <FaShoppingCart style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#cbd5e1' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Your checkout basket is empty</p>
                  <p style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>Select medicines from the left panel or visit the pharmacy catalog.</p>
                </div>
              ) : (
                selectedMedicines.map((item) => {
                  const medicine = medicines.find((med) => getMedId(med) === item.medicineId);
                  const lineTotal = (Number(medicine?.price || 0) * item.quantity).toFixed(2);

                  return (
                    <div key={item.medicineId} className="selected-medicine">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{medicine?.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>
                            ({medicine?.strength})
                          </span>
                        </div>
                        <strong style={{ color: '#0f766e' }}>৳ {lineTotal}</strong>
                      </div>

                      <div className="quantity-control" style={{ justifyContent: 'space-between', margin: '8px 0 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.medicineId, -1)}
                          >
                            <FaMinus size={10} />
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800 }}>
                            {item.quantity}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.medicineId, 1)}
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveMedicine(item.medicineId)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                          title="Remove item"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedMedicines.length > 0 && (
              <div className="cart-checkout-form" style={{ marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span>Medicines Subtotal</span>
                    <strong>৳ {totalBill.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span>Delivery Charge</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `৳ ${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, borderTop: '1px dashed #cbd5e1', paddingTop: '8px', color: '#0f172a' }}>
                    <span>Total Bill</span>
                    <span style={{ color: '#0f766e' }}>৳ {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>
                  Recipient & Delivery Information
                </h4>

                <div className="patient-details">
                  <input
                    type="text"
                    required
                    placeholder="Patient / Recipient Full Name *"
                    value={patientDetails.name}
                    onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Notification Email Address *"
                    value={patientDetails.email}
                    onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Contact Phone Number (+880...) *"
                    value={patientDetails.phoneNumber}
                    onChange={(e) => setPatientDetails({ ...patientDetails, phoneNumber: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full Delivery Address (Street, Apartment, Area, City) *"
                    value={patientDetails.address}
                    onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>
                    Select Payment Method:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'cod', label: '💵 Cash on Delivery' },
                      { id: 'wallet', label: '📱 bKash / Nagad' },
                      { id: 'card', label: '🏥 Health Card' },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        style={{
                          border: paymentMethod === opt.id ? '2px solid #0f766e' : '1px solid #e2e8f0',
                          background: paymentMethod === opt.id ? '#f0fdfa' : '#ffffff',
                          color: paymentMethod === opt.id ? '#0f766e' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textAlign: 'center',
                          padding: '8px 4px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: '#0f766e',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                  }}
                >
                  {loading ? 'Submitting Purchase...' : `Confirm & Place Order • ৳ ${grandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {confirmedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 2000,
          }}
          onClick={() => setConfirmedOrder(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '30px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 16px',
              }}
            >
              <FaCheckCircle />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
              Order Confirmed!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 20px' }}>
              Thank you, <strong>{confirmedOrder.name}</strong>. Your medicines are being assembled by HealingWave certified dispensary.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                fontSize: '0.88rem',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <strong>{confirmedOrder.billId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Delivery To:</span>
                <strong style={{ maxWidth: '220px', textAlign: 'right' }}>{confirmedOrder.address}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Items Count:</span>
                <strong>{confirmedOrder.itemsCount} medicines</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '6px', fontSize: '1.05rem', fontWeight: 900 }}>
                <span>Total Amount:</span>
                <span style={{ color: '#0f766e' }}>৳ {confirmedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  navigate('/pharmacy');
                }}
                style={{
                  background: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back to Pharmacy
              </button>
              <Link
                to="/patient/medicine-bill"
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                View Patient Bills
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyMedicine;
