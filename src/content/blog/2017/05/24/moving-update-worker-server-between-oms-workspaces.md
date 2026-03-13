---
title: "Moving Update Worker Server between OMS Workspaces"
excerpt: "Recently I’ve been fairly occupied in writing the second edition of Inside Microsoft Operations Management Suite book but now that I’ve finished my chapters I can go back to writing some blog posts…"
description: "Recently I’ve been fairly occupied in writing the second edition of Inside Microsoft Operations Management Suite book but now that I’ve finished my chapters..."
pubDate: 2017-05-24
updatedDate: 2017-05-24
heroImage: "/media/2017/05/image.png"
sourceUrl: "https://cloudadministrator.net/2017/05/24/moving-update-worker-server-between-oms-workspaces/"
tags: 
  - "Automation"
  - "Automation Control"
  - "Azure"
  - "Azure Automation"
  - "Hybrid Worker"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Automation & Control"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Update Worker"
---
Recently I’ve been fairly occupied in writing the second edition of Inside Microsoft Operations Management Suite book but now that I’ve finished my chapters I can go back to writing some blog posts.

Update Workers are like Hybrid Workers but they are automatically registered by the Update Management solution. This creates a problem because there is no way to unregister such server unlike the Hybrid Workers which have PowerShell cmdlets installed locally on the server.

Fear not though. There is easy way to move Update Worker between different workspaces as long as you follow the steps:

1.  First on the server that is Update Worker remove your current workspace connection from the Microsoft Monitoring Agent Properties:

[![image](/media/2017/05/image.png "image")](/media/2017/05/image.png)

1.  Apply the change. When there is no configuration the agent service won’t start but do not worry.
2.  Clear the Microsoft Monitoring Agent cache (C:\\Program Files\\Microsoft Monitoring Agent\\Agent\\Health Service State).

3.  Next step is to remove the whole registry located in HKEY\_LOCAL\_MACHINE\\SOFTWARE\\Microsoft\\HybridRunbookWorker

[![image](/media/2017/05/image1.png "image")](/media/2017/05/image1.png)

1.  In this registry the registration for Hybrid Worker and Update Worker is stored. Lab7 is my Hybrid Worker group name and User indicates that this worker was registered manually. ONPREM…. is my Update Worker and System indicates that this Update worker was registered by the Update Management solution. Of course for manually registered Hybrid Worker it is always better to use Remove-HybridRunbookWorker cmdlet instead of deleting the registry. If you have manually registered Hybrid Worker consider using the cmdlet before step 1.

-   Once that registry is deleted we can proceed to the next step.

-   Go to the Automation account that was connected to your previous Log Analytics workspace that was removed in step 1.

-   Under Hybrid Worker Groups there will be some records that needs to be cleaned as well. It is good practice.

[![image](/media/2017/05/image2.png "image")](/media/2017/05/image2.png)

1.  In my case I will delete the Update Worker (ONPREMVM….) and the Hybrid Worker Groups. Click on each one of them and delete them. Keep in mind that if your manually registered Hybrid Worker was in Hybrid Worker Group you cannot delete individual Hybrid Worker you can only delete the group. In such case you can delete the Group and for those other servers that were in the group you will need to register them again. As noted previously if you want to avoid such issue use Remove-HybridRunbookWorker cmdlet before step 1.

-   Now when this is done I can go back to the server and register the Microsoft Monitoring agent to the new workspace.

[![image](/media/2017/05/image3.png "image")](/media/2017/05/image3.png)

1.  After several minutes you should see that the registry is populated again but this time the Update Worker is registered to another Automation account.

[![image](/media/2017/05/image4.png "image")](/media/2017/05/image4.png)

[![image](/media/2017/05/image5.png "image")](/media/2017/05/image5.png)

This is probably case that does not happen very often but I hope it will help you if you encounter it and understand Hybrid/Update Workers more.
