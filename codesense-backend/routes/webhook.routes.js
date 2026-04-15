const express  = require("express");
const { handleWebhook } =require("../controllers/Webhook.controller");

const router = express.Router();

// Raw body is already handled at the app level
router.post("/github", handleWebhook);

module.exports = router;