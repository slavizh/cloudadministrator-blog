---
title: "Azure Monitor Alert Series – Part 7"
excerpt: "On this blog post we will cover Azure Monitor Log Alerts. You might know them as Log Analytics alerts but a long time has passed when Log Analytics was standalone service that was not part of Azure…"
description: "On this blog post we will cover Azure Monitor Log Alerts. You might know them as Log Analytics alerts but a long time has passed when Log Analytics was stand..."
pubDate: 2019-10-07
updatedDate: 2020-01-19
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/10/07/azure-monitor-alert-series-part-7/"
tags: 
  - "Alerts"
  - "Application Insights"
  - "ARM Templates"
  - "Azure"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "Log Analytics"
  - "Tips"
  - "ARM"
  - "Azure Resource Manager"
  - "Tricks"
---
On this blog post we will cover Azure Monitor Log Alerts. You might know them as Log Analytics alerts but a long time has passed when Log Analytics was standalone service that was not part of Azure Monitor. You may have noticed some UI improvements of those but the biggest improvements were actually under the hood. To my opinion this migration was executed very good with a lot of issues for the customers. No it was not perfect migration but taking into considerations all the complexity of such migrations I would say it was well executed and with thought for the customers. To be honest I will also say that these types of alert are my favorite. The simple reason for that is because by using Kusto queries I have way more room to improvise. Of course the alerts have their own downsides as well but that is the beauty of Azure Monitor alerts. You have flexible choices without being forced to specific one. Enough with the flattery and continue to the interesting parts of this blog post.

As I have mentioned before in [Part 1](/2019/08/15/azure-monitor-alerts-series-part-1/) of the series we have two sub types:

-   Number of results
-   Metric Measurement

I already gave a brief explanation of them and now I want to give advise in which situation you should which sub-type. Before proceeding to the actual advise let me give you some brief introduction on a few workflows and terms. Usually when you have alert that alert on itself is not a record that is very actionable. For example in Azure specifically on alert instance you have the option to set state and enter some optional comment with the state change but you do not have full capability to manage multiple comments, notes or assigning people and groups as owners of the alert. To put it simple just alerts does not cover Incident Management process which I think it is important even in DevOps world. Because of that usually when alert is fired its data is actually logged into another system as incident record. Of course you can have some automation as well that may be does additional remediation as well but for now we will not touch that topic. So when the alert is logged to incident record that record usually contains some vital information that is useful for operations team to understand the issue so investigation and remediation actions can be started. One of the most important information is which CI (configuration item) is affected by the issue. In many cases the CI could be the actual resource id (as unique identifier) of the resource but in other cases it can be more than that. For example let’s you have server and suddenly two of the volumes/disks (let’s say E: and F:) on the server fall below critical threshold for free disk space. Ideally you would want two separate instances of the alert fired for each disk of the server thus having two separate incident records as well. In those cases the CI is both the resource ID of the VM and the corresponding volume. So why the two incidents and why this should not be into single incident? While you investigate you might easier way to fix the problem on volume E: but fixing it on Volume F: might require more time. If you have two incidents and one of the incident is resolved you can close it thus avoid breaking any SLA. If both were in a single incident than the incident would have to stay open until you resolve both issues. This type of logic is also why we have dimensions in Metric alerts. Because of that logic in most cases when you create alerts for data in Log Analytics you would use metric measurement sub-type. Because usually Log Alerts are created for data that come from multiple resources you would want each alert fired to be per resource and that is what metric measurement sub-type allows you to do. Number of results sub-type also has its usage as well and to my modest opinion mostly when the alert targets Application Insights instance. Application Insights instances are usually create per application. Which means that all the data in Application Insights instance relates to single CI (the application that is monitored). Because of that it might be better to create alert rule that creates a single incident (or issue if you use service like DevOps) for a group of users who are experiencing issues with your application rather creating separate incident for each user. Of course at the end it is up to you to decide which sub-type to use but I hope these examples helps you better understand the difference between these two.

Both of these alerts you can create from Azure Portal and ARM templates. We will proceed directly with the ARM template example like in the other blog posts:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of Log Analytics workspace"
            }
        },
        "logAnalyticsWorkspaceLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of Log Analytics workspace"
            }
        },
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of the action group"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "scheduledQueryRules": "2018-04-16"
        }
    },
    "resources": [
        {
            "name": "Low Disk space on a volume",
            "type": "Microsoft.Insights/scheduledQueryRules",
            "apiVersion": "[variables( 'apiVersions' ).scheduledQueryRules]",
            "location": "[toLower( replace( parameters( 'logAnalyticsWorkspaceLocation' ), ' ', '' ) )]",
            "properties": {
                "description": "The volume on a computer is below 10%.",
                "enabled": "true",
                "source": {
                    "authorizedResources": [],
                    "query": "Perf | where ObjectName =~ 'LogicalDisk' and CounterName =~ '% Free Space' and InstanceName !~ '_Total' | summarize AggregatedValue = avg(CounterValue) by _ResourceId, VolumeName = InstanceName, bin(TimeGenerated, 5m)",
                    "dataSourceId": "[parameters('logAnalyticsWorkspaceId')]",
                    "queryType": "ResultCount"
                },
                "schedule": {
                    "frequencyInMinutes": 5,
                    "timeWindowInMinutes": 5
                },
                "action": {
                    "odata.type": "Microsoft.WindowsAzure.Management.Monitoring.Alerts.Models.Microsoft.AppInsights.Nexus.DataContracts.Resources.ScheduledQueryRules.AlertingAction",
                    "severity": "1",
                    "throttlingInMin": 0,
                    "aznsAction": {
                        "actionGroup": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "emailSubject": null,
                        "customWebhookPayload": null
                    },
                    "trigger": {
                        "thresholdOperator": "LessThan",
                        "threshold": 10,
                        "metricTrigger": {
                            "thresholdOperator": "GreaterThan",
                            "threshold": 0,
                            "metricTriggerType": "Total",
                            "metricColumn": "_ResourceId,VolumeName"
                        }
                    }
                }
            }
        }
    ]
}
```

Now let’s look at the important parts in this ARM template:

-   We have a name of ‘Low Disk space on a volume’ for the alert
-   These alert types use ‘Microsoft.Insights/scheduledQueryRules’ resource provider
-   These alerts have location and the location needs to be the as the Log Analytics workspace
-   We can have description for this alert
-   We can enable or disable the alert
-   When it comes to the query there are few things to note:
    -   The query is based on performance data (metrics)
    -   I use ‘=~’ operator for string comparisons to avoid any lower and upper cases issues
    -   When we deal with metric measurement alerts we have to have column with AggregatedValue. That column must also have as values integer or doable types.
    -   I am aggregating the data on two columns \_ResourceId and InstanceName. InstanceName is renamed to VolumeName. \_ResourceId is unique value that every data coming from Azure resource has.
    -   With bin() function I am slicing the data in 5 minutes interval. The 5 minutes interval matches the values in frequencyInMinutes and timeWindowInMinutes. It is always good idea that timeWindowInMinutes either matches the value in bin or it is higher. In my cases I always match it otherwise for the same frequency you might get the same alerts for the same resource depends how much of the time windows in bin() fits into the value of timeWindowInMinutes. Usage of bin() is also mandatory for this sub-type of alert.
-   the datasource is the resource id of the Log Analytics workspace. It could be also the resource ID of Application Insights instance if you are in that scenario.
-   We can set severity for the alert – 0 to 4
-   With throttlingInMin we can suppress the alert for specific minutes. I never do this on metric measurement alerts as this suppress is not per instance but for the whole alert rule. So if the suppress is initiated the whole alert will be suppressed for the defined period.
-   We can set action group
-   if we want we can modify the e-mail subject and/or the json webhook payload. These days I never do any of these. For the webhook I rely on the common alert schema format and for the e-mail on the default subject.
-   The threshold in this case we set to everything less 10. Basically everything less than 10 in AggregatedValue will trigger the alert. AggregatedValue represents the % of free disk space on a volume in our case.
-   The metric trigger threshold I always set this way so I can trigger on record that meets the above threshold criteria
-   At the end we have metricColumn. This is very important. The value in that property defines our unique CI. Basically as long as the pair of of columns \_ResourceId and VolumeName is different and it meets the threshold a separate alert will be fired for each pair. You can also put more than two columns as well here but always put at least one. Note that you will have this option to show in the UI only if you have data from the query or the table schema is available. That is why it is good approach to create your alerts via ARM templates as you can deploy/create the alerts no matter if you have the data or not.

As you saw in the example my query uses metrics data but you can use metric measurement alerts even if you use even based data. You can see that with the example below:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of Log Analytics workspace"
            }
        },
        "logAnalyticsWorkspaceLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of Log Analytics workspace"
            }
        },
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of the action group"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "scheduledQueryRules": "2018-04-16"
        }
    },
    "resources": [
        {
            "name": "A critical service has stopped",
            "type": "Microsoft.Insights/scheduledQueryRules",
            "apiVersion": "[variables( 'apiVersions' ).scheduledQueryRules]",
            "location": "[toLower( replace( parameters( 'logAnalyticsWorkspaceLocation' ), ' ', '' ) )]",
            "properties": {
                "description": "A critiecal service has stopped",
                "enabled": "true",
                "source": {
                    "authorizedResources": [],
                    "query": "ConfigurationChange | where ConfigChangeType =~ 'WindowsServices' and SvcChangeType =~ 'State' and SvcState =~ 'Stopped' | where SvcDisplayName in ('Computer Browser', 'DHCP Client', 'Server', 'Windows Event Log', 'Windows Firewall',  'Remote Procedure Call (RPC)', 'Workstation' ) | extend AggregatedValue = 1 | summarize arg_max(TimeGenerated, *) by _ResourceId, SvcDisplayName, bin(TimeGenerated, 5m)",
                    "dataSourceId": "[parameters('logAnalyticsWorkspaceId')]",
                    "queryType": "ResultCount"
                },
                "schedule": {
                    "frequencyInMinutes": 5,
                    "timeWindowInMinutes": 5
                },
                "action": {
                    "odata.type": "Microsoft.WindowsAzure.Management.Monitoring.Alerts.Models.Microsoft.AppInsights.Nexus.DataContracts.Resources.ScheduledQueryRules.AlertingAction",
                    "severity": "1",
                    "throttlingInMin": 0,
                    "aznsAction": {
                        "actionGroup": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "emailSubject": null,
                        "customWebhookPayload": null
                    },
                    "trigger": {
                        "thresholdOperator": "GreaterThan",
                        "threshold": 0,
                        "metricTrigger": {
                            "thresholdOperator": "GreaterThan",
                            "threshold": 0,
                            "metricTriggerType": "Total",
                            "metricColumn": "_ResourceId,SvcDisplayName"
                        }
                    }
                }
            }
        }
    ]
}
```

Comparing the main parts of this alert to the previous one you will see:

-   I am using ConfigurationChange table which comes from Configuration Management solution
-   I am filtering events only for specific services being reported in stopped state
-   I am adding AggregatedValue with static value 1. That way I am fulling the requirement that I need AggregatedValue column
-   I am using arg\_max() operator to get only the last results generated by a pair of \_ResourceId and SvcDisplayName
-   Threshold this time is everything greater than 0. As AggregatedValue for each record always will be 1 we get alerts for every record that matches our query filter. So for event based data our filtering is basically our threshold.
-   metricColumn contains \_ResourceId and SvcDisplayName because we want to get separate alert for each VM and service.

Another thing that is very little known is that you can use functions within the queries of the alert. Keep in mind that as far as I know this is not supported scenario but it is possible. Imagine that you have a query like:

```kusto
Heartbeat
| where Computer startswith 'srv'
| distinct _ResourceId
```

And you save this query as function with alias MyServers. Later the query for the alert could look like this:

```kusto
Perf
| where ObjectName =~ 'LogicalDisk' and CounterName =~ '% Free Space' and InstanceName !~ '_Total'
| where _ResourceId in (MyServers)
| summarize AggregatedValue = avg(CounterValue) by _ResourceId, VolumeName = InstanceName, bin(TimeGenerated, 5m)
```

That way you can scope your alert dynamically on the servers to which you want to apply to. In such kind of method it is important to know that the query in the alias will run for the same time window for which the alert is defined. So if the time window is 5 minutes the MyServers function will show results in the last 5 minutes only. For example if you for MyServers function you use some data that is generated only every hour and your time window in the alert is 5 minutes, the alert will basically stop to work properly because in most cases the function it will just return 0 records so there will be nothing to filter in the query for the alert and that will produce 0 records as well.

Creating number of results alert sub-type is very similar to the examples above. The only differences are:

-   AggregatedValue and bin() are not required in the query
-   The whole metricTrigger object in the template is removed. When that object does not exists the alert type becomes number of results.

In both examples you have might noticed one property that was empty array. That property is authorizedResources. In case you have alert query like this:

```kusto
Perf
| union workspace("e3ec9ac7-2855-49d9-9b88-d85a784113f6").Perf
| where ObjectName =~ 'LogicalDisk' and CounterName =~ '% Free Space' and InstanceName !~ '_Total' | summarize AggregatedValue = avg(CounterValue) by _ResourceId, VolumeName = InstanceName, bin(TimeGenerated, 5m)
```

that basically uses data from more than one workspace and/or application insights instance that is the case when values for authorizedResources needs to be provided. In such cases the template would look like this:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of Log Analytics workspace"
            }
        },
        "logAnalyticsWorkspaceId2": {
            "type": "string",
            "metadata": {
                "description": "The ID of the second Log Analytics workspace"
            }
        },
        "logAnalyticsWorkspaceLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of Log Analytics workspace"
            }
        },
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of the action group"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "scheduledQueryRules": "2018-04-16"
        }
    },
    "resources": [
        {
            "name": "Low Disk space on a volume",
            "type": "Microsoft.Insights/scheduledQueryRules",
            "apiVersion": "[variables( 'apiVersions' ).scheduledQueryRules]",
            "location": "[toLower( replace( parameters( 'logAnalyticsWorkspaceLocation' ), ' ', '' ) )]",
            "properties": {
                "description": "The volume on a computer is below 10%.",
                "enabled": "true",
                "source": {
                    "authorizedResources": [
                        "[parameters('logAnalyticsWorkspaceId')]",
                        "[parameters('logAnalyticsWorkspaceId2')]"
                    ],
                    "query": "Perf | union workspace('e3ec9ac7-2855-49d9-9b88-d85a784113f6').Perf | where ObjectName =~ 'LogicalDisk' and CounterName =~ '% Free Space' and InstanceName !~ '_Total' | summarize AggregatedValue = avg(CounterValue) by _ResourceId, VolumeName = InstanceName, bin(TimeGenerated, 5m)",
                    "dataSourceId": "[parameters('logAnalyticsWorkspaceId')]",
                    "queryType": "ResultCount"
                },
                "schedule": {
                    "frequencyInMinutes": 5,
                    "timeWindowInMinutes": 5
                },
                "action": {
                    "odata.type": "Microsoft.WindowsAzure.Management.Monitoring.Alerts.Models.Microsoft.AppInsights.Nexus.DataContracts.Resources.ScheduledQueryRules.AlertingAction",
                    "severity": "1",
                    "throttlingInMin": 0,
                    "aznsAction": {
                        "actionGroup": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "emailSubject": null,
                        "customWebhookPayload": null
                    },
                    "trigger": {
                        "thresholdOperator": "LessThan",
                        "threshold": 10,
                        "metricTrigger": {
                            "thresholdOperator": "GreaterThan",
                            "threshold": 0,
                            "metricTriggerType": "Total",
                            "metricColumn": "_ResourceId,VolumeName"
                        }
                    }
                }
            }
        }
    ]
}
```

In the example note that although resource id of the first workspace is available in property dataSourceId it still needs to be listed in authorizedResources as well. Additionally the location of the alert will be the location of the workspace that is entered in dataSourceId.

This is probably the longest blog post in the series so far but I hope it was helpful on understanding how to take advantage at best with these alerts.
