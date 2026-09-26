"use strict";

const express = require("express");
const path = require("path");

const monitoring = require("./monitoring");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/system-status", async (req, res, next) => {
    try {
      const stats = await monitoring.getSystemStats();
      res.json({ ...stats, healthy: monitoring.evaluateHealth(stats) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/check-url", async (req, res, next) => {
    try {
      const url = req.body && req.body.url;
      if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
        res.status(400).json({ detail: "url must start with http:// or https://" });
        return;
      }
      const result = await monitoring.checkUrl(url);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Express identifies an error-handling middleware by its arity, so all
  // four parameters must stay even though only `error` and `res` are used.
  app.use((error, _req, res, _next) => {
    res.status(500).json({ detail: "internal server error" });
  });

  return app;
}

module.exports = { createApp };
