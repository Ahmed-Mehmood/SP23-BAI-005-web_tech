const mongoose = require('mongoose');
const Product = require('./models/product');

const sampleProducts = [
    {
        title: "BLACK LILY OF THE VALLEY BAG",
        description: "A beautiful black bag featuring the iconic Lily of the Valley design.",
        price: 125.00,
        image: "/media/images/p1.jpg",
        category: "Bags",
        stock: 10
    },
    {
        title: "Red Lulu Mail Postbox",
        description: "A charming red postbox bag, perfect for everyday use.",
        price: 115.00,
        image: "/media/images/p2.jpg",
        category: "Bags",
        stock: 15
    },
    {
        title: "HYDRANGEA BASKET BAG",
        description: "A stunning basket bag adorned with hydrangea patterns.",
        price: 130.00,
        image: "/media/images/p3.jpg",
        category: "Bags",
        stock: 8
    },
    {
        title: "Red Lulu Mail Postbox Purse",
        description: "A matching purse to complement the postbox bag.",
        price: 85.00,
        image: "/media/images/p4.jpg",
        category: "Accessories",
        stock: 20
    },
    {
        title: "BLACK LARGE WOOL SCARF",
        description: "A luxurious wool scarf in classic black.",
        price: 150.00,
        image: "/media/images/p5.jpg",
        category: "Scarves",
        stock: 12
    },
    {
        title: "14K GOLD PLATED LUNA LIP PENDANT NECKLACE",
        description: "An elegant gold-plated necklace featuring the iconic lip design.",
        price: 180.00,
        image: "/media/images/p6.jpg",
        category: "Jewelry",
        stock: 5
    },
    {
        title: "The Lips Clutch Bag",
        description: "A stylish clutch bag featuring the signature lips design.",
        price: 95.00,
        image: "/media/images/p7.jpg",
        category: "Bags",
        stock: 15
    },
    {
        title: "Signature Red Tote Bag",
        description: "A spacious tote bag in signature red color.",
        price: 200.00,
        image: "/media/images/p8.jpg",
        category: "Bags",
        stock: 10
    }
];

mongoose.connect("mongodb://localhost:27017/web")
    .then(async () => {
        console.log("Connected to database");
        try {
            // Clear existing products
            await Product.deleteMany({});
            console.log("Cleared existing products");

            // Insert sample products
            await Product.insertMany(sampleProducts);
            console.log("Added sample products");

            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(error => {
        console.error("Error connecting to database:", error);
    }); 