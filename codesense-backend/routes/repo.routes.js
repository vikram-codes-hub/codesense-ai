const express  = require("express");
const { getRepos, getGithubRepos, connectRepo, disconnectRepo, getRepoReviews } = require("../controllers/repo.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect); // all routes require auth

router.get   ("/",            getRepos);
router.get   ("/github",      getGithubRepos);
router.post  ("/connect",     connectRepo);
router.delete("/:id",         disconnectRepo);
router.get   ("/:id/reviews", getRepoReviews);

module.exports = router;