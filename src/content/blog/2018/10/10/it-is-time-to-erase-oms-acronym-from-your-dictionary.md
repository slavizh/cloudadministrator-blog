---
title: "It Is Time to Erase OMS Acronym From Your Dictionary"
excerpt: "As I still see people confused and not informed about OMS I’ve decided to write this blog post and lay my thoughts around the end of OMS. If you are not sure what is OMS that is ok and you do…"
description: "As I still see people confused and not informed about OMS I’ve decided to write this blog post and lay my thoughts around the end of OMS. If you are not sure..."
pubDate: 2018-10-10
updatedDate: 2018-10-23
heroImage: "/media/2018/10/azure_management.png"
sourceUrl: "https://cloudadministrator.net/2018/10/10/it-is-time-to-erase-oms-acronym-from-your-dictionary/"
tags: 
  - "Azure Automation"
  - "Azure Governance"
  - "Azure Monitor"
  - "Configuration Management"
  - "MSOMS"
  - "OMS"
  - "Azure"
  - "Azure Policy"
  - "Azure Security Center"
  - "Governance"
  - "Log Analytics"
  - "Microsoft"
  - "Operations Management Suite"
  - "Update Management"
  - "Update Management"
---
As I still see people confused and not informed about OMS I’ve decided to write this blog post and lay my thoughts around the end of OMS.
If you are not sure what is OMS that is ok and you do not necessary need to know but if you are curious you should check out my blog post [What is OMS and a Brief History of It](/2018/06/21/what-is-oms-and-a-brief-history-of-it/). At Ignite 2018 Microsoft probably announced the last major change related to OMS. This was announced on the [Azure blog](https://azure.microsoft.com/en-us/blog/new-full-stack-monitoring-capabilities-in-azure-monitor/) and at [Ignite session](https://www.youtube.com/watch?v=xxni7UrZJFw). To put it in short Log Analytics (which is in 99% what people refer to when they say OMS) is part of Azure Monitor. In Azure Monitor you might see it being called just [Logs](https://docs.microsoft.com/en-us/azure/azure-monitor/overview#monitoring-data-platform) for short. But besides that there are actually way more changes some of which happened at Ignite others were happening for quite some time.

-   [Azure Security Center extends advanced threat protection to hybrid cloud workloads](https://azure.microsoft.com/en-us/blog/azure-security-center-extends-advanced-threat-protection-to-hybrid-cloud-workloads/) – September 25th 2017 – Basically Security & Audit solution became part of Azure Security Center with single pricing for both. Of course over time the integration became better and deeper.
-   [Automation and configuration of Azure, on-premises, and hybrid cloud resources at scale](https://azure.microsoft.com/en-us/blog/automation-and-configuration-of-your-azure-on-premises-and-hybrid-cloud-resources-at-scale/) – September 25th 2017 – Officially announcing that Update Management, Change tracking and Inventory are moving to Azure Portal from OMS Portal. Additionally the pricing is changed significantly thus no longer tied to OMS pricing.
-   [Update management, inventory, and change tracking in Azure Automation now generally available](https://azure.microsoft.com/en-us/blog/update-management-inventory-and-change-tracking-in-azure-automation-now-generally-available/) – March 8th 2017 – Previous OMS solutions completely moved to Azure Portal and officially now standalone services that rely on Log Analytics and Azure Automaiton as platform.
-   [Azure Log Analytics – meet our new query language](https://azure.microsoft.com/en-us/blog/azure-log-analytics-meet-our-new-query-language-2/) – September 27th 2017 – New Log Analytics query language announced. With this you will notice that querying logs is now possible from Azure Portal but from Advanced Analytics portal which had some advanced feature. At Ignite 2018 Advanced portal moved to Azure Portal and became the default experience for querying logs.
-   [Azure Automation DSC Pricing Flexibility](https://blogs.msdn.microsoft.com/powershell/2017/11/14/azure-automation-dsc-pricing-flexibility/) November 14th 2017 – Azure Automation DSC pricing changed as well providing more flexibility and deviating from OMS SKUs which you pay per node for full price.
-   [New Alerts (preview) in Azure Monitor](https://azure.microsoft.com/en-us/blog/new-alerts-preview-in-azure-monitor/) – December 20th 2017 – Alerts are now created from Azure Portal.
-   [The next generation of Azure Alerts has arrived](https://azure.microsoft.com/en-us/blog/the-next-generation-of-azure-alerts-has-arrived/) – March 21st 2018 – OMS Alerts officially moved to Azure Portal and now Log Alerts.
-   [End-to-end monitoring solutions in Azure for Apps and Infrastructure](https://azure.microsoft.com/en-us/blog/revamped-solutions-in-azure-for-application-and-infrastructure-monitoring/) – September 25th 2017 – In 2017 Microsoft is talking about Application Insights and Log Analytics as they are part of Azure Monitor though no announcement at that time.
-   [Extend Log Analytics alerts to Azure Alerts](https://docs.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-alerts-extend) – May 14th 2018 – Microsoft is starting to migrate OMS alerts to use Action Groups from Azure.
-   [Introducing a new way to purchase Azure monitoring services](https://azure.microsoft.com/en-us/blog/introducing-a-new-way-to-purchase-azure-monitoring-services/) – April 3rd 2018 – Log Analytics and Application Insights pricing model is changed. This announces the end of OMS E1, E2 (only for EA) and OMS per node pricing. Note that heading mentions Azure Monitoring services not OMS. Network Performance Monitor becomes part of Network Watcher thus Azure Monitor.
-   [OMS Portal Moving to Azure](/2018/06/19/oms-portal-moving-to-azure/) – June 19th 2018 – OMS Portal will be deprecated and all functionality will move to Azure to the corresponding services.
-   [New full stack monitoring capabilities in Azure Monitor](https://azure.microsoft.com/en-us/blog/new-full-stack-monitoring-capabilities-in-azure-monitor/) – September 24th 2018 – Service Map is also becoming part of Azure Monitor. It is re-branded as Azure Monitor for VMs to accommodate the new features added.

There are a lot more announcement but these are some of the most notable ones. You will notice that there aren’t Backup and Site Recovery announcements. This is just because those services were part of the OMS bundle (E1 and E2 SKUs only) but never integrated in OMS portal or part of OMS per node license. Most of these changes were announced in advance and offered dual experience without immediately cutting the legacy path. For example you can still use OMS per node, E1 and E2 SKUs, OMS Portal will still be available for several months, many of the features present in the old Log Analytics search experience are present in the new one (though there are still some left to tackle before full deprecation), etc. Essentially services like Azure Automation and Log Analytics became like a platform for other services or they can be a platform for your own custom services. Over time we saw a few more services appear like Azure Policy, Azure Cost Management, Azure Resource Graph, etc. that basically complete the picture of Management not only in Azure but on-premises and other clouds.

![Azure Management](/media/2018/10/azure_management.png)

*Azure Management*

**Image by [Microsoft Docs](https://docs.microsoft.com/en-us/azure/governance/azure-management)**

With that said I think it is time to scratch the OMS acronym from your dictionary and start using the correct technical words and acronyms so we can understand better each other.
