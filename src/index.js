"use strict";

const { createApp } = require("./server");

const port = process.env.PORT || 8000;
const app = createApp();

app.listen(port, () => {
  console.log(`Cloud Health Monitor listening on port ${port}`);
});
