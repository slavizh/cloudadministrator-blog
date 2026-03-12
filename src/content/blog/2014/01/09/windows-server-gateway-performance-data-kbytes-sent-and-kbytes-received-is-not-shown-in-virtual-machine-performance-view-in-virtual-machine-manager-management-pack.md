---
title: "Windows Server Gateway Performance Data (KBytes Sent and KBytes Received) is Not Shown in Virtual Machine Performance View in Virtual Machine Manager Management Pack"
excerpt: "After long holiday break I am back. On this post I want to introduce you to an issue I’ve spotted and to which of course I’ve found an easy solution. With System Center 2012 R2 Virtual Machine Mana…"
description: "After long holiday break I am back. On this post I want to introduce you to an issue I’ve spotted and to which of course I’ve found an easy solution. With Sy..."
pubDate: 2014-01-09
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2014/01/image.png"
sourceUrl: "https://cloudadministrator.net/2014/01/09/windows-server-gateway-performance-data-kbytes-sent-and-kbytes-received-is-not-shown-in-virtual-machine-performance-view-in-virtual-machine-manager-management-pack/"
tags: 
  - "Management Pack"
  - "Monitoring"
  - "NAT Performance Data"
  - "Network Virtualization"
  - "S2S"
  - "SCOM"
  - "SCVMM"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Operations Manager"
  - "System Center Virtual Machine Manager"
  - "VPN"
  - "Windows Server 2012 R2"
  - "Windows Server Gateway"
  - "Management Packs"
  - "Microsoft"
  - "Software"
  - "Virtualization"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "WSG"
---
After long holiday break I am back. On this post I want to introduce you to an issue I’ve spotted and to which of course I’ve found an easy solution. With System Center 2012 R2 Virtual Machine Manager and Windows Server 2012 R2 we have the role of Windows Server Gateway (Multi-Tenant RRAS role) which is part of the Network Virtualization architecture (a dear to my heart topic). While on this topic I would like to remind you to check [our whitepaper](http://gallery.technet.microsoft.com/Hybrid-Cloud-with-NVGRE-aa6e1e9a) on it. So in short Windows Server 2012 R2 provides this role and Virtual Machine Manager manages it. But the integration doesn’t stops here as the VMM Management Pack (Fabric Monitoring MP) is able gather and store performance data trough the integration with SCOM. As Windows Server Gateway is a Tenant aware role performance data is collected and gathered for every Tenant S2S VPN or NAT connection which is very useful information. Now that you are introduced to what I am talking about I can continue to the exact issue. I’ve noticed that the data – KBytes Sent and KBytes Received for every S2S VPN and NAT connection was not showing in the Virtual Machine Performance view of the VMM MP. As on this view also performance data for virtual machines is shown you can filter it by the word “gateway”. I’ve seen similar issues with other MP’s so my first instinct was to stop the Microsoft Monitoring Agent service on the VMM server/s, clear the cache and start Microsoft Monitoring Agent again. After a while I’ve opened the view again and I was able to see that my corrective actions worked.

[![image](/media/wordpress/2014/01/image.png "image")](/media/wordpress/2014/01/image.png)

This is the time to explain that the information that is gathered by the VMM MP is done on the VMM server so you only need to clear the cache of the SCOM agent there. If you have two VMM servers in cluster clear the cache on both. Also I would like to remind on implementing certain overrides when installing and configuring the VMM 2012 R2 MP. You can find the instruction [here](http://technet.microsoft.com/en-us/library/dn303329.aspx).

Hope this tip to help in tough times.
