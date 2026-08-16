#!/usr/bin/env bash
# Warm up TTS cache by pre-generating audio for all flashcard words.
# Usage: ./scripts/warm-tts.sh [BASE_URL] [CONCURRENCY] [VOICE]

BASE_URL="${1:-https://grad-exam-prep.vincent-xu-work.workers.dev}"
CONCURRENCY="${2:-5}"
VOICE="${3:-luna}"
WORD_FILE="/tmp/flashcard-words.txt"

if [ ! -f "$WORD_FILE" ]; then
  echo "Word file not found: $WORD_FILE"
  exit 1
fi

TOTAL=$(wc -l < "$WORD_FILE" | tr -d ' ')
echo "Warming TTS cache: $TOTAL words, concurrency=$CONCURRENCY, voice=$VOICE"
echo "Target: $BASE_URL/api/tts"
echo ""

COUNT=0
HITS=0
MISSES=0
ERRORS=0

while IFS= read -r word; do
  COUNT=$((COUNT + 1))

  (
    escaped=$(echo "$word" | sed 's/"/\\"/g')
    result=$(curl -s -w "%{http_code}|%header{X-TTS-Cache}" \
      -X POST "$BASE_URL/api/tts" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$escaped\",\"provider\":\"cloudflare\",\"voice\":\"$VOICE\"}" \
      -o /dev/null 2>&1)

    status="${result%%|*}"
    cache="${result##*|}"

    if [ "$status" = "200" ]; then
      if [ "$cache" = "hit" ]; then
        echo "HIT|$word"
      else
        echo "MISS|$word"
      fi
    else
      echo "ERR|$word|$status"
    fi
  ) &

  if (( COUNT % CONCURRENCY == 0 )); then
    wait
  fi

  if (( COUNT % 100 == 0 )); then
    echo "--- Progress: $COUNT/$TOTAL ---" >&2
  fi
done < "$WORD_FILE"

wait
echo ""
echo "=== Done: $COUNT words processed ==="
