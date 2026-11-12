import React, { useState, useEffect } from 'react';
import './App.css';

import customLogo from './Assests/logo.png.jpeg'; 

const API_BASE = 'http://localhost:5000';

function App() {
  // 1. Initial state localStorage se load karne ke liye
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('udaanBoxActiveTab') || 'browse';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

  // Selected item for Detail Modal popup
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [donateSubTab, setDonateSubTab] = useState('create'); 
  const [carouselImages] = useState([
    { 
      id: 1, 
      url: 'https://cdn.pixabay.com/photo/2018/01/27/13/48/boys-3111230_1280.jpg', 
      title: 'Share Knowledge, Spread Smiles', 
      subtitle: 'Empowering students across campuses by sharing books, notes, and study guides for free or nominal support.' 
    },
    { 
      id: 2, 
      url: 'https://cdn.pixabay.com/photo/2016/11/20/08/58/books-1842261_1280.jpg', 
      title: 'Pass Your Old Books & Notes to Juniors', 
      subtitle: 'Your old notes can be someone else roadmap to academic success. List them today!' 
    },
    { 
      id: 3, 
      url: 'https://cdn.pixabay.com/photo/2026/03/22/06/12/geralt-children-10186220_1280.jpg', 
      title: 'Sustainable Uniform Sharing Program', 
      subtitle: 'Clean uniforms, blazers, and sports kits ready to find a new home with deserving students.' 
    }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState('receiver');

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [editingId, setEditingId] = useState(null); // Edit track karne ke liye

  // Donation States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Books');
  const [condition, setCondition] = useState('Good');
  const [priceType, setPriceType] = useState('Free');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');

  // --- Helper function for changing tab and saving to localStorage ---
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem('udaanBoxActiveTab', tabName);
  };

  // --- Delete Item Function ---
  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await fetch(`${API_BASE}/items/${id}`, {
          method: 'DELETE',
        });
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item from server.");
      }
    }
  };

  // --- Edit Item Function ---
  const handleEditItem = (item) => {
    setTitle(item.title);
    setCategory(item.category);
    setCondition(item.condition);
    setPriceType(item.priceType || (item.price ? 'Paid' : 'Free'));
    setPrice(item.price || '');
    setDescription(item.description || '');
    setEditingId(item.id);
    setDonateSubTab('create');
    handleTabChange('donate');
  };

  // --- Check LocalStorage & Fetch Data on Mount ---
  useEffect(() => {
    fetchData();
    
    // Restore User session
    const savedUser = localStorage.getItem('udaanBoxUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  const fetchData = async () => {
    try {
      const [resItems, resReqs, resUsers] = await Promise.all([
        fetch(`${API_BASE}/items`),
        fetch(`${API_BASE}/requests`),
        fetch(`${API_BASE}/users`)
      ]);
      if (resItems.ok) setItems(await resItems.json());
      if (resReqs.ok) setRequests(await resReqs.json());
      if (resUsers.ok) setUsers(await resUsers.json());
    } catch (err) {
      console.error('JSON Server connection error.', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (!foundUser) { alert('Invalid email or password!'); return; }
    
    setCurrentUser(foundUser);
    setIsLoggedIn(true);
    localStorage.setItem('udaanBoxUser', JSON.stringify(foundUser));
    handleTabChange('browse');
    alert(`Welcome back, ${foundUser.name}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('udaanBoxUser');
    localStorage.removeItem('udaanBoxActiveTab');
    handleTabChange('browse');
    alert('Logged out successfully.');
  };

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let uploadedUrls = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          
          uploadedUrls.push(compressed);
          if (uploadedUrls.length === files.length) {
            setImages(prev => [...prev, ...uploadedUrls]);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newUser = { name: regName, email: regEmail, password: regPassword, phone: regPhone, address: regAddress, role: regRole };
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        alert('Registration successful! Please login.');
        handleTabChange('login');
        setRegName(''); setRegEmail(''); setRegPassword(''); setRegPhone(''); setRegAddress('');
        fetchData();
      }
    } catch (err) { alert('Server error.'); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title || images.length === 0) { alert('Please provide a title and upload at least one image.'); return; }
    const newItem = {
      title, category, condition, priceType,
      price: priceType === 'Paid' ? Number(price) : 0,
      images,
      donorId: currentUser.id || currentUser.email,
      donorName: currentUser.name, donorEmail: currentUser.email,
      donorPhone: currentUser.phone, donorAddress: currentUser.address, description
    };
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem)
      });
      if (res.ok) {
        alert('Item successfully listed on UdaanBox!');
        setTitle(''); setDescription(''); setPrice(''); setImages([]);
        handleTabChange('browse'); fetchData();
      }
    } catch (err) { alert('Error listing item.'); }
  };

  const handleRequestItem = async (item) => {
    if (!isLoggedIn) { alert('Please login as a Receiver to request items!'); handleTabChange('login'); return; }
    if (currentUser.role === 'donor') { alert('Donor accounts cannot request items.'); return; }
    const newRequest = {
      itemId: item.id, itemTitle: item.title, donorId: item.donorId, donorEmail: item.donorEmail,
      receiverName: currentUser.name, receiverEmail: currentUser.email, receiverPhone: currentUser.phone,
      receiverAddress: currentUser.address, status: 'Pending', date: new Date().toLocaleDateString()
    };
    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRequest)
      });
      if (res.ok) { 
        alert(`Request sent successfully to ${item.donorName}!`); 
        setSelectedItemModal(null);
        fetchData(); 
      }
    } catch (err) { alert('Error sending request.'); }
  };

  const handleUpdateStatus = async (reqId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/requests/${reqId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { alert(`Request status updated to: ${newStatus}`); fetchData(); }
    } catch (err) { alert('Error updating status.'); }
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.donorName.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="ecommerce-app">
      <div className="announcement-bar">
        <span>🚀 UdaanBox Advanced Portal — Share Books, Notes & Uniforms Seamlessly</span>
      </div>

      {/* Navbar */}
      <header className="e-navbar">
        <div className="e-logo-container" onClick={() => { setActiveTab('browse'); setSearchQuery(''); }}>
          <div className="circular-brand-logo">
            <img src={customLogo} alt="UdaanBox Logo" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1532012197267-da84d127e765?w=100';}} />
          </div>
          <div>
            <h1>Udaan<span>Box</span></h1>
            <p>Student Resource Hub</p>
          </div>
        </div>

        <div className="header-search">
          <span className="search-symbol">🔍</span>
          <input 
            type="text" 
            placeholder="Search books, notes, uniforms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        <nav className="e-nav-menu">
          <button className={activeTab === 'browse' ? 'nav-link active' : 'nav-link'} onClick={() => { setActiveTab('browse'); setSearchQuery(''); }}>
            Storefront
          </button>

          {isLoggedIn && currentUser.role === 'donor' && (
            <>
              <button className={activeTab === 'donate' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('donate')}>
                + List Item
              </button>
              <button className={activeTab === 'requests' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('requests')}>
                📋 Admin Requests ({requests.filter(r => r.donorEmail === currentUser.email).length})
              </button>
            </>
          )}

          {isLoggedIn && currentUser.role === 'receiver' && (
            <button className={activeTab === 'requests' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('requests')}>
              📦 My Requests ({requests.filter(r => r.receiverEmail === currentUser.email).length})
            </button>
          )}

          {isLoggedIn ? (
            <div className="user-pill">
              <div className="user-info">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.role.toUpperCase()}</span>
              </div>
              <button className="e-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <button className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</button>
              <button className="e-login-btn" onClick={() => setActiveTab('register')}>Register</button>
            </div>
          )}
        </nav>
      </header>

      {/* HERO CAROUSEL & STATS BAR: Hidden on Search */}
      {activeTab === 'browse' && !searchQuery && (
  <>
    <div className="advanced-carousel-wrapper">
      <div className="carousel-track" style={{ backgroundImage: `url(${carouselImages[currentSlide].url})` }}>
        <div className="carousel-glass-overlay">
          <div className="carousel-content">
            <span className="carousel-badge-pill">✨ COMMUNITY SHARING HUB</span>
            <h2>{carouselImages[currentSlide].title}</h2>
            <p>{carouselImages[currentSlide].subtitle}</p>
            <div className="carousel-btn-group">
              <button className="carousel-cta-primary" onClick={() => window.scrollTo({ top: 550, behavior: 'smooth' })}>
                Explore Catalog 👇
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="carousel-arrow left" onClick={prevSlide}>❮</button>
      <button className="carousel-arrow right" onClick={nextSlide}>❯</button>

      <div className="carousel-indicators">
        {carouselImages.map((_, idx) => (
          <span 
            key={idx} 
            className={currentSlide === idx ? 'indicator-dot active' : 'indicator-dot'} 
            onClick={() => setCurrentSlide(idx)}
          ></span>
        ))}
      </div>
    </div>

    <div className="impact-stats-bar">
      <div className="stat-item">
        <h3>{items.length}+</h3>
        <p>Resources Listed</p>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <h3>100%</h3>
        <p>Verified Students</p>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <h3>Zero</h3>
        <p>Hidden Costs</p>
      </div>
    </div>
  </>
)}

    {/* Main Container */}
<main className="e-main">
  {activeTab === 'browse' && (
    <div className="storefront-view">
      {!searchQuery && (
        <div className="categories-section-clean">
          <div className="categories-header-flex">
            <div className="section-title-wrap">
              <h3>Explore Categories</h3>
              <span className="section-subtitle">Find resources tailored to your curriculum</span>
            </div>
            
          </div>

          <div className="circular-categories-flex">
            {[
              { name: 'All', count: items.length, icon: '🌟', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=250' },
              { name: 'Books', count: items.filter(i => i.category === 'Books').length, icon: '📚', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=250' },
              { name: 'Notes', count: items.filter(i => i.category === 'Notes').length, icon: '📝', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=250' },
              { name: 'Uniform', count: items.filter(i => i.category === 'Uniform').length, icon: '👕', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=250' }
            ].map((cat) => (
              <div 
                key={cat.name} 
                className={selectedCategory === cat.name ? 'circular-cat-card active' : 'circular-cat-card'}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="circle-img-wrap">
                  <img src={cat.img} alt={cat.name} />
                  <span className="cat-emoji-badge">{cat.icon}</span>
                </div>
                <div className="cat-info-wrap">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">{cat.count} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
            <div className="catalog-header">
              <h3>{searchQuery ? `Search Results for "${searchQuery}"` : `Available Listings (${filteredItems.length})`}</h3>
            </div>

            {/* COMPACT & ATTRACTIVE PRODUCTS GRID */}
            <div className="e-products-grid">
              {filteredItems.length === 0 ? (
                <div className="e-empty-state">
                  <div className="empty-icon">🔍</div>
                  <h4>No items found</h4>
                  <p>Try searching with another keyword or category.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    onCardClick={() => setSelectedItemModal(item)} 
                    handleRequestItem={handleRequestItem} 
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* MODERN SPLIT-SCREEN REGISTRATION VIEW */}
        {activeTab === 'register' && (
          <div className="auth-split-container">
            <div className="auth-left-banner">
              <div className="auth-banner-content">
                <span className="auth-pill">JOIN THE COMMUNITY</span>
                <h2>Empower Education Together</h2>
                <p>Register as a Donor to share unused study materials or as a Receiver to get textbooks, notes, and uniforms instantly.</p>
              </div>
            </div>
            <div className="auth-right-form">
              <div className="auth-card-modern">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Please enter your personal details to sign up</p>

                <form onSubmit={handleRegister}>
                  <div className="input-field-group">
                    <label>Select Role</label>
                    <div className="role-selector-modern">
                      <button 
                        type="button" 
                        className={regRole === 'receiver' ? 'role-opt active' : 'role-opt'}
                        onClick={() => setRegRole('receiver')}
                      >
                        🎒 Receiver
                      </button>
                      <button 
                        type="button" 
                        className={regRole === 'donor' ? 'role-opt active' : 'role-opt'}
                        onClick={() => setRegRole('donor')}
                      >
                        🤝 Donor
                      </button>
                    </div>
                  </div>

                  <div className="input-field-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>

                  <div className="input-field-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>

                  <div className="input-field-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  </div>

                  <div className="input-field-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="9876543210" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                  </div>

                  <div className="input-field-group">
                    <label>Delivery / Pickup Address</label>
                    <textarea rows="2" placeholder="House no, Street, City" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required></textarea>
                  </div>

                  <button type="submit" className="auth-submit-btn">Create Account</button>
                </form>
                <p className="auth-redirect-text">Already have an account? <span onClick={() => setActiveTab('login')}>Sign In</span></p>
              </div>
            </div>
          </div>
        )}

        {/* MODERN SPLIT-SCREEN LOGIN VIEW */}
  {activeTab === 'login' && (
  <div className="login-wrapper">
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">UdaanBox</span>
        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <label htmlFor="loginEmail">Email Address</label>
          <div className="input-container">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input 
              id="loginEmail"
              type="email" 
              placeholder="name@example.com" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="input-group">
          <div className="label-row">
            <label htmlFor="loginPassword">Password</label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-password">Forgot?</a>
          </div>
          <div className="input-container">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input 
              id="loginPassword"
              type="password" 
              placeholder="••••••••" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="login-btn">
          Sign In
        </button>
      </form>
    </div>
  </div>
)}

       {/* DONATE / LIST ITEM VIEW WITH TWO TABS */}
{/* DONATE / LIST ITEM VIEW */}
{activeTab === 'donate' && isLoggedIn && currentUser.role === 'donor' && (
  <div className="e-donate-container">
    
    {/* TOP SWITCHER TABS (Form ke bilkul upar) */}
    <div className="donate-sub-tabs-top">
      <button 
        type="button"
        className={donateSubTab === 'create' ? 'sub-tab-btn active' : 'sub-tab-btn'} 
        onClick={() => setDonateSubTab('create')}
      >
        ➕ Add New Listing
      </button>
      <button 
        type="button"
        className={donateSubTab === 'manage' ? 'sub-tab-btn active' : 'sub-tab-btn'} 
        onClick={() => setDonateSubTab('manage')}
      >
        📦 Manage Listings ({items.filter(i => i.donorEmail === currentUser.email).length})
      </button>
    </div>

    {/* CONDITIONAL VIEW: 1. ADD / EDIT FORM OR 2. TABLE VIEW */}
    {donateSubTab === 'create' ? (
      <div className="e-form-card animate-fade">
        <div className="form-top-title">
          <h2>{editingId ? '✏️ Edit Listing' : '➕ List Item for Sharing'}</h2>
          <p>{editingId ? 'Update your item specifications below.' : 'Add item specifications and upload multiple photographs.'}</p>
        </div>

        <form onSubmit={handleAddItem}>
          <div className="e-form-group">
            <label>Item Title:</label>
            <input type="text" placeholder="e.g. Physics Quantum Series" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label>Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Books">Books</option>
                <option value="Notes">Notes</option>
                <option value="Uniform">Uniform</option>
              </select>
            </div>

            <div className="e-form-group">
              <label>Condition:</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label>Listing Type:</label>
              <select value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="Free">Free (Muft)</option>
                <option value="Paid">Paid (Nominal Price)</option>
              </select>
            </div>

            {priceType === 'Paid' && (
              <div className="e-form-group">
                <label>Price (₹):</label>
                <input type="number" placeholder="Amount in INR" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            )}
          </div>

          <div className="e-form-group">
            <label>Upload Multiple Images:</label>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImagesUpload} required={!editingId} />
            {images.length > 0 && (
              <div className="e-multi-img-preview">
                {images.map((imgSrc, idx) => (
                  <div key={idx} className="preview-thumb">
                    <img src={imgSrc} alt={`Preview ${idx}`} />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="e-form-group">
            <label>Description & Pickup Instructions:</label>
            <textarea rows="3" placeholder="Mention details..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>

          <div className="form-btn-flex">
            <button type="submit" className="e-submit-btn">
              {editingId ? 'Update Listing' : 'Publish to JSON Server'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="e-cancel-btn" 
                onClick={() => { 
                  setEditingId(null); 
                  setTitle(''); 
                  setPrice(''); 
                  setDescription(''); 
                  setImages([]); 
                  setDonateSubTab('manage'); 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    ) : (
      /* MANAGE LISTINGS TABLE VIEW */
      <div className="e-manage-card animate-fade">
        <div className="form-top-title">
          <h2>📦 Your Listed Products</h2>
          <p>Here is the table of all items you have shared with the campus community.</p>
        </div>

        <div className="table-responsive-container">
          <table className="modern-listings-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Type / Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.donorEmail === currentUser.email).length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-state">
                    📂 You haven't listed any items yet. Click on 'Add New Listing' above to start sharing!
                  </td>
                </tr>
              ) : (
                items
                  .filter(i => i.donorEmail === currentUser.email)
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="table-item-cell">
                        <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/50'} alt={item.title} className="table-thumb" />
                        <div>
                          <strong>{item.title}</strong>
                          <span className="table-subtext">{item.description ? item.description.substring(0, 30) + '...' : 'No description'}</span>
                        </div>
                      </td>
                      <td><span className="badge-cat">{item.category}</span></td>
                      <td>{item.condition || 'Good'}</td>
                      <td>
                        <span className={item.priceType === 'Free' || !item.price ? 'badge-free' : 'badge-paid'}>
                          {item.priceType === 'Free' || !item.price ? 'Free' : `₹${item.price}`}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button 
                            className="btn-action edit" 
                            onClick={() => handleEditItem(item)}
                            title="Edit Item"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn-action delete" 
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete Item"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

  </div>
)}
        {/* REQUESTS & ADMIN TABLE VIEW */}
        {activeTab === 'requests' && isLoggedIn && (
          <div className="e-requests-view">
            {currentUser.role === 'donor' ? (
              <>
                <div className="admin-table-header-flex">
                  <div>
                    <h2>📋 Admin Incoming Requests Table</h2>
                    <p>Review receiver records, search instantly, and approve or cancel requests.</p>
                  </div>
                  <div className="table-search-box">
                    <span>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search requests by item or receiver..." 
                      value={requestSearchQuery}
                      onChange={(e) => setRequestSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="admin-requests-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Item Title</th>
                        <th>Receiver Name</th>
                        <th>Email & Phone</th>
                        <th>Delivery Address</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests
                        .filter(r => r.donorEmail === currentUser.email)
                        .filter(r => {
                          const q = requestSearchQuery.toLowerCase();
                          return r.itemTitle.toLowerCase().includes(q) || r.receiverName.toLowerCase().includes(q) || r.receiverEmail.toLowerCase().includes(q);
                        }).length === 0 ? (
                          <tr><td colSpan="8" className="table-empty-row">No matching requests found in database.</td></tr>
                        ) : (
                          requests
                            .filter(r => r.donorEmail === currentUser.email)
                            .filter(r => {
                              const q = requestSearchQuery.toLowerCase();
                              return r.itemTitle.toLowerCase().includes(q) || r.receiverName.toLowerCase().includes(q) || r.receiverEmail.toLowerCase().includes(q);
                            })
                            .map((req) => (
                              <tr key={req.id}>
                                <td>#{req.id}</td>
                                <td><strong>{req.itemTitle}</strong></td>
                                <td>{req.receiverName}</td>
                                <td>{req.receiverEmail}<br/><small>{req.receiverPhone}</small></td>
                                <td>{req.receiverAddress}</td>
                                <td>{req.date}</td>
                                <td><span className={`table-status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                                <td>
                                  <div className="table-action-btns">
                                    {req.status !== 'Approved' && (
                                      <button className="tbl-approve-btn" onClick={() => handleUpdateStatus(req.id, 'Approved')}>Approve</button>
                                    )}
                                    {req.status !== 'Cancelled' && (
                                      <button className="tbl-cancel-btn" onClick={() => handleUpdateStatus(req.id, 'Cancelled')}>Cancel</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <h2>📦 My Sent Requests Table</h2>
                <p>Track the live status of items you requested.</p>

                <div className="table-responsive-wrapper">
                  <table className="admin-requests-table">
                    <thead>
                      <tr>
                        <th>Item Title</th>
                        <th>Donor Email</th>
                        <th>Requested Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.receiverEmail === currentUser.email).length === 0 ? (
                        <tr><td colSpan="4" className="table-empty-row">You haven't requested any items yet.</td></tr>
                      ) : (
                        requests
                          .filter(r => r.receiverEmail === currentUser.email)
                          .map((req) => (
                            <tr key={req.id}>
                              <td><strong>{req.itemTitle}</strong></td>
                              <td>{req.donorEmail}</td>
                              <td>{req.date}</td>
                              <td><span className={`table-status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* DETAILED ITEM & DONOR MODAL POPUP */}
      {selectedItemModal && (
        <div className="modal-backdrop" onClick={() => setSelectedItemModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedItemModal(null)}>✕</button>
            
            <div className="modal-content-grid">
              {/* Left: Interactive Image Gallery */}
              <ItemGalleryModal images={selectedItemModal.images || [selectedItemModal.image]} />

              {/* Right: Item Specs & Donor Contact Info */}
              <div className="modal-details-pane">
                <span className="modal-cat-tag">{selectedItemModal.category}</span>
                <h2>{selectedItemModal.title}</h2>
                
                <div className="modal-price-condition">
                  <span className={`modal-price ${selectedItemModal.priceType.toLowerCase()}`}>
                    {selectedItemModal.priceType === 'Free' ? 'FREE' : `₹${selectedItemModal.price}`}
                  </span>
                  <span className="modal-cond">Condition: <strong>{selectedItemModal.condition}</strong></span>
                </div>

                <div className="modal-section-box">
                  <h4>Description & Instructions</h4>
                  <p>{selectedItemModal.description || 'No additional description provided by the donor.'}</p>
                </div>

                <div className="modal-section-box donor-highlight-box">
                  <h4>🤝 Donor Contact Information</h4>
                  <p><strong>Name:</strong> {selectedItemModal.donorName}</p>
                  <p><strong>Email:</strong> {selectedItemModal.donorEmail}</p>
                  <p><strong>Phone:</strong> {selectedItemModal.donorPhone}</p>
                  <p><strong>Pickup Address:</strong> {selectedItemModal.donorAddress}</p>
                </div>

                <button className="e-cart-btn modal-action-btn" onClick={() => handleRequestItem(selectedItemModal)}>
                  {selectedItemModal.priceType === 'Free' ? '🎁 Request Free Item Now' : `🛒 Purchase / Request for ₹${selectedItemModal.price}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="e-footer">
        <p>© 2026 UdaanBox Portal.</p>
      </footer>
    </div>
  );
}

// Compact & Attractive Product Card Component
function ProductCard({ item, onCardClick, handleRequestItem }) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const imgList = item.images && item.images.length > 0 ? item.images : [item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'];

  return (
    <div className="e-product-card" onClick={onCardClick}>
      <div className="e-card-img-box">
        <img src={imgList[activeImgIdx]} alt={item.title} />
        <span className={`e-price-tag ${item.priceType.toLowerCase()}`}>
          {item.priceType === 'Free' ? 'FREE' : `₹${item.price}`}
        </span>
        <span className="e-condition-badge">{item.condition}</span>

        {imgList.length > 1 && (
          <div className="card-img-dots" onClick={(e) => e.stopPropagation()}>
            {imgList.map((_, i) => (
              <span 
                key={i} 
                className={`img-dot ${activeImgIdx === i ? 'active' : ''}`}
                onClick={() => setActiveImgIdx(i)}
              ></span>
            ))}
          </div>
        )}
      </div>

      <div className="e-card-body">
        <span className="e-category-label">{item.category}</span>
        <h4 className="e-product-title">{item.title}</h4>
        <p className="e-product-desc">{item.description}</p>
        
        <div className="e-seller-info">
          <span>Donor: <strong>{item.donorName}</strong></span>
          <small>📍 {item.donorAddress}</small>
        </div>

        <button className="e-cart-btn" onClick={(e) => { e.stopPropagation(); handleRequestItem(item); }}>
          {item.priceType === 'Free' ? '🎁 Request Item' : `🛒 Buy ₹${item.price}`}
        </button>
      </div>
    </div>
  );
}

// Sub-component for Item Modal Image Switcher
function ItemGalleryModal({ images }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className="modal-gallery">
      <div className="modal-main-img">
        <img src={images[currentIdx]} alt="Item View" />
      </div>
      {images.length > 1 && (
        <div className="modal-thumbnails">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`modal-thumb ${currentIdx === idx ? 'active' : ''}`}
              onClick={() => setCurrentIdx(idx)}
            >
              <img src={img} alt={`Thumb ${idx}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;