module.exports = {
  ensureAuth: (req, res, next) => {
    if(req.session && req.session.user) {
      return next();
    } 
    res.redirect('/auth/login');
  },

  ensureGuest: (req, res, next) => {
    if(!req.session || !req.session.user) {
      return next();
    }
    res.redirect('/dashboard');
  },

  ensureRole: (role) => (req, res, next) => {
    if(req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    res.status(403).send('Unauthorized');
  }
};
