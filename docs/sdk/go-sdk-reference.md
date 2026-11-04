---
title: Go SDK API Reference
sidebar_position: 6
description: Public constructors, options, request types, and methods in pkg/gateway.
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
func WithConfigFile(path string) Option
func WithDemoMocksIfEnvMissing() Option
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

## Virtual keys and protocol registration

```go
func (c *Client) CreateVirtualKey(ctx context.Context, req VirtualKeyRequest) (*VirtualKeyInfo, error)
func (c *Client) RevokeVirtualKey(ctx context.Context, keyID string) error
func (c *Client) AddMCPServer(ctx context.Context, srv MCPServerConfig) (string, error)
func (c *Client) SyncMCPTools(ctx context.Context, serverID string) (int, error)
func (c *Client) ListMCPTools(ctx context.Context, route string) ([]map[string]any, error)
func (c *Client) AddA2AAgent(ctx context.Context, agent A2AAgentConfig) (string, error)
```

The corresponding public configuration types are `VirtualKeyRequest`, `VirtualKeyInfo`, `MCPServerConfig`, and `A2AAgentConfig`. Use the SDK feature guides for examples and required server permissions:

- [Client configuration](./client-configuration)
- [Virtual keys and FinOps](./virtual-keys-and-finops)
- [MCP and A2A](./mcp-and-a2a)
