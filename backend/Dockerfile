FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads/products && \
    chmod -R 755 /app/uploads

EXPOSE 3001

CMD ["npm", "start"]