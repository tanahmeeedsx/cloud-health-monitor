const fs = require("fs");
const {
  checkUrl,
  getMemoryPercent,
  getDiskPercent,
  getSystemStats,
  evaluateHealth,
} = require("../src/monitoring");

describe("checkUrl", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("reports a successful, reachable URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const result = await checkUrl("https://example.com");
    expect(result.isUp).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeNull();
  });

  test("reports an HTTP error status as down", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 });
    const result = await checkUrl("https://example.com");
    expect(result.isUp).toBe(false);
    expect(result.statusCode).toBe(500);
  });

  test("reports a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("boom"));
    const result = await checkUrl("https://example.com");
    expect(result.isUp).toBe(false);
    expect(result.statusCode).toBeNull();
    expect(result.error).toBe("boom");
  });

  test("reports a timeout distinctly", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    global.fetch = jest.fn().mockRejectedValue(abortError);
    const result = await checkUrl("https://example.com", 10);
    expect(result.isUp).toBe(false);
    expect(result.error).toBe("request timed out");
  });
});

describe("getMemoryPercent", () => {
  test("returns a value between 0 and 100", () => {
    const percent = getMemoryPercent();
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });
});

describe("getDiskPercent", () => {
  test("returns a value between 0 and 100 for the current directory", async () => {
    const percent = await getDiskPercent(".");
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });

  test("returns 0 defensively when total blocks is 0", async () => {
    const spy = jest
      .spyOn(fs.promises, "statfs")
      .mockResolvedValue({ blocks: 0, bsize: 4096, bfree: 0 });
    const percent = await getDiskPercent(".");
    expect(percent).toBe(0);
    spy.mockRestore();
  });
});

describe("getSystemStats", () => {
  test("returns cpu, memory, and disk percentages", async () => {
    const stats = await getSystemStats(".");
    expect(stats).toHaveProperty("cpuPercent");
    expect(stats).toHaveProperty("memoryPercent");
    expect(stats).toHaveProperty("diskPercent");
  });
});

describe("evaluateHealth", () => {
  test("returns true when every metric is under its threshold", () => {
    const stats = { cpuPercent: 10, memoryPercent: 20, diskPercent: 30 };
    expect(evaluateHealth(stats)).toBe(true);
  });

  test("returns false when a metric exceeds its threshold", () => {
    const stats = { cpuPercent: 95, memoryPercent: 20, diskPercent: 30 };
    expect(evaluateHealth(stats)).toBe(false);
  });

  test("respects custom thresholds", () => {
    const stats = { cpuPercent: 50, memoryPercent: 20, diskPercent: 30 };
    expect(evaluateHealth(stats, { cpuThreshold: 40 })).toBe(false);
  });
});
