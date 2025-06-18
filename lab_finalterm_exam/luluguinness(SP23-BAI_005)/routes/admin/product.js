const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const orderModel = require('../models/order');
const { isLoggedIn } = require('../middleware/auth');

router.get("/create_product", (req, res) => {
    return res.render("admin/add-product");
});



module.exports = router;