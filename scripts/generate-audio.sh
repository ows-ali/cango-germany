#!/bin/bash
# CanGo Audio Generation Script
# Uses edge-tts (Microsoft Neural TTS) — free, no API key needed
# Install: pip install edge-tts

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/cango}"

echo "📢 Generating CanGo audio files..."
echo ""

# Fetch all experiences that need audio
EXPERIENCES=$(psql "$DB_URL" -t -A -F',' \
  "SELECT e.id, e.title, string_agg(t.german_text, ' ' ORDER BY t.order) AS full_text
   FROM experiences e
   JOIN transcript_lines t ON t.experience_id = e.id
   WHERE e.audio_url IS NULL
   GROUP BY e.id
   ORDER BY e.id")

mkdir -p public/audio

echo "$EXPERIENCES" | while IFS=',' read -r id title text; do
  if [ -z "$id" ]; then continue; fi
  echo "  Generating: Experience $id — $title"
  
  # Truncate if too long (edge-tts limit is ~3000 chars)
  truncated="${text:0:2800}"
  
  edge-tts \
    --voice de-DE-KatjaNeural \
    --text "$truncated" \
    --write-media "public/audio/experience-$id.mp3"
  
  # Also generate a short preview version
  preview="${text:0:300}"
  edge-tts \
    --voice de-DE-KatjaNeural \
    --text "$preview" \
    --write-media "public/audio/experience-$id-preview.mp3"
    
  echo "    ✅ experience-$id.mp3 generated"
done

echo ""
echo "✅ All audio files generated in public/audio/"
echo "Run: psql \$DATABASE_URL -c \"UPDATE experiences SET audio_url = 'https://your-domain.com/audio/experience-' || id || '.mp3' WHERE audio_url IS NULL;\""
