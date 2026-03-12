---
title: "Tracking Issues with Resource Health and Log Analytics"
excerpt: "Today’s topic we will focus on two Azure Monitor features – Resource Health and Log Analytics. [Resource Health]( is may be not so known feature of Azure Monitor. The service will basic…"
description: "Today’s topic we will focus on two Azure Monitor features – Resource Health and Log Analytics. [Resource Health]( is may be not so known feature of Azure Mon..."
pubDate: 2021-01-13
updatedDate: 2021-01-13
heroImage: "/media/wordpress/2021/01/resource-health-query-1.png"
sourceUrl: "https://cloudadministrator.net/2021/01/13/tracking-issues-with-resource-health-and-log-analytics/"
tags: 
  - "Azure"
  - "Azure Management"
  - "Azure Monitor"
  - "Data"
  - "Log Analytics"
  - "Resource Health"
---
I have been away from blogging for a while as I needed to dedicate some more time to my family but now I am back with new blog post. Today’s topic we will focus on two Azure Monitor features – Resource Health and Log Analytics. [Resource Health](https://docs.microsoft.com/en-us/azure/service-health/resource-health-overview?WT.mc_id=AZ-MVP-5000120) is may be not so known feature of Azure Monitor. The service will basically track the health of your resources for specific known issues. Think of it like something between Service Health which monitors health for specific services rather resources on higher level and Log Analytics/Application Insights which allows you to monitor on lower level. Using all of them you can achieve end-to-end monitoring. There are a [number of resources that are supported by resource health with a number of issues that are monitored](https://docs.microsoft.com/en-us/azure/service-health/resource-health-checks-resource-types?WT.mc_id=AZ-MVP-5000120). My advise is if you do not have any monitoring on an Azure resource you should at least create [resource health alerts](/2019/09/13/azure-monitor-alert-series-part-5/) for it. Even if you have monitoring I would still advise to use resource health as it will alert you on things that you probably cannot or your are not checking with your monitoring.

Now that we had small introduction we can actually continue with the topic of this blog post. The data for resource health is also logged as records in Azure Activity log. [With diagnostic settings configured on subscription level](/2019/12/03/send-subscription-activity-logs-via-arm-template/) you can send that data to Log Analytics workspace. You will need to send the ResourceHealth category. Once the data is flowing in Log Analytics you can use the power of Kusto to analyze the data. Typical scenarios for this data is:

-   Alerting – although you have the ability to create resource health alerts you can also use Log Analytics alerts to alert on Resource Health data.
-   Tracking health – You can track the health of one or multiple resources or resource type over 90 days period. It is a lot easier to do this in Log Analytics.
-   Correlating health with other data – You can correlate the data of Resource Health with your other monitoring data. For example you can check if an issue/downtime on specific resource has affected the performance or availability of that resource and how.

In the next few examples I will just show you on how to do simple queries on resource health data in Log Analytics and hopefully those can inspire you to build your own for one of the above cases mentioned.

The first query I have is just to show you what data I am processing (see query comments) and what causes you can find issues.

```kusto
AzureActivity
// Filter only on resource health data in activity log
| where CategoryValue == 'ResourceHealth'
// dump any resource health data where the health issue was resolved. We are interested only on unhealthy data
| where ActivityStatusValue <> "Resolved"
// Column Properties has nested columns which we are parsing as json
| extend p = parse_json(Properties)
// Column the parsed Properties column is now a dynamic in column p
// We take the top level properties of column p and place them in their own columns that start with prefix Properties_
| evaluate bag_unpack(p, 'Properties_')
// We do the same for the newly created column Properties_eventProperties
| extend ep = parse_json(Properties_eventProperties)
| evaluate bag_unpack(ep, 'EventProperties_' )
// We list the unique values for column EventProperties_cause
| distinct EventProperties_cause
```

![](/media/wordpress/2021/01/resource-health-query-1.png)

*Resource Health causes*

You can see that we see 3 main causes that we can get. Mostly you should be interested in those that are PlatformInitiated although if you want to track if a person has affected the resource health you can check UserInitiated.

Next we can see a sample data for a resource health issue looks like:

```kusto
AzureActivity
| where CategoryValue == 'ResourceHealth'
| where ActivityStatusValue <> "Resolved"
| extend p = parse_json(Properties)
| evaluate bag_unpack(p, 'Properties_')
| extend ep = parse_json(Properties_eventProperties)
| evaluate bag_unpack(ep, 'EventProperties_' )
```

![](/media/wordpress/2021/01/resource-health-query-2.png)

*Resource Health record*

Next query will show you some titles for resource health issues that you can see for your resources.

```kusto
AzureActivity
| where CategoryValue == 'ResourceHealth'
| where ActivityStatusValue <> "Resolved"
| extend p = parse_json(Properties)
| evaluate bag_unpack(p, 'Properties_')
| extend ep = parse_json(Properties_eventProperties)
| evaluate bag_unpack(ep, 'EventProperties_' )
| distinct EventProperties_title
```

![](/media/wordpress/2021/01/resource-health-query-3.png)

*Resource Health cause titles*

And the last query I have I am tracking unique titles, causes per resource

```kusto
AzureActivity
| where CategoryValue == 'ResourceHealth'
| where ActivityStatusValue <> "Resolved"
| extend p = parse_json(Properties)
| evaluate bag_unpack(p, 'Properties_')
| extend ep = parse_json(Properties_eventProperties)
| evaluate bag_unpack(ep, 'EventProperties_' )
| distinct _ResourceId, EventProperties_title, EventProperties_cause
```

![](/media/wordpress/2021/01/resource-health-query-4.png)

*Resource Health – Resource Id, title and cause*

Now that you have more information how this data looks and how you can use it some tips from me:

-   You can filter only on PlatformInitiated cause to track issues only caused by Azure
-   You can filter on previous and current health status so you track events only going from Available to Degraded
-   You can filter on specific resource type(s), resource group(s) or resource(s)

One thing to keep in mind is that Azure VMs data can be overwhelming as you can login to VMs and restart them from inside.

I hope this was useful blog post for you.
