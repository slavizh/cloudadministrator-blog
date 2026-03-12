---
title: "Storage Spaces Direct (S2D) Management Solution for OMS V2"
excerpt: "As you may have heard Log Analytics has a new query language. When you upgrade solutions are automatically converted to this new query language but I wanted to provide better experience so I’ve upd…"
description: "As you may have heard Log Analytics has a new query language. When you upgrade solutions are automatically converted to this new query language but I wanted..."
pubDate: 2017-09-15
updatedDate: 2017-09-15
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2017/09/15/storage-spaces-direct-s2d-management-solution-for-oms-v2/"
tags: 
  - "Azure"
  - "Kusto"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "NEW Query Language"
  - "OMS"
  - "Operations Management Suite"
  - "S2D"
  - "Solution"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Script"
  - "Storage Spaces Direct"
---
As you may have [heard Log Analytics has a new query language](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-log-search-upgrade). When you upgrade solutions are automatically converted to this new query language but I wanted to provide better experience so I’ve updated the Storage Spaces Direct (S2D) solution.

Besides that change I’ve also made a few other changes. Check them all out on [s2d-oms-mgmt-solution GitHub Repo](https://github.com/slavizh/s2d-oms-mgmt-solution). The solution is also available as [Azure quick start template](https://github.com/Azure/azure-quickstart-templates/tree/master/s2d-oms-mgmt-solution). Keep in mind that when installing the new version you will not loose data but as there are changes to the structure of the data the new solution will be able to visualize properly only the new data coming after you apply the update.

I highly recommend installing the Windows Server 2016 September 2017 Cumulative update.
