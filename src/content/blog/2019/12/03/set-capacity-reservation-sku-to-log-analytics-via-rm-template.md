---
title: "Set Capacity Reservation SKU to Log Analytics via ARM Template"
excerpt: "Right before Ignite Microsoft has released a new SKU for Log Analytics. With that SKU the model of usage does not change but it is rather discount you get for committing certain usage in your Log A…"
description: "Right before Ignite Microsoft has released a new SKU for Log Analytics. With that SKU the model of usage does not change but it is rather discount you get fo..."
pubDate: 2019-12-03
updatedDate: 2019-12-09
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/12/03/set-capacity-reservation-sku-to-log-analytics-via-rm-template/"
tags: 
  - "Azure"
  - "Azure Monitor"
  - "Azure Sentinel"
  - "Capacity Reservation"
  - "Log Analytics"
  - "ARM"
  - "Governance"
  - "SKU"
---
Right before Ignite Microsoft has released a new SKU for Log Analytics. With that SKU the model of usage does not change but it is rather discount you get for committing certain usage in your Log Analytics workspace. To me it is similar to reserved instances but on a monthly bases. This SKU is also related to Azure Sentinel as it is the recommended SKU when you have onbarded Log Analytics workspace to Azure Sentinel.

As this is property on the Log Analytics workspace resource setting it via ARM Template is fairly easy. The template below shows you how to set it:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceName": {
            "type": "string",
            "metadata": {
                "description": "The name of the log analytics workspace"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "workspaces": "2017-03-15-preview"
        }
    },
    "resources": [
        {
            "name": "[parameters('logAnalyticsWorkspaceName')]",
            "type": "Microsoft.OperationalInsights/workspaces",
            "apiVersion": "[variables('apiVersions').workspaces]",
            "location": "[resourceGroup().location]",
            "properties": {
                "sku": {
                    "name": "CapacityReservation",
                    "capacityReservationLevel": 100
                },
                "retentionInDays": 90,
                "features": {
                    "legacy": 0,
                    "searchVersion": 1,
                    "enableLogAccessUsingOnlyResourcePermissions": true
                }
            }
        }
    ]
}
```

In the example you should take a note on a few things:

-   The name of the SKU is CapacityReservation
-   there is a new property that is used when the SKU is CapacityReservation. That property is capacityReservationLevel and sets the capacity for that SKU in GBs. Possible values are 100, 200, 300, 400, 500 or any value above 500 till 50000. For higher value you must contact Microsoft support.
-   If you have onboarded the workspace to Sentinel you might also want to set the retention to 90 days.
-   if you want to switch back to previous sku just enter name PerGB2018 and set capacityReservationLevel to null. Remember to adjust retention accordingly as well. Think about changing your SKU to capacity reservation before you do it as there are charges that will be applied. Also check the [documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/manage-cost-storage#changing-pricing-tier).

I hope this was useful blog post for you.
