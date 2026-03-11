const { verifySignature, processPREvent } = require("../services/webhook.service");

/* ── Handle GitHub Webhook ────────────────────────────────
   POST /api/webhook/github
──────────────────────────────────────────────────────────── */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event     = req.headers["x-github-event"];
    const body      = req.body;

    // Verify webhook is genuinely from GitHub
    const isValid = verifySignature(body, signature);
    if (!isValid)
      return res.status(401).json({ success: false, message: "Invalid webhook signature" });

    const payload = JSON.parse(body.toString());

    // We only care about pull_request events
    if (event === "pull_request") {
      const action = payload.action;

      // Only trigger review on opened or synchronized (new commits pushed)
      if (action === "opened" || action === "synchronize") {
        await processPREvent(payload);
      }
    }

    // Always respond 200 quickly to GitHub
    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) { next(err); }
};

module.exports = { handleWebhook };