import { useMemo, useState } from 'react'
import { Search, ShoppingBag, Heart, Menu, X, Plus, Minus, Trash2, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react'
import './App.css'

const categories = ['All Products', 'Clothing', 'Bags', 'Shoes', 'Watches', 'Accessories']

const products = [
  { id: 1, name: 'Classic Everyday Tote', category: 'Bags', price: 899, oldPrice: 1199, tag: 'BESTSELLER', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85' },
  { id: 2, name: 'Minimalist Summer Dress', category: 'Clothing', price: 1299, oldPrice: 1599, tag: 'NEW ARRIVAL', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85' },
  { id: 3, name: 'Everyday Sneakers', category: 'Shoes', price: 1499, oldPrice: 1799, tag: 'POPULAR', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85' },
  { id: 4, name: 'Elegant Wrist Watch', category: 'Watches', price: 1899, tag: '', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85' },
  { id: 5, name: 'Modern Shoulder Bag', category: 'Bags', price: 1099, oldPrice: 1399, tag: 'SALE', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85' },
  { id: 6, name: 'Casual Fashion Outfit', category: 'Clothing', price: 999, tag: '', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=85' },
  { id: 7, name: 'Stylish Sunglasses', category: 'Accessories', price: 499, oldPrice: 699, tag: 'SALE', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=85' },
  { id: 8, name: 'Premium Fashion Shoes', category: 'Shoes', price: 1699, tag: '', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85' },
]

const money = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function App() {
  const [category, setCategory] = useState('All Products')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('joyshop-cart') || '[]') } catch { return [] }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const [currentUser, setCurrentUser] = useState(() => readStorage('joyshop-current-user', null))
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const saveCart = (next) => {
    setCart(next)
    localStorage.setItem('joyshop-cart', JSON.stringify(next))
  }

  const filtered = useMemo(() => products.filter((p) => {
    const categoryMatch = category === 'All Products' || p.category === category
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase())
    return categoryMatch && searchMatch
  }), [category, search])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = (product) => {
    const found = cart.find((item) => item.id === product.id)
    const next = found
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }]
    saveCart(next)
    setNotice(`${product.name} added to your cart`)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const changeQuantity = (id, amount) => {
    saveCart(cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  const removeItem = (id) => saveCart(cart.filter((item) => item.id !== id))

  const handleAuth = async (event) => {
    event.preventDefault()
    setAuthError('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('authName') || '').trim()
    const email = String(form.get('authEmail') || '').trim().toLowerCase()
    const password = String(form.get('authPassword') || '')
    const users = readStorage('joyshop-users', [])
    const passwordHash = await hashPassword(password)

    if (authMode === 'register') {
      if (users.some((user) => user.email === email)) { setAuthError('An account with this email already exists.'); return }
      const user = { name, email, passwordHash }
      localStorage.setItem('joyshop-users', JSON.stringify([...users, user]))
      setCurrentUser({ name, email })
      localStorage.setItem('joyshop-current-user', JSON.stringify({ name, email }))
      setAuthOpen(false)
      setNotice('Your JoyShop account has been created.')
    } else {
      const user = users.find((item) => item.email === email && item.passwordHash === passwordHash)
      if (!user) { setAuthError('Incorrect email or password.'); return }
      const signedIn = { name: user.name, email: user.email }
      setCurrentUser(signedIn)
      localStorage.setItem('joyshop-current-user', JSON.stringify(signedIn))
      setAuthOpen(false)
      setNotice(`Welcome back, ${user.name}!`)
    }
    window.setTimeout(() => setNotice(''), 2600)
  }

  const signOut = () => {
    localStorage.removeItem('joyshop-current-user')
    setCurrentUser(null)
    setAuthOpen(false)
    setNotice('You have signed out.')
    window.setTimeout(() => setNotice(''), 2200)
  }

  const placeOrder = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const newOrder = {
      number: `JS-${Date.now().toString().slice(-7)}`,
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email'),
      address: form.get('address'),
      city: form.get('city'),
      province: form.get('province'),
      customerEmail: currentUser.email,
      payment: paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod,
      paymentReference: form.get('paymentReference') || '',
      paymentSender: form.get('paymentSender') || '',
      paymentStatus: paymentMethod === 'COD' ? 'Pay upon delivery' : 'Pending manual verification',
      items: cart,
      total: subtotal,
      date: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
    }
    const allOrders = readStorage('joyshop-orders', [])
    localStorage.setItem('joyshop-orders', JSON.stringify([newOrder, ...allOrders]))
    setOrder(newOrder)
    setCheckoutOpen(false)
    setCartOpen(false)
    saveCart([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goShop = () => {
    setCheckoutOpen(false)
    setCartOpen(false)
    setOrder(null)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Require an authenticated customer before rendering any shopping content.
  // The login/register screen is the only page visible while signed out.
  if (!currentUser) {
    return (
      <div className="site-shell">
        <main
          className="auth-gate"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '32px 18px',
            background: '#fff7fa',
          }}
        >
          <section
            className="auth-card"
            style={{ width: '100%', maxWidth: '460px', position: 'relative' }}
          >
            <a
              className="logo"
              href="#login"
              onClick={(event) => event.preventDefault()}
              style={{ display: 'inline-block', marginBottom: '28px' }}
            >
              joy<span>shop.</span>
            </a>
            <span className="eyebrow">WELCOME TO JOYSHOP</span>
            <h2>{authMode === 'login' ? 'Sign in to continue.' : 'Create your account.'}</h2>
            <p className="auth-subtitle">
              {authMode === 'login'
                ? 'Please sign in before browsing and shopping.'
                : 'Create a customer account to start shopping.'}
            </p>
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === 'register' && (
                <label>
                  Full name *
                  <input name="authName" placeholder="Your full name" required />
                </label>
              )}
              <label>
                Email address *
                <input name="authEmail" type="email" placeholder="you@example.com" required />
              </label>
              <label>
                Password *
                <input
                  name="authPassword"
                  type="password"
                  minLength="6"
                  placeholder="At least 6 characters"
                  required
                />
              </label>
              {authError && <p className="auth-error">{authError}</p>}
              <button className="place-order" type="submit">
                {authMode === 'login' ? 'Sign in and continue' : 'Create account'}
              </button>
            </form>
            <p className="auth-switch">
              {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setAuthError('')
                }}
              >
                {authMode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
            <p className="prototype-note">
              Demo account only. Your account is stored in this browser for this prototype.
            </p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="site-shell">
      <div className="announcement">✨ A little something special for your everyday style</div>
      <header className="header">
        <div className="header-inner">
          <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a className="logo" href="#home" onClick={() => setOrder(null)}>joy<span>shop.</span></a>
          <nav className={mobileMenu ? 'nav-links show' : 'nav-links'}>
            <a href="#home" onClick={() => setMobileMenu(false)}>Home</a>
            <a href="#shop" onClick={() => setMobileMenu(false)}>Shop</a>
            <a href="#categories" onClick={() => setMobileMenu(false)}>Categories</a>
            <a href="#about" onClick={() => setMobileMenu(false)}>About</a>
          </nav>
          <div className="header-actions">
            <button className="account-trigger" onClick={() => { setAuthError(''); setAuthMode('login'); setAuthOpen(true) }}>{currentUser ? currentUser.name.split(' ')[0] : 'Sign in'}</button>
            <button className="icon-button" aria-label="Focus product search" onClick={() => { document.getElementById('search')?.focus(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}><Search size={20} /></button>
            <button className="cart-trigger" onClick={() => setCartOpen(true)}><ShoppingBag size={18} /><span>Cart</span><b>{cartCount}</b></button>
          </div>
        </div>
      </header>

      {order ? (
        <main className="confirmation-wrap">
          <div className="confirmation-card">
            <CheckCircle2 className="success-icon" size={54} />
            <span className="eyebrow">THANK YOU FOR SHOPPING WITH US</span>
            <h1>Your order is placed!</h1>
            <p className="confirmation-lead">Thank you, {order.name}. Your JoyShop order has been recorded in this prototype.</p>
            <div className="order-number">Order number <strong>{order.number}</strong></div>
            <div className="confirmation-details">
              <div><span>Order date</span><strong>{order.date}</strong></div>
              <div><span>Payment</span><strong>{order.payment}</strong></div>
              <div><span>Payment status</span><strong>{order.paymentStatus}</strong></div>
              <div><span>Delivery address</span><strong>{order.address}, {order.city}, {order.province}</strong></div>
              <div><span>Total</span><strong>{money(order.total)}</strong></div>
            </div>
            <p className="prototype-note">Prototype only: this order is saved in this browser and is not sent to a real store or online database.</p>
            <button className="primary-button full-button" onClick={goShop}>Continue shopping <ArrowRight size={17} /></button>
          </div>
        </main>
      ) : checkoutOpen ? (
        <main className="checkout-page">
          <div className="checkout-container">
            <button className="back-link" onClick={() => setCheckoutOpen(false)}><ChevronLeft size={17} /> Back to cart</button>
            <div className="checkout-heading">
              <span className="eyebrow">ALMOST YOURS</span>
              <h1>Complete your order.</h1>
              <p>Just a few details before your JoyShop finds arrive.</p>
            </div>
            <form className="checkout-layout" onSubmit={placeOrder}>
              <section className="checkout-fields">
                <div className="form-card">
                  <h2>01. Contact information</h2>
                  <label>Full name *<input name="name" placeholder="Enter your full name" required /></label>
                  <div className="two-fields">
                    <label>Phone number *<input name="phone" type="tel" placeholder="09XX XXX XXXX" required /></label>
                    <label>Email address<input name="email" type="email" placeholder="you@example.com" /></label>
                  </div>
                </div>
                <div className="form-card">
                  <h2>02. Delivery address</h2>
                  <label>House number, street, barangay *<input name="address" placeholder="Enter your complete address" required /></label>
                  <div className="two-fields">
                    <label>City / Municipality *<input name="city" placeholder="City or municipality" required /></label>
                    <label>Province *<input name="province" placeholder="Province" required /></label>
                  </div>
                </div>
                <div className="form-card">
                  <h2>03. Payment method</h2>
                  <div className="payment-options">
                    {[{ id: 'COD', title: 'Cash on Delivery', detail: 'Pay when your order arrives.' }, { id: 'GCash', title: 'GCash', detail: 'Pay using your GCash wallet.' }, { id: 'Maya', title: 'Maya', detail: 'Pay using your Maya wallet.' }].map((method) => (
                      <label className={paymentMethod === method.id ? 'payment-option selected' : 'payment-option'} key={method.id}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                        <span><strong>{method.title}</strong><small>{method.detail}</small></span>
                      </label>
                    ))}
                  </div>
                  {paymentMethod !== 'COD' && <div className="manual-payment-box">
                    <strong>{paymentMethod} payment instructions</strong>
                    <p>Send your payment to the shop's official {paymentMethod} account, then enter your payment details below. The shop owner must provide the official account details.</p>
                    <label>{paymentMethod} account / sender mobile number *<input name="paymentSender" type="tel" placeholder="09XX XXX XXXX" required /></label>
                    <label>Transaction reference number *<input name="paymentReference" placeholder="Enter your transaction reference" required /></label>
                    <small>Demo only: no money is transferred or verified by this website. Your order will be marked pending manual verification.</small>
                  </div>}
                </div>
              </section>
              <aside className="checkout-summary">
                <h2>Your order</h2>
                {cart.map((item) => <div className="summary-item" key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><small>Qty: {item.quantity}</small></div><b>{money(item.price * item.quantity)}</b></div>)}
                <div className="summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                <div className="summary-line muted"><span>Shipping</span><span>To be confirmed</span></div>
                <div className="summary-total"><span>Order total</span><strong>{money(subtotal)}</strong></div>
                <p className="shipping-note">Shipping fees are not included in this prototype.</p>
                <button className="place-order" type="submit">Place demo order · {money(subtotal)}</button>
              </aside>
            </form>
          </div>
        </main>
      ) : (
        <>
          <main>
            <section className="hero" id="home">
              <div className="hero-copy">
                <span className="eyebrow">YOUR STYLE, YOUR STORY</span>
                <h1>Find your<br />everyday <em>joy.</em></h1>
                <p>Discover pieces you'll love. Shop your favorites and make every day a little more stylish.</p>
                <a className="primary-button" href="#shop">Explore Collection <ArrowRight size={18} /></a>
                <div className="hero-footnote"><Heart size={15} /> Made for your everyday moments</div>
              </div>
              <div className="hero-visual">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85" alt="Friends browsing a fashion collection" />
                <div className="floating-note"><span>NEW SEASON</span><strong>Style starts here.</strong></div>
              </div>
              <span className="hero-mark">J.</span>
            </section>

            <section className="benefits">
              <div><Heart size={18} /><span>Curated styles</span></div>
              <div><span className="sparkle">✧</span><span>Affordable finds</span></div>
              <div><ArrowRight size={18} /><span>Easy shopping</span></div>
            </section>

            <section className="category-section section-wrap" id="categories">
              <div className="section-heading"><div><span className="eyebrow">FIND YOUR FAVORITE</span><h2>Shop by category</h2></div><p>A style for every mood and moment.</p></div>
              <div className="category-pills">
                {categories.slice(1).map((item) => <button key={item} className={category === item ? 'category-pill selected' : 'category-pill'} onClick={() => { setCategory(item); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}>{item}<ArrowRight size={14} /></button>)}
              </div>
            </section>

            <section className="shop-section section-wrap" id="shop">
              <div className="section-heading"><div><span className="eyebrow">THE JOYSHOP EDIT</span><h2>Our favorites</h2></div><p>Find something you'll love.</p></div>
              <div className="shop-toolbar">
                <div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>
                <label className="search-box"><Search size={17} /><input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." /></label>
              </div>
              <div className="product-grid">
                {filtered.map((product) => <article className="product-card" key={product.id}>
                  <div className="product-image"><img src={product.image} alt={product.name} loading="lazy" />{product.tag && <span className="product-tag">{product.tag}</span>}<button className="quick-add" onClick={() => addToCart(product)}><Plus size={15} /> Add to cart</button></div>
                  <div className="product-info"><span className="product-category">{product.category}</span><h3>{product.name}</h3><div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div>
                </article>)}
              </div>
              {filtered.length === 0 && <div className="no-results"><Search size={26} /><h3>No products found</h3><p>Try another search or category.</p><button onClick={() => { setSearch(''); setCategory('All Products') }}>Clear filters</button></div>}
            </section>

            <section className="newsletter section-wrap" id="about"><span className="eyebrow">A LITTLE JOY IN YOUR INBOX</span><h2>Stay in the loop.</h2><p>Discover new arrivals, special finds and more.</p><form onSubmit={(e) => { e.preventDefault(); setNotice('Thanks for your interest! Newsletter signup is a demo.'); window.setTimeout(() => setNotice(''), 2600); e.currentTarget.reset() }}><input type="email" placeholder="Enter your email address" required /><button type="submit">Subscribe <ArrowRight size={16} /></button></form></section>
          </main>
          <footer className="footer"><a className="logo" href="#home">joy<span>shop.</span></a><p>Find your everyday joy. ♡</p><small>© 2026 JoyShop. Prototype project.</small></footer>
        </>
      )}

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label="Shopping cart">
        <div className="drawer-header"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your Shopping Cart ({cartCount})</h2></div><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={42} /><h3>Your cart is waiting.</h3><p>Find something lovely to add to your cart.</p><button className="primary-button" onClick={goShop}>Continue shopping <ArrowRight size={16} /></button></div> : <>
          <div className="drawer-items">{cart.map((item) => <div className="drawer-item" key={item.id}><img src={item.image} alt={item.name} /><div className="drawer-item-info"><span className="product-category">{item.category}</span><h3>{item.name}</h3><strong>{money(item.price)}</strong><div className="quantity-row"><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="remove-button" onClick={() => removeItem(item.id)}><Trash2 size={13} /> Remove</button></div></div></div>)}</div>
          <div className="drawer-bottom"><div className="subtotal-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Shipping fees will be confirmed separately.</p><button className="checkout-button" onClick={() => { setCartOpen(false); if (!currentUser) { setAuthMode('login'); setAuthOpen(true); setNotice('Please sign in or create an account before checkout.') } else { setCheckoutOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}>Proceed to checkout <ArrowRight size={17} /></button><button className="continue-button" onClick={() => setCartOpen(false)}>Continue shopping</button></div>
        </>}
      </aside></div>}
      {authOpen && <div className="overlay auth-overlay" onClick={() => setAuthOpen(false)}><section className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-button auth-close" onClick={() => setAuthOpen(false)} aria-label="Close sign in"><X /></button>
        {currentUser ? <><span className="eyebrow">YOUR JOYSHOP ACCOUNT</span><h2>Hello, {currentUser.name}!</h2><p className="auth-subtitle">{currentUser.email}</p><div className="account-orders"><h3>Your demo orders</h3>{readStorage('joyshop-orders', []).filter((item) => item.customerEmail === currentUser.email).length === 0 ? <p>You have no orders yet.</p> : readStorage('joyshop-orders', []).filter((item) => item.customerEmail === currentUser.email).map((item) => <div className="account-order" key={item.number}><span>{item.number}<small>{item.date} · {item.payment}</small></span><strong>{money(item.total)}</strong></div>)}</div><button className="place-order" onClick={signOut}>Sign out</button></> : <><span className="eyebrow">WELCOME TO JOYSHOP</span><h2>{authMode === 'login' ? 'Sign in to your account.' : 'Create your account.'}</h2><p className="auth-subtitle">Keep track of your orders and enjoy shopping.</p><form className="auth-form" onSubmit={handleAuth}>{authMode === 'register' && <label>Full name *<input name="authName" placeholder="Your full name" required /></label>}<label>Email address *<input name="authEmail" type="email" placeholder="you@example.com" required /></label><label>Password *<input name="authPassword" type="password" minLength="6" placeholder="At least 6 characters" required /></label>{authError && <p className="auth-error">{authError}</p>}<button className="place-order" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button></form><p className="auth-switch">{authMode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }}>{authMode === 'login' ? 'Create one' : 'Sign in'}</button></p></>}
        <p className="prototype-note">Prototype account only. Account data is stored in this browser and is not protected by a production server.</p>
      </section></div>}
      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}

export default App
