---
title: "Azure Monitor Alert Series – Part 6"
excerpt: "In Part 6 of the series we will cover Metric Alerts. These are very powerful alerts but they also have some limitations. The good thing is that the Azure Monitor team is constantly working on blurr…"
description: "In Part 6 of the series we will cover Metric Alerts. These are very powerful alerts but they also have some limitations. The good thing is that the Azure Mon..."
pubDate: 2019-09-18
updatedDate: 2020-01-19
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/09/18/azure-monitor-alert-series-part-6/"
tags: 
  - "Azure"
  - "Azure Application Insights"
  - "Azure Log Analytics"
  - "Azure Management"
  - "Azure Metric Alerts"
  - "Azure Metrics"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "ARM"
  - "Azure Resource Manager"
  - "Log Analytics"
  - "Azure Resource Manager"
---
In Part 6 of the series we will cover Metric Alerts. These are very powerful alerts but they also have some limitations. The good thing is that the Azure Monitor team is constantly working on blurring the lines between Metric alerts and Log alerts and providing more unified experience. It is first important to say we have 3 different types of metric alerts. Don’t be afraid as one of the types is strictly specific to Application Insights and the other two are very similar and have deviation on defining the condition. Here are the 3 types available:

-   Static Metric Alerts
-   Dynamic Metric Alerts
-   Availability Test alert – specific to Application Insights

As Microsoft has some good documentation (including ARM template examples) I will reference their documentation in some parts of the blog post to avoid duplicate content. Things that I think are very important for sure I will mention here.

First let’s start about some important information that is applicable for all metric alerts types:

-   Alerts are fired per resource but it can be configured to fire per dimensions. For example per VM resource and disk. In that case the disk is dimension. More on this later in the blog post.
-   You can assign you own severity via the alert
-   Supports common alert schema
-   Currently alerts are created per resource but support for creating alerts per resource group or subscription is coming. More on that later in the blog post.
-   The alerts are automatically resolved when the issue no longer exists. In case of resolved problem another alert instance is fired with Resolved status.
-   like the Activity Log alerts these are also global resource

Static metric alerts are called static because you have one or two conditions and the thresholds for those conditions are static numbers. You can create static metric alerts from both Portal and ARM templates. If you are doing discovering and learning I would suggest to use the Portal as that will give you easier access to the available metrics for a specific resource. If you are going to deploy to production I would advise you to create your metric alert rules as code in ARM Templates. This applies basically for any of the alerts in these series.

In order to understand the options for creating static metric alerts let’s see one such example in ARM template:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "resourceID": {
            "type": "string",
            "metadata": {
                "description": "The ID of the resource"
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
            "metricAlerts": "2018-03-01"
        }
    },
    "resources": [
        {
            "name": "Metric Alert Sample Rule",
            "type": "Microsoft.Insights/metricAlerts",
            "apiVersion": "[variables( 'apiVersions' ).metricAlerts]",
            "location": "global",
            "properties": {
                "description": "Metric Alert Sample description",
                "enabled": true,
                "severity": 1,
                "windowSize": "PT5M",
                "evaluationFrequency": "PT5M",
                "scopes": [
                    "[parameters('resourceID')]"
                ],
                "criteria": {
                    "allOf": [
                        {
                            "metricName": "AverageResponseTime",
                            "metricNamespace": "Microsoft.Web/sites",
                            "operator": "LessThan",
                            "timeAggregation": "Average",
                            "name": "Metric1",
                            "dimensions": [
                                {
                                    "name": "Instance",
                                    "operator": "Include",
                                    "values": [
                                        "*"
                                    ]
                                }
                            ],
                            "monitorTemplateType": 8,
                            "criterionType": "StaticThresholdCriterion",
                            "threshold": 1000
                        }
                    ],
                    "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria"
                },
                "actions": [
                    {
                        "actionGroupId": "[parameters('actionGroupResourceId')]",
                        "webhookProperties": {}
                    }
                ],
                "autoMitigate": true,
                "targetResourceType": "Microsoft.Web/sites"
            }
        }
    ]
}
```

Let’s start dissecting all the important properties of the alert:

-   The resource name also represents the name of the alert. It is no problem to have white spaces in it.
-   As you can see it is global resource
-   we have description that we can set. This is good area of also putting some knowledge on how those who receive the alert should resolve it, why the alert was fired, etc.
-   We have the possibility to enable or disable the alert rule
-   We can set severity from 0 to 4. These appear in portal as Sev0 – Sev4
-   windowSize reflects aggregation granularity (period) in the portal. In this case it is 5 minutes. In portal you can see available values to set.
-   evaluationFrequency reflects frequency of evaluation in the portal. In this case it is 5 minutes. In portal you can see available values to set.
-   scopes – here you need to put the resource ID of the resource you will create this alert for. In this case would be the Azure web site resource id. As I have mentioned before currently you create these alerts per resource. There is currently [public preview](https://azure.microsoft.com/en-us/blog/azure-monitor-alerting-just-got-better/) which allows you to set the scope to a resource group resource ID or subscription resource ID. This currently works only for Virtual Machines though. More resources will be added in the future. One thing that is important to know is that when you scope per subscription or resource group you need to scope the alert rule per region. Because of that you will have targetResourceRegion property under targetResourceType property. The value of the property will be the region to which the alert is scoped to. When the alert is scoped to resource group or subscription odata.type property is also changed to ‘Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria’.
-   the criteria property contains only allOf array and odata.type property.
-   allOf is array that contains the conditions. You can have one or two conditions. If there are two they both need to be true so the alert gets fired. In our case we have one condition.
-   We have metricNamespace. You can see all supported name spaces [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-metric-near-real-time) under resource type column. Additionally if you create metric alerts based on metrics from Application Insights the value is microsoft.insights/components. Although it is not listed in that link it is listed [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/metrics-supported#microsoftinsightscomponents). In case you also have custom metrics in Application Insights the value would be Azure.ApplicationInsights.
-   We have metricName. The value reflects Metric column in Supported Metrics Microsoft document.
-   We have operator. The value can be Equals, NotEquals, GreaterThan, GreaterThanOrEqual, LessThan and LessThanOrEqual.
-   We have also timeAggregation. This is aggregation type setting in portal and possible values are listed for each metric in in Supported Metrics Microsoft document. under Aggregation Type column. I have noticed that some metrics might have some Aggregation Types that are not documented but in most cases you will either use Average or Count. This is one of the limitations of metric alerts because you have predefined aggregation types where compared to Log alerts you can use whatever it is available in Kusto query language. For example you can use percentile 95. Certainly there are cases where you would want to have such aggregation.
-   name basically gives name to this condition. You can put whatever you want. If you have two conditions the names must be different.
-   In this case we also have dimensions. The name of the dimension is taken again from [this table](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/metrics-supported#microsoftwebsites-excluding-functions) under Dimensions column for that metric. You can put multiple dimensions if it makes sense for the alert and of course if the metric has such. Operator value in dimensions is either Include or Exclude. Values is \["\*"\] which means that any dimension value. If I want to put explicit value I can do that but for example for web app does not makes much sense as the name of the instance is some random name that usually starts with RD and it could change over time. If you do not want to include any dimensions you can just put empty array for dimensions property.
-   templateType and criterionType values sets that this is static metric alert.
-   threshold is the value we will compare to fire the alert
-   we also can set one or multiple action groups as any other alert
-   autoMitigate property sets if when the alert is resolved, it will fire new action with Resolved status. This basically will close the alert in Azure Monitor and will send data via the action group that this is resolved. This option is not available in the portal but it seems it is available here to turn it off if you do not want this behavior. This kind of behavior is available only for Metric alerts and Azure Monitor for VMs alerts
-   targetResourceType has the same value like metricNamespace usually and represents the type of resource the alert is targeting.

The above alert sample is not something you would want to deploy in production as it does not makes sense as logic. It is rather sample just to show you different capabilities. You can find a lot of metric alert samples (even for dynamic metric alerts) [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-metric-create-templates).

Speaking of dynamic metric alerts let’s move to them. Dynamic alerts are based on AI (or as I call it Machine Learning). Basically the alerts teach themselves based on previous data about the baseline of your resource metric. Because of that keep in mind that there is a period of learning before these alerts are fully enabled. Let’s see the ARM template example:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "resourceID": {
            "type": "string",
            "metadata": {
                "description": "The ID of the resource"
            }
        },
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The ID of the action group"
            }
        },
        "resourceLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of the monitored resource."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "metricAlerts": "2018-03-01"
        }
    },
    "resources": [
        {
            "name": "Dynamic Metric Alert Sample Rule",
            "type": "Microsoft.Insights/metricAlerts",
            "apiVersion": "[variables( 'apiVersions' ).metricAlerts]",
            "location": "global",
            "properties": {
                "description": "Dynamic Metric Alert Sample description",
                "enabled": true,
                "severity": 1,
                "windowSize": "PT5M",
                "evaluationFrequency": "PT5M",
                "templateType": 13,
                "templateSpecificParameters": {
                    "direction": "Up",
                    "sensitivity": "Medium"
                },
                "scopes": [
                    "[parameters('resourceID')]"
                ],
                "criteria": {
                    "allOf": [
                        {
                            "metricName": "AverageResponseTime",
                            "metricNamespace": "Microsoft.Web/sites",
                            "operator": "GreaterThan",
                            "timeAggregation": "Average",
                            "name": "Metric1",
                            "alertSensitivity": "Medium",
                            "failingPeriods": {
                                "numberOfEvaluationPeriods": 4,
                                "minFailingPeriodsToAlert": 4
                            },
                            "ignoreDataBefore": "2019-09-03T21:00:00.000Z",
                            "dimensions": [
                                {
                                    "name": "Instance",
                                    "operator": "Include",
                                    "values": [
                                        "*"
                                    ]
                                }
                            ],
                            "monitorTemplateType": 13,
                            "criterionType": "DynamicThresholdCriterion"
                        }
                    ],
                    "odata.type": "Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria"
                },
                "actions": [
                    {
                        "actionGroupId": "[parameters('actionGroupResourceId')]",
                        "webhookProperties": {}
                    }
                ],
                "autoMitigate": true,
                "targetResourceType": "Microsoft.Web/sites",
                "targetResourceRegion": "[parameters('resourceLocation')]"
            }
        }
    ]
}
```

For properties that are the same between dynamic and static alerts I will not list them below.

-   templateType, monitorTemplateType and criterionType set that is dynamic alert
-   direction in templateSpecificParameters sets the logic for learning. Basically if operator value is GreaterThan the value here is Up, if it is LessThan it is Down and if it is GreaterOrLessThan is UpAndDown. Those are also the only available values for operator. As you can see they are different from static metric alerts.
-   sensitivity in templateSpecificParameters also sets the logic for learning. This value is Low, Medium and High. Same value is put inalert Sensitivity property.
-   minFailingPeriodsToAlert and numberOfEvaluationPeriods properties in failingPeriods represents number of violations to trigger the alert setting as it can be seen in the portal. minFailingPeriodsToAlert represents the number of violations and numberOfEvaluationPeriods represents the aggregation points. minFailingPeriodsToAlert number is tied to windowSize property. If windowSize is set to PT5M (5 minutes) you should set this number to at least 4. If you increase the windowSize you can decrease this value to lower. Possible values are 1-6. numberOfEvaluationPeriods is also tied windowSize property. In the portal you will see this property as minutes that you can choose. Here it is number. You multiple the number for windowSize to numberOfEvaluationPeriods to get the actual minutes. The value for this property should be also equal or greater than minFailingPeriodsToAlert. Possible values are 1-6.
-   You will also notice that for this alert type we need to set targetResourceRegion and that will be the region of the resource we monitor with dynamic alert.

We have covered these two alerts and now we can move to alerts for Application Insights Availability Tests. When you create availability test via the Portal you also have the option to check if you want to create alert based on the test. Of course this is all described [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-metric-create-templates#template-for-a-availability-test-along-with-availability-test-alert) including the creation of the availability test via ARM Template. I will not post a separate example but I want to note on a few properties:

-   scope – note that the scope needs to contain two resources – the application insights resource id and the availability test resource id
-   tags – you have some special tags that needs to be set. This to me is bad practice Microsoft to use tags for their internal purposes. I am not sure what will happen if you do not have these tags but it is better to set them than sorry. Hopefully with time they will get rid of linking resources with tags like these.
-   templateType and odata.type signal that this is availability test alert
-   In webTestId you need to put the resource id of the availability test
-   In componentId you need to put the resource id of the application insights
-   failedLocationCount – when you construct template for this this value depends on the number of locations that were added for the availability test Basically the logic can be described in the following table:

| Number of Availability test locations | Number of failed locations count |
| --- | --- |
| 1 | 1 |
| 2 | 1 |
| 3 | 1 |
| 4 | 2 |
| 5 | 3 |
| 6 | 3 |
| 7 | 3 |
| 8 | 4 |
| 9 | 4 |
| 10 | 5 |
| 11 | 5 |
| 12 | 6 |
| 13 | 6 |
| 14 | 7 |
| 15 | 7 |
| 16 | 8 |

While we are on the Application Insights topic I would like to mention that there is one alert type that is also specific for this service. That is Failure anomalies alert. This alert is automatically created with every Application Insights instance. If you want to manage its configuration with ARM template, that is possible and it is all described [here](https://docs.microsoft.com/bs-latn-ba/azure/azure-monitor/app/proactive-arm-config#failure-anomalies-v2-non-classic-alert-rule). I have not done much testing on this alert as it is not easy to make it fire so I do not know if it supports things like common alert schema. If you have more information feel free to share it in the comments.

I hope this was another interesting blog post on my Azure Monitor Alert Series.
