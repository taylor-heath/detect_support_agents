#!/usr/bin/env bash
#
# gitpush.sh — stage all changes, commit with a timestamped message, push to main.
#
# Usage:
#   ./gitpush.sh
#

set -euo pipefail

# Current date and time, e.g. 2026-08-04 14:32:07
TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

# Stage everything (new, modified, and deleted files)
git add -A

# Only commit if there's something staged
if git diff --cached --quiet; then
    echo "Nothing to commit — working tree clean."
    exit 0
fi

git commit -m "Heath committed . ${TIMESTAMP}"

# Pull any remote changes before pushing (rebase keeps history linear)
git pull --rebase origin main

git push origin main

echo "Done: pushed to main at ${TIMESTAMP}"