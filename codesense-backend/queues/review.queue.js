const { Queue } = require("bullmq");

let reviewQueue;

const initReviewQueue = (redisConnection) => {
  reviewQueue = new Queue("review", {
    connection: redisConnection,
    defaultJobOptions: {
      attempts    : 3,                          // retry 3 times on failure
      backoff     : { type: "exponential", delay: 5000 }, // wait 5s, 10s, 20s
      removeOnComplete: { count: 100 },         // keep last 100 completed jobs
      removeOnFail    : { count: 50 },          // keep last 50 failed jobs
    },
  });

  reviewQueue.on("error", (err) => {
    console.error("❌ Review queue error:", err.message);
  });

  console.log("✅ Review queue initialized");
  return reviewQueue;
};

const addReviewJob = async (data) => {
  if (!reviewQueue) throw new Error("Review queue not initialized");

  const job = await reviewQueue.add("analyze-code", data, {
    priority: data.isManual ? 1 : 2,  // manual reviews get higher priority
  });

  console.log(`📥 Review job added → jobId: ${job.id} | reviewId: ${data.reviewId}`);
  return job;
};

const getReviewQueue = () => reviewQueue;

module.exports = { initReviewQueue, addReviewJob, getReviewQueue };