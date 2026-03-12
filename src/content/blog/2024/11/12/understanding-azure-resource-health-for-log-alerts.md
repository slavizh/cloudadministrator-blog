---
title: "Understanding Azure Resource Health for Log Alerts"
excerpt: "Azure Resource Health is Azure Monitor feature to track the overall health of different Azure services. It is particularly handy for PaaS and SaaS type of services as those usually get at most metr…"
description: "Azure Resource Health is Azure Monitor feature to track the overall health of different Azure services. It is particularly handy for PaaS and SaaS type of se..."
pubDate: 2024-11-12
updatedDate: 2024-11-12
heroImage: "/media/wordpress/2024/11/image.png"
sourceUrl: "https://cloudadministrator.net/2024/11/12/understanding-azure-resource-health-for-log-alerts/"
tags: 
  - "Activity Logs"
  - "Azure"
  - "Azure Monitor"
  - "Cloud"
  - "Log Alerts"
  - "Microsoft"
  - "Resource Health"
---
[Azure Resource Health](https://learn.microsoft.com/en-us/azure/service-health/resource-health-overview?WT.mc_id=AZ-MVP-5000120) is Azure Monitor feature to track the overall health of different Azure services. It is particularly handy for PaaS and SaaS type of services as those usually get at most metrics and diagnostic logs that you can use to monitor them. The feature is on by default and it is supported by [many resource types](https://learn.microsoft.com/en-us/azure/service-health/resource-health-checks-resource-types?WT.mc_id=AZ-MVP-5000120). For each resource type there are certain checks that are made on intervals and if any of those checks fails resource health will mark the resource as unavailable. These changes in the resource health are logged as [Azure Activity log events](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log-insights?WT.mc_id=AZ-MVP-5000120). In order to monitor for these changes you can use [Resource Health alerts](https://learn.microsoft.com/en-us/azure/service-health/resource-health-alert-monitor-guide?WT.mc_id=AZ-MVP-5000120) which underneath are alerts monitoring for activity log events scoped to Resource Health category events. Recently Azure Monitor introduced support for [resource health on Log Alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/log-alert-rule-health?WT.mc_id=AZ-MVP-5000120). Log alerts use Kusto query language to monitor based on data from Log Analytics workspace. Due to the rich Kusto query language capabilities there is the possibility of providing incorrect query and saving the alert rule without knowing that it will stop working. This is where Resource Health for Log alerts comes in as it will signal you that there is something wrong with your alert rule. There are of course other checks made related to permissions and networking that will also be signal by Resource Health for your Log Alerts. So enabling Resource Health alerts to notify you on problems with your Log Alerts is something you should do in your environment. The purpose of the blog post is to show you how resource health works and hopefully to enable resource health alerts for your Log Alerts. Overall I would strongly advise you to enable it for all supported resources as it does not introduce additional cost.

Before creating the actual Log Alert I encourage you to look at document [Monitor the health of log search alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/log-alert-rule-health?WT.mc_id=AZ-MVP-5000120). There you will see probably something strange. With the list of Resource Health statuses besides Available, Unknown and Unavailable you have other statuses like Semantic error, The response size is too large, etc. These health status are not correct. The health status supported are Available, Unavailable, Unknown and Degreaded. The statuses listed in the documentation are basically different checks that are performed and signaled when they are failing.

To test the Log Alert resource health I have created Log Alert that uses query to Azure Resource Graph and as those queries require managed Identity I am assigning such with appropriate permissions. The query runs every 5 minutes. Everything should be healthy as it is shown:

![](/media/wordpress/2024/11/log-alert-resource-health-initial.png)

*Log Alert Resource Health initial state*

There is one health event which always appear when you create alert rule. There are not health events in Activity log for now.

Next I will remove the permissions of the identity and wait until the health changes. This could be typical change that could have been done and affect your monitoring. I have waited more than 25 minutes until Resource Health changed its state. I am assuming that the check runs at the frequency of the alert rule and it triggers status change when it fails a few times.

![](/media/wordpress/2024/11/log-alert-resource-health-after-removal-permissions-1.png)

*Log Alert Resource health state after permissions removal*

Not sure why unavailable is shown with blue icon instead of read as this is critical issue to me but that is only UI issue. Before looking at the activity logs I will re-assigned the permissions back to the managed identity in order to see if the alert rule will go back in healthy status. Returning to healthy too less than 20 minutes:

![](/media/wordpress/2024/11/log-alert-resource-health-after-adding-permissions.png)

*Log Alert Resource Health state after adding permissions*

Looking at the activity log we have the following resource health events in chronological order:

First we have the Active status with the health status going from Available to Unavailable.

![](/media/wordpress/2024/11/log-alert-activity-log-1.png)

*Log Alert resource health log – Active*

After that we have Updated status containing details about the issue:

![](/media/wordpress/2024/11/log-alert-activity-log-2.png)

*Log alert resource health log – Updated*

And at last after the permissions were added back to the identity the resource health resolves the issue and health status is back at Available:

![](/media/wordpress/2024/11/log-alert-activity-log-3.png)

*Log Alert Resource health log – Resolved*

As you can see there is clear path from Available -> Unavailable -> Available. Also there is clear path for that health state from Active -> Updated -> Resolved. This is clear indication of the lifecycle of the health event. This lifecyle is important as if you have integration with ITSM you can automatically open incident and automatically close it when the issue is resolved automatically. That could save a lot of time on your support teams. Of course you will need to create Resource Health alert rule that will generate 4 alert instances – one for each activity log event but you can build your integration in a way that all these alert instances are tracked into single ITSM incident that gets closed when Resolved state is received. Check more information on [Resource health events sent to the activity log](https://learn.microsoft.com/en-us/azure/service-health/resource-health-overview#resource-health-events-sent-to-the-activity-log). Note that transitioning to unknown state from Available will not be logged.

Another issue that can be simulated easily by modifying the query in a way that is not valid:

![](/media/wordpress/2024/11/log-alert-activity-log-4.png)

*Log Alert resource health log – Active*

![](/media/wordpress/2024/11/log-alert-activity-log-5.png)

*Log Alert Resource health log – Updated*

![](/media/wordpress/2024/11/log-alert-activity-log-6.png)

*Log Alert resource health log – Resolved*

It is important to note that the resource health status works for alert rules with frequency of 15 minutes or lower. If the alert rule is with higher frequency the health status will be unknown and no event will be logged in activity log.

I hope this will help you to make your monitor (or as now many folks call it observability) better.
