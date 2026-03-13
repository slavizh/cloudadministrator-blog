---
title: "Azure Log Alert scoped to resource that sends logs to more than one Log Analytics workspace"
excerpt: "When you configure [diagnostic settings]( you have the option to configure more than one thus send the logs and metrics to multiple Log Analytics workspaces. At t he same time [Log Alert v2]( allow…"
description: "When you configure [diagnostic settings]( you have the option to configure more than one thus send the logs and metrics to multiple Log Analytics workspaces...."
pubDate: 2023-03-02
updatedDate: 2023-03-02
heroImage: "/media/2023/03/diagnstic-settings.png"
sourceUrl: "https://cloudadministrator.net/2023/03/02/azure-log-alert-scoped-to-resource-that-sends-logs-to-more-than-one-log-analytics-workspace/"
tags: 
  - "Azure"
  - "Azure Alerts"
  - "Azure Log Analytics"
  - "Azure Monitor"
  - "Log Analytics"
  - "Azure Monitor"
---
When you configure [diagnostic settings](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings?tabs=portal?WT.mc_id=AZ-MVP-5000120) you have the option to configure more than one thus send the logs and metrics to multiple Log Analytics workspaces. At t he same time [Log Alert v2](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-new-alert-rule?tabs=log?WT.mc_id=AZ-MVP-5000120) allows you to scope your alerts not only to Log Analytics workspace but also to a specific resource or resource group. When the scope is a resource that is not the Log Analytics workspace or resource group than the Log Alert automatically finds to which workspace the logs are send and uses the data from there. But what happens if you are sending the logs and metrics to more than one Log Analytics workspace?

The answer is quite simple when the query for the alert rule is executed it will pull data from all workspaces that are configured these logs to be send. Let’s dig into the details with example. We have storage account that sends logs to two different Log Analytics workspaces:

![](/media/2023/03/diagnstic-settings.png)

*Diagnostic Settings*

If you query the logs for that resource what you will see that the records are repeating. Basically each recorded twice – once for workspace1 and second for workspace2.

![](/media/2023/03/storage-logs.png)

*Azure Storage Logs*

You will see that basically the value for every column is the same including the time excluding TenantId value. TenantId contains the Log Analytics workspace ID which designates which record for which Log Analytics workspace it is.

With that information when the create Log Alert scoped to the resource or resource group we can configure TenantId as dimension. The configuration allows us to filter to receiving alerts on data only from specific workspace by picking one of the values or get separate alert for data of each workspace by selecting all values.

![](/media/2023/03/alert-dimensions.png)

*Alert Dimensions*

I hope that will help you when you plan your logs and metrics storing and alerting.
