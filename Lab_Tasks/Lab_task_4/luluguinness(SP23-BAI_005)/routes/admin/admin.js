const express = require('express');
const router = express.Router();
const Product = require('../../models/product');
const Order = require('../../models/order');
const Complaint = require('../../models/complaint');
const { isAdmin } = require('../../middleware/auth');

// Admin dashboard - root route
router.get('/', isAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
        
        res.render('admin/dashboard', {
            user: req.session.user,
            products: products,
            orders: orders,
            title: 'Admin Dashboard'
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Error fetching dashboard data');
    }
});

// View all products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/products', {
            user: req.session.user,
            products: products,
            title: 'Manage Products',
            success: req.session.success,
            error: req.session.error
        });
        
        // Clear flash messages
        delete req.session.success;
        delete req.session.error;
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

// View all orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        console.log('Accessing /admin/orders route');
        console.log('User session:', req.session.user);
        
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: 'name email',
                options: { lean: true }
            });
        
        console.log('Found orders:', orders);
        
        // Filter out any orders with missing user data
        const validOrders = orders.filter(order => order.user);
        
        res.render('admin/orders', {
            user: req.session.user,
            orders: validOrders,
            title: 'Manage Orders',
            success: req.session.success,
            error: req.session.error
        });
        
        // Clear flash messages
        delete req.session.success;
        delete req.session.error;
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Error fetching orders');
    }
});

// Update order status
router.post('/orders/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            req.session.error = 'Order not found';
            return res.redirect('/admin/orders');
        }

        order.status = status;
        await order.save();
        
        req.session.success = 'Order status updated successfully';
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        req.session.error = 'Error updating order status';
        res.redirect('/admin/orders');
    }
});

// View order details
router.get('/orders/:id', isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');
            
        if (!order) {
            req.session.error = 'Order not found';
            return res.redirect('/admin/orders');
        }

        res.render('admin/order-details', {
            user: req.session.user,
            order: order,
            title: `Order #${order._id.toString().slice(-6)}`
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        req.session.error = 'Error fetching order details';
        res.redirect('/admin/orders');
    }
});

// Add new product form (products/add route)
router.get('/products/add', isAdmin, (req, res) => {
    res.render('admin/add-product', {
        user: req.session.user,
        title: 'Add Product'
    });
});

// Create new product (products/add route)
router.post('/products/add', isAdmin, async (req, res) => {
    try {
        const { title, description, price, image, category, stock } = req.body;
        const product = new Product({
            title,
            description,
            price,
            image,
            category,
            stock
        });
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
});

// Edit product form
router.get('/products/edit/:id', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('admin/edit-product', {
            user: req.session.user,
            product: product,
            title: 'Edit Product'
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Error fetching product');
    }
});

// Update product
router.post('/products/edit/:id', isAdmin, async (req, res) => {
    try {
        const { title, description, price, image, category, stock } = req.body;
        await Product.findByIdAndUpdate(req.params.id, {
            title,
            description,
            price,
            image,
            category,
            stock
        });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
});

// Delete product
router.post('/products/delete/:id', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});

// Admin: List all complaints
router.get('/complaints', isAdmin, async (req, res) => {
  const complaints = await Complaint.find().populate('userId').populate('orderId');
  res.render('admin/complaints', { complaints });
});

module.exports = router; 