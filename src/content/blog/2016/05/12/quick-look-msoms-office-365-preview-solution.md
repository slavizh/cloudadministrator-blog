---
title: "Quick Look – #MSOMS Office 365 (Preview) Solution"
excerpt: "Yesterday MSOMS team released in preview Office 365 solution:"
description: "Yesterday MSOMS team released in preview Office 365 solution:"
pubDate: 2016-05-12
updatedDate: 2016-05-12
heroImage: "/media/2016/05/image.png"
sourceUrl: "https://cloudadministrator.net/2016/05/12/quick-look-msoms-office-365-preview-solution/"
tags: 
  - "Audit"
  - "Cloud"
  - "Logs"
  - "MSOMS"
  - "Office 365"
  - "Office 365"
  - "OMS"
  - "Operations Management Suite"
  - "Security"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Exchange"
  - "Hybrid Security"
  - "Log Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Software"
  - "Solutions"
---
Yesterday MSOMS team released in preview Office 365 solution:

[![image](/media/2016/05/image.png "image")](/media/2016/05/image.png)

The first time when you click on the tile you will be taken to Settings to Connect to Office 365 subscription with account that is Office 365 global administrator:

[![image](/media/2016/05/image1.png "image")](/media/2016/05/image1.png)

As you can see you can add multiple subscriptions which is great. Supported workloads are Azure AD, Exchange and SharePoint. I am not Office 365 expert but so far I think these are the only workloads now that support logs.

After you’ve add your account you do not have to do anything. OMS will automatically try to pull the logs. Actually logs are pulled on notification from Office 365 as far as I can understand the flow. So the interval is pretty low between the logs being generated and available in OMS.

When your logs are populated in OMS you will see the following dashboards for the solution:

[![image](/media/2016/05/image2.png "image")](/media/2016/05/image2.png)

As you can see you have all operations (all Office 365 logs) and separate blades for the different logs.

All logs are in one Type:

Type=OfficeActivity

[![image](/media/2016/05/image3.png "image")](/media/2016/05/image3.png)

Under that type we can use filtering if we want to see logs for specific workload:

Type=OfficeActivity (OfficeWorkload=sharepoint)

[![image](/media/2016/05/image4.png "image")](/media/2016/05/image4.png)

We can get more useful results like this to see how our SharePoint is used:

Type=OfficeActivity (OfficeWorkload=sharepoint) | measure count() by Operation

[![image](/media/2016/05/image5.png "image")](/media/2016/05/image5.png)

You can even go more granular by having the same query but filtered to specific sites or even by user.

Useful scenario is to send some of this data to PowerBi (without exposing personal information) in order to create some beautiful dashboards that can track the usage of your Office 365 workloads for example.

I would put this solution more in the security and audit focus area of OMS. Very useful for auditing, tracking trends, noticing security issues or troubleshooting.

Hope this was nice quick look for you.
