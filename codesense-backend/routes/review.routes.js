const express  = require("express");
const {
  getReviews, getReview, getReviewFiles,
  manualReview, deleteReview, getAIFix
} = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

router.get   ("/",                              getReviews);
router.post  ("/manual",                        manualReview);
router.get   ("/:id",                           getReview);
router.get   ("/:id/files",                     getReviewFiles);
router.delete("/:id",                           deleteReview);
router.post  ("/:id/issues/:issueId/ai-fix",    getAIFix);

module.exports = router;