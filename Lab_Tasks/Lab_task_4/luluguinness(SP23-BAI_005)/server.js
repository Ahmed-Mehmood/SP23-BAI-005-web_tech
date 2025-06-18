const express = require("express");
const server = express();
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin/admin");
const cartRouter = require("./routes/cart");
const Product = require("./models/product");
const Order = require("./models/order");
const Cart = require("./models/cart");

const mongoose = require("mongoose");
const session = require('express-session');
const expressLayouts = require("express-ejs-layouts");

// Session configuration
server.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express.static("public"));

// Add user to all views
server.use((req, res, next) => {
    console.log('Session user data in middleware:', req.session.user);
    res.locals.user = req.session.user || null;
    next();
});

// View engine setup
server.set("view engine", "ejs");
server.set('layout', 'layouts/layout');
server.use(expressLayouts);

// Routes
server.use("/user", userRouter);
server.use("/admin", adminRouter);
server.use("/cart", cartRouter);

// Homepage route
server.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render("index", { 
            title: 'Home',
            products: products, 
            layouts: "layouts/layout"
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

// Product details route
server.get("/product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        console.log(product);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render("product-details", {
            title: product.title,
            product: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Error fetching product');
    }
});

// Checkout route
server.get("/checkout", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }

    try {
        console.log('Fetching cart for user:', req.session.user._id);
        const cart = await Cart.findOne({ user: req.session.user._id });
        
        console.log('Found cart:', cart);
        
        if (!cart || !cart.items || cart.items.length === 0) {
            console.log('Cart is empty');
            return res.redirect('/cart');
        }

        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.render("checkout", {
            title: 'Checkout',
            cart: cart,
            total: total,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error in checkout:', error);
        res.status(500).send('Error processing checkout: ' + error.message);
    }
});

// Process checkout
server.post("/process-checkout", async (req, res) => {
    try {
        const { fullName, address, city, state, zipCode } = req.body;
        
        // Validate user session
        if (!req.session.user) {
            console.log('No user in session');
            return res.redirect('/user/login');
        }

        console.log('Processing checkout for user:', req.session.user._id);

        // Get user's cart
        const cart = await Cart.findOne({ user: req.session.user._id });
        
        // Validate cart
        if (!cart || !cart.items || cart.items.length === 0) {
            console.log('Cart is empty');
            throw new Error('Cart is empty');
        }

        // Validate required fields
        if (!fullName || !address || !city || !state || !zipCode) {
            throw new Error('All shipping fields are required');
        }

        // Calculate total
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        console.log('Creating order with items:', cart.items);

        // Create order items array
        const orderItems = cart.items.map(item => ({
            product: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        // Create new order
        const order = new Order({
            user: req.session.user._id,
            items: orderItems,
            shippingAddress: {
                fullName,
                address,
                city,
                state,
                zipCode
            },
            totalAmount,
            status: 'pending',
            paymentStatus: 'completed'
        });

        console.log('Saving order:', order);

        // Save order to database
        await order.save();

        console.log('Order saved successfully');

        // Clear the cart
        cart.items = [];
        await cart.save();
        
        console.log('Cart cleared after order');
        
        res.redirect('/checkout-success');
    } catch (error) {
        console.error('Error in process-checkout:', error);
        res.status(500).send('Error processing your order: ' + error.message);
    }
});

// Checkout success route
server.get("/checkout-success", (req, res) => {
    res.render("checkout-success", {
        title: 'Order Confirmed'
    });
});

// Database connection
mongoose.connect("mongodb://localhost:27017/web")
    .then(() => {
        console.log("Connected to database");
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });

// Error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handling
server.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
server.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
