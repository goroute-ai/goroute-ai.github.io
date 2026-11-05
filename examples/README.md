# GoRoute AI Gateway — Progressive Developer Demos

> Hands-on Go examples for the [GoRoute AI Gateway](https://github.com/goroute-ai/ai-gateway-go).
> Every demo is self-contained in its own directory, compiles with pure Go (`go run ./<dir>`), and demonstrates a single atomic capability.

---

## 🚀 Running the Demos

All demos run **100% offline with zero external dependencies** by default using simulated mocks.
To run live against upstream providers, copy `.env.example` to `.env` (or export in shell):

```bash
# Optional: test live with your own keys
export OPENAI_API_KEY="sk-proj-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIzaSy... or AQ.Ab8..."
```

---

## 📚 Examples Roadmap

### Fundamentals
| Directory | Focus & Concept |
|---|---|
| [`hello_gateway`](./hello_gateway/main.go) | Minimalist 20-line in-process gateway setup and synchronous completion. |
| [`system_prompt`](./system_prompt/main.go) | Persona steering and behavioral guidance using `gateway.WithSystem(...)`. |
| [`streaming_tokens`](./streaming_tokens/main.go) | Zero-buffer SSE token-by-token streaming with live delta chunk callback. |
| [`temperature_and_sampling`](./temperature_and_sampling/main.go) | Deterministic sampling controls (`WithTemperature(0.0)`) and minimal token caps. |
| [`json_mode_structured_output`](./json_mode_structured_output/main.go) | Guaranteed machine-readable JSON schema extraction. |
| [`multi_turn_conversation`](./multi_turn_conversation/main.go) | Contextual chat history preservation across alternating user and assistant turns. |

### Multi-Provider Integrations
| Directory | Focus & Concept |
|---|---|
| [`openai_direct`](./openai_direct/main.go) | Direct OpenAI integration with cost-optimized `openai/gpt-4o-mini`. |
| [`anthropic_direct`](./anthropic_direct/main.go) | Direct Anthropic integration with economical `anthropic/claude-haiku-4-5-20251001`. |
| [`gemini_direct`](./gemini_direct/main.go) | Direct Google Gemini integration with ultra-low-cost `gemini/gemini-2.5-flash-lite`. |
| [`local_ollama`](./local_ollama/main.go) | Offline on-premises inference with local Ollama (`ollama/llama3.2`). |
| [`unified_model_alias`](./unified_model_alias/main.go) | Logical abstraction layer decoupling application code from upstream providers. |

### Tool Calling & Autonomous Agents
| Directory | Focus & Concept |
|---|---|
| [`single_tool_definition`](./single_tool_definition/main.go) | Tool schema registration and discovery via Model Context Protocol (MCP). |
| [`tool_execution_callback`](./tool_execution_callback/main.go) | In-process execution of tool calls and result formatting. |
| [`multi_tool_selection`](./multi_tool_selection/main.go) | Aggregating multiple microservice tool servers into a unified registry. |
| [`autonomous_tool_loop`](./autonomous_tool_loop/main.go) | Multi-turn autonomous tool execution loop with zero human intervention. |

### Traffic Routing, Balancers & Resiliency
| Directory | Focus & Concept |
|---|---|
| [`failover_fallback_chain`](./failover_fallback_chain/main.go) | Upstream 503 outage automatic fallback cascade to backup model. |
| [`round_robin_balancer`](./round_robin_balancer/main.go) | Uniform stateless request distribution across multiple model backends. |
| [`weighted_shuffle_routing`](./weighted_shuffle_routing/main.go) | Proportionate canary traffic splitting (e.g. 80% to Gemini, 20% to Claude). |
| [`least_latency_ewma`](./least_latency_ewma/main.go) | Dynamic Peak-EWMA load balancing steering concurrent traffic to fastest endpoint. |
| [`circuit_breaker`](./circuit_breaker/main.go) | Consecutive failure tripping (Closed -> Open) to eliminate cascade latency spikes. |

### Enterprise FinOps, Protocols & Microservices
| Directory | Focus & Concept |
|---|---|
| [`exact_match_cache`](./exact_match_cache/main.go) | Sub-millisecond SHA-256 exact-match cache (0 cost, 0 latency). |
| [`sliding_window_rate_limiting`](./sliding_window_rate_limiting/main.go) | Strict per-minute request (RPM) and token (TPM) quota enforcement. |
| [`virtual_keys_and_budgets`](./virtual_keys_and_budgets/main.go) | Department virtual keys, micro-dollar budget limits, and instant key revocation. |
| [`mcp_virtual_hub`](./mcp_virtual_hub/main.go) | Model Context Protocol (MCP 2026-07-28 & 2025-11-25) Virtual Hub & REST bridge. |
| [`a2a_agent_network`](./a2a_agent_network/main.go) | Agent-to-Agent (A2A v1.0) cryptographic Agent Card discovery and delegation. |
| [`embedded_http_microservice`](./embedded_http_microservice/main.go) | Production HTTP server with Kubernetes liveness & readiness probes and graceful shutdown. |

---

## 🏃 Running Examples

```bash
cd examples

# Run Hello Gateway
go run ./hello_gateway

# Run EWMA Load Balancer
go run ./least_latency_ewma

# Run Embedded Microservice
go run ./embedded_http_microservice
```
