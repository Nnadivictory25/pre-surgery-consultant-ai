#!/bin/bash

# Run database migration
bun run db:migrate

# Start the development server
bun run dev