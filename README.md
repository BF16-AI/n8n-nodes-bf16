# n8n-nodes-bf16

Official [n8n](https://n8n.io) community node for [bf16.ai](https://bf16.ai) — 1M-context uncensored open-weight LLMs (DeepSeek V4.1 Flash, GLM-5.3, GLM-5.3 Flash, Kimi K3.1 Pro) with prompt caching, JSON output mode, and strict Zero Data Retention (ZDR).

## Installation

In n8n, go to **Settings → Community Nodes → Install** and enter:

```text
n8n-nodes-bf16
```

## Credentials

Create an API key at [bf16.ai/dashboard/keys](https://bf16.ai/dashboard/keys) ($0.20 free starter credit). Credential testing runs against `GET https://api.bf16.ai/v1/models` at zero token cost.

## Operations

- **Chat Completion**: Run any active bf16.ai model or `bf16/auto:coding` smart router with optional system prompt, temperature, max tokens, and JSON output mode.
- **List Models**: Query live models, context windows, capabilities, and per-token pricing.

## Links

- Website: https://bf16.ai
- Docs: https://bf16.ai/docs
- Pricing: https://bf16.ai/pricing
- OpenAPI Spec: https://github.com/BF16-AI/bf16-openapi
