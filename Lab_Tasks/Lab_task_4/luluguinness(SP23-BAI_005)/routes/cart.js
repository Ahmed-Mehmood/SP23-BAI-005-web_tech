const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { isLoggedIn } = require('../middleware/auth');

// Get user's cart
router.get('/', isLoggedIn, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.session.user._id })
            .populate('items.product');
        
        if (!cart) {
            cart = new Cart({ user: req.session.user._id, items: [] });
            await cart.save();
        }
        
        res.render('cart', {
            title: 'Shopping Cart',
            cart: cart
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Error fetching cart');
    }
});

// Add item to cart
router.post('/add/:id', isLoggedIn, async (req, res) => {
    try {
        console.log('Adding to cart - User:', req.session.user);
        console.log('Product ID:', req.params.id);
        
        if (!req.session.user || !req.session.user._id) {
            console.log('No user ID in session');
            return res.redirect('/user/login');
        }

        const productId = req.params.id;
        const product = await Product.findById(productId);
        
        console.log('Found product:', product);
        
        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }

        let cart = await Cart.findOne({ user: req.session.user._id });
        console.log('Existing cart:', cart);
        
        if (!cart) {
            console.log('Creating new cart for user:', req.session.user._id);
            cart = new Cart({
                user: req.session.user._id,
                items: [{
                    product: product._id,
                    name: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                }]
            });
        } else {
            const cartItem = cart.items.find(item => item.product.toString() === productId);
            
            if (cartItem) {
                console.log('Updating existing item quantity');
                cartItem.quantity += 1;
            } else {
                console.log('Adding new item to cart');
                cart.items.push({
                    product: product._id,
                    name: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
        }

        await cart.save();
        console.log('Cart saved successfully');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Error adding to cart: ' + error.message);
    }
});

// Remove item from cart
router.post('/remove/:id', isLoggedIn, async (req, res) => {
    try {
        const productId = req.params.id;
        const cart = await Cart.findOne({ user: req.session.user._id });
        
        if (cart) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
        }
        
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).send('Error removing from cart');
    }
});

// Update item quantity
router.post('/update/:id', isLoggedIn, async (req, res) => {
    try {
        const { quantity } = req.body;
        const productId = req.params.id;
        const cart = await Cart.findOne({ user: req.session.user._id });
        
        if (cart) {
            const cartItem = cart.items.find(item => item.product.toString() === productId);
            if (cartItem) {
                cartItem.quantity = parseInt(quantity);
                await cart.save();
            }
        }
        
        res.redirect('/cart');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Error updating cart');
    }
});

// Clear cart
router.post('/clear', isLoggedIn, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.session.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.redirect('/cart');
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).send('Error clearing cart');
    }
});

module.exports = router; 