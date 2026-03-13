---
title: "NVGRE Gateway Cluster Not Discovered Completely by the Multi-Tenant RRAS MP"
excerpt: "In the past I’ve tried Multi-Tenant RRAS Management Pack with NVGRE Gateway that was not in the cluster. Recently I was able to try the MP with NVGRE Gateway cluster but I’ve met some challenges.…"
description: "In the past I’ve tried Multi-Tenant RRAS Management Pack with NVGRE Gateway that was not in the cluster. Recently I was able to try the MP with NVGRE Gateway..."
pubDate: 2014-01-22
updatedDate: 2015-09-20
heroImage: "/media/2014/01/image1.png"
sourceUrl: "https://cloudadministrator.net/2014/01/22/nvgre-gateway-cluster-not-discovered-completely-by-the-multi-tenant-rras-mp/"
tags: 
  - "Cluster"
  - "Gateway"
  - "Management Pack"
  - "Monitor"
  - "Monitoring"
  - "MP"
  - "Multi Tenant"
  - "NVGRE"
  - "RRAS"
  - "SCOM"
  - "SCVMM"
  - "System Center 2012 R2"
  - "System Center Operations Manager"
  - "Hyper-V"
  - "Management Packs"
  - "Microsoft"
  - "Network Virtualization"
  - "Software"
  - "System Center"
  - "System Center Virtual Machine Manager"
  - "Virtualization"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "System Center Virtual Machine Manager"
---
In the past I’ve tried [Multi-Tenant RRAS Management Pack with NVGRE Gateway that was not in the cluster](https://cloudadministrator.wordpress.com/2013/12/02/quick-look-at-multi-tenant-rras-management-pack/). Recently I was able to try the MP with NVGRE Gateway cluster but I’ve met some challenges. Even though I’ve configured the override for _Network name dependency discovered as instance of Virtual Server_ the cluster couldn’t be discovered properly and because of that almost all monitors were not working. After I was able to contact some folks from Microsoft we were able to resolve the issue. When you add your NVGRE Gateway cluster to VMM a new role (HyperV Network Virtualization Gateway) is created in the cluster:

[![image](/media/2014/01/image1.png "image")](/media/2014/01/image1.png)

In that Role there is an Public IP address as resource.

Basically the discovery script relays that this Public IP address have Network Name type resource assigned to it but that resource is not created during adding the NVGRE Gateway cluster in VMM. That resource is not needed by VMM but is needed by the MP in order to discover the cluster properly and monitor it. The override above allows that resource to be discovered as Virtual Server instance.

The workaround is simple:

-   Add Client Access Point resource to the HyperV Network Virtualization Gateway role assigned to the Public IP address resource

[![image](/media/2014/01/image2.png "image")](/media/2014/01/image2.png)

This information will be added soon the Multi-Tenant MP guide. Thanks to all engineers from Microsoft who helped me on this issue.
