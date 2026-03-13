---
title: "Quick Tip: Pinging Provider Address in Hyper-V Network Virtualization"
excerpt: "If you are familiar with Hyper-V Network Virtualization you know that there is the concept of Provider Addresses and they are kind of different than the normal addresses assigned for physical or vi…"
description: "If you are familiar with Hyper-V Network Virtualization you know that there is the concept of Provider Addresses and they are kind of different than the norm..."
pubDate: 2013-11-25
updatedDate: 2015-09-20
heroImage: "/media/2013/11/image8.png"
sourceUrl: "https://cloudadministrator.net/2013/11/25/quick-tip-pinging-provider-address-in-hyper-v-network-virtualization/"
tags: 
  - "Hyper V"
  - "Ping"
  - "Provider Address"
  - "SCVMM"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Virtual Machine Manager"
  - "Hyper-V"
  - "Microsoft"
  - "Network"
  - "Network Virtualization"
  - "Software"
  - "Virtualization"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "Troubleshoot"
---
If you are familiar with Hyper-V Network Virtualization you know that there is the concept of Provider Addresses and they are kind of different than the normal addresses assigned for physical or virtual network adapters. In some troubleshooting scenarios you may want to ping the provider addresses between the hosts. If you try with just “ping” that will not work the right syntax is ping –p <provider\_address>.

[![image](/media/2013/11/image8.png "image")](/media/2013/11/image8.png)

Keep in mind that this command is available only on Windows Server 2012 R2.

I hope this is helpful.
