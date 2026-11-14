---
title: Network Security & SSRF Protection
sidebar_position: 4
description: See how GoRoute blocks server-side request forgery with outbound network controls that protect cloud metadata, private IP ranges, and internal services.
---

# Network Security & Outbound SSRF Protection

When AI agents invoke tools (MCP), fetch web content, or interact with external services, malicious prompts can attempt **Server-Side Request Forgery (SSRF)** to compromise cloud metadata endpoints, internal databases, or private cluster IPs.

GoRoute AI Gateway embeds strict network perimeter defenses to prevent outbound SSRF attacks.

---

## 1. Outbound SSRF Gating

Every outbound HTTP dial executed by GoRoute is inspected by an anti-SSRF dialer:

- **Cloud Metadata Endpoint Blocking**: Outbound calls to `169.254.169.254` (AWS, GCP, Azure, and DigitalOcean instance metadata services) are permanently blocked.
- **Private RFC 1918 CIDR Enforcement**: Outbound requests to internal loopback (`127.0.0.0/8`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and IPv6 site-local addresses (`fc00::/7`, `fe80::/10`) are rejected unless explicitly allowlisted in configuration.
- **DNS Rebinding Prevention**: Validates resolved IP addresses at socket connection time, preventing attackers from using dynamic DNS records to bypass hostname checks.
- **Redirect Limits**: Restricts HTTP redirects to a maximum of 3 hops and enforces that redirect locations do not point to restricted IP ranges.

---

## 2. Inbound Client CIDR Whitelisting

Restrict gateway ingress to trusted network segments or VPN tunnels:

```yaml
security:
  network:
    outbound_ssrf:
      allow_private_networks: false
      allowed_schemes: ["https"]
      blocked_ips:
        - "169.254.169.254"
      dial_timeout: 10s
      max_redirects: 3
    inbound_caller:
      expose_on_public_internet: false
      allowed_client_cidrs:
        - "10.240.0.0/16"
        - "192.168.1.0/24"
```
