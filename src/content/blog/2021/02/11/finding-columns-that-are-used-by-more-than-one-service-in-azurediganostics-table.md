---
title: "Finding Columns that are used by more than one service in AzureDiganostics table"
excerpt: "AzureDiagnstics table is used by many Azure Services when you send diagnostic logs thus the [500 column limit that Microsoft is trying to fix for that table]( When you hit that limit there is curre…"
description: "AzureDiagnstics table is used by many Azure Services when you send diagnostic logs thus the [500 column limit that Microsoft is trying to fix for that table]..."
pubDate: 2021-02-11
updatedDate: 2021-02-11
heroImage: "/media/wordpress/2021/02/eventname_s-results.png"
sourceUrl: "https://cloudadministrator.net/2021/02/11/finding-columns-that-are-used-by-more-than-one-service-in-azurediganostics-table/"
tags: 
  - "Azure Backup"
  - "Azure Monitor"
  - "AzureDiagnostics"
  - "KQL"
  - "Kusto"
  - "Azure"
  - "Log Analytics"
  - "Log Analytics"
---
AzureDiagnstics table is used by many Azure Services when you send diagnostic logs thus the [500 column limit that Microsoft is trying to fix for that table](https://docs.microsoft.com/en-us/azure/azure-monitor/reference/tables/azurediagnostics#additionalfields-column?WT.mc_id=AZ-MVP-5000120). When you hit that limit there is currently the described workaround but let’s say you have used one service that was sending logs and you no longer use that service. The logs associated with that service are yet to purged but you also want to clean up any custom columns that the service was using. That way you can free some slots for new custom columns for new services that will send logs to AzureDiagnostics table. Of course you can delete the custom column from Log Analytics blade but you do not want to delete a custom column that is also used by another service. This will be a short blog post that I will show you how to find if custom column is used by more than one service by using Kusto query language.

In order to use the query that I will show you make sure that you execute the query for retention period of your workspace so you make sure you run it for you whole data.

To demonstrate the query I will present you with the following scenario:

-   Azure Backup diagnostic logs now supports being send to their own tables instead of AzureDiagnsotics table
-   You are changing the configuration of diagnostic settings for Backup vaults to send data to their own tables
-   The logs now appear in those new tables but you still have the old logs in AzureDiagnostics table
-   After the retention period of your workspace passes you want to remove the [custom columns used by Azure Backup](https://docs.microsoft.com/en-us/azure/backup/backup-azure-diagnostics-mode-data-model?WT.mc_id=AZ-MVP-5000120) but you need to check first if some of these custom columns are used by other services.

With that in mind we can check if column with name EventName\_s for example is used by more than one service by using the following query:

```kusto
AzureDiagnostics
| where TimeGenerated >= ago(365d)
| where isnotempty(EventName_s)
| distinct ResourceProvider
```

The result of that query in my test environment looks like this:

![](/media/wordpress/2021/02/eventname_s-results.png)

*EventName_s results*

So by looking at the results we can see that Service Bus service is also sending data to that column.

We can run the same query for Cloud\_s column.

```kusto
AzureDiagnostics
| where TimeGenerated >= ago(365d)
| where isnotempty(AlertType_s)
| distinct ResourceProvider
```

![](/media/wordpress/2021/02/alerttype_s-results.png)

*AlertType_s results*

Note that I am looking for 1 year time which is my workspace retention period.

I hope this was useful blog post for you.
