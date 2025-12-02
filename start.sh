#!/bin/bash

# Build the application
bun run build

# Run database migration
bun run db:migrate


# Start the preview server
bun run preview