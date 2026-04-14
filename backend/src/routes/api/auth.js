const router = require('express').Router();

router.get('/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ logged: true, user: req.session.user });
  } else {
    res.json({ logged: false, user: null });
  }
});

module.exports = router;
