---
title: "Using Custom Log Search Alerts Based on Metric Measurement for Event Based Logs"
excerpt: "In a typical scenario you will use Number of results for logs and events and metric measurement for performance/metric logs. That wouldn’t be a problem if the way the alerts are fired disting…"
description: "In a typical scenario you will use Number of results for logs and events and metric measurement for performance/metric logs. That wouldn’t be a problem if th..."
pubDate: 2018-03-16
updatedDate: 2018-03-16
heroImage: "/media/wordpress/2018/03/alert_criteria.png"
sourceUrl: "https://cloudadministrator.net/2018/03/16/using-custom-log-search-alerts-based-on-metric-measurement-for-event-based-logs/"
tags: 
  - "Alerts"
  - "Azure"
  - "Azure Monitor"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Query"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Search"
---
In Azure Monitor we can create two type of alerts for Log Analytics:

-   [Custom Log Search Alerts](https://docs.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitor-alerts-unified-usage)
-   [Near real-time metric alerts](https://docs.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-near-real-time-metric-alerts)

Near real-time metric alerts are scoped to specific performance counter and heartbeat events but with Custom Log Search Alerts you can alert on any log in Log Analytics. With Custom Log Search Alerts the alert logic have two types:

-   Number of results
-   Metric Measurement

In a typical scenario you will use Number of results for logs and events and metric measurement for performance/metric logs. That wouldn’t be a problem if the way the alerts are fired distinguish quite a lot between those. For example in metric measurement you aggregate/summarize results and you alert based on the value from the aggregation/summarization. On top of that different alert instance is fired on each summarized record. In number of results you do not summarize/aggregate and alerts are fired based on the count of the records. For example on 10 records you will get only one alert instead of 10. If you are like me this is a problem as you want to get separate alert instance for your events just like metric measurement alerts.
In this blog post I will show you how to overcome this problem with workaround from the powerful Log Analytics query language.

Couple of weeks ago I’ve wrote a blog post on [how to monitor the Windows Services States with Log Analytics](https://cloudadministrator.wordpress.com/2018/01/24/monitoring-windows-services-sates-with-log-analytics/). I will use the example from that article to create measurement alert that will fire alert instances for every computer. For the example I will use ‘Update Orchestrator Service for Windows Update’ service as it is stopped quite often. As first step prior creating the actual alert I will reveal the query I will use and explain the logic behind it.

```kusto
Event
| where EventLog == 'System' and EventID == 7036 and Source == 'Service Control Manager'
| parse kind=relaxed EventData with * '<Data Name="param1">' Windows_Service_Name '</Data><Data Name="param2">' Windows_Service_State '</Data>' *
| where Windows_Service_Name == 'Update Orchestrator Service for Windows Update' and Windows_Service_State == 'stopped'
| extend AggregatedValue = 1
| summarize arg_max(TimeGenerated, *)  by Computer, bin(TimeGenerated, 5m)
```

In the first part of the query we have the typical filtering EventLog, EventID and Source. This hasn’t changed from my blog post. Next we are using parse to get the Service Name and state. This also hasn’t changed. On the third line we have filtering to specific service and specific state. This is new compared to the blog post. On the fourth line we are extending every record with column named AggregatedValue and fixed value of 1. Custom Log search alerts use the AggregatedValue column to compare the threshold defined. We can basically artificially create that value and in the alert provide threshold that will always be reached. On the fifth line we are using arg\_max() function to summarize. With that approach we are getting all the columns in the records and are making sure that if we have the record for the same computer and same service being stopped in 5 minutes time frame we get notified only once. With that we can proceed to creating the Alert. I am using Azure Monitor to create the alert and I’ve already selected my workspace as target. With below screenshot I am creating the criteria.

![alert_criteria](/media/wordpress/2018/03/alert_criteria.png)

I’ve pasted the query from above. I’ve chosen metric measurement with Aggregated value greater than 0. My aggregated value will always be 1 so this condition will always be true if the service is reporting stopped state. I am also selecting Total breaches greater than 0 and making sure that my period is 5 minutes as well as my frequency. After that I can click done. Additionally define the alert details and the Action Group. For my case I’ve defined e-mail action. Do not configure suppress alert as that suppresses the whole alert and not an instance. After that notice that the alerts I get are for every computer:

![s2d_alert](/media/wordpress/2018/03/s2d_alert.png)

![ad_alert](/media/wordpress/2018/03/ad_alert.png)

Hope this will be useful to you!
