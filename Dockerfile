FROM oven/bun:1

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN chmod +x start.sh

CMD ["./start.sh"]