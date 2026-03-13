---
title: "Azure Monitor Alert Series Part 12"
excerpt: "I have promised that I will write the last part of this series and I am doing it later than never. After the December holidays I have been occupied with some community stuff that hopefully will see…"
description: "I have promised that I will write the last part of this series and I am doing it later than never. After the December holidays I have been occupied with some..."
pubDate: 2020-02-19
updatedDate: 2020-02-19
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2020/02/19/azure-monitor-alert-series-part-12/"
tags: 
  - "Application Insights"
  - "Azure"
  - "Azure Alerts"
  - "Azure Management"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "Azure Policy"
  - "Log Analytics"
  - "Log Analytics"
---
I have promised that I will write the last part of this series and I am doing it later than never. After the December holidays I have been occupied with some community stuff that hopefully will see light in the next months. Due those community duties I was not able to write the last part sooner.

In this last part we will cover [Azure Alerts Common schema](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-common-schema-definitions). I will try not to cover things that are already in the official documentation but I want to mention a few important things. If you haven’t checked the documentation please do before reading the rest of the blog post.

As you have seen from the documentation the schema is divided in two main parts:

-   essentials – where the same type of properties are present for all alert types
-   alert context – specific data for the alert depending on its type

Although the properties in essentials are the same the values for some those properties will differ depending on the alert type. Here are the main differences I have noticed:

-   alertId – There is not difference in this between alert types but documentation says GUID where this is the resource ID of the alert not just its GUID.
-   severity – We have already mentioned this but some alerts like activity based one you cannot configure it so default value will always be Sev4 for those.
-   signalType – This one differs depending on alert type and possible values are: Activity Log, Metric and Log. Activity log is for all activity log based alerts. Metric is for Metric and Application Insights alerts (even those based on log queries). Log is for Log Analytics alerts.
-   monitorCondition – As mentioned there are two possible values Fired and Resolved. As far as I am aware only the Metric alerts currently return value Resolved as they are the only ones who can auto-resolve based on their condition. So for any other alert type based metric you will see the value always being Fired. This applies also to Service Health and Resource Health alerts which have a way to report Resolved status. Because they are based on activity log every alert instance fired is on its own and not in any way tied to previous ones. For Service Health alerts the actual health state will be reported in alertContext -> properties -> stage. Keep in mind that stage property besides Active and Resolved can be [other values like RCA, Planned, etc.](https://docs.microsoft.com/en-us/azure/service-health/service-health-notifications-properties) which depend also incidentType property value. For resource health alerts the actual health is in alertContext -> properties -> [currentHealthStatus](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/activity-log-schema#resource-health).
-   alertTargetIds – as it is mentioned in the documentation when you have alerts based on log queries for Application Insights or Log Analytics worksapce here will be the resource IDs of those instances. In case you alert query returns Azure resources in its results the actual resource IDs for those Azure Resources will be located in alertContext -> AffectedConfigurationItems. For application insights you do not have such property as you usually with one Application Insights instance monitor a specific set of Azure resources that are all tied to single application.
-   firedDateTime – The value for this property is in format YYYY-MM-ddTHH:mm:ss.fffffffZ. For example 2019-08-12T11:57:17.8328556Z. There is one bug that I have discovered recently is that only service health alerts return the value in format YYYY-MM-ddTHH:mm:ss.fffffff. Basically without Z at the end. I have reported this to the Product Group and hopefully they have already fixed it. If not know that if you expect certain format might be different for service health alerts.
-   resolvedDateTime – As we have mentioned Resolved in monitorCondition is reported only by metric alerts so this property is only present when monitorCondition is Resolved. Date format is the same as firedDateTime.

I hope you will find this last blog post on the series useful as the others!
