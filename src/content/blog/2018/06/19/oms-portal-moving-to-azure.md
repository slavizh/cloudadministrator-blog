---
title: "OMS Portal Moving to Azure"
excerpt: "For quite some time it was clear that the OMS Portal will move completely to Azure and that is good news. We have seen services like Update Management, Azure Security Center (Security & Audit s…"
description: "For quite some time it was clear that the OMS Portal will move completely to Azure and that is good news. We have seen services like Update Management, Azure..."
pubDate: 2018-06-19
updatedDate: 2018-06-19
heroImage: "/media/2018/06/update-management.png"
sourceUrl: "https://cloudadministrator.net/2018/06/19/oms-portal-moving-to-azure/"
tags: 
  - "ASC"
  - "Azure"
  - "Azure Automation"
  - "Azure Log Analytics"
  - "Azure Security Center"
  - "Deprecate"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Automation"
  - "Automation & Control"
  - "Azure Monitor"
  - "Azure Operational Insights Preview"
  - "Azure Site Recovery"
  - "Backup"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Log Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Security & Compliance"
  - "Site Recovery"
  - "Portal"
---
For quite some time it was clear that the OMS Portal will move completely to Azure and that is good news. We have seen services like Update Management, Azure Security Center (Security & Audit solution is part of it) releasing new functionalities only in Azure Portal. In fact some services that have been part of OMS (OMS is a suite not a product or service) have always been in Azure Portal. Such services are Azure Backup, Site Recovery, Application Insights, etc. Microsoft has [documented OMS Portal deprecation](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-oms-portal-transition) but I would like to add some things to the ones documented there:

-   Update Management solution have been moved to Azure Automation. You will find the new experience in a tab under that service. All the new features released for that solution you will see only there.

![Azure Update Management](/media/2018/06/update-management.png)

*Azure Update Management*

-   Change Tracking solution is now split into two different blades under Azure Automation. Those are Inventory and Change tracking
-   Security & Audit and Antimalware solutions are part now of Azure Security Center. Do not think for those as standalone solutions. If you have enabled those you are paying for ASC. Most of the views of Security & Audit solutions were moved to ASC service in Azure Portal.
-   All solutions that you’ve seen in OMS Gallery you will find in Azure Marketplace. There is Management Tools section on which you can click more to find all the solutions.
-   Not completely related to this but a couple of solutions were recently deprecated – [Capacity and Performance solution](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-capacity), [Azure Web Apps Analytics](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-azure-web-apps-analytics) and [VMware Monitoring](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-vmware)

A few reminders as well:

-   Your existing dashboards created by View Designer can be pinned to Azure Dashboards. This way you can build one view that not only covers data from Log Analytics but data from other Azure resources.
-   In Advanced Analytics Portal you can also pin charts from there as Azure Dashboards.
-   The views of the out of the box solutions are still available as resources and they can be pinned to Azure Dashboards or viewed

With that said I would still like to see some UI changes in Azure Portal in order to simplify things:

-   It is time to put OMS naming to rest. OMS is a suite and single service from that suite should not be associated with OMS. We see that confusion even in Azure Portal where the first blade is named OMS Workspace.
-   We still have to portals for search operations. I would like to see those merged but of course their functionalities needs to be merged as well. For example the classic search experience can show proper time chart when you summarize on more than one column. From the screenshot below you can see that in classic search we have separate lines for each pair of computer and drive where in the advanced portal we just have one line for each computer.

![OMS Classic Search](/media/2018/06/classic_search.png)

*OMS Classic Search*

![Advanced Analytics Search](/media/2018/06/advnaced-search.png)

*Advanced Analytics Search*

-   Creating alerts is possible only from classic search
-   List view is only available in classic search
-   Classic search still has some tailored views depending on the table. For example security data had some views that were handy. Overall might be better idea that these tailored views to be exposed in the corresponding service blade.
-   The OMS mobile app has the ability to display some of the dashboards and this functionality is not present in the Azure mobile app. Although the Azure Mobile app is good one it lacks showing data from Azure Dashboards and view designer dashboards.
-   Link to Advanced Analytics portal should be available in the Log Analytics blade. It is not good experience every time I have to go do Search just to open Advanced Analytics Portal.
-   Advanced Settings UI needs to be refactored as currently is just a wrapper of what is available in OMS Portal.

I hope this blog post was useful. You can post your feedback on this move in [Azure Log Analytics UserVoice](https://feedback.azure.com/forums/267889-log-analytics). Keep in mind that as some of the solutions belong to different services there are separate user voices for those as well.
