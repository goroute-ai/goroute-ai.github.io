---
title: Chat and Streaming
sidebar_position: 3
description: Send single-prompt and multi-turn requests, stream deltas, and handle cancellation.
---

# Chat and Streaming

The SDK exposes `Chat` for a single user prompt, `ChatWithMessages` for structured history, and `StreamChat` for receiving text deltas through a callback. The examples below are function-body snippets and assume `ctx context.Context`, an initialized `gw`, and the standard imports.

## Single-prompt chat

```go
result, err := gw.Chat(ctx, "fast", "Draft a short status update.",
	gateway.WithSystem("You are a concise engineering assistant."),
	gateway.WithTemperature(0.4),
	gateway.WithMaxTokens(256),
)
if err != nil {
	return err
}
fmt.Println(result.Content)
```

Available request options are `WithSystem`, `WithTemperature`, `WithMaxTokens`, and `WithReasoningEffort`. The upstream provider determines which options it supports.

## Multi-turn chat

```go
result, err := gw.ChatWithMessages(ctx, gateway.ChatRequest{
	Model: "fast",
	Messages: []gateway.Message{
		{Role: "system", Content: "You are a concise site reliability engineer."},
		{Role: "user", Content: "What should I check first after an HTTP 504?"},
		{Role: "assistant", Content: "Check the gateway, upstream health, and timeout logs."},
		{Role: "user", Content: "How can I narrow it down?"},
	},
})
if err != nil {
	return err
}
fmt.Println(result.Content)
```

## Stream text deltas

`StreamChat` calls `onDelta` as text arrives from the upstream stream. The callback can return an error to stop processing.

```go
result, err := gw.StreamChat(ctx, "fast", "Write a short haiku about Go.", func(delta string) error {
	_, err := fmt.Print(delta)
	return err
})
if err != nil {
	return err
}
fmt.Printf("\nCost: %d µ$\n", result.CostMicros)
```

The gateway translates supported provider streaming responses into the SDK callback. Delivery timing and available content depend on the selected provider; no fixed latency or buffering guarantee is implied.

## Set a deadline

Pass a context with a timeout to bound the request and cancel work when the caller no longer needs the response:

```go
requestCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
defer cancel()

result, err := gw.Chat(requestCtx, "fast", "Summarize this report.")
if err != nil {
	return err
}
fmt.Println(result.Content)
```

## Inspect result fields

`ChatResult` provides top-level fields for content, provider, model, request ID, cost in micro-dollars, routing time in microseconds, cache status, and whether a fallback was attempted. `Usage` and `Raw` expose internal domain types; prefer the top-level fields when you need a stable public SDK surface.

For function/tool definitions and the HTTP request shape, see [Tool Calling](/docs/data-plane/tool-calling). The current public SDK request type does not expose a `tools` field.
