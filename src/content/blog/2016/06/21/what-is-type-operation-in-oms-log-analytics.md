---
title: "What is Type Operation in OMS Log Analytics?"
excerpt: "You may have noticed that there is a new type named Operation in Operations Management Suite Log Analytics."
description: "You may have noticed that there is a new type named Operation in Operations Management Suite Log Analytics."
pubDate: 2016-06-21
updatedDate: 2016-06-21
heroImage: "/media/2016/06/image.png"
sourceUrl: "https://cloudadministrator.net/2016/06/21/what-is-type-operation-in-oms-log-analytics/"
tags: 
  - "Azure"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpInsights"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Troubleshoot"
---
You may have noticed that there is a new type named Operation in Operations Management Suite Log Analytics.

It is not exposed in any solution but you can use search to get it:

_Type:Operation_

[![image](/media/2016/06/image.png "image")](/media/2016/06/image.png)

It seems this type is some kind of log for the different solutions in OMS. Currently the ones that I’ve noticed using it are AD Assessment, SQL Assessment and AD Replication.

_Type:Operation | measure count() by Solution_

[![image](/media/2016/06/image1.png "image")](/media/2016/06/image1.png)

Besides some standard fields and Solution field the type has some others like:

**Detail** – Description of what has been run

[![image](/media/2016/06/image2.png "image")](/media/2016/06/image2.png)

**Operation Category** – Some categorization for the different operations that are being executed

[![image](/media/2016/06/image3.png "image")](/media/2016/06/image3.png)

**HelpLink** – Link to OMS Log Analytics documentation for that specific solution

[![image](/media/2016/06/image4.png "image")](/media/2016/06/image4.png)

**OperationStatus** – Status of the operation that has been executed on specific server

[![image](/media/2016/06/image5.png "image")](/media/2016/06/image5.png)

In my case everything is with success status but I would imagine that if for some reason you have problems with one of those 3 solutions not able to run successfully you will have failed operations. For example if you do not meet the minimum requirements of any of the solutions or the solution cannot execute successfully.

I hope in the future we will see more solutions of using this type as a way to single either that the solution is running successfully or in case there is some failure with it. What you can do now is to create some alerts based on search query to make sure your AD Assessment, SQL Assessment and AD Replication solutions are running successfully.
