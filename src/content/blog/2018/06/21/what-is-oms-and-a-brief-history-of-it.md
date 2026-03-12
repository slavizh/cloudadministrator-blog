---
title: "What is OMS and a Brief History of It"
excerpt: "While discussing Azure/OMS topics in the community I often see incorrect usage of OMS (Operations Management Suite). That is understandable of course as Microsoft hasn’t done good job at clea…"
description: "While discussing Azure/OMS topics in the community I often see incorrect usage of OMS (Operations Management Suite). That is understandable of course as Micr..."
pubDate: 2018-06-21
updatedDate: 2018-06-21
heroImage: "/media/wordpress/2018/06/classic-oms-portal.png"
sourceUrl: "https://cloudadministrator.net/2018/06/21/what-is-oms-and-a-brief-history-of-it/"
tags: 
  - "Application Insights"
  - "Azure"
  - "Azure Automation"
  - "Azure Backup"
  - "Azure Cost Management"
  - "Azure Log Analytics"
  - "Azure Management"
  - "Azure Monitor"
  - "Azure Policy"
  - "Azure Security Center"
  - "Azure Site Recovery"
  - "Configuration Management"
  - "History"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "Network Performance Monitor"
  - "OMS"
  - "Process Automation"
  - "Service Map"
  - "Automation"
  - "Automation & Control"
  - "Azure Operational Insights Preview"
  - "Backup"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Log Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Operations Management Suite"
  - "Security & Compliance"
  - "Site Recovery"
  - "Update Management"
---
While discussing Azure/OMS topics in the community I often see incorrect usage of OMS (Operations Management Suite). That is understandable of course as Microsoft hasn’t done good job at clearing out all the terms but I still think we should be using the correct term when posting questions or discussing OMS in forums and other sites. This can help us communicate better between each other and especially in forums could result to answering question faster. As we the [move from OMS Portal to Azure Portal](/2018/06/19/oms-portal-moving-to-azure/) it was about time to write this blog post which I’ve intended to do for quite some time but always delayed due to different circumstances.

## Let’s first start by what is OMS?

OMS stands for Operations Management Suite and the key word is Suite here. OMS is not just one service is a set of services. Often people refer to OMS but in fact they mean Log Analytics or a specific solution in the Operations Management Suite. The list of services under the OMS brand are:

-   Azure Monitor
-   Application Insights
-   Azure Log Analytics
-   Azure Automation – Process Automation or aka Runbook and Watchers functionality
-   Azure Automation – Configuration Management – DSC, Inventory and Change Tracking
-   Update Management
-   Recovery Services – Backup
-   Recovery Services – Site Recovery
-   Service Map
-   Azure Security Center – Security & Audit and Antimalware solutions are part of ASC and are no longer standalone solutions
-   Network Performance Monitor
-   Azure Migrate

Do not treat this as official list from Microsoft. It is my own personal list as Microsoft states that Azure Automation, Log Analytics, Backup and Site recovery are part of OMS. My thinking is that the name Operations Management Suite was created so it can bring those initial 4 services as umbrella for them. An umbrella that also was housing E1 and E2 SKUs which were available only for Enterprise Agreement (EA) customers. For other customers there was Per Node SKU. More on that later in the blog post.
But the list above as you will notice lists some services like Log Analytics but also some solutions like Service Map and Network Performance Monitor. My thinking is that those were initially solutions but as they’ve matured they have become something like standalone Azure services that use basic functionalities in Azure Automation and Log Analytics services as platform. For example Update Management uses Log Analytics workspace and the OMS Agent to retrieve data from servers and store it in the workspace. Update Management also uses the Hybrid Worker functionality from Azure Automation to apply updates to servers. I hope this makes sense and clarifies it for you. If we take a look at all the OMS solutions there are some that have matured and basically turned into services on their own and others like Azure Application Gateway Analytics are staying solutions because of their nature. If you ask me any management service like Azure Policy or Azure Cost Management (Cloudyn) should be into single brand like OMS but also we can make the argument do we actually need brand like OMS after the [latest pricing changes](https://azure.microsoft.com/en-us/blog/introducing-a-new-way-to-purchase-azure-monitoring-services/)? If the initial thinking was to create the brand so the services can be sold as package that is no longer true as now the pricing provides flexibility so you can purchase any of these services on their own without needing to buy the whole suite. Again I do not have any internal knowledge. This is just my thoughts on the topic. I hope with this clarification it will now be easier for you to use the right terms in discussion or questions for any of the services.

Now let’s move to our next more interesting topic:

## Brief History of OMS

In this brief history we will focus mostly on the history of Azure Log Analytics as from it the OMS naming confusion comes in. The grandpa of Log Analytics is something called System Center Advisor. I cannot remember when I first heard about System Center Advisor but according to [Wikipedia](https://en.wikipedia.org/wiki/System_Center_Advisor) the service was released in **2012**. That service was initially part of Microsoft software assurance license but later it became free service tied to System Center license. I didn’t use System Center Advisor that much but basically was making some assessments on certain types of workloads and raising alerts on the different checks of the assessment. In **April 2013** Azure Backup was announced as public preview and in **October 2013** was made generally available. Also in **October 2013** Site Recovery was announced in public preview and made generally available an year later. In **2014** System Center Advisor was renamed to Azure Operational Insights and it was launched as preview. If I remember correctly that happened at TechEd NA. I was actually one of the first people to use the service and of course to blog about it. Basically the System Center Advisor portal became Azure Operational Insights portal. At the time Azure Operational Insights was announced if I remember correctly Azure Automation was already present as a service for at least an year – preview in **April 2014** and general availability in **October 2014**. In **May 2015** Operations Management Suite was [announced](https://azure.microsoft.com/en-in/updates/announcing-microsoft-operations-management-suite/). The initial suite included Operational Insights, Azure Automation, Azure Backup and Azure Site Recovery. Security & Audit although a solution was also presented like it is separate service. At that time the Azure Operational Insights Portal was renamed to OMS Portal. With the exception of Operational Insights (and Security & Audit solution) all other services were accessed and operated from Azure Classic Portal at that time. So from this point comes the confusion to my knowledge. Only one of those services was present in that portal but it was called OMS Portal. At that time Backup and Site Recovery had some dashboards in OMS Portal but it was just exposing some data already available in Azure Classic portal. You couldn’t do any actions on Backup and Site Recovery Vaults. At **June 2015** Microsoft also bought BlueStripe and the Service Map service was launched as public preview in **November 2016** and made General Available in **April 2017**. I am not sure I remember the exact time but I think in **February 2016** Operational Insights was renamed to Log Analytics but the portal stayed with the name OMS. Log Analytics also became available as official Azure resource. At **Ignite 2017** Security & Audit and Antimalware solutions officially became part of Azure Security Center. With that basically ASC became part of OMS as if you were using those solutions you were charged like for ASC. In the beginning of **2018** ASC switched to using the OMS agent and Log Analytics workspace so we do not have to install two different agents for the same service and have better place for security events data than just Azure Storage. In **2018** we also saw some core features from Log Analytics like alerting moving under Azure Monitor in order to provide a better unified alert experience across all Azure services. The last step of this journey so far is moving the OMS Portal functionality to Azure Portal. This will finally bring all OMS services into a single portal which I think was something that many of us wanted. This movement was announced recently but it has been happening quite some time. You have seen it with service like Update Management for which new functionality appeared lately only in Azure Portal. As any Azure service OMS services are constantly evolving and improving to provide better experience, value and new functionalities.

Again I would like to remind that this is my personal opinion on the topic without any internal information. Some dates might not be completely accurate. I hope you will find these explanations useful on looking at the big picture.

![Classic OMS Portal](/media/wordpress/2018/06/classic-oms-portal.png)

*Classic OMS Portal*
