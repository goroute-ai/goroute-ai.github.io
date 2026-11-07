---
title: Asynchronous Batch Processing API
sidebar_position: 11
description: Asynchronous batch processing with 24-hour turnaround SLA, 50% off-peak cost discount, state transitions, and JSONL input/output pipelines.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Asynchronous Batch Processing API (`POST /v1/batches`)

For high-volume, non-interactive workloads—such as dataset labeling, offline evaluation, bulk summarization, and synthetic data generation—GoRoute AI Gateway provides the **OpenAI-Compatible Batch Processing API**.

Batches decouple request ingestion from immediate execution. By accepting a 24-hour completion SLA, workloads run over off-peak provider headroom at up to a **50% discount** compared to synchronous on-demand inference.

---

## Endpoint Specification

| Endpoint | Method | Output | Description |
| :--- | :--- | :--- | :--- |
| `/v1/batches` | `POST` | `CanonicalBatch` JSON | Submit a new asynchronous batch job. |
| `/v1/batches` | `GET` | List JSON | List all recent batches for the organization. |
| `/v1/batches/{batch_id}` | `GET` | `CanonicalBatch` JSON | Inspect execution status and progress counts. |
| `/v1/batches/{batch_id}/cancel`| `POST` | `CanonicalBatch` JSON | Abort an ongoing or pending batch job. |

- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Turnaround SLA (`completion_window`)**: `24h`
- **Supported Target Endpoint**: `/v1/chat/completions`

---

## State Machine Transitions

```mermaid
stateDiagram-v2
    [*] --> validating: POST /v1/batches
    validating --> in_progress: Valid input file & schema
    validating --> failed: Invalid file or syntax error
    in_progress --> completed: All records processed
    in_progress --> cancelled: POST /v1/batches/{id}/cancel
    in_progress --> failed: Disk or database failure
    completed --> [*]
    failed --> [*]
    cancelled --> [*]
```

| State | Description |
| :--- | :--- |
| `validating` | Gateway checks tenant ownership of `input_file_id`, file purpose (`batch`), and verifies initial JSONL syntax. |
| `in_progress` | Background worker parses records sequentially, checks RBAC permissions per line item, and dispatches inference. |
| `completed` | All items have completed; output JSONL file is finalized and registered with `purpose: "batch_output"`. |
| `failed` | The batch encountered an unrecoverable failure (e.g. malformed lines exceeding buffer limits or storage loss). |
| `cancelled` | The caller explicitly aborted the batch before completion; completed items are preserved in output. |

---

## JSONL File Formats

### 1. Input File (`.jsonl`)

Upload using [`POST /v1/files`](/docs/data-plane/files) with `purpose="batch"`:

```json
{"custom_id": "eval-task-001", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "fast", "messages": [{"role": "user", "content": "Classify sentiment: Great latency."}]}}
{"custom_id": "eval-task-002", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "fast", "messages": [{"role": "user", "content": "Classify sentiment: Connection dropped."}]}}
```

### 2. Output File (`.jsonl`)

Once the batch reaches `status: "completed"`, download via `GET /v1/files/{output_file_id}/content`:

```json
{"id": "batch_req_01a", "custom_id": "eval-task-001", "response": {"status_code": 200, "request_id": "req_88f9...", "body": {"choices": [{"message": {"role": "assistant", "content": "Positive"}}]}}, "error": null}
{"id": "batch_req_02b", "custom_id": "eval-task-002", "response": {"status_code": 200, "request_id": "req_11a4...", "body": {"choices": [{"message": {"role": "assistant", "content": "Negative"}}]}}, "error": null}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Upload input file
FILE_ID=$(curl -s -X POST http://localhost:8080/v1/files \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@batch_tasks.jsonl" \
  -F "purpose=batch" | jq -r .id)

# 2. Submit Batch job
BATCH_ID=$(curl -s -X POST http://localhost:8080/v1/batches \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d "{
    \"input_file_id\": \"$FILE_ID\",
    \"endpoint\": \"/v1/chat/completions\",
    \"completion_window\": \"24h\",
    \"metadata\": {\"job_name\": \"nightly-evals\"}
  }" | jq -r .id)

echo "Created batch: $BATCH_ID"

# 3. Check Batch Status
curl -X GET "http://localhost:8080/v1/batches/$BATCH_ID" \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"

# 4. Cancel Batch (if needed)
curl -X POST "http://localhost:8080/v1/batches/$BATCH_ID/cancel" \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
import time
from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080/v1"
)

# 1. Upload file
file = client.files.create(
    file=open("tasks.jsonl", "rb"),
    purpose="batch"
)

# 2. Create batch
batch = client.batches.create(
    input_file_id=file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"pipeline": "benchmark_v2"}
)
print(f"Batch {batch.id} submitted (status: {batch.status})")

# 3. Poll batch status
while True:
    b = client.batches.retrieve(batch.id)
    print(f"Status: {b.status} | Completed: {b.request_counts.completed}/{b.request_counts.total}")
    if b.status in ("completed", "failed", "cancelled"):
        if b.status == "completed":
            print(f"Output File ID: {b.output_file_id}")
        break
    time.sleep(5)
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

type CreateBatchRequest struct {
	InputFileID      string            `json:"input_file_id"`
	Endpoint         string            `json:"endpoint"`
	CompletionWindow string            `json:"completion_window"`
	Metadata         map[string]string `json:"metadata,omitempty"`
}

type BatchResponse struct {
	ID            string `json:"id"`
	Status        string `json:"status"`
	OutputFileID  string `json:"output_file_id,omitempty"`
	RequestCounts struct {
		Total     int `json:"total"`
		Completed int `json:"completed"`
		Failed    int `json:"failed"`
	} `json:"request_counts"`
}

func main() {
	payload, _ := json.Marshal(CreateBatchRequest{
		InputFileID:      "file-89fa21bc-1240-4fe9-b001-c8120fa23e11",
		Endpoint:         "/v1/chat/completions",
		CompletionWindow: "24h",
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/batches",
		bytes.NewReader(payload),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var b BatchResponse
	_ = json.Unmarshal(body, &b)

	fmt.Printf("Batch created: %s | Status: %s\n", b.ID, b.Status)
}
```

</TabItem>
</Tabs>

---

## FinOps & Cost Economics

Because batch execution allows upstream providers to schedule processing during lower-demand periods, GoRoute applies the batch modality rate:
- **Up to 50% discount** relative to synchronous inference rates.
- Each completed request line item commits an atomic `SpendEvent` with `modality: "batch"` and exact token counts.
- Failed items do not incur completion token costs.
