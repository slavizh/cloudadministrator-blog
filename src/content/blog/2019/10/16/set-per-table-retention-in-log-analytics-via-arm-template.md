---
title: "Set Per Table Retention in Log Analytics via ARM Template"
excerpt: "This will be a short blog post but I hope still interesting one as I will provide example how to set per table retention in Log Analytics. Several weeks ago the Azure Monitor team has [provided opt…"
description: "This will be a short blog post but I hope still interesting one as I will provide example how to set per table retention in Log Analytics. Several weeks ago..."
pubDate: 2019-10-16
updatedDate: 2019-10-17
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/10/16/set-per-table-retention-in-log-analytics-via-arm-template/"
tags: 
  - "ARM Templates"
  - "Azure"
  - "Azure Monitor"
  - "AzureRM"
  - "ARM"
  - "Log Analytics"
  - "Log Analytics"
---
This will be a short blog post but I hope still interesting one as I will provide example how to set per table retention in Log Analytics. Several weeks ago the Azure Monitor team has [provided option to set retention period per table](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/manage-cost-storage#change-the-data-retention-period) instead of just having retention period for the whole workspace.

**Update 17.10.2019**: If you set per table retention you will not be able to delete the workspace. You will get web request error 500 when you try that in the portal. To delete the workspace you will have to reset the value for every table with tool like ARM client. Example with Perf table below:

```text
ARMClient.exe put "/subscriptions/22391568-8971-4320-b4be-08beb4919e9a/resourcegroups/loganalytics/providers/microsoft.operationalinsights/workspaces/ws000001/tables/Perf?api-version=2015-03-20" "{'properties':{'retentionInDays':null}}"
```

**Update 17.10.2019**: Just a few hours later Azure Monitor team fixed the issue. That is what I call fast support. Kudos to Azure Monitor team for being such proactive.

That is cool feature as sometimes you need certain data for longer period and other data for shorter one. This setting is not available in the UI but can easily be configured with ARM Template. Below you will see such example:

```json
{
    "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceName": {
            "type": "string",
            "metadata": {
                "description": "The name of the log analytics workspace"
            }
        },
        "tableName": {
            "type": "string",
            "metadata": {
                "description": "The name of the table in log analytics to set custom retention. Tables names are case sensitive."
            }
        },
        "tableRetention": {
            "type": "int",
            "metadata": {
                "description": "The custom retention period for the table in days."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "tables": "2017-04-26-preview"
        }
    },
    "resources": [
        {
            "name": "[concat(parameters('logAnalyticsWorkspaceName'), '/', parameters('tableName'))]",
            "type": "Microsoft.OperationalInsights/workspaces/tables",
            "apiVersion": "[variables('apiVersions').tables]",
            "properties": {
                "retentionInDays": "[parameters('tableRetention')]"
            }
        }
    ],
    "outputs": {}
}
```

You can also find the [example here](https://github.com/slavizh/ARMTemplates/blob/master/log-analytics/retention-per-table.json). You apply the template at the resource group where the Log Analytics workspace is located. With the template deployment you will have to provide workspace name, table name and the retention value. Table name you can grab by going to the Logs blade and on the left pane under Schema you can see the different tables available from different solutions. The retention thresholds are still the same from 30 to 730 days.

I hope this was useful example for you.
