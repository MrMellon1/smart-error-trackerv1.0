const router     = require('express').Router();
const { authMiddleware: auth } = require('../middlewares/authMiddleware');
const { validateErrorPayload } = require('../middlewares/validateRequest');
const ctrl       = require('../controllers/errorController');

// Hata alma — SDK buraya gönderir
router.post('/',          auth, validateErrorPayload, ctrl.receiveError);

// Issue listeleme ve güncelleme
router.get('/issues',     auth, ctrl.listIssues);
router.get('/issues/:id', auth, ctrl.getIssueDetail);
router.patch('/issues/:id/status', auth, ctrl.updateStatus);

module.exports = router;
