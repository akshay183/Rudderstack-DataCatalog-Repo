FROM ubuntu:22.04
WORKDIR /app
RUN apt-get update && apt-get install -y wget curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs
RUN node -v && npm -v  # Verify Node 18.x and npm
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]