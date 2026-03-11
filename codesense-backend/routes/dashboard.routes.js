const express  = require("express");
const { getStats, getRecent } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/stats",  getStats);
router.get("/recent", getRecent);

module.exports = router;