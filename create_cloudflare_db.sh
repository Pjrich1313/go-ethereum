#!/bin/bash
# Copyright 2025 The go-ethereum Authors
# This script creates a Cloudflare D1 database using the Cloudflare API.
#
# Cloudflare D1 is a serverless SQL database built on SQLite.
# This script uses the Cloudflare API to create a new D1 database instance.
#
# Prerequisites:
#   - A Cloudflare account with API access
#   - A valid Cloudflare API token with D1 permissions
#   - Your Cloudflare account ID
#
# Usage:
#   1. Replace <account_id> with your Cloudflare account ID
#   2. Replace <TOKEN> with your Cloudflare API token
#   3. Replace <database_name> with your desired database name
#   4. Run the script: ./create_cloudflare_db.sh
#
# Example:
#   curl -X POST \
#     "https://api.cloudflare.com/client/v4/accounts/abc123/d1/database" \
#     -H "Authorization: Bearer your_token_here" \
#     -H "Content-Type: application/json" \
#     --data '{"name":"my-database"}'
#
# For more information, see:
#   https://developers.cloudflare.com/api/operations/cloudflare-d1-create-database

# Cloudflare API endpoint for creating a D1 database
# Replace placeholders before running this command:
#   <account_id> - Your Cloudflare account ID
#   <TOKEN> - Your Cloudflare API token with D1 permissions
#   <database_name> - The name for your new D1 database

curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/<account_id>/d1/database" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{"name":"<database_name>"}'
