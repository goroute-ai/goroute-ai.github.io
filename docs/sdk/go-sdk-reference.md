---
title: Go SDK API Reference
sidebar_position: 6
description: Public constructors, options, request types, and methods in pkg/gateway.
keywords: [go sdk reference, pkg/gateway api, gateway client methods, go options, sdk types]
---

# Go SDK API Reference

Package: `github.com/goroute-ai/ai-gateway-go/pkg/gateway`

The signatures below reflect the public SDK types and methods. A few lower-level helpers expose types from Go's `internal` packages; those are omitted because applications outside the gateway module cannot import those types.

## Constructors and client lifecycle

```go
func New(opts ...Option) (*Client, error)
func NewClient(baseURL, apiKey string) *Client

func (c *Client) WithKey(virtualKey string) *Client
func (c *Client) Close()
func (c *Client) BaseURL() string
```

`New` starts an embedded instance unless configured with `WithRemote`. `NewClient` creates a client for an existing gateway. `Close` shuts down resources created for embedded mode; it is a no-op for a remote client.

## Client options

```go
func WithAllowPrivateNetworks() Option
func WithConfigFile(path string) Option
func WithDemoMocksIfEnvMissing() Option
func WithHTTPClient(hc *http.Client) Option
func WithLogLevel(level string) Option
func WithLogger(l *slog.Logger) Option
func WithModelList(entries ...ModelEntry) Option
func WithRemote(baseURL, apiKey string) Option
func WithSilentLogs() Option
```

`Option` is an opaque option type accepted by `New`; its function signature uses an internal configuration type. Applications should pass the built-in options instead of constructing options directly.

## Chat methods

```go
func (c *Client) Chat(ctx context.Context, model, userPrompt string, opts ...RequestOption) (*ChatResult, error)
func (c *Client) ChatWithMessages(ctx context.Context, req ChatRequest, opts ...RequestOption) (*ChatResult, error)
func (c *Client) StreamChat(ctx context.Context, model, userPrompt string, onDelta func(delta string) error, opts ...RequestOption) (*ChatResult, error)
func (c *Client) ListModels(ctx context.Context) ([]string, error)
```

Request options:

```go
func WithSystem(systemPrompt string) RequestOption
func WithTemperature(temp float64) RequestOption
func WithMaxTokens(maxTokens int) RequestOption
func WithReasoningEffort(effort string) RequestOption
```

Pass these helpers to `Chat` or `StreamChat`. The SDK exposes the option type for use with its built-in helpers; applications should not implement custom options because the function signature depends on an internal request type.

## Core data types

```go
type ModelEntry struct {
	ModelName       string
	Model           string
	APIKey          string
	APIBase         string
	RoutingStrategy string
	Fallbacks       []string
	Weight          int
	RPM             int
	TPM             int
	SimulateStatus  int
}

type ChatResult struct {
	Content           string
	ReasoningContent  string
	Provider          string
	Model             string
	RequestID         string
	CostMicros        int64
	RoutingMicros     int64
	CacheStatus       string
	RouteReason       string
	FallbackAttempted bool
    // Usage and Raw are omitted because their concrete types come from internal packages.
}

type ChatRequest struct {
	Model           string
	Messages        []Message
	Temperature     *float64
	TopP            *float64
	MaxTokens       *int
	Stop            []string
	Stream          bool
	ReasoningEffort string
	User            string
}

type Message struct {
	Role       string
	Content    string
	Name       string
	ToolCallID string
	ToolCalls  []ToolCall
}

type ToolCall struct {
	ID       string
	Type     string
	Function FunctionCall
}

type FunctionCall struct {
	Name      string
	Arguments string
}
```

The `ChatResult` excerpt shows the stable top-level fields most applications need. It also has `Usage` and `Raw` fields whose concrete types come from internal packages; prefer top-level fields when you need to avoid depending on those implementation types. JSON tags are omitted here for readability; consult the source for serialization details.

## Modality, Responses, Files, Batches & Realtime (`v1.7.0`)

Pure-SDK methods using self-contained public structs (no `internal/` imports):

```go
// Embeddings, Rerank, Moderation, Responses
func (c *Client) CreateEmbedding(ctx context.Context, req EmbeddingRequest) (*EmbeddingResponse, error)
func (c *Client) CreateRerank(ctx context.Context, req RerankRequest) (*RerankResponse, error)
func (c *Client) CreateModeration(ctx context.Context, req ModerationRequest) (*ModerationResponse, error)
func (c *Client) CreateResponse(ctx context.Context, req ResponseRequest) (*ResponseOutput, error)
func (c *Client) StreamResponse(ctx context.Context, req ResponseRequest, onDelta func(delta string) error) (*ResponseOutput, error)

// Images & Audio
func (c *Client) CreateImage(ctx context.Context, req ImageGenerationRequest) (*ImageResponse, error)
func (c *Client) ImageEdit(ctx context.Context, req ImageEditRequest) (*ImageResponse, error)
func (c *Client) ImageVariation(ctx context.Context, req ImageVariationRequest) (*ImageResponse, error)
func (c *Client) CreateSpeech(ctx context.Context, req SpeechRequest) ([]byte, error)
func (c *Client) TranscribeAudio(ctx context.Context, req AudioTranscriptionRequest) (*AudioTranscriptionResult, error)

// Tokenization & Anthropic Messages pass-through
func (c *Client) Tokenize(ctx context.Context, req TokenizeRequest) (*TokenizeResponse, error)
func (c *Client) CountTokens(ctx context.Context, req CountTokensRequest) (*CountTokensResponse, error)
func (c *Client) Messages(ctx context.Context, req map[string]any) (map[string]any, error)
func (c *Client) StreamMessages(ctx context.Context, req map[string]any, onDelta func(delta string) error) (map[string]any, error)

// Stateful Files & Batches
func (c *Client) UploadFile(ctx context.Context, req FileUploadRequest) (*FileObject, error)
func (c *Client) ListFiles(ctx context.Context, purpose string) ([]FileObject, error)
func (c *Client) GetFile(ctx context.Context, fileID string) (*FileObject, error)
func (c *Client) GetFileContent(ctx context.Context, fileID string) ([]byte, error)
func (c *Client) DeleteFile(ctx context.Context, fileID string) error
func (c *Client) CreateBatch(ctx context.Context, req BatchCreateRequest) (*BatchObject, error)
func (c *Client) ListBatches(ctx context.Context) ([]BatchObject, error)
func (c *Client) GetBatch(ctx context.Context, batchID string) (*BatchObject, error)
func (c *Client) CancelBatch(ctx context.Context, batchID string) (*BatchObject, error)

// WebSocket Realtime Sessions
func (c *Client) ConnectRealtime(ctx context.Context, model string) (*RealtimeSession, error)
func (s *RealtimeSession) SendEvent(ctx context.Context, ev RealtimeEvent) error
func (s *RealtimeSession) ReadEvent(ctx context.Context) (*RealtimeEvent, error)
func (s *RealtimeSession) Close() error
```

Public modality/realtime structs in `pkg/gateway`: `EmbeddingRequest`, `EmbeddingData`, `EmbeddingResponse`, `UsageInfo`, `RerankRequest`, `RerankResult`, `RerankUsage`, `RerankResponse`, `ModerationRequest`, `ModerationResult`, `ModerationResponse`, `ResponseRequest`, `ResponseContentPart`, `ResponseOutputItem`, `ResponseOutput`, `ImageGenerationRequest`, `ImageEditRequest`, `ImageVariationRequest`, `ImageData`, `ImageResponse`, `SpeechRequest`, `AudioTranscriptionRequest`, `AudioTranscriptionResult`, `TokenizeRequest`, `TokenizeResponse`, `CountTokensMessage`, `CountTokensRequest`, `CountTokensResponse`, `FileUploadRequest`, `FileObject`, `BatchCreateRequest`, `BatchCounts`, `BatchObject`, `RealtimeSessionConfig`, `RealtimeEvent`, and `RealtimeSession`.

## Virtual keys, governance, FinOps & protocol registration

```go
func (c *Client) CreateVirtualKey(ctx context.Context, req VirtualKeyRequest) (*VirtualKeyInfo, error)
func (c *Client) UpdateVirtualKey(ctx context.Context, keyID string, req VirtualKeyUpdateRequest) (*VirtualKeyConfig, error)
func (c *Client) RotateVirtualKey(ctx context.Context, keyID string) (*VirtualKeyRotateResponse, error)
func (c *Client) RevokeVirtualKey(ctx context.Context, keyID string) error
func (c *Client) UpdateTeam(ctx context.Context, teamID string, req TeamUpdateRequest) (*TeamConfig, error)
func (c *Client) DeleteTeam(ctx context.Context, teamID string) error
func (c *Client) UpdateUser(ctx context.Context, userID string, req UserUpdateRequest) (*UserConfig, error)
func (c *Client) DeleteUser(ctx context.Context, userID string) error
func (c *Client) GetSpendSummary(ctx context.Context) (*SpendSummaryResponse, error)
func (c *Client) GetConfig(ctx context.Context) (map[string]any, error)
func (c *Client) AddMCPServer(ctx context.Context, srv MCPServerConfig) (string, error)
func (c *Client) SyncMCPTools(ctx context.Context, serverID string) (int, error)
func (c *Client) ListMCPTools(ctx context.Context, route string) ([]map[string]any, error)
func (c *Client) AddA2AAgent(ctx context.Context, agent A2AAgentConfig) (string, error)
func (c *Client) GetWellKnownAgentCard(ctx context.Context) (map[string]any, error)
```

The corresponding public configuration and governance types are `VirtualKeyRequest`, `VirtualKeyInfo`, `VirtualKeyConfig`, `VirtualKeyUpdateRequest`, `VirtualKeyRotateResponse`, `TeamConfig`, `TeamUpdateRequest`, `UserConfig`, `UserUpdateRequest`, `SpendSummaryResponse`, `MCPServerConfig`, and `A2AAgentConfig`. Use the SDK feature guides for examples and required server permissions:

- [Client configuration](./client-configuration)
- [Chat and streaming](./chat-and-streaming)
- [Virtual keys and FinOps](./virtual-keys-and-finops)
- [MCP and A2A](./mcp-and-a2a)
