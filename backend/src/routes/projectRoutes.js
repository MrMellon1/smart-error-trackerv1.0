const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const { adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/', adminMiddleware, ctrl.createProject);
router.get('/',  adminMiddleware, ctrl.listProjects);

// 🎯 Yeni Eklenen Silme Rotası (Bunu Araya Ekle)
router.delete('/:id', adminMiddleware, ctrl.deleteProject);

module.exports = router;