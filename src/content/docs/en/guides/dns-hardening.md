---
title: Harden your DNS with blocking and filtering
description: Configure Cloudflare Gateway plus DNS-level category filtering to block malware, phishing, and adult content across every device in your small business — no per-device agent required.
---

DNS-level filtering is the cheapest, highest-leverage security upgrade most SMBs never do. One change at the resolver level blocks malware command-and-control, phishing domains, and category-based content for every device on the network — with no per-device agent.

## What this gets you

- Malware and phishing domains blocked before the browser even resolves them.
- Category filtering (adult, gambling, peer-to-peer, etc.) configurable per office or per identity.
- Per-query log of blocked attempts — evidence you can show during an incident review.
- Zero per-device agent if you push the change at the office router or via WARP.

## Approach: Cloudflare Gateway + WARP

[Cloudflare Gateway](https://developers.cloudflare.com/cloudflare-one/policies/gateway/dns-policies/) is the SMB-friendly choice: free for up to 50 seats on Zero Trust Free, runs on the same Cloudflare account that already fronts your catena services, and pairs with the [WARP client](https://1.1.1.1/) when you want filtering on devices that leave the office network.

### 1. Enable Cloudflare Zero Trust on your existing Cloudflare account

From the Cloudflare dashboard: **Zero Trust** → **Settings** → choose a team domain (you can change it later). The Free plan is fine for under 50 seats; bumps to *Pay-as-you-go* if you grow.

### 2. Create a baseline DNS policy

**Gateway** → **Policies** → **DNS**. Add a policy with selectors *Security categories: malware, phishing, command-and-control, cryptomining* and action *Block*. That alone catches the bulk of what would otherwise reach end-user browsers.

### 3. Add a content policy

Add a second DNS policy with selectors *Content categories: adult, gambling, anonymizers* (pick the categories that match your business posture) and action *Block*. For a clinic or a school, add *peer-to-peer* and *illegal downloads*.

### 4. Pick how clients reach the resolver

Two options, you can use both:

- **Office router:** set the LAN's DNS servers to the IPv4 + IPv6 addresses Gateway gives you under *Networks*. Every device on the LAN now resolves through your filtered policy.
- **WARP client:** push the [WARP client](https://1.1.1.1/) to laptops that leave the office. The same policy follows them home, on hotel WiFi, and on cellular.

### 5. Verify

From a device behind the policy, visit [a known-bad test domain](https://www.malware-test-site.com/). You should land on Cloudflare's block page rather than the site. Then check **Gateway** → **Logs**; the blocked query is there with the matched policy attached.

## Caveats

- DNS filtering does not see traffic that uses DNS-over-HTTPS (DoH) bypassing your resolver. Disable per-browser DoH on managed devices, or use WARP, which tunnels resolution through Gateway regardless of the app's preference.
- Allow-list false positives *quickly*. The cost of a three-day delay on a legitimate vendor domain is much higher than the marginal risk of allowing it.
- Logs include user IPs and queried hostnames. Configure retention deliberately and document it in your privacy policy.
