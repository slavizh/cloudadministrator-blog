---
title: "Azure Monitor Alert Series – Part 11"
excerpt: "So far we have covered all the alert types that are available not only in Azure Monitor but other services like Sentinel and Cost Management as well. That does not end this series though as we have…"
description: "So far we have covered all the alert types that are available not only in Azure Monitor but other services like Sentinel and Cost Management as well. That do..."
pubDate: 2019-11-25
updatedDate: 2020-01-19
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/11/25/azure-monitor-alert-series-part-11/"
tags: 
  - "Action Groups"
  - "Action Rules"
  - "Azure"
  - "Azure Alerts"
  - "Azure Management"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "ARM"
  - "Governance"
  - "Log Analytics"
  - "Log Analytics"
---
So far we have covered all the alert types that are available not only in Azure Monitor but other services like Sentinel and Cost Management as well. That does not end this series though as we haven’t other important parts of the alerting like integration. In this blog particularly we will cover Action Groups and Action Rules. These are two very important features in order to achieve complete monitoring.

I will not go into describing these features in detail as you can check the [official documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/alerts-action-rules) but I want to give brief explanation:

-   Action Groups – Allows you to integrate alerts with other systems like e-mails, phone calls, SMS, Logic Apps, Functions, Automation runbook, etc. Once alert rule is configured to particular action group and alert instance is fired you can start one or more of the action groups integrations.
-   Action Rules – This feature is still in preview at the time of writing this blog post. Action rules have two mode that each addresses different scenario. First mode is to configure alert rule that will catch alert instances from alert rules based on criteria and execute actions in action groups. This allows for more flexible approach where you do not have to attach action groups to alerts but instead you are defining conditions for the alert rules that if met will call one or more action groups. Decoupling the defining of action groups in the alerts turns this configuration from static to a dynamic one. The second more is the scenario about configuring suppression. Such action rules allows you to not stop particular integration with action group for specified period of time. The suppression happens on per alert instance level. This makes it flexible as for one alert that fires two different alert instances you can suppress only one of them by specifying criteria. For example by specifying the name of the resource in the criteria for which you want the suppression to apply.

Both of these resources you can create via Azure Portal but I want to provide you with some small examples of creating them via ARM template:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "actionGroupName": {
            "type": "string",
            "metadata": {
                "description": "The name of the action group."
            }
        },
        "actionGroupShortName": {
            "type": "string",
            "metadata": {
                "description": "The short name of the action group"
            }
        },
        "email": {
            "type": "string",
            "metadata": {
                "description": "email to receive alerts."
            }
        },
        "logicAppSubscriptionId": {
            "type": "string",
            "defaultValue": "[subscription().subscriptionId]",
            "metadata": {
                "description": "The subscription id of the logic app."
            }
        },
        "logicAppResourceGroupName": {
            "type": "string",
            "metadata": {
                "description": "The resource group name of the logic app."
            }
        },
        "logicAppName": {
            "type": "string",
            "metadata": {
                "description": "The name of the logic app."
            }
        },
        "actionRuleName1": {
            "type": "string",
            "metadata": {
                "description": "The name of the first action rule."
            }
        },
        "actionRuleName2": {
            "type": "string",
            "metadata": {
                "description": "The name of the second action rule."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "actionGroups": "2019-06-01",
            "workflows": "2017-07-01",
            "actionRules": "2019-05-05-preview"
        }
    },
    "resources": [
        {
            "name": "[parameters('actionGroupName')]",
            "type": "Microsoft.Insights/actionGroups",
            "apiVersion": "[variables( 'apiVersions' ).actionGroups]",
            "location": "Global",
            "tags": {},
            "properties": {
                "groupShortName": "[parameters('actionGroupShortName')]",
                "enabled": true,
                "emailReceivers": [
                    {
                        "name": "email1",
                        "emailAddress": "[parameters('email')]",
                        "useCommonAlertSchema": true
                    }
                ],
                "webhookReceivers": [],
                "smsReceivers": [],
                "itsmReceivers": [],
                "azureAppPushReceivers": [],
                "automationRunbookReceivers": [],
                "voiceReceivers": [],
                "logicAppReceivers": [
                    {
                        "name": "logicApp1",
                        "resourceId": "[resourceId(parameters('logicAppSubscriptionId'), parameters('logicAppResourceGroupName'), 'Microsoft.Logic/workflows', parameters('logicAppName'))]",
                        "callbackUrl": "[listCallbackUrl(resourceId(parameters('logicAppSubscriptionId'), parameters('logicAppResourceGroupName'), 'Microsoft.Logic/workflows/triggers', parameters('logicAppName'), 'manual'), variables('apiVersions').workflows ).value]",
                        "useCommonAlertSchema": true
                    }
                ],
                "azureFunctionReceivers": [],
                "armRoleReceivers": []
            }
        },
        {
            "name": "[parameters('actionRuleName1')]",
            "type": "Microsoft.AlertsManagement/actionRules",
            "apiVersion": "[variables('apiVersions').actionRules]",
            "location": "global",
            "dependsOn": [
                "[resourceId('Microsoft.Insights/actionGroups', parameters('actionGroupName'))]"
            ],
            "properties": {
                "status": "Enabled",
                "type": "ActionGroup",
                "description": "Catches all alerts and fires action group",
                //"scope": {
                //    "scopeType": "ResourceGroup", // Value could be also Resource
                //    "values": [
                //        "/subscriptions/607f23dd-f51d-493f-97eb-d4e77607df39/resourceGroups/ASR"
                //    ]
                //},
                "actionGroupId": "[resourceId('Microsoft.Insights/actionGroups', parameters('actionGroupName'))]"
            }
        },
        {
            "name": "[parameters('actionRuleName2')]",
            "type": "Microsoft.AlertsManagement/actionRules",
            "apiVersion": "[variables('apiVersions').actionRules]",
            "location": "global",
            "properties": {
                "status": "Enabled",
                "type": "Suppression",
                "description": "Exception for DB001",
                "conditions": {
                    "monitorService": {
                        "operator": "Equals",
                        "values": [
                            "Log Analytics"
                        ]
                    },
                    "alertContext": {
                        "operator": "Contains",
                        "values": [
                            "DB001"
                        ]
                    }
                },
                "suppressionConfig": {
                    "recurrenceType": "Weekly",
                    "schedule": {
                        "startDate": "11/25/2019",
                        "endDate": "08/26/2020",
                        "startTime": "05:00:00", // In UTC
                        "endTime": "14:00:00", // In UTC
                        "recurrenceValues": [
                            0,
                            6
                        ]
                    }
                }
            }
        }
    ]
}
```

The example template above deploys 3 resources:

-   An action group
    -   that has one e-mail as receiver
    -   one logic app as receiver
    -   both receivers are configured to use Common alert schema
-   Action rule
    -   scoped to subscription of the deployment
    -   all alert instances no matter how they are defined or their alert information will trigger the action group
-   Action rule
    -   scoped to subscription of the deployment
    -   Configured with condition that matches
        -   Log Analytics alerts
        -   the alert payload must contain the string DB001 which is Azure SQL database that I do not want to get notifications
    -   The suppression will be active weekly
        -   Every Saturday and Sunday
        -   from 5 to 14 UTC time

It is important to note that there are other condition types that you can add and the above example only illustrates certain configuration.

Some of the most important things to note in these APIs and configurations are:

-   All resources are global
-   You can set states to these resources – Enable or Disable
-   In the portal when you choose Logic APP you just provide the resource but on API level you also provide the webhook URL for the Logic App. We use ARM functions to get that dynamically based on the provided information. In general all other integration like webhooks, automation runbooks and Azure functions use a common unified way where data is passed via webhook
-   When scope is not defined on action rules resource the scope automatically becomes the current subscription. You can also put scope to specific resource group or resource if that is needed.
-   The time values for a schedule in action rule that needs to be provided are in a little bit strange format as you provide date and time in different properties
-   The date time values are set in UTC so currently there is no time zone support
-   reoccurring values will be different depending reoccurring type. In this case because we have weekly reoccurrance 0 and 6 are basically Sunday and Saturday.

As Action rules is still in preview I would like to see some improvements at API level and functionality. The things that I think will be useful are:

-   For schedules in action groups we need time zone support so we do not have to re-configure these rules on daylight savings time. Unfortunately this is not the first time that I see a service that has some kind of schedule is lacking time zone support. Such kind of functionality is critical even in preview phase.
-   More aligned with other Azure services for defining dates. In most services ISO8601 format is used
-   I would like to see suppression based on tags of resources. For example you define filters for tags and values and the end result is resources that match or do not match those tags. Those resources are than compared to the alert instance resource id or/and payload context if \_ResourceId column exists in that payload context. This is very similar approach to how Azure update deployments work. The information about the tags from the resources are is taken by querying Azure Resource Graph and than results will be compared similarly to how it is done today in action rules. The condition criteria to get resources with specific tags could be executed every 5 or 10 minutes to avoid querying ARG too often.
-   Ability to scope the action rules on higher than subscription level. For example at tenant level.

I hope you will find this post useful and I think we have one more part of these series until we put an end to them.
