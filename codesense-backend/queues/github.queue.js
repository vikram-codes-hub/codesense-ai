const { Queue } = require("bullmq");

let githubQueue;

const initGithubQueue = (redisConnection) => {
  githubQueue = new Queue("github", {
    connection: redisConnection,
    defaultJobOptions: {
      attempts        : 3,
      backoff         : { type: "exponential", delay: 3000 },
      removeOnComplete: { count: 100 },
      removeOnFail    : { count: 50 },
    },
  });

  githubQueue.on("error", (err) => {
    console.error("❌ GitHub queue error:", err.message);
  });

  console.log("✅ GitHub queue initialized");
  return githubQueue;
};

const addGithubJob = async (data) => {
  if (!githubQueue) throw new Error("GitHub queue not initialized");

  const job = await githubQueue.add("post-comments", data);

  console.log(`📥 GitHub job added → jobId: ${job.id} | reviewId: ${data.reviewId}`);
  return job;
};

const getGithubQueue = () => githubQueue;

module.exports = { initGithubQueue, addGithubJob, getGithubQueue };