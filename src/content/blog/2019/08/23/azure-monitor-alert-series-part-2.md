---
title: "Azure Monitor Alert Series – Part 2"
excerpt: "In this blog post we will have a look at Administrative Log Activity alerts. Keep in mind that because many of the other alerts like Security, Service Health, Advisor, Policy, Autoscale and Resourc…"
description: "In this blog post we will have a look at Administrative Log Activity alerts. Keep in mind that because many of the other alerts like Security, Service Health..."
pubDate: 2019-08-23
updatedDate: 2020-01-19
heroImage: "/media/wordpress/2019/08/acitity-log-alert-scoped-1.png"
sourceUrl: "https://cloudadministrator.net/2019/08/23/azure-monitor-alert-series-part-2/"
tags: 
  - "Activity Logs"
  - "Alert"
  - "Azure"
  - "Azure Management"
  - "Azure Monitor"
  - "ARM"
  - "Azure Monitor Alert Series"
---
In this blog post we will have a look at Administrative Log Activity alerts. Keep in mind that because many of the other alerts like Security, Service Health, Advisor, Policy, Autoscale and Resource health are also based on activity logs, the things written in this blog post will also apply for them as well.

Let’s first start by listing some important information about these type of alerts:

-   Alerts are fired by instance automatically – This means that for every Activity log record you get one alert instance
-   To designate this alert Administrative Log Activity alert you need to scope the alert to Administrative category
-   You cannot assign severity for these alerts. The severity is always translated to Sev4 when it is Administrative category.
-   Support common alert schema
-   Alert rules are created per subscription. If you want to cover multiple subscriptions you will have to create the same alert in each subscription

Alerts can be created via the Azure Portal or via ARM templates. PowerShell and CLI are also possible options. I prefer ARM templates as they are most universal and allow me to customize the alert rule way more than what is possible in the portal.

In case you opt to creating alerts via the portal you have two options:

-   The first option is to go to Azure Monitor -> Alerts blade (this blade is also present on each resource) -> New Alert rule. First you will select the resource and than you will select Condition. In condition blade if you select signal Activity log that will show you only some pre-defined conditions only for Activity log alert type. In Monitor Service you can select Administrative to scope only to that sub type. Keep in mind that once you select pre-defined condition there isn’t much you can select more. From the 3 options like Event level, Status and Event Initiated by it is always good idea to scope the Status at least. Activity records are generated when operation is started, accepted, started and Succeeded or Failed at the management plane.
-   Second option is to select a record in Activity Log blade. Once selected you have option to create new alert. That option is not very good as in most cases I do not like how the condition is build. On top of that keep in mind that in all cases the action will always be scoped to the user who has done that activity.

![](/media/wordpress/2019/08/acitity-log-alert-scoped-1.png)

*Activity Log Alert Scoped*

Now let’s proceed with the interesting part of looking at some ARM template code. Let’s say I want to alert upon Resource Group creation. To achieve that I can deploy the template bellow and I will explain the details of it.

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "actionGroupResourceId": {
            "type": "string"
        }
    },
    "variables": {
        "apiVersions": {
            "activityLogAlerts": "2017-04-01"
        }
    },
    "resources": [
        {
            "name": "Resource Group was created",
            "type": "Microsoft.Insights/activityLogAlerts",
            "apiVersion": "[variables( 'apiVersions' ).activityLogAlerts]",
            "location": "Global",
            "properties": {
                "enabled": true,
                "description": "Administrative log alert sample.",
                "scopes": [
                    "[subscription().id]"
                ],
                "condition": {
                    "allOf": [
                        {
                            "field": "category",
                            "equals": "Administrative"
                        },
                        {
                            "field": "operationName",
                            "equals": "Microsoft.Resources/subscriptions/resourceGroups/write"
                        },
                        {
                            "field": "status",
                            "equals": "Succeeded"
                        },
                        {
                            "field": "properties.statusCode",
                            "equals": "Created"
                        }
                    ]
                },
                "actions": {
                    "actionGroups": [
                        {
                            "actionGroupId": "[parameters('actionGroupResourceId')]"
                        }
                    ]
                }
            }
        }
    ]
}
```

A few of the more obvious details are:

-   The name of the resource is the name of the alert
-   Activity log Alerts are global resource
-   Alert is scoped to the current subscription. Although this is array property you can add only one entry and this is the current subscription
-   Alert is enabled
-   Alert is attached to one action group

Now let’s start to explain the condition which is the most important part of the alert. The condition has one rule condition which states all of the bellow comparison must be true in order alert to be fired. The conditions are the following:

-   category must be Administrative – After all we are creating Administrative Log Acitvity alert rather Policy or something else.
-   The name of the operation is ‘Microsoft.Resources/subscriptions/resourceGroups/write’ – We want to catch all alerts that do some write operation on resourceGroups resource. As this is broader scope we need to apply additional conditions
-   status must be Succeeded – we want to get alerted only if this operation has succeeded. We do not want to get alerted if someone has started the operation or even failed to execute it (probably due to permissions)
-   statusCode must be Created – With write operation you can do other things on the resource group like updating its tags. We do not want to get alerted on that we want to get alerted only when the resource group is created for first time.

Now what you got the explanation of the condition where did I get all these values from? The answer is simple all this comes from activity log. I have created a resource group and looked at what data is there as you can see below.

![](/media/wordpress/2019/08/new-resource-group-log.png)

*New Resource Group log*

No matter that the activity log has display name of Update resource group it is actually resource group creation. You can see all values from our scope. Only category is missing but that is also in the log just not displayed in the picture.

Keep in mind that [Microsoft states that there should be only one ‘allOf’ condition](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-activity-log#overview) you can actually use anyOf as well inside allOf. I will demo that in later posts.

I hope this was educational for you.
