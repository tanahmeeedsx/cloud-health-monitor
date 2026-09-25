const request = require("supertest");
const monitoring = require("../src/monitoring");
const { createApp } = require("../src/server");

const app = createApp();

describe("GET /health", () => {
  test("responds ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /system-status", () => {
  test("responds with system metrics and a healthy flag", async () => {
    const response = await request(app).get("/system-status");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("cpuPercent");
    expect(response.body).toHaveProperty("memoryPercent");
    expect(response.body).toHaveProperty("diskPercent");
    expect(response.body).toHaveProperty("healthy");
  });

  test("returns 500 when reading system stats fails", async () => {
    const spy = jest
      .spyOn(monitoring, "getSystemStats")
      .mockRejectedValue(new Error("boom"));
    const response = await request(app).get("/system-status");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});

describe("POST /check-url", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("checks a valid URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const response = await request(app)
      .post("/check-url")
      .send({ url: "https://example.com" });
    expect(response.status).toBe(200);
    expect(response.body.isUp).toBe(true);
  });

  test("rejects a missing url", async () => {
    const response = await request(app).post("/check-url").send({});
    expect(response.status).toBe(400);
  });

  test("rejects a non-http(s) scheme", async () => {
    const response = await request(app)
      .post("/check-url")
      .send({ url: "ftp://example.com" });
    expect(response.status).toBe(400);
  });

  test("returns 500 when the URL check itself throws unexpectedly", async () => {
    const spy = jest
      .spyOn(monitoring, "checkUrl")
      .mockRejectedValue(new Error("boom"));
    const response = await request(app)
      .post("/check-url")
      .send({ url: "https://example.com" });
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});
