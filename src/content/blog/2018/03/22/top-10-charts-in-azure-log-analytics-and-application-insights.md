---
title: "Top 10 Charts in Azure Log Analytics and Application Insights"
excerpt: "I’ve recently stumbled on forum question asking for chart that list only the top 10 resources or computers. Such chart is of course used a lot in performance metrics where for example you wan…"
description: "I’ve recently stumbled on forum question asking for chart that list only the top 10 resources or computers. Such chart is of course used a lot in performance..."
pubDate: 2018-03-22
updatedDate: 2018-03-22
heroImage: "/media/wordpress/2018/03/top10chart.png"
sourceUrl: "https://cloudadministrator.net/2018/03/22/top-10-charts-in-azure-log-analytics-and-application-insights/"
tags: 
  - "Application Insights"
  - "Azure"
  - "Azure Log Analytics"
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
  - "TOP 10"
---
I’ve recently stumbled on forum question asking for chart that list only the top 10 resources or computers. Such chart is of course used a lot in performance metrics where for example you want to get the top 10 computers with CPU usage and list them in time chart.

In this blog post I will show you scenario but the example can be used for other performance metrics and resources. The key for achieving such chart is to use let function where we can first find the top 10 resources/computers by using some of the functions for summarization and after that we can build the chart that we want only scoped to those computers. This is simple as the query below:

```kusto
let TopComputers = Perf
| where ObjectName == 'Processor' and CounterName == '% Processor Time' and InstanceName == '_Total'
| summarize AggregatedValue = avg(CounterValue) by Computer
| sort by AggregatedValue desc
| limit 10
| project Computer;
Perf
| where ObjectName == 'Processor' and CounterName == '% Processor Time' and InstanceName == '_Total' and Computer in (TopComputers)
| summarize AggregatedValue = avg(CounterValue) by Computer, bin(TimeGenerated, 1h) | render timechart
```

As you can see by using let I can output only the names of the computers that are in top 10 of CPU usage. After that the next query that displays the chart is scoped only to those computers. The result of the query will look similar to this:

![top10chart](/media/wordpress/2018/03/top10chart.png)

Additionally you can set different times for both queries depending on your scenario. For example you can only get top 10 computers based on the last hour but display the results for the last 24 hours.

Hope this will help you in monitoring your resources.
