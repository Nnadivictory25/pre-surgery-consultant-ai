FROM oven/bun:1

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN chmod +x start.sh

RUN bun run build

EXPOSE 4173

CMD ["./start.sh"]