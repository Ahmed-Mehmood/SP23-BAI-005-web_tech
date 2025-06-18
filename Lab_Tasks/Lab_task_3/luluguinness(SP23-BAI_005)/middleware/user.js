function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/user/login");
  }

  if (req.session.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }

  next(); 
}

module.exports = requireAdmin;