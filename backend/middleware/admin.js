export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      requiredRole: 'admin',
      currentRole: req.user.role
    });
  }

  // Additional check: ensure admin is not banned (safety check)
  if (req.user.isBanned) {
    return res.status(403).json({ message: 'Admin account is banned' });
  }

  next();
};

// Middleware to check specific roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        requiredRoles: roles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user is verified
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'This action requires a verified account. Please contact admin for verification.',
      isVerified: false
    });
  }

  next();
};
