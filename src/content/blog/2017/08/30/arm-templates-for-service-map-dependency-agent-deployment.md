---
title: "ARM Templates for Service Map Dependency Agent Deployment"
excerpt: "Yesterday Dave announced that there is a new Azure VM extension that deploys the Service Map Dependency Agent. The example provided was only for PowerShell so it was natural that we need ARM templa…"
description: "Yesterday Dave announced that there is a new Azure VM extension that deploys the Service Map Dependency Agent. The example provided was only for PowerShell s..."
pubDate: 2017-08-30
updatedDate: 2017-08-30
heroImage: "/media/2017/08/image.png"
sourceUrl: "https://cloudadministrator.net/2017/08/30/arm-templates-for-service-map-dependency-agent-deployment/"
tags: 
  - "ARM"
  - "Automation"
  - "Azure"
  - "Azure Resource Manager"
  - "Dependency Agent"
  - "Deployment"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Service Map"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Templates"
---
Yesterday Dave [announced](https://blogs.technet.microsoft.com/msoms/2017/08/29/azure-vm-extension-for-dependency-agent/) that there is a new Azure VM extension that deploys the Service Map Dependency Agent. The example provided was only for PowerShell so it was natural that we need ARM template as well.

My friend [Tao Yang](https://twitter.com/MrTaoYang) beat me to the idea:

[![image](/media/2017/08/image.png "image")](/media/2017/08/image.png)

but I will make his life easier and provide these templates earlier.

You can grab those from my [ARMTempaltes](https://github.com/slavizh/ARMTemplates) repo. Remember that this extension is still rolling to all Azure regions. I’ve managed to make it work in West Central US. If it does not work in your region wait a couple of days.
