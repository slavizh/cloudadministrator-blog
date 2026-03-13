---
title: "AD Replication Status Solution in Operations Management Suite"
excerpt: "Like a Christmas present OMS team gave us a new solution yesterday. As the name suggest the solution aims to give you visibility over the replication of your domain controllers. To get some results…"
description: "Like a Christmas present OMS team gave us a new solution yesterday. As the name suggest the solution aims to give you visibility over the replication of your..."
pubDate: 2015-12-19
updatedDate: 2015-12-19
heroImage: "/media/2015/12/image.png"
sourceUrl: "https://cloudadministrator.net/2015/12/19/ad-replication-status-solution-in-operations-management-suite/"
tags: 
  - "Azure"
  - "Domain Controller"
  - "Log Analytics"
  - "Monitoring"
  - "MSOMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "Replication"
  - "Sites"
  - "Active Directory"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "System Center Operations Manager"
  - "Windows"
  - "Windows Server"
---
Like a Christmas present OMS team gave us a new solution yesterday. As the name suggest the solution aims to give you visibility over the replication of your domain controllers. To get some results you will need at least two domain controllers located in different AD sites. I believe the solution works with any domain controller that is on a supported by OMS Windows operating system. Once you add AD Replication Status solution from the gallery you will have a new tile added to overview.

[![image](/media/2015/12/image.png "image")](/media/2015/12/image.png)

I was able to get results almost immediately by just executing in search:

_Type=ADReplicationResult_

[![image](/media/2015/12/image1.png "image")](/media/2015/12/image1.png)

From the results we can see that we are getting replication status for every partition. Basically if LastSyncResult is 0 it means all is good. If there is some error in the replication the error ID will be in that field.

Additionally bi-directional results are returned meaning you get status for Source and Desitnation for every domain controller.

When something goes bad you will start to see the main view of the solution filled up.

[![image](/media/2015/12/image2.png "image")](/media/2015/12/image2.png)

When you click on error you will get additional information:

[![image](/media/2015/12/image3.png "image")](/media/2015/12/image3.png)

You can easily follow the HelpLink to troubleshoot and resolve the replication issue.

Once the issue is fixed errors will be gone from the main view:

[![image](/media/2015/12/image4.png "image")](/media/2015/12/image4.png)

I’ve noticed that the data for this solution is coming only from one of the domain controllers I had, but at some point I’ve started to receive information from the other domain controller. I can only guess that is somehow of high availability for this solution in case one the domain controller on which the solution runs goes down and does not have any connection.

Overall the solution seems very good and very helpful in a environment with a lot of domain controllers in different sites. It offers a lot of information on what is failing and the error for failure.
