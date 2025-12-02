FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run db:generate

RUN bun run db:migrate

RUN bun run build

FROM oven/bun:1 AS runtime

WORKDIR /app

COPY --from=builder /app/package.json ./

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/build ./build

COPY --from=builder /app/src/lib/server/db ./src/lib/server/db

EXPOSE 4173

CMD ["bun", "run", "preview"]