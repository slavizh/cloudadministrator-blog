---
title: "Moving OMS Workspace between Resource Groups"
excerpt: "This will be a short one. Azure Resource Manager is a powerful beast and Operations Management Suite is gaining more of its functionality every day. And by that statement I do not mean OMS features…"
description: "This will be a short one. Azure Resource Manager is a powerful beast and Operations Management Suite is gaining more of its functionality every day. And by t..."
pubDate: 2016-02-09
updatedDate: 2016-02-09
heroImage: "/media/2016/02/image.png"
sourceUrl: "https://cloudadministrator.net/2016/02/09/moving-oms-workspace-between-resource-groups/"
tags: 
  - "API"
  - "ARM"
  - "Azure"
  - "Azure Resource Manager"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Operational Insights"
  - "Resource Group"
---
This will be a short one. Azure Resource Manager is a powerful beast and Operations Management Suite is gaining more of its functionality every day. And by that statement I do not mean OMS features specific to Azure. I mean the API, management and  orchestration stuff of Azure Resource Manager. So you’ve probably read [Operations Management Suite Blog](https://blogs.technet.microsoft.com/msoms/2016/02/09/1474/) that OMS and more specifically Log Analytics is now available on the [Azure Portal](https://portal.azure.com). All OMS stuff is still available in the OMS portal but in Azure we have some specific stuff like change pricing, connecting Azure Storage accounts and VMs. If you have used Azure lately you will know that every resource in Azure is located in Resource Group. Log Analytics as Azure resource is no exception. By default when you have created your OMS workspace prior to Azure Resource Manager being GA the OMS workspace (Log Analytics) was located in some default created resource Group like OI-Default-<region>. Before Log Analytics appeared in the Azure portal it was not possible to move your workspace to another resource group simply because the Azure Resource Manager API for Log Analytics was not there. Now with that in place we can do this in easy steps:

1.  Login to [Azure Portal](https://portal.azure.com).
2.  From the hamburger menu choose Browse and search for Log Analytics

[![image](/media/2016/02/image.png "image")](/media/2016/02/image.png)

1.  Click on Log analytics (OMS).

[![image](/media/2016/02/image1.png "image")](/media/2016/02/image1.png)

1.  Click on the workspace you want to move to another Resource Group.

-   From the OMS Workspace blade click on the pencil icon next to the resource group name.

[![image](/media/2016/02/image2.png "image")](/media/2016/02/image2.png)

1.  On the Move resource blade choose or create new resource group. Enter the first 5 characters if the old resource group name to confirm and press OK.

[![image](/media/2016/02/image3.png "image")](/media/2016/02/image3.png)

1.  A job will be initiated.

[![image](/media/2016/02/image4.png "image")](/media/2016/02/image4.png)

1.  After a few minutes the job will be completed successfully and you should see your workspace under new resource group. I guess the time for movement depends on the size of your workspace.
