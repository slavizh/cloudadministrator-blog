---
title: "Monitoring Windows Services States with Log Analytics"
excerpt: "Monitoring Windows Services States is one of the most common requests that I’ve seen on forums, groups and blog posts. My fellow MVP and OMS expert Stefan Roth wrote a similar blog post titled OMS …"
description: "Monitoring Windows Services States is one of the most common requests that I’ve seen on forums, groups and blog posts. My fellow MVP and OMS expert Stefan Ro..."
pubDate: 2018-01-24
updatedDate: 2018-01-24
heroImage: "/media/wordpress/2018/01/image4.png"
sourceUrl: "https://cloudadministrator.net/2018/01/24/monitoring-windows-services-sates-with-log-analytics/"
tags: 
  - "Azure"
  - "Event Log"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "Monitor"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Search"
  - "Windows Server"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Windows"
  - "Windows Services"
---
Monitoring Windows Services States is one of the most common requests that I’ve seen on forums, groups and blog posts. My fellow MVP and OMS expert [Stefan Roth](https://twitter.com/stefanroth_net) wrote a similar blog post titled [OMS – Monitor Windows Services / Processes](https://www.stefanroth.net/2017/12/11/oms-monitor-windows-services-processes/). I would suggest to check it out as well. The approach I will show is somehow already cover in official article that [demonstrates custom fields](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-custom-fields) in Log Analytics. The difference is that we now have the new rich Log Analytics search syntax so we do not need  custom fields anymore. This approach also is different from Stefan’s as his one covers wider topic with monitoring processes by using performance counters. In this approach we will use windows events which Stefan mentions that is not reliable but he was referring to specific Event Id which I also agree it is not reliable. In the next steps I will use another Event Id that is reliable 100%. The advantage of using windows events for monitoring windows services states are:

-   Only windows events are gathered which results in less data uploaded compared to performance data
-   You do not have to add performance counter for each process, you just need to add only one event log to monitor all services

-   The services are shown with their actual name that is used in services.msc or Get-Service cmdlet.

-   We have the actual state of the service when it happened

Some of the disadvantages of this method are:

-   Until the service is started or stopped it will take at least 5 minutes until the data appears in Log Analytics

With that said let’s see how we can achieve this task very easy by using the power of Log Analytics search.

The first we need to do is to add System event log as data source:

[![image](/media/wordpress/2018/01/image4.png "image")](/media/wordpress/2018/01/image4.png)

If you prefer you can only add Information channel.

The next step is just to execute a query but before that let’s mention what we will do. We will filter on Event Id 7036 from System log. This event contains information which service has stopped or started. That information is contained in EventData column but is unstructured. By using the Log Analytics powerful language we will structure that data very nicely. This is done by executing the following query:

_**Event**_

_**| where EventLog == “System” and EventID == 7036 and Source == ‘Service Control Manager’**_

_**| parse kind=relaxed EventData with \* ‘<Data Name=”param1″>’ Windows\_Service\_Name ‘</Data><Data Name=”param2″>’ Windows\_Service\_State ‘</Data>’ \***_

_**| sort by TimeGenerated desc**_

_**| project Computer, Windows\_Service\_Name, Windows\_Service\_State, TimeGenerated**_

[![image](/media/wordpress/2018/01/image5.png "image")](/media/wordpress/2018/01/image5.png)

As you can see from the screenshot we have the Computer in question, the service name, the state – stopped and running when it was started and the time.

Keep in mind this is point in time state and I suggest to automate so that when service is stopped you fire a runbook that starts it. By having the actual name of the service this is pretty easy.

Remember also to filter on the services that you want to monitor because there are a lot of services that start and stop all the time especially on Windows Server 2016.
