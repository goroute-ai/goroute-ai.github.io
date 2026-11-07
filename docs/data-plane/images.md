---
title: Image Generation, Edits & Variations API
sidebar_position: 8
description: OpenAI-compatible image generations, edits, and variations across DALL-E 2/3 and Google Imagen with quality tiers and resolution-based FinOps pricing.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Image Processing API (`POST /v1/images/*`)

GoRoute AI Gateway provides multi-provider image generation, inpainting/editing, and variation capabilities compatible with OpenAI's Images specification. Traffic can be directed to OpenAI **DALL-E 2 / DALL-E 3** or **Google Imagen** using unified request parameters.

---

## Endpoint Specifications

| Endpoint | Method | Format | Description |
| :--- | :--- | :--- | :--- |
| `/v1/images/generations` | `POST` | `application/json` | Generates new images from text prompts (DALL-E 3, Imagen). |
| `/v1/images/edits` | `POST` | `multipart/form-data` | Inpainting / editing existing images with prompt and optional alpha mask. |
| `/v1/images/variations` | `POST` | `multipart/form-data` | Creates visual variations of an uploaded source image. |

- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Max Image Upload Limit**: `20 MB` (enforced via `http.MaxBytesReader`)
- **Supported Formats**: PNG (must contain standard PNG signature `\x89PNG\r\n\x1a\n`)

---

## Resolution Pricing Matrix & FinOps Accounting

Image models do not bill on input/output token counts; instead, they bill per generated image unit based on **Resolution** (`1024x1024`, `1024x1792`, `1792x1024`), **Quality Tier** (`standard` vs `hd`), and **Quantity** (`n`).

GoRoute evaluates image spend using the model catalog's `ModalityPricingJSON` and integer micro-dollar calculation:

```text
Cost (µ$) = UnitRate(Quality, Size) * n
```

### DALL-E 3 Pricing Matrix Reference

| Resolution | Quality Tier | Unit Cost (USD) | Micro-Dollars ($\mu\$) |
| :--- | :--- | :--- | :--- |
| `1024x1024` | `standard` | $0.040 | **40,000 µ$** |
| `1024x1024` | `hd` | $0.080 | **80,000 µ$** |
| `1024x1792` / `1792x1024` | `standard` | $0.080 | **80,000 µ$** |
| `1024x1792` / `1792x1024` | `hd` | $0.120 | **120,000 µ$** |

> [!NOTE]
> If a request specifies `quality: "hd"` and the model catalog lacks an explicit resolution entry, GoRoute falls back safely to `ImageCostMicrosHD`, ensuring continuous FinOps ledger tracking.

---

## Generations API (`POST /v1/images/generations`)

### Request Schema (`CanonicalImageRequest`)

```json
{
  "model": "dall-e-3",
  "prompt": "A modern data center rendered with glowing fiber optic cables and neon illumination.",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "response_format": "url",
  "style": "vivid"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | string | **Yes** | Text description of the desired image(s). |
| `model` | string | No | Model identifier (`dall-e-3`, `dall-e-2`, `imagen-3.0`). Default: `dall-e-3`. |
| `n` | integer | No | Number of images to generate (1 for DALL-E 3; 1–10 for DALL-E 2). Default: `1`. |
| `quality` | string | No | Image fidelity: `standard` or `hd`. Default: `standard`. |
| `size` | string | No | Resolution: `1024x1024`, `1024x1792`, `1792x1024`, `512x512`, `256x256`. |
| `response_format` | string | No | Format of returned images: `url` or `b64_json`. Default: `url`. |
| `style` | string | No | `vivid` (hyper-real/dramatic) or `natural`. Default: `vivid`. |

### Response Schema (`CanonicalImageResponse`)

```json
{
  "created": 1740000000,
  "model": "dall-e-3",
  "provider": "openai",
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-...",
      "revised_prompt": "A sprawling server room bathed in electric blue and neon purple light..."
    }
  ]
}
```

---

## Image Edits & Variations

### Inpainting / Edits (`POST /v1/images/edits`)

Image editing modifies an existing PNG image using a replacement prompt and an optional alpha transparency mask.
- `image`: Original PNG file (under 20 MB).
- `mask` (optional): Transparent PNG where the transparent area denotes what should be repainted.
- `prompt`: Textual instruction for the edit.

### Variations (`POST /v1/images/variations`)

Generates stylistic variants of an existing PNG image without prompt text.
- `image`: Original source PNG file.
- `n`: Number of variations to create.

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Generate an image
curl -X POST http://localhost:8080/v1/images/generations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "Minimalist geometric logo representing network routing, vector style.",
    "size": "1024x1024",
    "quality": "standard"
  }'

# 2. Inpaint an existing image
curl -X POST http://localhost:8080/v1/images/edits \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "image=@diagram.png" \
  -F "mask=@mask.png" \
  -F "prompt=Add a glowing green database cluster icon inside the masked area" \
  -F "size=1024x1024"

# 3. Create image variations
curl -X POST http://localhost:8080/v1/images/variations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "image=@logo.png" \
  -F "n=2" \
  -F "size=1024x1024"
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080/v1"
)

response = client.images.generate(
    model="dall-e-3",
    prompt="Futuristic software architecture blueprint on dark glass, isometric 3D.",
    size="1024x1024",
    quality="hd",
    n=1
)

image_url = response.data[0].url
print(f"Generated Image URL: {image_url}")
print(f"Revised Prompt: {response.data[0].revised_prompt}")
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

type ImageGenRequest struct {
	Model   string `json:"model"`
	Prompt  string `json:"prompt"`
	Size    string `json:"size"`
	Quality string `json:"quality"`
}

type ImageGenResponse struct {
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Data    []struct {
		URL           string `json:"url"`
		RevisedPrompt string `json:"revised_prompt"`
	} `json:"data"`
}

func main() {
	payload, _ := json.Marshal(ImageGenRequest{
		Model:   "dall-e-3",
		Prompt:  "Cyberpunk cityscape at sunset with flying vehicles.",
		Size:    "1024x1024",
		Quality: "standard",
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/images/generations",
		bytes.NewReader(payload),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var imgResp ImageGenResponse
	_ = json.Unmarshal(body, &imgResp)

	fmt.Printf("Provider: %s | Cost: %s µ$\n",
		resp.Header.Get("X-Gateway-Provider"),
		resp.Header.Get("X-Gateway-Cost-Micros"),
	)
	if len(imgResp.Data) > 0 {
		fmt.Printf("Image URL: %s\n", imgResp.Data[0].URL)
	}
}
```

</TabItem>
</Tabs>
