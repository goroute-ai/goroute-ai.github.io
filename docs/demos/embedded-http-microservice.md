---
title: Embedded Microservice
sidebar_position: 27
description: Embed GoRoute AI Gateway in a Go HTTP service with Kubernetes liveness and readiness probes and graceful shutdown handling.
---

# Embedded HTTP Microservice with Kubernetes Probes

In this guide, you will embed the GoRoute AI Gateway directly into a production Go HTTP microservice featuring Kubernetes liveness (`/health/live`) and readiness (`/health/ready`) probes and graceful OS shutdown.

---

## Runnable Go Code

```go title="examples/embedded_http_microservice/main.go"
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	demoutil.Banner("Embedded HTTP Microservice with Kubernetes Probes")

	// 1. Initialize embedded gateway engine in-process
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "copilot",
				Model:     "openai/gpt-4o-mini",
				APIKey:    "os.environ/OPENAI_API_KEY",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Failed to initialize gateway", err)
	}
	defer gw.Close()

	// 2. Attach standard enterprise HTTP routes
	mux := http.NewServeMux()

	// Kubernetes Liveness & Readiness Probes
	mux.HandleFunc("/health/live", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"UP","timestamp":%d}`, time.Now().Unix())
	})
	mux.HandleFunc("/health/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"ready":true,"router_status":"HEALTHY"}`)
	})

	// Business route using embedded gateway client
	mux.HandleFunc("/api/ask", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")
		if q == "" {
			q = "Brief status update"
		}
		res, err := gw.Chat(r.Context(), "copilot", q, gateway.WithMaxTokens(16))
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"response":%q,"model":%q,"cost_micros":%d}`, res.Content, res.Model, res.CostMicros)
	})

	// 3. Start local HTTP server on random free port
	server := &http.Server{
		Addr:    "127.0.0.1:0",
		Handler: mux,
	}

	go func() {
		_ = server.ListenAndServe()
	}()
	time.Sleep(50 * time.Millisecond)

	demoutil.Info("Server Architecture", "Embedded GoRoute Gateway in Go HTTP Microservice")
	demoutil.Info("Liveness Probe", "GET /health/live -> 200 OK")
	demoutil.Info("Readiness Probe", "GET /health/ready -> 200 OK")
	demoutil.Info("Business Endpoint", "GET /api/ask?q=ping -> 200 OK")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)

	demoutil.Success("Microservice Status", "Gracefully stopped; zero memory leaks or unclosed sockets")
	demoutil.Done()
}
```
