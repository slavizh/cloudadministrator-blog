---
title: "Quick Look at Multi-Tenant RRAS Management Pack"
excerpt: "If you are using Network Virtualization from Microsoft you probably also using Multi-Tenant Gateways. In such scenario the gateways become critical part of your infrastructure and would be best if …"
description: "If you are using Network Virtualization from Microsoft you probably also using Multi-Tenant Gateways. In such scenario the gateways become critical part of y..."
pubDate: 2013-12-02
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2013/12/image.png"
sourceUrl: "https://cloudadministrator.net/2013/12/02/quick-look-at-multi-tenant-rras-management-pack/"
tags: 
  - "BGP"
  - "Gateway"
  - "HNV"
  - "Management Pack"
  - "Monitoring"
  - "MP"
  - "Multi Tenant"
  - "NAT S2S"
  - "Network Virtualization"
  - "OpsMgr"
  - "Routing and Remote Access"
  - "RRAS"
  - "SCOM"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Operations Manager"
  - "Hyper-V"
  - "Management Packs"
  - "Microsoft"
  - "Software"
  - "Virtualization"
  - "Windows"
  - "VPN"
---
If you are using Network Virtualization from Microsoft you probably also using Multi-Tenant Gateways. In such scenario the gateways become critical part of your infrastructure and would be best if you can monitor them. Luckily Microsoft provides such management pack for Operations Manager. Let’s see how that MP looks:

We first have to install the MP:

[![image](/media/wordpress/2013/12/image.png "image")](/media/wordpress/2013/12/image.png)

[![image](/media/wordpress/2013/12/image1.png "image")](/media/wordpress/2013/12/image1.png)

[![image](/media/wordpress/2013/12/image2.png "image")](/media/wordpress/2013/12/image2.png)

[![image](/media/wordpress/2013/12/image3.png "image")](/media/wordpress/2013/12/image3.png)

Than we import the MP

[![image](/media/wordpress/2013/12/image4.png "image")](/media/wordpress/2013/12/image4.png)

After that you need to install agent on your Multi-Tenant Gateway server and he will be discovered.

As always you have alert view where you can see alerts related to only this MP:

[![image](/media/wordpress/2013/12/image5.png "image")](/media/wordpress/2013/12/image5.png)

The Diagram is nice especially if you have more of these servers in your environment:

[![image](/media/wordpress/2013/12/image6.png "image")](/media/wordpress/2013/12/image6.png)

You will have all you Multi-Tenant Gateways listed in a State view with some information for them:

[![image](/media/wordpress/2013/12/image7.png "image")](/media/wordpress/2013/12/image7.png)

Separate view for your Tenants will be helpful in troubleshooting and drilling down the affected service:

[![image](/media/wordpress/2013/12/image8.png "image")](/media/wordpress/2013/12/image8.png)

At last you have BGP Peer State view and S2S Interface State View:

[![image](/media/wordpress/2013/12/image9.png "image")](/media/wordpress/2013/12/image9.png)

If you have the Gateways in a cluster you have to do two things:

-   Enable Agent Proxy on all gateway servers
-   Create the following overrides:

[![image](/media/wordpress/2013/12/image10.png "image")](/media/wordpress/2013/12/image10.png)

This rule will allow each IP address -> Network name dependency discovered as instance of Virtual Server.

I haven’t tried the cluster option but it seems the MP has some very solid monitors and rules in place.

What I am missing is discovery and monitoring of the NAT feature on the Gateways. It will be nice if some monitors for this feature can be added in next versions.
