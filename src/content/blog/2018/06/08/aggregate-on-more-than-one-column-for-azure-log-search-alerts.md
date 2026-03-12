---
title: "Aggregate on More Than One Column for Azure Log Search Alerts"
excerpt: "Log Analytics alerts aka Azure Log Search Alerts allows you to create a single alert and trigger alert instances per a column. This is possible by creating metric measurement alert. Unfortunately t…"
description: "Log Analytics alerts aka Azure Log Search Alerts allows you to create a single alert and trigger alert instances per a column. This is possible by creating m..."
pubDate: 2018-06-08
updatedDate: 2018-11-12
heroImage: "/media/wordpress/2018/06/alert.png"
sourceUrl: "https://cloudadministrator.net/2018/06/08/aggregate-on-more-than-one-column-for-azure-log-search-alerts/"
tags: 
  - "Alerts"
  - "Azure"
  - "Azure Log Analytics"
  - "Azure Management"
  - "Azure Monitor"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "Operations Management Suite"
  - "Automation"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Query"
---
Log Analytics alerts aka Azure Log Search Alerts allows you to create a single alert and trigger alert instances per a column. This is possible by creating metric measurement alert. Unfortunately these types of alerts also have a limitation which might be blocking in certain situation. The classical example for that limitation is to create a single alert that will separate instance for free disk space threshold for each computer and disk. The query representation of that looks like this:

```kusto
Perf
| where ObjectName == 'LogicalDisk' or ObjectName == 'Logical Disk'
| where CounterName == '% Free Space'
| where InstanceName <> '_Total'
| summarize AggregatedValue = avg(CounterValue) by Computer, InstanceName, bin(TimeGenerated, 5m) | render timechart
```

but as you can see we aggregating on more than one field – Computer and InstanceName and such alert if created will not function properly. Basically will ignore the InstanceName column and produce incorrect results.
Fear not because of the power of Log Analytics query language there is a workaround. What we can do is basically merge Computer and InstanceName columns into one and aggregated on that merged column. This is easy done by the [extend operator](https://docs.loganalytics.io/docs/Language-Reference/Tabular-operators/extend-operator). The query we will have will look like this:

```kusto
Perf
| where ObjectName == "LogicalDisk" or ObjectName == "Logical Disk"
| where CounterName == "% Free Space"
| where InstanceName <> "_Total"
| extend ComputerDrive = strcat(Computer, ' - ', InstanceName)
| summarize AggregatedValue = avg(CounterValue) by ComputerDrive, bin(TimeGenerated, 5m)
```

After that we can proceed with creating the alert with that query:

![alert](/media/wordpress/2018/06/alert.png)

Note the alert is configured intentionally with such threshold to generate alerts just for demo purposes.

Once the alerts are triggered as you can see via the e-mails below that separate e-mails are generated for each computer and drive:

![alert1](/media/wordpress/2018/06/alert1.png)

![alert2](/media/wordpress/2018/06/alert2.png)

![alert3](/media/wordpress/2018/06/alert3.png)

I hope this Azure Management trick was useful for you!
