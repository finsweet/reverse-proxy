# Finsweet's Reverse Proxy

This repository contains the Cloudflare Worker script for reverse proxying all the Finsweet subdomains under the main finsweet.com domain, as well as documentation on how to properly manage them.

## DNS Management

The DNS of the finsweet.com domain are managed from Cloudflare. You can access it by asking @alexiglesias to include you as a team member of the Cloudflare account.

In there, you will notice that some DNS records are set to be proxied, and some not. Continue reading to know the differences between them.

![Proxied DNS](./images/proxied-dns-list.png)
