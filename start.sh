#!/bin/bash

# Run database migration
bun run db:migrate

# Build the application
bun run build

# Start the preview server
bun run preview