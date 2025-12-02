FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]