---
title: Fast Heuristic Tokenization API
sidebar_position: 6
description: Zero-latency in-process token counting approximating family-specific BPE and SentencePiece vocabularies without external network calls.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Fast Heuristic Tokenization API (`POST /v1/tokenize`)

Accurate token estimation is vital for client-side budgeting, chunking text for RAG (Retrieval-Augmented Generation), and pre-flight validation before executing long-context inference.

GoRoute AI Gateway includes a **zero-latency, in-process subword tokenizer** accessible via `POST /v1/tokenize`. Unlike traditional proxies that make network roundtrips to an external tokenizer service or invoke heavyweight Cgo Python bindings (like `tiktoken`), GoRoute runs an optimized, pure-Go heuristic scanner that approximates Byte Pair Encoding (BPE) and SentencePiece vocabularies in under **50 microseconds**.

---

## Endpoint Specification

- **HTTP Method**: `POST`
- **Supported Paths**:
  - `/v1/tokenize`
  - `/tokenize` (Unversioned alias)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Tokenizer Profiles & Vocabulary Heuristics

The gateway dynamically resolves models to one of five specialized tokenization profiles (`internal/ratelimit/tokenizer.go`):

| Profile | Applicable Models | Vocabulary Divisor | Description |
| :--- | :--- | :--- | :--- |
| `o200k_base` | GPT-4o, GPT-4.1, o1, o3, o4 | `4.2` chars/token | 200k vocabulary; high compression on multilingual & code. |
| `cl100k_base` | GPT-4, GPT-3.5, `text-embedding-3-*` | `3.9` chars/token | Standard 100k OpenAI BPE vocabulary. |
| `claude_bpe` | Claude 3.5 Sonnet, Claude 3.7, Claude 3 Opus | `3.6` chars/token | Denser subword encoding on prose and system instructions. |
| `gemini_sp` | Gemini 2.5 Flash, Gemini 2.5 Pro, Gemma | `4.1` chars/token | Google SentencePiece unigram/BPE mixture. |
| `mistral_tekken`| Mistral Large, Codestral, Llama 3/3.3 | `3.8` chars/token | Tekken tokenizer with expanded code character tables. |

### Mathematical Estimation Algorithm

For any given input text, the scanner decomposes the byte stream across three dimensions:

```text
Tokens = ⌈(AlnumChars * 100) / Divisor⌉ + ⌊(PunctChars + 1) / 2⌋ + ⌊(UTF8NonASCIIBytes + 1) / 2⌋
```

1. **Alphanumeric Characters**: Scaled using the family-specific character-to-token ratio.
2. **Punctuation & Code Syntax**: Code brackets (`{`, `}`, `[`, `]`), JSON quotes, and operators often form dedicated BPE tokens.
3. **Multi-Byte UTF-8 Bytes**: Multi-byte sequences (emojis, Cyrillic, CJK, Arabic) undergo multi-step BPE merges.

---

## Request & Response Schemas

### Request Schema

Supports either a raw text prompt, or structured chat messages and tool definitions:

```json
{
  "model": "gpt-4.1",
  "prompt": "Explain Byzantine fault tolerance in distributed databases."
}
```

Or for structured multi-turn conversations:

```json
{
  "model": "claude-3-7-sonnet",
  "messages": [
    {"role": "system", "content": "You are a concise code reviewer."},
    {"role": "user", "content": "Review this pull request diff."}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "lookup_git_diff",
        "description": "Fetch PR diff by commit hash",
        "parameters": {
          "type": "object",
          "properties": {
            "commit": {"type": "string"}
          }
        }
      }
    }
  ]
}
```

### Response Schema

```json
{
  "model": "gpt-4.1",
  "profile": "o200k_base",
  "count": 9,
  "total_tokens": 9
}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# Tokenize a raw prompt
curl -X POST http://localhost:8080/v1/tokenize \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4.1",
    "prompt": "GoRoute AI Gateway performs zero-allocation subword tokenization."
  }'

# Tokenize full chat messages using Claude BPE profile
curl -X POST http://localhost:8080/v1/tokenize \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet",
    "messages": [
      {"role": "system", "content": "You are an AI assistant."},
      {"role": "user", "content": "How do goroutines manage call frames?"}
    ]
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:8080",
    headers={"Authorization": "Bearer sk-gw-prod-7f9a2b8c4d1e"}
)

response = client.post("/v1/tokenize", json={
    "model": "gemini-2.5-flash",
    "prompt": "Estimate token requirements for RAG context window budgeting."
})

result = response.json()
print(f"Profile: {result['profile']}")
print(f"Token count: {result['count']}")
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
	"time"
)

type TokenizeRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type TokenizeResponse struct {
	Model       string `json:"model"`
	Profile     string `json:"profile"`
	Count       int    `json:"count"`
	TotalTokens int    `json:"total_tokens"`
}

func main() {
	payload, _ := json.Marshal(TokenizeRequest{
		Model:  "claude-3-7-sonnet",
		Prompt: "Micro-dollar spend calculations with ceiling integer division.",
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/tokenize",
		bytes.NewReader(payload),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var tokResp TokenizeResponse
	_ = json.Unmarshal(body, &tokResp)

	fmt.Printf("Model: %s | Profile: %s | Tokens: %d\n",
		tokResp.Model, tokResp.Profile, tokResp.Count)
}
```

</TabItem>
</Tabs>

---

## Comparison: In-Process Heuristic vs Network Tokenizer

| Feature | GoRoute `/v1/tokenize` | Remote Tokenizer Service | Cgo / Tiktoken Binding |
| :--- | :--- | :--- | :--- |
| **Execution Latency** | **< 0.05 ms** (in-process) | 15 – 50 ms (HTTP network) | 0.5 – 2 ms |
| **Memory Allocation** | Zero heap allocation | TCP socket buffers | Cgo stack transition overhead |
| **Network Failure Mode** | None (always available) | External point of failure | Process segmentation risk |
| **Cross-Provider Profiles**| Auto-adapts to GPT, Claude, Gemini, Mistral | Usually single vendor only | Requires multiple native libraries |

> [!NOTE]
> The in-process token counter is also invoked automatically on every incoming `/v1/chat/completions` request for pre-flight rate limiting and sliding-window quota reservations.
