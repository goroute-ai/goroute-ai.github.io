---
title: Audio Transcription, Translation & Speech API
sidebar_position: 7
description: High-throughput audio transcription (Whisper STT), translation, and speech synthesis (TTS) with retryable disk spooling and precision integer FinOps.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Audio Processing API (`POST /v1/audio/*`)

GoRoute AI Gateway provides full OpenAI-compatible support for multi-modal audio processing across three core capabilities:

1. **Speech-to-Text Transcription** (`POST /v1/audio/transcriptions`): Transcribes audio in its original language using OpenAI Whisper or open-source equivalents.
2. **Audio Translation** (`POST /v1/audio/translations`): Transcribes audio from any supported source language directly into English.
3. **Text-to-Speech Synthesis** (`POST /v1/audio/speech`): Synthesizes lifelike spoken audio from text using multi-voice neural models (`tts-1`, `tts-1-hd`).

---

## Endpoint Specifications

| Endpoint | Method | Input Type | Description |
| :--- | :--- | :--- | :--- |
| `/v1/audio/transcriptions` | `POST` | `multipart/form-data` | Converts spoken audio into text. |
| `/v1/audio/translations` | `POST` | `multipart/form-data` | Transcribes and translates non-English audio to English. |
| `/v1/audio/speech` | `POST` | `application/json` | Generates streaming audio from textual input. |

- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Supported Audio Codecs**: `mp3`, `opus`, `aac`, `flac`, `wav`, `m4a`, `webm`
- **Max Audio File Upload**: `25 MB` (enforced via `http.MaxBytesReader`)

---

## Architecture: Zero-Memory Retryable Disk Spooling

When handling large audio uploads, loading entire audio files into memory buffers would cause severe memory pressure and garbage collection pauses under high concurrent loads. Furthermore, if an upstream provider fails mid-flight, a pure streaming pipeline cannot retry because the HTTP request body stream has already been consumed.

GoRoute solves this with **Zero-Memory Disk Spooling**:

```mermaid
sequenceDiagram
    autonumber
    Client ->> Gateway: POST /v1/audio/transcriptions (Multipart Form, max 25MB)
    Note over Gateway: Spool stream directly to disk<br/>(gw-audio-*.tmp, 0600 mode)
    Gateway ->> Upstream Provider A: Stream from disk spool
    Upstream Provider A -->> Gateway: HTTP 503 Service Unavailable
    Note over Gateway: Rewind file descriptor to offset 0 (Zero GC)
    Gateway ->> Upstream Provider B (Fallback): Re-stream identical spool
    Upstream Provider B -->> Gateway: HTTP 200 OK (Transcription JSON)
    Note over Gateway: Unlink & remove spool file immediately
    Gateway -->> Client: Return Transcript + Telemetry Headers
```

1. **Disk Spooling**: Incoming multipart files are written directly to a temporary file (`gw-audio-*.tmp`) in chunks using `io.Copy`.
2. **Infinite Rewindability**: The gateway's reliability layer can rewind the file descriptor (`Seek(0, io.SeekStart)`) to replay the exact audio bytes to healthy fallback deployments without re-reading from the client.
3. **Immediate Cleanup**: Once the upstream completes (or fails all retries), the temporary file is safely unlinked (`defer os.Remove(spoolPath)`).

---

## Speech-to-Text Transcription (`/v1/audio/transcriptions`)

### Multipart Parameters

- `file` (binary, required): The audio file to transcribe.
- `model` (string, optional, default: `whisper-1`): Speech model identifier.
- `language` (string, optional): ISO-639-1 language code (e.g. `en`, `es`, `fr`, `de`).
- `prompt` (string, optional): An optional text guide to establish spelling, jargon, or punctuation context.
- `response_format` (string, optional, default: `json`): Format of the transcript: `json`, `text`, `verbose_json`, `srt`, `vtt`.
- `temperature` (float, optional, default: `0`): Sampling temperature between `0` and `1`.

### FinOps Accounting for STT

Whisper models bill based on **audio duration** rather than text tokens. GoRoute records exact duration in integer milliseconds (`duration_ms`) and computes spend in micro-dollars using 64-bit integer ceiling arithmetic:

```text
Cost (µ$) = ⌈ (DurationMs * AudioSTTCostMicrosPerSecond + 999) / 1000 ⌉
```

---

## Text-to-Speech Synthesis (`/v1/audio/speech`)

### JSON Request Schema

```json
{
  "model": "tts-1",
  "input": "GoRoute AI Gateway synthesizes audio with low latency and streaming responses.",
  "voice": "alloy",
  "response_format": "mp3",
  "speed": 1.0
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | No | TTS model (`tts-1` or `tts-1-hd`). Default: `tts-1`. |
| `input` | string | **Yes** | Text to convert to speech (up to 4096 characters). |
| `voice` | string | No | Voice profile: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`. Default: `alloy`. |
| `response_format` | string | No | Output format: `mp3`, `opus`, `aac`, `flac`, `wav`, `pcm`. Default: `mp3`. |
| `speed` | float | No | Playback speed from `0.25` to `4.0`. Default: `1.0`. |

### FinOps Accounting for TTS

TTS is priced strictly per 1,000 input characters. GoRoute enforces ceiling integer division so that short sentences never truncate fractional micro-dollars to zero:

```text
Cost (µ$) = ⌈ (CharCount * AudioTTSCostMicrosPer1KChars + 999) / 1000 ⌉
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Transcribe Audio
curl -X POST http://localhost:8080/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@meeting_recording.mp3" \
  -F "model=whisper-1" \
  -F "language=en"

# 2. Translate Foreign Audio to English
curl -X POST http://localhost:8080/v1/audio/translations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@spanish_interview.wav" \
  -F "model=whisper-1"

# 3. Text-to-Speech Synthesis
curl -X POST http://localhost:8080/v1/audio/speech \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Welcome to GoRoute AI Gateway. High reliability multi-modal routing.",
    "voice": "nova",
    "response_format": "mp3"
  }' \
  --output welcome.mp3
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080/v1"
)

# Transcribe
with open("lecture.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="text"
    )
print("Transcript:", transcript)

# Synthesize Speech
speech_response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input="Streaming real-time TTS over GoRoute Gateway."
)
speech_response.stream_to_file("output.mp3")
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type SpeechRequest struct {
	Model          string `json:"model"`
	Input          string `json:"input"`
	Voice          string `json:"voice"`
	ResponseFormat string `json:"response_format"`
}

func main() {
	payload, _ := json.Marshal(SpeechRequest{
		Model:          "tts-1",
		Input:          "Zero-memory disk spooling and precision FinOps.",
		Voice:          "echo",
		ResponseFormat: "mp3",
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/audio/speech",
		bytes.NewReader(payload),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	costHeader := resp.Header.Get("X-Gateway-Cost-Micros")
	providerHeader := resp.Header.Get("X-Gateway-Provider")
	fmt.Printf("TTS Provider: %s | Cost: %s µ$\n", providerHeader, costHeader)

	outFile, _ := os.Create("synthesized.mp3")
	defer outFile.Close()
	_, _ = io.Copy(outFile, resp.Body)
	fmt.Println("Audio saved to synthesized.mp3")
}
```

</TabItem>
</Tabs>

---

## Response Headers & Telemetry

| Header | Description |
| :--- | :--- |
| `X-Gateway-Request-Id` | Unique ID prefixed with `stt_`, `stt_translation_`, or `tts_` |
| `X-Gateway-Provider` | Upstream provider executing audio inference (e.g. `openai`) |
| `X-Gateway-Cost-Micros` | Micro-dollar spend incurred by the operation |
| `X-Gateway-Pricing-Status` | Price provenance (`verified`, `custom`, `unknown`) |
