const express  = require("express");
const { getReviews, getReview, getReviewFiles, manualReview, deleteReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect); // all routes require auth

router.get   ("/",          getReviews);
router.post  ("/manual",    manualReview);
router.get   ("/:id",       getReview);
router.get   ("/:id/files", getReviewFiles);
router.delete("/:id",       deleteReview);

module.exports = router;