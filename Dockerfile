# AI Test Case Generator Agent - Docker Configuration
# Build: docker build -t testcase-agent .
# Run: docker run -p 3000:3000 -e GEMINI_API_KEY=your_key testcase-agent

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install git for cloning repositories
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create LTM directory
RUN mkdir -p /app/LTM

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "app.js"]

