---
title: Stateful Tenant Files API
sidebar_position: 10
description: Multi-tenant file storage with streaming SHA-256 hashing, 0700/0600 POSIX permissions, PostgreSQL indexing, and OpenAI Files compatibility.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stateful Tenant Files API (`POST /v1/files`)

GoRoute AI Gateway implements OpenAI-compatible stateful file management to support asynchronous batch processing (`/v1/batches`), fine-tuning workflows, and multi-modal assistants. Files are isolated per organization, validated for integrity via streaming cryptographic hashes, and stored with strict POSIX permissions.

---

## Endpoint Specification

| Endpoint | Method | Output | Description |
| :--- | :--- | :--- | :--- |
| `/v1/files` | `POST` | `CanonicalFile` JSON | Upload a new tenant file (up to 512 MB). |
| `/v1/files` | `GET` | List JSON | List all active files for the authenticated organization. |
| `/v1/files/{file_id}` | `GET` | `CanonicalFile` JSON | Retrieve metadata for a specific file. |
| `/v1/files/{file_id}/content` | `GET` | Binary Stream | Download raw binary or text file contents. |
| `/v1/files/{file_id}` | `DELETE`| Deletion Status | Permanently delete file from database and disk storage. |

- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Max Upload Limit**: `512 MB` (enforced via `http.MaxBytesReader`)
- **Default Storage Path**: Configured via `GOROUTE_FILES_DIR` or defaults to `/tmp/goroute-files`

---

## Architecture: Multi-Tenant Storage & Streaming Hashes

```mermaid
sequenceDiagram
    autonumber
    Client ->> Gateway: POST /v1/files (multipart/form-data, purpose="batch")
    Note over Gateway: Auth & Org Isolation Check (VirtualKey Context)
    Gateway ->> Disk Storage: Stream chunks to 0600 file descriptor
    Gateway ->> SHA-256 Hasher: io.MultiWriter computes SHA-256 concurrently
    Note over Gateway: Zero Heap Buffering: Streamed in 32KB chunks
    Disk Storage -->> Gateway: Sync file to disk (0700 dir / 0600 mode)
    Gateway ->> PostgreSQL: INSERT INTO files (id, org_id, content_sha256, ...)
    PostgreSQL -->> Gateway: Commit OK
    Gateway -->> Client: HTTP 201 Created (CanonicalFile JSON)
```

### Security & Integrity Controls

1. **POSIX File System Isolation**:
   The gateway daemon creates its storage root with directory permissions `0700` (`drwx------`) and all uploaded blobs with file permissions `0600` (`-rw-------`). Unprivileged local system processes cannot read or modify tenant files.
2. **Streaming Cryptographic Hashing**:
   Rather than buffering up to 512 MB in memory to calculate hashes, GoRoute utilizes an `io.MultiWriter(dst, hasher)` that writes to disk while concurrently streaming bytes into a SHA-256 digest engine.
3. **Multi-Tenant Boundary**:
   Every database query filters by `WHERE org_id = $1`. Tenants cannot read, download, or delete files belonging to another organization, preventing cross-tenant leakage.

---

## File Schemas

### File Object Schema (`CanonicalFile`)

```json
{
  "id": "file-89fa21bc-1240-4fe9-b001-c8120fa23e11",
  "object": "file",
  "bytes": 284102,
  "created_at": 1740000000,
  "filename": "batch_prompts_2026.jsonl",
  "purpose": "batch",
  "status": "uploaded",
  "content_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Upload a JSONL file for Batch processing
curl -X POST http://localhost:8080/v1/files \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@requests.jsonl" \
  -F "purpose=batch"

# 2. List all files for the organization
curl -X GET http://localhost:8080/v1/files \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"

# 3. Retrieve file metadata
curl -X GET http://localhost:8080/v1/files/file-89fa21bc-1240-4fe9-b001-c8120fa23e11 \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"

# 4. Stream / Download file content
curl -X GET http://localhost:8080/v1/files/file-89fa21bc-1240-4fe9-b001-c8120fa23e11/content \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -o downloaded_requests.jsonl

# 5. Delete file
curl -X DELETE http://localhost:8080/v1/files/file-89fa21bc-1240-4fe9-b001-c8120fa23e11 \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080/v1"
)

# Upload File
file_record = client.files.create(
    file=open("prompts.jsonl", "rb"),
    purpose="batch"
)
print(f"Uploaded File ID: {file_record.id} ({file_record.bytes} bytes)")

# List Files
files = client.files.list()
for f in files.data:
    print(f"- {f.id}: {f.filename} [{f.purpose}]")

# Retrieve Content
content = client.files.content(file_record.id)
with open("retrieved_prompts.jsonl", "wb") as f:
    f.write(content.read())

# Delete File
client.files.delete(file_record.id)
print(f"File {file_record.id} deleted.")
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
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

type FileRecord struct {
	ID        string `json:"id"`
	Bytes     int64  `json:"bytes"`
	Filename  string `json:"filename"`
	Purpose   string `json:"purpose"`
	Status    string `json:"status"`
	SHA256    string `json:"content_sha256"`
}

func main() {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	_ = writer.WriteField("purpose", "batch")
	part, _ := writer.CreateFormFile("file", "eval_batch.jsonl")
	_, _ = part.Write([]byte(`{"custom_id":"req-1","method":"POST","url":"/v1/chat/completions","body":{"model":"fast","messages":[{"role":"user","content":"Hello"}]}}` + "\n"))
	_ = writer.Close()

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/files",
		body,
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	var fileRec FileRecord
	_ = json.Unmarshal(respBytes, &fileRec)

	fmt.Printf("File Uploaded: %s (Bytes: %d, SHA: %s)\n",
		fileRec.ID, fileRec.Bytes, fileRec.SHA256)
}
```

</TabItem>
</Tabs>
