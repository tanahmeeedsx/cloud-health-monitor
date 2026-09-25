# Small, production image for the Cloud Health Monitor API.
FROM node:22-slim

WORKDIR /app

# Install only production deps in the image (not eslint/jest/prettier).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 8000

# AWS App Runner / Elastic Beanstalk / ECS inject PORT differently, but
# 8000 is a safe, explicit default that all of them can be pointed at.
ENV PORT=8000

CMD ["node", "src/index.js"]
