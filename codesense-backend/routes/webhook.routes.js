const express  = require("express");
const { handleWebhook } =require("../controllers/Webhook.controller");

const router = express.Router();

// Raw body needed for GitHub webhook signature verification
router.post("/github", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;