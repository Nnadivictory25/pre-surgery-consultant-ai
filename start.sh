#!/bin/bash

# Run database migration
bun run db:migrate

# Start the production server
bun ./build/index.js