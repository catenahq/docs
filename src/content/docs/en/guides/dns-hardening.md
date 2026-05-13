---
title: Filter your DNS to block malware and phishing
description: Configure Quad9 (no signup) or NextDNS (custom filters) on your router, Firefox, or Chrome to block malware and phishing on every device.
---

DNS-level filtering is the cheapest, highest-leverage security upgrade most SMBs never do. One change at the resolver level blocks malicious domains for every device on the network -- no software to install on each machine.

## Pick a resolver

Two privacy-respecting resolvers we recommend. Both are free.

| | Quad9 | NextDNS |
| --- | --- | --- |
| Where the organization is based | Switzerland (non-profit foundation) | France |
| Signup required | no | yes (free account) |
| Malware and phishing blocking | yes, built in | yes, configurable |
| Custom filters (categories, lists, logs) | no | yes |
| Free quota | unlimited | 300,000 queries / month (≈ 10-30 people depending on usage) |

**Quad9** fits if you want the baseline protection without managing another account. You change the DNS addresses and you are done.

**NextDNS** fits if you want to see what is blocked, add your own rules (ads, trackers, adult content, gambling, etc.), or cover multiple offices with different policies. You create an account at [nextdns.io](https://nextdns.io/), pick your filters, and use the configuration ID assigned to you (looks like `abc123`) in place of the example values below.

## Configure the office router

This is the option that covers the most devices in one shot: workstations, phones, printers, smart devices on the network. Log into your router's admin interface (usually `192.168.1.1` or `192.168.0.1`), find the DNS section (often under *WAN*, *Internet*, or *DHCP*), and replace the DNS servers with:

**Quad9**
- Primary DNS: `9.9.9.9`
- Secondary DNS: `149.112.112.112`
- Primary IPv6: `2620:fe::fe`
- Secondary IPv6: `2620:fe::9`

**NextDNS** (replace `abc123` with your configuration ID)
- Primary DNS: `45.90.28.0`
- Secondary DNS: `45.90.30.0`
- Then follow NextDNS's instructions to link those IPs to your account, or, if your router supports DNS-over-HTTPS (OPNsense, pfSense, MikroTik, some Asus / Ubiquiti models), point it directly at the endpoint `https://dns.nextdns.io/abc123`.

Reboot the router. Devices pick up the new DNS at the next DHCP renewal (usually after unplugging-replugging the network cable, or forgetting and rejoining WiFi).

## Configure Firefox

For laptops that leave the office, or devices on networks you do not control.

1. Open **Settings** -> **Privacy & Security**.
2. Scroll to **DNS over HTTPS** and pick **Max Protection**.
3. Under **Choose provider**, pick **Custom**.
4. Paste the URL:
   - Quad9: `https://dns.quad9.net/dns-query`
   - NextDNS: `https://dns.nextdns.io/abc123` (replace `abc123` with your ID)
5. Close the tab. The change takes effect immediately.

## Configure Chrome (and Edge, Brave, Opera)

1. Open **Settings** -> **Privacy and security** -> **Security**.
2. Scroll to **Use secure DNS**, turn it on, pick **With** then **Custom**.
3. Paste the URL:
   - Quad9: `https://dns.quad9.net/dns-query`
   - NextDNS: `https://dns.nextdns.io/abc123` (replace `abc123` with your ID)
4. Close the tab. The change takes effect immediately.

Edge, Brave, and Opera expose the same setting under an equivalent label ("Secure DNS").

## Verify it is working

- **Quad9**: visit [test.quad9.net](https://test.quad9.net/). The page confirms whether your device is resolving via Quad9, and offers a known-bad test domain that should be blocked.
- **NextDNS**: visit [test.nextdns.io](https://test.nextdns.io/). The page confirms your configuration ID is active, and the NextDNS dashboard shows queries in real time.

If the check fails, the device is probably still using the ISP's DNS. On the router, double-check the DNS change was saved and that DHCP hands out the new servers. On the browser, confirm DNS over HTTPS is enabled (not in "default" mode).

## Caveats

- DNS filtering blocks domain names, not page content once a page has loaded. It complements but does not replace an up-to-date antivirus and basic caution with attachments.
- Configuring DNS at both the router AND the browser at the same time means the browser wins. Pick one layer or the other, or make sure both point at the same resolver.
- Legitimate domains occasionally get blocked by mistake. If NextDNS blocks a vendor domain you use, add it to your allow list in the dashboard -- the change takes effect in under a minute. Quad9 does not offer a per-customer allow list; if a false positive blocks you, switch that workstation to NextDNS.
