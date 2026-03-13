---
title: "OMS Analytics Portal Can Now Display Results In Your Local Time Zone"
excerpt: "As you are familiar currently OMS has two search portals – the legacy one located in OMS classic Portal and the Analytics one. The Analytics Portal is slowly getting some of the cool features from …"
description: "As you are familiar currently OMS has two search portals – the legacy one located in OMS classic Portal and the Analytics one. The Analytics Portal is slowly..."
pubDate: 2017-09-12
updatedDate: 2017-09-12
heroImage: "/media/2017/09/image.png"
sourceUrl: "https://cloudadministrator.net/2017/09/12/oms-analytics-portal-can-now-display-results-in-your-local-time-zone/"
tags: 
  - "Analytics Portal"
  - "Azure"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Time Zone"
  - "Automation & Control"
  - "Azure Operational Insights Preview"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Security & Compliance"
  - "Timegenerated"
---
As you are familiar currently OMS has two search portals – the legacy one located in OMS classic Portal and the Analytics one. The Analytics Portal is slowly getting some of the cool features from the legacy Search Portal. One feature that was very handy in it was that TimeGenerated was displayed in the time zone you are accessing it. This is very handy when you have to investigate as it helps you track the events, logs and metrics at your local time. This was missing in the Analytics portal but now it is there and even enhanced.

To setup your time zone you will need to go to the Settings of the Analytics Portal. In general you can set Display Time Zone:

[![image](/media/2017/09/image.png "image")](/media/2017/09/image.png)

By default this will be set to UTC reflecting how TimeGenerated was shown so far. You can change that to your time zone and exit the settings.

After this you will need to refresh the tab where you’ve opened the Analytics Portal.

Now when you execute a query TimeGenerated will de displayed in the time zone configured.

[![image](/media/2017/09/image1.png "image")](/media/2017/09/image1.png)

But wait that is not all. At any time you can change how TimeGenerated is displayed by clicking in the right corner where the Time Zone is displayed and change it to something else.

[![image](/media/2017/09/image2.png "image")](/media/2017/09/image2.png)

This is very handy and I am glad that the product group listened to our feedback and implemented it.
