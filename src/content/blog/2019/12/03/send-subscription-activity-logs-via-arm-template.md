---
title: "Send Subscription Activity Logs via ARM Template"
excerpt: "At Ignite the Azure Monitor team has announced that you can now send subscription activity logs to Log Analytics. Wait? What? Isn’t that already available? And the answer yes it was available…"
description: "At Ignite the Azure Monitor team has announced that you can now send subscription activity logs to Log Analytics. Wait? What? Isn’t that already available? A..."
pubDate: 2019-12-03
updatedDate: 2019-12-03
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/12/03/send-subscription-activity-logs-via-arm-template/"
tags: 
  - "Activity Logs"
  - "ARM Templates"
  - "Azure"
  - "Azure Monitor"
  - "Azure Sentinel"
  - "ARM"
  - "Governance"
  - "Log Analytics"
  - "Log Analytics"
---
At Ignite the Azure Monitor team has announced that you can now send subscription activity logs to Log Analytics. Wait? What? Isn’t that already available? And the answer yes it was available before but if we look closer you will see that the previous implementation was not very native to Azure. With the new implementation besides making the API better there are also other improvements like faster ingestion, ability to send different categories, etc.

Let’s have a look in ARM template how the previous implementation looked:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceName": {
            "type": "string",
            "metadata": {
                "description": "The name of the log analytics workspace."
            }
        },
        "subscriptionIds": {
            "type": "array",
            "metadata": {
                "description": "IDs of Azure Subscriptions in array"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "dataSources": "2015-11-01-preview"
        }
    },
    "resources": [
        {
            "name": "[concat(parameters('logAnalyticsWorkspaceName'), '/', replace(parameters('subscriptionIds')[copyIndex()], '-', ''))]",
            "type": "Microsoft.OperationalInsights/workspaces/dataSources",
            "apiVersion": "[variables('apiVersions').dataSources]",
            "copy": {
                "name": "activityLogsCopy",
                "count": "[length(parameters('subscriptionIds'))]"
            },
            "kind": "AzureActivityLog",
            "properties": {
                "linkedResourceId": "[concat('/subscriptions/', parameters('subscriptionIds')[copyIndex()], '/providers/Microsoft.Insights/eventTypes/management')]"
            }
        }
    ]
}
```

As you will see above this is resource group level deployment and you are deploying child resource to the Log Analytics workspace.

With the new implementation the API has the following improvements:

-   you are setting diagnostic settings on Azure Subscription just like any other resource in Azure
-   the deployment is at subscription level
-   you are just referencing the Log Analytics workspace
-   you can choose which Azure Activity log categories to send

At the end the ARM template looks like this:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceId": {
            "type": "string",
            "metadata": {
                "description": "the resource id of the log analytics workspace"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "diagnosticSettings": "2017-05-01-preview"
        }
    },
    "resources": [
        {
            "name": "subscriptionLogsToLogAnalytics",
            "type": "Microsoft.Insights/diagnosticSettings",
            "apiVersion": "[variables('apiVersions').diagnosticSettings]",
            "location": "Global",
            "properties": {
                "workspaceId": "[parameters('logAnalyticsWorkspaceId')]",
                "logs": [
                    {
                        "category": "Administrative",
                        "enabled": true
                    },
                    {
                        "category": "Security",
                        "enabled": true
                    },
                    {
                        "category": "ServiceHealth",
                        "enabled": true
                    },
                    {
                        "category": "Alert",
                        "enabled": true
                    },
                    {
                        "category": "Recommendation",
                        "enabled": true
                    },
                    {
                        "category": "Policy",
                        "enabled": true
                    },
                    {
                        "category": "Autoscale",
                        "enabled": true
                    },
                    {
                        "category": "ResourceHealth",
                        "enabled": true
                    }
                ]
            }
        }
    ]
}
```

I hope you will find this tip useful.
