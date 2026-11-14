---
title: OpenAI
sidebar_position: 2
description: OpenAI provider integration for chat, reasoning, images, audio, embeddings, Responses API, and Realtime WebSockets.
---

# OpenAI

GoRoute provides a native adapter for **OpenAI**, with gateway routes for chat, embeddings, audio, images, moderation, Responses, and Realtime. Model IDs used in examples are provider-side examples, not an exhaustive or guaranteed-current list of models supported by every GoRoute deployment. OpenAI changes model IDs and endpoint availability over time; check the [OpenAI model catalog](https://developers.openai.com/api/docs/models) and then confirm the IDs exposed to your key with [`GET /v1/models`](/docs/api-reference/gateway-api#4-model-catalogue-inventory-get-v1models).

---

## Modalities & Route Map

| Modality | Gateway Route | Upstream Engine |
| :--- | :--- | :--- |
| **Chat Completions** | `POST /v1/chat/completions` | Standard Chat REST |
| **Reasoning Models** | `POST /v1/chat/completions` | Reasoning Normalizer |
| **Embeddings** | `POST /v1/embeddings` | Vector Engine |
| **Audio Transcription** | `POST /v1/audio/transcriptions` | Audio transcription |
| **Audio Speech** | `POST /v1/audio/speech` | Speech generation |
| **Image Generation** | `POST /v1/images/generations` | Image generation |
| **Content Moderation**| `POST /v1/moderations` | Moderation classifier |
| **Responses API** | `POST /v1/responses` | Structured Responses |
| **Realtime WebSockets**| `GET /v1/realtime` | Full-duplex WebSockets |

OpenAI's current catalog includes IDs such as `gpt-6-astra` and `gpt-6.1-sol`; these are provider-side examples only. The model catalog describes endpoint availability per model, so do not assume that every listed model works with Chat Completions or every GoRoute route. Verify provider endpoint compatibility and your tenant-filtered gateway inventory before configuring a deployment.

---

## Reasoning Effort Normalization (o1 & o3)

OpenAI's reasoning models (`o1`, `o1-mini`, `o3`, `o3-mini`) enforce different API constraints than standard models. GoRoute's native adapter automatically handles these nuances:

1. **System Prompt Normalization**: OpenAI reasoning models reject messages with `role: "system"`. GoRoute transparently converts them to `role: "developer"` when targeting any model prefixed with `o1` or `o3`.
2. **Temperature and Top-P Stripping**: Because reasoning models enforce internal temperature controls, supplying `temperature` or `top_p` triggers an upstream `400 Bad Request`. GoRoute automatically strips these fields before transmission.
3. **Reasoning Effort Mapping**: Pass `reasoning_effort` (`"low"`, `"medium"`, `"high"`) directly in your request payload to control internal chain-of-thought token allocation:

```json
{
  "model": "o3-mini",
  "reasoning_effort": "high",
  "messages": [
    {"role": "developer", "content": "You are an expert algorithmic systems engineer."},
    {"role": "user", "content": "Prove that 2-SAT can be solved in linear time using strongly connected components."}
  ]
}
```

---

## Audio Services: Whisper & TTS

### Audio Transcription (Whisper STT)
Available via `POST /v1/audio/transcriptions` and `/translations`. To protect gateway memory under concurrent uploads of large audio files (up to 25 MB), GoRoute uses **multipart disk spooling** (`internal/server/handlers_audio.go`):
- Audio payloads are spooled to temporary files with secure `0600` permissions.
- Zero-memory retryability: upstream network retries re-stream from disk rather than buffering gigabytes in RAM.
- Billing is tracked strictly per integer duration second.

```bash
curl -X POST http://localhost:8080/v1/audio/transcriptions \
  -H "Authorization: Bearer your-virtual-key" \
  -F "file=@meeting_recording.mp3" \
  -F "model=whisper-1" \
  -F "language=en"
```

### Text-to-Speech (TTS)
Available via `POST /v1/audio/speech`. GoRoute streams raw audio bytes back to the caller as they arrive from OpenAI:
- Supported formats: `mp3`, `opus`, `aac`, `flac`, `wav`, `pcm`.
- Voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`.
- Billed per 1,000 characters using 64-bit ceiling integer division in the FinOps ledger.

```bash
curl -X POST http://localhost:8080/v1/audio/speech \
  -H "Authorization: Bearer your-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "GoRoute provides zero-overhead intelligent routing for modern enterprise AI.",
    "voice": "nova"
  }' --output speech.mp3
```

---

## Image Generation (DALL-E 2 / 3)

Access image generation, edits, and variations via `POST /v1/images/generations`:

```bash
curl -X POST http://localhost:8080/v1/images/generations \
  -H "Authorization: Bearer your-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "Isometric view of a modern data center with glowing fiber cables, cinematic lighting",
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }'
```

GoRoute records image unit accounting in micro-dollars based on model resolution and quality tier (e.g., $0.040 for 1024x1024 standard DALL-E 3).

---

## Realtime WebSocket Protocol (`/v1/realtime`)

GoRoute supports the OpenAI **Realtime API** (`GET /v1/realtime` and `GET /openai/v1/realtime`), enabling low-latency, full-duplex speech-to-speech and text-to-speech interactions.

- **Connection Hijacking**: GoRoute leverages `nhooyr.io/websocket` to hijack the initial HTTP request and establish bidirectional WebSocket tunnels between client applications and OpenAI.
- **Upstream Session Headers**: Injects Bearer credentials and `OpenAI-Beta: realtime=v1` transparently.
- **FinOps Stream Auditing**: Monitors session frame counts and connection durations.

```javascript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
  headers: {
    'Authorization': 'Bearer your-virtual-key'
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'response.create',
    response: {
      modalities: ['text'],
      instructions: 'You are a real-time conversational agent.'
    }
  }));
});
```

---

## Gateway Configuration

Add OpenAI deployments to `configs/config.yaml`:

```yaml
model_list:
  # Primary GPT-4o
  - model_name: gpt-4o
    routing_strategy: weighted-shuffle
    fallbacks: ["gpt-4o-mini"]
    model_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
      rpm: 5000
      tpm: 800000

  # Cost-effective fallback
  - model_name: gpt-4o-mini
    model_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  # Reasoning flagships
  - model_name: o3-mini
    model_params:
      model: openai/o3-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: o1
    model_params:
      model: openai/o1
      api_key: os.environ/OPENAI_API_KEY

  # Embeddings
  - model_name: text-embedding-3-large
    model_params:
      model: openai/text-embedding-3-large
      api_key: os.environ/OPENAI_API_KEY
```

---

## Usage Examples

### 1. Chat Completion with Reasoning Effort

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "o3-mini",
    "reasoning_effort": "medium",
    "messages": [
      {"role": "user", "content": "Write a concurrent worker pool in Go with worker cancellation."}
    ]
  }'
```

### 2. Streaming with Usage Statistics

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Summarize distributed consensus algorithms."}],
    "stream": true,
    "stream_options": {"include_usage": true}
  }'
```

### 3. Calling OpenAI via the Go SDK

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "gpt-4o",
				Model:     "openai/gpt-4o",
				APIKey:    "os.environ/OPENAI_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway initialization failed: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "gpt-4o", "Explain zero-copy I/O in the Linux kernel.")
	if err != nil {
		log.Fatalf("OpenAI chat error: %v", err)
	}

	fmt.Println("Response:\n", response)
}
```

> [!NOTE]
> GoRoute automatically registers upstream model pricing provenance for OpenAI models, ensuring real-time spend calculations reflect the latest token rates for prompt, completion, and reasoning tokens.
