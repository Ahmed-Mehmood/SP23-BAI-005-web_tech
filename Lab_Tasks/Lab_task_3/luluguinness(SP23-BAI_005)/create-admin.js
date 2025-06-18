const mongoose = require('mongoose');
const userModel = require('./models/user');

mongoose.connect("mongodb://localhost:27017/web")
    .then(async () => {
        console.log("Connected to database");
        
        // Create admin user
        const adminUser = new userModel({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        try {
            await adminUser.save();
            console.log('Admin user created successfully');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
        } catch (error) {
            if (error.code === 11000) {
                console.log('Admin user already exists');
            } else {
                console.error('Error creating admin user:', error);
            }
        }
        
        process.exit(0);
    })
    .catch((error) => {
        console.error("Database connection error:", error);
        process.exit(1);
    }); 