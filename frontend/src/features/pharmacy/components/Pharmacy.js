import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaArrowLeft,
  FaTimes,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheckCircle,
  FaTruck,
  FaShieldAlt,
  FaUserMd,
  FaCreditCard,
  FaFilePrescription,
  FaPills,
  FaPhoneAlt,
  FaBuilding,
  FaInfoCircle,
  FaCheck,
  FaExclamationCircle,
  FaCloudUploadAlt,
  FaReceipt,
  FaHeartbeat
} from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import '../../../components/styles/Pharmacy.css';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';

// Cart storage key
const CART_STORAGE_KEY = 'hw_pharmacy_cart';

// Audio feedback safely wrapped
const playAudio = (path) => {
  try {
    const audio = new Audio(path);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore autoplay or file error
  }
};

const Pharmacy = () => {
  const navigate = useNavigate();

  // Core Data
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedForm, setSelectedForm] = useState('All');
  const [sort, setSort] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals & Drawers
  const [selectedMed, setSelectedMed] = useState(null); // Details modal
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart drawer
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Quick Checkout modal
  const [isRxModalOpen, setIsRxModalOpen] = useState(false); // Prescription Upload modal
  const [confirmedOrder, setConfirmedOrder] = useState(null); // Success receipt modal

  // Cart State: [{ medicineId, medicine, quantity }]
  const [cart, setCart] = useState(() => {
    try {
      const saved = storage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    name: storage.getItem('patientName') || '',
    email: storage.getItem('patientEmail') || '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'cod', // 'cod' | 'card' | 'healthcard'
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Rx upload form
  const [rxForm, setRxForm] = useState({
    phone: '',
    notes: '',
    fileName: '',
  });

  // Resolve Image URL
  const resolveMedImg = (img) => {
    if (!img) return '/default-image.png';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.startsWith('/') ? img : `/${img}`;
  };

  // Sync Cart with localStorage
  useEffect(() => {
    try {
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('hw-cart-updated'));
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [cart]);

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/medicines');
        const data = Array.isArray(response.data) ? response.data : [];
        setMedicines(data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        toast.error('Unable to fetch medicine inventory. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  // Classify therapeutic category
  const getCategory = useCallback((m) => {
    const text = `${m.name || ''} ${m.genericName || ''} ${m.description || ''}`.toLowerCase();
    if (text.includes('paracetamol') || text.includes('fever') || text.includes('pain') || text.includes('tolfenamic') || text.includes('migraine')) return 'Pain & Fever';
    if (text.includes('omeprazole') || text.includes('pantoprazole') || text.includes('esomeprazole') || text.includes('ulcer') || text.includes('acid') || text.includes('gerd') || text.includes('cramps')) return 'Gastro & Acidity';
    if (text.includes('fexofenadine') || text.includes('chlorpheniramine') || text.includes('montelukast') || text.includes('allergy') || text.includes('asthma') || text.includes('cough')) return 'Allergy & Respiratory';
    if (text.includes('azithromycin') || text.includes('cefixime') || text.includes('metronidazole') || text.includes('antibiotic') || text.includes('infection')) return 'Antibiotics';
    if (text.includes('bisoprolol') || text.includes('propranolol') || text.includes('hypertension') || text.includes('blood pressure') || text.includes('heart')) return 'Cardiovascular';
    if (text.includes('metformin') || text.includes('gliclazide') || text.includes('diabetes') || text.includes('sugar')) return 'Diabetes Care';
    if (text.includes('vitamin') || text.includes('calcium') || text.includes('minerals') || text.includes('supplement') || text.includes('ascorbic')) return 'Vitamins & Supplements';
    return 'General Care';
  }, []);

  // Determine Prescription requirement
  const isRxRequired = useCallback((m) => {
    const text = `${m.name || ''} ${m.genericName || ''} ${m.description || ''}`.toLowerCase();
    return (
      text.includes('antibiotic') ||
      text.includes('cefixime') ||
      text.includes('azithromycin') ||
      text.includes('metformin') ||
      text.includes('gliclazide') ||
      text.includes('propranolol') ||
      text.includes('bisoprolol') ||
      text.includes('clonazepam') ||
      text.includes('rivotril')
    );
  }, []);

  // Unique Categories & Dosage Forms
  const categoriesList = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => set.add(getCategory(m)));
    return ['All', ...Array.from(set).sort()];
  }, [medicines, getCategory]);

  const dosageFormsList = useMemo(() => {
    const set = new Set(medicines.map((m) => m.dosageForm).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [medicines]);

  // Cart operations
  const getMedId = (m) => m?._id || m?.id;

  const getItemQuantityInCart = (medId) => {
    const item = cart.find((i) => i.medicineId === medId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (medicine, e) => {
    if (e) e.stopPropagation();
    const medId = getMedId(medicine);
    if (!medId) return;

    if (medicine.strip <= 0) {
      toast.error(`${medicine.name} is currently out of stock.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === medId);
      if (existing) {
        if (existing.quantity >= medicine.strip) {
          toast.info(`Max available stock (${medicine.strip}) reached for ${medicine.name}.`);
          return prev;
        }
        return prev.map((i) =>
          i.medicineId === medId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { medicineId: medId, medicine, quantity: 1 }];
    });

    toast.success(`Added ${medicine.name} to your cart!`);
    playAudio('/assets/success.mp3');
  };

  const handleUpdateQuantity = (medId, delta, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === medId);
      if (!existing) return prev;

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.medicineId !== medId);
      }
      const maxStock = existing.medicine?.strip || 999;
      if (newQty > maxStock) {
        toast.info(`Only ${maxStock} strips available in stock.`);
        return prev;
      }
      return prev.map((i) =>
        i.medicineId === medId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const handleRemoveFromCart = (medId, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => prev.filter((i) => i.medicineId !== medId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart Totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.medicine?.price || 0);
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const deliveryFee = cartSubtotal >= 300 || cartSubtotal === 0 ? 0 : 30;
  const cartTotalPayable = cartSubtotal + deliveryFee;
  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Filtered and Sorted Medicines
  const visibleMedicines = useMemo(() => {
    let list = medicines.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || getCategory(m) === selectedCategory;

      const matchesForm =
        selectedForm === 'All' || m.dosageForm === selectedForm;

      const matchesStock = !onlyInStock || (m.strip && m.strip > 0);

      return matchesSearch && matchesCat && matchesForm && matchesStock;
    });

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }
    return list;
  }, [medicines, searchTerm, selectedCategory, selectedForm, onlyInStock, sort, getCategory]);

  // Checkout submission
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.phoneNumber || !checkoutForm.address) {
      toast.error('Please fill in all required delivery details.');
      return;
    }

    setSubmittingOrder(true);

    try {
      const payload = {
        name: checkoutForm.name,
        email: checkoutForm.email,
        phoneNumber: checkoutForm.phoneNumber,
        address: checkoutForm.address,
        selectedMedicines: cart.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
        })),
      };

      const res = await axios.post('/api/medicineBill/buy', payload);

      // Local stock deduction
      setMedicines((prev) =>
        prev.map((m) => {
          const inCart = cart.find((i) => i.medicineId === getMedId(m));
          if (inCart) {
            return { ...m, strip: Math.max(0, (m.strip || 0) - inCart.quantity) };
          }
          return m;
        })
      );

      // Order confirmation details
      const orderSummary = {
        billId: res.data?.bill?._id || `ORD-${Date.now().toString().slice(-6)}`,
        name: checkoutForm.name,
        address: checkoutForm.address,
        phoneNumber: checkoutForm.phoneNumber,
        total: cartTotalPayable,
        itemsCount: totalCartCount,
        items: [...cart],
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setConfirmedOrder(orderSummary);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      playAudio('/assets/success.mp3');
      toast.success('Your pharmacy order has been placed successfully!', {
        title: 'Order Confirmed',
      });
    } catch (err) {
      console.error('Order submission error:', err);
      const errMsg = err.response?.data?.message || 'Failed to place order. Please check stock.';
      toast.error(errMsg);
      playAudio('/assets/error.mp3');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Prescription Upload Mock Submission
  const handleRxSubmit = (e) => {
    e.preventDefault();
    if (!rxForm.phone) {
      toast.error('Please provide your phone number for prescription verification.');
      return;
    }
    setIsRxModalOpen(false);
    playAudio('/assets/success.mp3');
    toast.success('Prescription received! A hospital pharmacist will call you within 15 minutes.', {
      title: 'Prescription Submitted',
    });
    setRxForm({ phone: '', notes: '', fileName: '' });
  };

  return (
    <div className="pharmacy-page">
      <Helmet>
        <title>Digital Pharmacy - HealingWave Hospital</title>
        <meta
          name="description"
          content="Order authentic prescription and over-the-counter medicines online from HealingWave Hospital Certified Pharmacy with express 2-hour doorstep delivery."
        />
      </Helmet>

      {/* --------------------------------------------------------
          1. Hero Banner & Brand Announcement
          -------------------------------------------------------- */}
      <section className="pharmacy-hero">
        <div className="pharmacy-hero-container">
          <div className="pharmacy-hero-topline">
            <Link to="/" className="pharmacy-back-link">
              <FaArrowLeft /> Hospital Main Portal
            </Link>
            <div className="pharmacy-live-badge">
              <span className="pharmacy-pulse-dot"></span>
              Licensed Hospital E-Pharmacy • JCI Accredited
            </div>
          </div>

          <div className="pharmacy-hero-content">
            <div className="pharmacy-hero-text">
              <h1>
                HealingWave <span>Digital Pharmacy</span>
              </h1>
              <p>
                100% genuine hospital-grade medicines, vital wellness essentials, and cold-chain
                formulations dispensed under strict clinical supervision with express doorstep delivery.
              </p>
              <div className="pharmacy-hero-actions">
                <button
                  className="btn-pharmacy-primary"
                  onClick={() => setIsRxModalOpen(true)}
                >
                  <FaFilePrescription /> Upload Doctor Prescription
                </button>
                <Link to="/doctors" className="btn-pharmacy-secondary">
                  <FaUserMd /> Consult a Doctor First
                </Link>
                <a href="tel:10666" className="btn-pharmacy-secondary">
                  <FaPhoneAlt /> Pharmacy Hotline: 10666
                </a>
              </div>
            </div>

            {/* Quick Prescription Ordering Card */}
            <div className="pharmacy-prescription-card">
              <div className="pharmacy-prescription-card-header">
                <div className="pharmacy-prescription-icon">
                  <FaFilePrescription />
                </div>
                <div>
                  <h3>Order with Prescription</h3>
                  <p>Upload your doctor's slip & relax</p>
                </div>
              </div>

              <div className="pharmacy-prescription-steps">
                <div className="rx-step">
                  <div className="rx-step-num">1</div>
                  <span>Upload Rx Slip</span>
                </div>
                <div className="rx-step">
                  <div className="rx-step-num">2</div>
                  <span>Doctor Review</span>
                </div>
                <div className="rx-step">
                  <div className="rx-step-num">3</div>
                  <span>Doorstep Delivery</span>
                </div>
              </div>

              <button
                className="btn-pharmacy-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setIsRxModalOpen(true)}
              >
                <FaCloudUploadAlt /> Quick Upload Slip
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------
          2. Trust Highlights Strip
          -------------------------------------------------------- */}
      <section className="pharmacy-trust-strip">
        <div className="pharmacy-trust-grid">
          <div className="pharmacy-trust-item">
            <div className="pharmacy-trust-icon">
              <FaTruck />
            </div>
            <div className="pharmacy-trust-text">
              <h4>Express 2-Hr Delivery</h4>
              <p>Swift temperature-controlled transit</p>
            </div>
          </div>

          <div className="pharmacy-trust-item">
            <div className="pharmacy-trust-icon">
              <FaShieldAlt />
            </div>
            <div className="pharmacy-trust-text">
              <h4>100% Genuine Medicine</h4>
              <p>Direct from verified pharma manufacturers</p>
            </div>
          </div>

          <div className="pharmacy-trust-item">
            <div className="pharmacy-trust-icon">
              <FaUserMd />
            </div>
            <div className="pharmacy-trust-text">
              <h4>Pharmacist Verified</h4>
              <p>Every dose reviewed by hospital experts</p>
            </div>
          </div>

          <div className="pharmacy-trust-item">
            <div className="pharmacy-trust-icon">
              <FaCreditCard />
            </div>
            <div className="pharmacy-trust-text">
              <h4>Flexible Payment</h4>
              <p>Cash on delivery, bKash & Health Card</p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------
          3. Main Catalog Area
          -------------------------------------------------------- */}
      <main className="pharmacy-main">
        {/* Controls: Search, In-Stock filter, Sort */}
        <div className="pharmacy-controls">
          <div className="pharmacy-search-row">
            <div className="pharmacy-search-box">
              <FaSearch className="pharmacy-search-icon" />
              <input
                type="text"
                className="pharmacy-search-input"
                placeholder="Search by brand name, generic chemical (e.g. Paracetamol), or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="pharmacy-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear Search"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="pharmacy-filter-actions">
              <label className="pharmacy-instock-toggle">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>

              <div className="pharmacy-sort-wrapper">
                <span className="pharmacy-sort-label">Sort By</span>
                <select
                  className="pharmacy-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A → Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Search Tag Pills */}
          <div className="pharmacy-quick-tags">
            <span>Popular:</span>
            {['Napa', 'Seclo', 'Monas', 'Azithral', 'Calbo-D', 'Metformin', 'Fexo'].map((tag) => (
              <button
                key={tag}
                className="pharmacy-tag-chip"
                onClick={() => setSearchTerm(tag)}
              >
                {tag}
              </button>
            ))}
            {searchTerm && (
              <button
                className="pharmacy-tag-chip"
                style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => setSearchTerm('')}
              >
                Reset Search ✕
              </button>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------
            4. Curated Therapeutic Categories Bar
            -------------------------------------------------------- */}
        <div className="pharmacy-categories-bar">
          <div className="pharmacy-categories-scroll">
            {categoriesList.map((cat) => {
              const count =
                cat === 'All'
                  ? medicines.length
                  : medicines.filter((m) => getCategory(m) === cat).length;
              return (
                <button
                  key={cat}
                  className={`pharmacy-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <FaPills style={{ fontSize: '0.8rem' }} />
                  <span>{cat}</span>
                  <span className="pharmacy-cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header: Count & Dosage Forms */}
        <div className="pharmacy-results-header">
          <div className="pharmacy-results-count">
            Showing <span>{visibleMedicines.length}</span> {visibleMedicines.length === 1 ? 'medicine' : 'medicines'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchTerm && ` for "${searchTerm}"`}
          </div>

          {dosageFormsList.length > 1 && (
            <div className="pharmacy-dosage-chips">
              {dosageFormsList.map((form) => (
                <button
                  key={form}
                  className={`pharmacy-dosage-chip ${selectedForm === form ? 'active' : ''}`}
                  onClick={() => setSelectedForm(form)}
                >
                  {form === 'All' ? 'All Forms' : form}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --------------------------------------------------------
            5. Product Cards Grid
            -------------------------------------------------------- */}
        {loading ? (
          <div className="pharmacy-empty-view">
            <div className="pharmacy-pulse-dot" style={{ margin: '0 auto 16px', width: '16px', height: '16px' }}></div>
            <h3>Loading HealingWave Pharmacy Catalog...</h3>
            <p>Fetching verified medical inventory from the hospital central dispensary.</p>
          </div>
        ) : visibleMedicines.length === 0 ? (
          <div className="pharmacy-empty-view">
            <FaExclamationCircle className="pharmacy-empty-icon" />
            <h3>No Medicines Found</h3>
            <p>
              We couldn't find any medicine matching your criteria. Try adjusting your search or clearing active filters.
            </p>
            <button
              className="btn-pharmacy-primary"
              style={{ margin: '0 auto' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedForm('All');
                setOnlyInStock(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="pharmacy-grid">
            {visibleMedicines.map((medicine) => {
              const medId = getMedId(medicine);
              const qtyInCart = getItemQuantityInCart(medId);
              const isRx = isRxRequired(medicine);
              const isOutOfStock = medicine.strip <= 0;
              const isLowStock = medicine.strip > 0 && medicine.strip <= 15;

              return (
                <div
                  key={medId}
                  className="pharmacy-card"
                  onClick={() => setSelectedMed(medicine)}
                >
                  {/* Media Header */}
                  <div className="pharmacy-card-media">
                    <img
                      src={resolveMedImg(medicine.image)}
                      alt={medicine.name}
                      className="pharmacy-card-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="pharmacy-img-fallback" style={{ display: 'none' }}>
                      <FaPills />
                    </div>

                    <div className="pharmacy-badge-group">
                      <span className="pharmacy-badge form">
                        {medicine.dosageForm || 'Medicine'}
                      </span>
                      <span className={`pharmacy-badge ${isRx ? 'rx' : 'otc'}`}>
                        {isRx ? 'Rx Required' : 'OTC'}
                      </span>
                    </div>

                    <div className="pharmacy-stock-indicator">
                      <span
                        className={`stock-dot ${
                          isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'
                        }`}
                      ></span>
                      {isOutOfStock
                        ? 'Out of Stock'
                        : isLowStock
                        ? `Low Stock (${medicine.strip})`
                        : `In Stock (${medicine.strip})`}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="pharmacy-card-body">
                    <div className="pharmacy-card-meta-top">
                      <span className="pharmacy-med-category">
                        {getCategory(medicine)}
                      </span>
                    </div>

                    <h4 className="pharmacy-med-name" title={medicine.name}>
                      {medicine.name}
                      {medicine.strength && (
                        <span className="pharmacy-strength-pill">{medicine.strength}</span>
                      )}
                    </h4>

                    <p className="pharmacy-generic-tag" title={medicine.genericName}>
                      {medicine.genericName || 'Active Formulation'}
                    </p>

                    <div className="pharmacy-manufacturer-tag">
                      <FaBuilding style={{ fontSize: '0.7rem' }} />
                      <span>{medicine.manufacturer || 'Licensed Pharmaceutical Co.'}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="pharmacy-card-action-bar">
                      <div className="pharmacy-price-block">
                        <span className="pharmacy-price-val">৳ {Number(medicine.price).toFixed(2)}</span>
                        <span className="pharmacy-price-unit">per strip/unit</span>
                      </div>

                      {/* Interactive Cart Action */}
                      {isOutOfStock ? (
                        <button className="pharmacy-add-btn disabled" disabled>
                          Out of Stock
                        </button>
                      ) : qtyInCart > 0 ? (
                        <div
                          className="pharmacy-stepper"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="pharmacy-stepper-btn"
                            onClick={(e) => handleUpdateQuantity(medId, -1, e)}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span className="pharmacy-stepper-qty">{qtyInCart}</span>
                          <button
                            className="pharmacy-stepper-btn"
                            onClick={(e) => handleUpdateQuantity(medId, 1, e)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="pharmacy-add-btn"
                          onClick={(e) => handleAddToCart(medicine, e)}
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --------------------------------------------------------
            6. Hospital Quality & Patient Support Section
            -------------------------------------------------------- */}
        <section className="pharmacy-info-section">
          <div className="pharmacy-info-banner">
            <div>
              <h3>Why Order from HealingWave Pharmacy?</h3>
              <p>
                As an integral wing of HealingWave Hospital, our online pharmacy operates under the highest
                international healthcare standards. We enforce strict cold-chain compliance, zero-counterfeit
                guarantees, and seamless synchronization with your hospital inpatient and outpatient health records.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <Link to="/patient/prescription" className="btn-pharmacy-primary">
                  <FaFilePrescription /> View My Hospital Prescriptions
                </Link>
                <Link to="/buy-medicine" className="btn-pharmacy-secondary">
                  <FaReceipt /> Go to Express Bill Checkout
                </Link>
              </div>
            </div>

            <div className="pharmacy-faq-list">
              <div className="pharmacy-faq-card">
                <h5>How do I submit an Rx prescription?</h5>
                <p>Click "Upload Doctor Prescription" at any time. Our hospital clinical team will verify your slip before packing.</p>
              </div>
              <div className="pharmacy-faq-card">
                <h5>Are your medicines stored properly?</h5>
                <p>Yes. All thermal-sensitive drugs and vaccines are strictly housed in monitored 2°C - 8°C cold rooms.</p>
              </div>
              <div className="pharmacy-faq-card">
                <h5>Can I use my HealingWave Health Card?</h5>
                <p>Yes! Simply choose "Health Card" during checkout to enjoy your direct subsidized medical benefits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------
          7. Floating Cart Pill
          -------------------------------------------------------- */}
      {cart.length > 0 && (
        <div
          className="pharmacy-floating-cart-pill"
          onClick={() => setIsCartOpen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="pharmacy-cart-icon-wrap">
            <FaShoppingCart />
            <span className="pharmacy-cart-badge-count">{totalCartCount}</span>
          </div>
          <div className="pharmacy-floating-cart-text">
            <span className="pharmacy-floating-cart-title">Your Cart</span>
            <span className="pharmacy-floating-cart-total">৳ {cartTotalPayable.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          8. Slide-Over Cart Drawer
          -------------------------------------------------------- */}
      {isCartOpen && (
        <div
          className="pharmacy-drawer-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="pharmacy-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pharmacy-drawer-header">
              <h3>
                <FaShoppingCart style={{ color: 'var(--ph-primary)' }} />
                Your Cart ({totalCartCount})
              </h3>
              <button
                className="pharmacy-drawer-close"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close Cart"
              >
                <FaTimes />
              </button>
            </div>

            <div className="pharmacy-drawer-items">
              {cart.length === 0 ? (
                <div className="pharmacy-drawer-empty">
                  <FaShoppingCart className="pharmacy-drawer-empty-icon" />
                  <h4>Your Cart is Empty</h4>
                  <p>Browse our catalog and add medicines to complete your delivery.</p>
                </div>
              ) : (
                cart.map((item) => {
                  const m = item.medicine;
                  const medId = item.medicineId;
                  const lineTotal = (Number(m?.price || 0) * item.quantity).toFixed(2);

                  return (
                    <div key={medId} className="pharmacy-cart-item">
                      <div className="pharmacy-cart-thumb">
                        <img
                          src={resolveMedImg(m?.image)}
                          alt={m?.name}
                          onError={(e) => { e.currentTarget.src = '/default-image.png'; }}
                        />
                      </div>
                      <div className="pharmacy-cart-item-info">
                        <h5 className="pharmacy-cart-item-title">{m?.name}</h5>
                        <p className="pharmacy-cart-item-meta">
                          {m?.strength} • {m?.dosageForm}
                        </p>
                        <div className="pharmacy-cart-item-bottom">
                          <span className="pharmacy-cart-item-price">৳ {lineTotal}</span>
                          <div className="pharmacy-stepper">
                            <button
                              className="pharmacy-stepper-btn"
                              onClick={() => handleUpdateQuantity(medId, -1)}
                            >
                              <FaMinus />
                            </button>
                            <span className="pharmacy-stepper-qty">{item.quantity}</span>
                            <button
                              className="pharmacy-stepper-btn"
                              onClick={() => handleUpdateQuantity(medId, 1)}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        className="pharmacy-cart-remove-btn"
                        onClick={() => handleRemoveFromCart(medId)}
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="pharmacy-drawer-footer">
                <div className="pharmacy-delivery-note">
                  <FaCheckCircle />
                  {cartSubtotal >= 300
                    ? 'Free express doorstep delivery unlocked!'
                    : `Add ৳ ${(300 - cartSubtotal).toFixed(2)} more for FREE delivery`}
                </div>

                <div className="pharmacy-bill-row">
                  <span>Subtotal</span>
                  <strong>৳ {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div className="pharmacy-bill-row">
                  <span>Standard Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `৳ ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="pharmacy-bill-row total">
                  <span>Estimated Total</span>
                  <span style={{ color: 'var(--ph-primary-dark)' }}>
                    ৳ {cartTotalPayable.toFixed(2)}
                  </span>
                </div>

                <button
                  className="btn-pharmacy-checkout"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  <FaCheck /> Proceed to Quick Checkout
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <Link
                    to="/buy-medicine"
                    style={{ fontSize: '0.82rem', color: 'var(--ph-primary)', fontWeight: 700 }}
                  >
                    Or open full billing page →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          9. Clinical Medicine Details Modal
          -------------------------------------------------------- */}
      {selectedMed && (
        <div
          className="pharmacy-modal-overlay"
          onClick={() => setSelectedMed(null)}
        >
          <div
            className="pharmacy-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="pharmacy-modal-close-btn"
              onClick={() => setSelectedMed(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="pharmacy-modal-media">
              <img
                src={resolveMedImg(selectedMed.image)}
                alt={selectedMed.name}
                className="pharmacy-modal-img"
                onError={(e) => { e.currentTarget.src = '/default-image.png'; }}
              />
            </div>

            <div className="pharmacy-modal-content">
              <div className="pharmacy-modal-tag-row">
                <span className="pharmacy-badge form">{selectedMed.dosageForm}</span>
                <span className={`pharmacy-badge ${isRxRequired(selectedMed) ? 'rx' : 'otc'}`}>
                  {isRxRequired(selectedMed) ? 'Rx Required' : 'Over the Counter (OTC)'}
                </span>
                <span className="pharmacy-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  {getCategory(selectedMed)}
                </span>
              </div>

              <h2 className="pharmacy-modal-title">
                {selectedMed.name}
                {selectedMed.strength && <small>{selectedMed.strength}</small>}
              </h2>

              <p className="pharmacy-modal-generic">
                {selectedMed.genericName || 'Active Pharmaceutical Ingredient'}
              </p>

              <div className="pharmacy-specs-table">
                <div className="pharmacy-spec-row">
                  <span>Manufacturer</span>
                  <strong>{selectedMed.manufacturer || 'Licensed Pharma'}</strong>
                </div>
                <div className="pharmacy-spec-row">
                  <span>Dosage Form</span>
                  <strong>{selectedMed.dosageForm || 'Unit'}</strong>
                </div>
                <div className="pharmacy-spec-row">
                  <span>Inventory In Stock</span>
                  <strong>{selectedMed.strip || 0} strips</strong>
                </div>
                <div className="pharmacy-spec-row">
                  <span>Storage Guideline</span>
                  <strong>Below 30°C, Dry & Protected from light</strong>
                </div>
              </div>

              {selectedMed.description && (
                <div className="pharmacy-modal-desc">
                  <strong>Clinical Usage & Indications:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selectedMed.description}</p>
                </div>
              )}

              <div className="pharmacy-modal-footer">
                <div className="pharmacy-modal-price-tag">
                  ৳ {Number(selectedMed.price).toFixed(2)}
                  <small>Price per strip/unit (incl. VAT)</small>
                </div>

                {selectedMed.strip <= 0 ? (
                  <button className="pharmacy-add-btn disabled" disabled>
                    Currently Out of Stock
                  </button>
                ) : (
                  <button
                    className="btn-pharmacy-primary"
                    onClick={() => {
                      handleAddToCart(selectedMed);
                      setIsCartOpen(true);
                      setSelectedMed(null);
                    }}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          10. Quick Checkout Modal
          -------------------------------------------------------- */}
      {isCheckoutOpen && (
        <div
          className="pharmacy-modal-overlay"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="pharmacy-checkout-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="pharmacy-modal-close-btn"
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="pharmacy-checkout-header">
              <h2>Confirm Pharmacy Order</h2>
              <p>Direct doorstep delivery by HealingWave Hospital Logistics</p>
            </div>

            <form onSubmit={handleConfirmOrder}>
              <div className="pharmacy-form-group">
                <label>Recipient / Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="pharmacy-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  />
                </div>
                <div className="pharmacy-form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1XXXXXXXXX"
                    value={checkoutForm.phoneNumber}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="pharmacy-form-group">
                <label>Complete Delivery Address *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="House, Flat / Floor, Road number, Area, City..."
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                ></textarea>
              </div>

              <div className="pharmacy-form-group">
                <label>Payment Method</label>
                <div className="pharmacy-pay-options">
                  <div
                    className={`pharmacy-pay-option ${checkoutForm.paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'cod' })}
                  >
                    💵 Cash on Delivery
                  </div>
                  <div
                    className={`pharmacy-pay-option ${checkoutForm.paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'card' })}
                  >
                    📱 bKash / Nagad
                  </div>
                  <div
                    className={`pharmacy-pay-option ${checkoutForm.paymentMethod === 'healthcard' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'healthcard' })}
                  >
                    🏥 Health Card
                  </div>
                </div>
              </div>

              {/* Order summary recap inside checkout */}
              <div className="pharmacy-receipt-card" style={{ marginBottom: '18px' }}>
                <div className="pharmacy-receipt-row">
                  <span>Selected Items ({totalCartCount})</span>
                  <strong>৳ {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div className="pharmacy-receipt-row">
                  <span>Delivery Charge</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `৳ ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="pharmacy-receipt-row" style={{ borderTop: '1px dashed var(--ph-border)', paddingTop: '6px', marginTop: '4px', fontWeight: 800 }}>
                  <span>Total Amount Payable</span>
                  <span style={{ color: 'var(--ph-primary)' }}>৳ {cartTotalPayable.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-pharmacy-checkout"
                disabled={submittingOrder}
                style={{ opacity: submittingOrder ? 0.7 : 1 }}
              >
                {submittingOrder ? 'Placing Your Order...' : `Confirm Order • ৳ ${cartTotalPayable.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          11. Prescription Upload Modal
          -------------------------------------------------------- */}
      {isRxModalOpen && (
        <div
          className="pharmacy-modal-overlay"
          onClick={() => setIsRxModalOpen(false)}
        >
          <div
            className="pharmacy-checkout-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="pharmacy-modal-close-btn"
              onClick={() => setIsRxModalOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="pharmacy-checkout-header">
              <h2>Upload Doctor's Prescription</h2>
              <p>Our licensed hospital pharmacists will review your prescription slip and prepare your medicine bundle.</p>
            </div>

            <form onSubmit={handleRxSubmit}>
              <div
                className="pharmacy-rx-upload-zone"
                onClick={() => document.getElementById('rx-file-input').click()}
              >
                <input
                  id="rx-file-input"
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setRxForm({ ...rxForm, fileName: file.name });
                  }}
                />
                <FaCloudUploadAlt className="pharmacy-rx-upload-icon" />
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700 }}>
                  {rxForm.fileName ? `Selected: ${rxForm.fileName}` : 'Click or Drag Prescription Image / PDF'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Supports clear photos, scans, or digital prescriptions (JPG, PNG, PDF up to 10MB)
                </p>
              </div>

              <div className="pharmacy-form-group">
                <label>Your Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1XXXXXXXXX"
                  value={rxForm.phone}
                  onChange={(e) => setRxForm({ ...rxForm, phone: e.target.value })}
                />
              </div>

              <div className="pharmacy-form-group">
                <label>Additional Notes / Required Days (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Please provide for 15 days, or include 1 pack of paracetamol..."
                  value={rxForm.notes}
                  onChange={(e) => setRxForm({ ...rxForm, notes: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn-pharmacy-checkout">
                <FaCheck /> Submit for Pharmacist Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          12. Order Confirmed Receipt Modal
          -------------------------------------------------------- */}
      {confirmedOrder && (
        <div
          className="pharmacy-modal-overlay"
          onClick={() => setConfirmedOrder(null)}
        >
          <div
            className="pharmacy-checkout-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pharmacy-success-box">
              <div className="pharmacy-success-badge">
                <FaCheck />
              </div>
              <h2>Order Placed Successfully!</h2>
              <p>
                Thank you, <strong>{confirmedOrder.name}</strong>. Your medicine request has been received by our hospital dispensary and is being packed.
              </p>

              <div className="pharmacy-receipt-card">
                <div className="pharmacy-receipt-row">
                  <span>Order Reference #</span>
                  <strong>{confirmedOrder.billId}</strong>
                </div>
                <div className="pharmacy-receipt-row">
                  <span>Date of Order</span>
                  <strong>{confirmedOrder.date}</strong>
                </div>
                <div className="pharmacy-receipt-row">
                  <span>Delivery Address</span>
                  <strong style={{ maxWidth: '240px', textAlign: 'right' }}>{confirmedOrder.address}</strong>
                </div>
                <div className="pharmacy-receipt-row">
                  <span>Items Count</span>
                  <strong>{confirmedOrder.itemsCount} medicines</strong>
                </div>
                <div className="pharmacy-receipt-row" style={{ borderTop: '1px dashed var(--ph-border)', paddingTop: '8px', marginTop: '6px' }}>
                  <span>Total Amount</span>
                  <strong style={{ color: 'var(--ph-primary)', fontSize: '1.1rem' }}>
                    ৳ {confirmedOrder.total.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  className="btn-pharmacy-primary"
                  onClick={() => setConfirmedOrder(null)}
                >
                  Continue Shopping
                </button>
                <Link
                  to="/patient/medicine-bill"
                  className="btn-pharmacy-secondary"
                  style={{ color: 'var(--ph-ink)', borderColor: 'var(--ph-border)' }}
                >
                  View My Bills
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
