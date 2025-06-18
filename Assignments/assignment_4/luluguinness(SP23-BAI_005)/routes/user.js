const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const orderModel = require('../models/order');
const Complaint = require('../models/complaint');
const Order = require('../models/order');
const { isLoggedIn } = require('../middleware/auth');

router.get("/login", (req, res) => {
    res.render('login', { 
        title: 'Login',
        user: req.session.user || null,
        error: req.session.error,
        success: req.session.success
    });
    
    // Clear flash messages
    delete req.session.error;
    delete req.session.success;
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signup", async (req, res) => {
    let data = req.body;

    const existingUser = await userModel.findOne({ email: data.email.toLowerCase() });

    if (existingUser) {
        return res.render("signup", { error: "User already exists." });
    }

    let user = new userModel();
    user.name = data.name;
    user.email = data.email.toLowerCase(); 
    user.password = data.password;
    user.role = data.isAdmin ? 'admin' : 'user';

    await user.save();

    return res.redirect("/user/login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.render('login', {
                error: 'Invalid email or password',
                title: 'Login',
                user: null
            });
        }

        if (user.password !== password) {
            return res.render('login', {
                error: 'Invalid email or password',
                title: 'Login',
                user: null
            });
        }

        // Set user session with all necessary fields
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user' // Ensure role is set, default to 'user' if not specified
        };

        console.log('User logged in:', req.session.user);

        if (user.role === 'admin') {
            req.session.success = 'Welcome back, Admin!';
            res.redirect('/admin');
        } else {
            req.session.success = 'Welcome back!';
            res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            error: 'An error occurred during login',
            title: 'Login',
            user: null
        });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// My Orders page (protected route)
router.get('/my-orders', isLoggedIn, async (req, res) => {
    // Prevent admin users from accessing user orders
    if (req.session.user.role === 'admin') {
        return res.redirect('/admin');
    }
    
    try {
        console.log('Fetching orders for user:', req.session.user._id);
        
        const orders = await orderModel.find({ user: req.session.user._id })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        console.log('Found orders:', orders);
        
        res.render('my-orders', { 
            title: 'My Orders',
            user: req.session.user,
            orders: orders,
            error: null
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.render('my-orders', { 
            title: 'My Orders',
            user: req.session.user,
            orders: [],
            error: 'Failed to fetch orders. Please try again later.'
        });
    }
});

// Order Details page
router.get('/order/:id', isLoggedIn, async (req, res) => {
    // Prevent admin users from accessing user order details
    if (req.session.user.role === 'admin') {
        return res.redirect('/admin');
    }
    
    try {
        console.log('Fetching order details for order:', req.params.id);
        console.log('User ID:', req.session.user._id);

        const order = await orderModel.findOne({
            _id: req.params.id,
            user: req.session.user._id
        });

        console.log('Found order:', order);

        if (!order) {
            console.log('Order not found');
            return res.status(404).render('error', {
                message: 'Order not found',
                error: { status: 404 }
            });
        }

        res.render('order-details', {
            title: `Order #${order._id.toString().slice(-6)}`,
            user: req.session.user,
            order: order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).render('error', {
            message: 'Error fetching order details',
            error: { status: 500 }
        });
    }
});

// Show complaint submission form
router.get('/complaints/new', isLoggedIn, async (req, res) => {
  // Prevent admin users from submitting complaints
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin');
  }
  
  // Optionally, fetch user's orders for dropdown
  const orders = await Order.find({ user: req.session.user._id });
  res.render('complaints/new', { orders });
});

// Handle complaint submission
router.post('/complaints', isLoggedIn, async (req, res) => {
  // Prevent admin users from submitting complaints
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin');
  }
  
  const { orderId, message } = req.body;
  await Complaint.create({
    userId: req.session.user._id,
    orderId,
    message
  });
  res.redirect('/user/complaints');
});

// List user's complaints
router.get('/complaints', isLoggedIn, async (req, res) => {
  // Prevent admin users from viewing user complaints
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin');
  }
  
  const complaints = await Complaint.find({ userId: req.session.user._id }).populate('orderId');
  res.render('complaints/list', { complaints });
});

module.exports = router;