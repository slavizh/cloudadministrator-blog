---
title: "Orchestrator Web Service Does Not Work After Adding The Server to Infrastructure Servers in VMM 2012 R2"
excerpt: "I have a couple of Orchestrator servers with Web Features role installed on them. I’ve recently added those servers as Infrastructure Servers in VMM 2012 R2 in order to update them from there. Afte…"
description: "I have a couple of Orchestrator servers with Web Features role installed on them. I’ve recently added those servers as Infrastructure Servers in VMM 2012 R2..."
pubDate: 2013-11-04
updatedDate: 2015-09-20
heroImage: "/media/2013/11/image7.png"
sourceUrl: "https://cloudadministrator.net/2013/11/04/orchestrator-web-service-does-not-work-after-adding-the-server-to-infrastructure-servers-in-vmm-2012-r2/"
tags: 
  - "Certificate"
  - "SCO"
  - "SCVMM"
  - "System Center 2012 R2"
  - "System Center Orchestrator"
  - "System Center Virtual Machine Manager"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "Web Service"
---
I have a couple of Orchestrator servers with Web Features role installed on them. I’ve recently added those servers as Infrastructure Servers in VMM 2012 R2 in order to update them from there. After adding them the Orchestrator Web Service on those server stopped working.

Reason

When servers are added as Infrastructure servers in VMM 2012 R2 on those servers VMM agent is installed and because of that VMM also imports certificate. As my Orchestrator Web Service is using certificate during the install of the VMM agent I guess the certificates were messed somehow and the web service stopped working.

How to fix it

Just open the bindings for the Orchestrator Web Service and select the right certificate again. In my case the field for certificate was blank.

[![image](/media/2013/11/image7.png "image")](/media/2013/11/image7.png)

After that your Orchestrator Web service should work again.
