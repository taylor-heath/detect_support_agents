#!/usr/bin/env bash
#
# watch.sh — watch a repo for changes and run gitpush.sh on each burst,
#            logging every trigger with a timestamp.
#
# Usage:
#   ./watch.sh
#
# Requires: fswatch  (brew install fswatch)
#
 
set -uo pipefail
 
# --- Configure these two paths ---
REPO_DIR="/Users/heath.taylor/Documents/Technical/detect_support_agents"
PUSH_SCRIPT="/Users/heath.taylor/Documents/Technical/detect_support_agents/gitadd.sh"
LOG_FILE="${REPO_DIR}/.gitpush.log"
# ---------------------------------
 
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}
 
log "watcher started, watching ${REPO_DIR}"
 
# -o        : coalesce many file events into one batch line
# -e "\.git": ignore changes inside .git (prevents self-triggering loops)
# --latency : wait this many seconds to gather a burst before firing
fswatch -o -e "\.git" --latency 2 "$REPO_DIR" | while read -r num_events; do
    log "detected ${num_events} change batch — running gitpush"
    # Run the push script and fold its output into the same log, timestamped
    if "$PUSH_SCRIPT" >> "$LOG_FILE" 2>&1; then
        log "gitpush finished OK"
    else
        log "gitpush FAILED (exit $?) — check output above"
    fi
done