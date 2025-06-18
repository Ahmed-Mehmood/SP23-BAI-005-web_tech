const isLoggedIn = (req, res, next) => {
    console.log('isLoggedIn middleware - User session:', req.session.user);
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Please log in to access this page';
        res.redirect('/user/login');
    }
};

const isAdmin = (req, res, next) => {
    console.log('isAdmin middleware - User session:', req.session.user);
    if (!req.session.user) {
        req.session.error = 'Please log in to access this page';
        return res.redirect('/user/login');
    }
    
    if (req.session.user.role === 'admin') {
        next();
    } else {
        req.session.error = 'You do not have permission to access the admin area';
        res.redirect('/user/login');
    }
};

module.exports = { isLoggedIn, isAdmin }; 