"use strict";

const os = require("os");
const fs = require("fs").promises;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cpuSnapshot() {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;

  for (const cpu of cpus) {
    for (const ms of Object.values(cpu.times)) {
      totalMs += ms;
    }
    idleMs += cpu.times.idle;
  }

  return { idleMs, totalMs };
}

/**
 * Measures CPU usage percentage by comparing two snapshots taken
 * `sampleMs` apart, since a single snapshot only gives cumulative
 * totals since boot, not a current usage rate.
 */
async function getCpuPercent(sampleMs = 100) {
  const start = cpuSnapshot();
  await sleep(sampleMs);
  const end = cpuSnapshot();

  const idleDiff = end.idleMs - start.idleMs;
  const totalDiff = end.totalMs - start.totalMs;
  const usage = totalDiff === 0 ? 0 : 1 - idleDiff / totalDiff;

  return Math.round(usage * 10000) / 100;
}

function getMemoryPercent() {
  const total = os.totalmem();
  const free = os.freemem();
  return Math.round(((total - free) / total) * 10000) / 100;
}

async function getDiskPercent(path = "/") {
  const stats = await fs.statfs(path);
  const total = stats.blocks * stats.bsize;
  const free = stats.bfree * stats.bsize;
  if (total === 0) {
    return 0;
  }
  return Math.round(((total - free) / total) * 10000) / 100;
}

async function getSystemStats(path = "/") {
  const [cpuPercent, diskPercent] = await Promise.all([
    getCpuPercent(),
    getDiskPercent(path),
  ]);

  return {
    cpuPercent,
    memoryPercent: getMemoryPercent(),
    diskPercent,
  };
}

function evaluateHealth(
  stats,
  { cpuThreshold = 90, memoryThreshold = 90, diskThreshold = 90 } = {},
) {
  return (
    stats.cpuPercent < cpuThreshold &&
    stats.memoryPercent < memoryThreshold &&
    stats.diskPercent < diskThreshold
  );
}

/**
 * Checks whether a URL is reachable and how fast it responds. Network
 * errors are caught and reported instead of thrown, so callers always
 * get a result object back.
 */
async function checkUrl(url, timeoutMs = 5000) {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      url,
      isUp: response.status < 400,
      statusCode: response.status,
      responseTimeMs,
      error: null,
    };
  } catch (error) {
    const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      url,
      isUp: false,
      statusCode: null,
      responseTimeMs,
      error: error.name === "AbortError" ? "request timed out" : error.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  checkUrl,
  getCpuPercent,
  getMemoryPercent,
  getDiskPercent,
  getSystemStats,
  evaluateHealth,
};
