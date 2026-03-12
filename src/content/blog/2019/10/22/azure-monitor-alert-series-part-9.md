---
title: "Azure Monitor Alert Series – Part 9"
excerpt: "We continue our journey in Azure Monitor Alerts. This time we will cover alert type that is not part of Azure Monitor specifically but my opinion is that every Azure alert should integrate somehow …"
description: "We continue our journey in Azure Monitor Alerts. This time we will cover alert type that is not part of Azure Monitor specifically but my opinion is that eve..."
pubDate: 2019-10-22
updatedDate: 2020-01-19
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/10/22/azure-monitor-alert-series-part-9/"
tags: 
  - "ARM Templates"
  - "Azure"
  - "Azure Cost Management"
  - "Azure Governance"
  - "Azure Monitor"
  - "ARM"
  - "Azure Resource Manager"
  - "Cost Management"
  - "Governance"
  - "Azure Monitor Alert Series"
---
We continue our journey in Azure Monitor Alerts. This time we will cover alert type that is not part of Azure Monitor specifically but my opinion is that every Azure alert should integrate somehow with Azure Monitor so we have one consistent alert experience. The alert type that we will cover today somehow achieve this. This alert type is cost management alert or budget alert.

As I have mentioned before this alert is part of Azure Cost Management service. Although it is not part of Azure Monitor it integrates with action groups that are part of Azure Monitor. This integration is partial though. For example you can set e-mail or logic app for trigger but the latter does not support common alert schema. Instead it supports [its own schema that is purely documented](https://docs.microsoft.com/en-us/azure/billing/billing-cost-management-budget-scenario#create-an-azure-logic-app-for-orchestration). Thankfully if you want to automate the creation of budget alerts it is possible trough ARM templates. Currently the budget alerts with ARM templates are created per subscription (no management group support) but the budget alert can be scoped to one or more resource group or to resources of specific tags. Of course the scoping can be done to other things like resource location, meter, etc. All options that you see in the Portal are also available in ARM templates. Let’s have a look at the first example I have:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "resourceGroupNames": {
            "type": "array",
            "defaultValue": [
                "test"
            ],
            "metadata": {
                "description": "Array of one or more resource groups."
            }
        },
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The resource Id of action group."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "budgets": "2019-10-01"
        }
    },
    "resources": [
        {
            "name": "Budget1",
            "type": "Microsoft.Consumption/budgets",
            "apiVersion": "[variables('apiVersions').budgets]",
            "properties": {
                "category": "Cost",
                "amount": 79,
                "timeGrain": "BillingMonth",
                "timePeriod": {
                    "startDate": "2019-10-01",
                    "endDate": "2029-10-01"
                },
                "notifications": {
                    "Actual_GreaterThan_75_Percent": {
                        "enabled": true,
                        "operator": "GreaterThan",
                        "threshold": 75,
                        "contactEmails": [
                        ],
                        "contactRoles": [
                        ],
                        "contactGroups": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "thresholdType": "Actual"
                    },
                    "Actual_GreaterThan_95_Percent": {
                        "enabled": true,
                        "operator": "GreaterThan",
                        "threshold": 95,
                        "contactEmails": [
                        ],
                        "contactRoles": [
                        ],
                        "contactGroups": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "thresholdType": "Actual"
                    }
                },
                "filter": {
                    "dimensions": {
                        "name": "ResourceGroupName",
                        "operator": "In",
                        "values": "[parameters('resourceGroupNames')]"
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

Some of the main points in the example are:

-   This is subscription level resource so you need to deploy it at subscription level
-   The name of my budget alert is called Budget1
-   The category is set to Cost. This could be Cost or Usage. Currently I have not see examples on how to create usage alert.
-   amount represents the spending threshold for my budget alert. This will be in the currency that the subscription uses for billing.
-   timegrain is set to billing month monthly recurrence. It can also be Monthly, Quarterly, Annually, BillingQuarter and BillingAnnual.
-   We have time period for the alert. endDate is not required
-   We have 2 notifications. You an add up to 5. At least one needs to be defined. You can choose the name of the notification however you want. I am using the same pattern that the portal uses when you create it from there. threshold is set as percentage. In conctact groups you can add action groups. You can also add e-mail addresses directly in contactEmails (up to 5). Currently I have not seen contactRoles being used. I would assume you can add built-in or custom Azure RBAC role and whoever is assigned that role will also get e-notificationtons. thresholdType is currently Actual as far as I know. May be in the future we will see option to set threshold notifications on Forecast for example.
-   if filter object is empty this means the budget applies for the whole subscription. In our case we have added one dimension to filter on a resource group with specific name.

Now let’s look at another example where the filtering is for specific tag:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "actionGroupResourceId": {
            "type": "string",
            "metadata": {
                "description": "The resource Id of action group."
            }
        },
        "tagName": {
            "type": "string",
            "defaultValue": "createdby",
            "metadata": {
                "description": "the name of the tag"
            }
        },
        "tagValue": {
            "type": "string",
            "defaultValue": "devtestlabs",
            "metadata": {
                "description": "the value of the tag"
            }
        }
    },
    "variables": {
        "apiVersions": {
            "budgets": "2019-10-01"
        }
    },
    "resources": [
        {
            "name": "Budget1",
            "type": "Microsoft.Consumption/budgets",
            "apiVersion": "[variables('apiVersions').budgets]",
            "properties": {
                "category": "Cost",
                "amount": 79,
                "timeGrain": "BillingMonth",
                "timePeriod": {
                    "startDate": "2019-10-01",
                    "endDate": "2029-10-01"
                },
                "notifications": {
                    "Actual_GreaterThan_75_Percent": {
                        "enabled": true,
                        "operator": "GreaterThan",
                        "threshold": 75,
                        "contactEmails": [
                        ],
                        "contactRoles": [
                        ],
                        "contactGroups": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "thresholdType": "Actual"
                    },
                    "Actual_GreaterThan_95_Percent": {
                        "enabled": true,
                        "operator": "GreaterThan",
                        "threshold": 95,
                        "contactEmails": [
                        ],
                        "contactRoles": [
                        ],
                        "contactGroups": [
                            "[parameters('actionGroupResourceId')]"
                        ],
                        "thresholdType": "Actual"
                    }
                },
                "filter": {
                    "tags": {
                        "name": "[parameters('tagName')]",
                        "operator": "In",
                        "values": [
                            "[parameters('tagValue')]"
                        ]
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

As we can see from this example most of the things are similar. The main difference is in the filter where we filter by specific tag and value. You can find the examples also [here](https://github.com/slavizh/ARMTemplates/tree/master/cost-managemnet). If you are interested in the budgets API you can find it [documented partially here](https://docs.microsoft.com/en-us/azure/templates/microsoft.consumption/2019-01-01/budgets).

My recommendations for setting budget alerts are:

-   Define tag strategy for your Azure resources
-   Put tags on all your resources
-   Enforce tags via Azure Policy so you do not end up with untagged resources
-   Use tag filters on your budget alerts to track specific costs.
-   Use subscription scope or resource group scope to track overall costs

Overall budget alerts are good beginning for tracking your cost. What I think is missing is also ability to track abnormal behaviors like cost being increased by 10 % when you compare the day before to yesterday. This is very real world scenario. I also would like to see full Azure Monitor action groups integration where common alert schema is available for these alerts as well.

I hope this was useful blog post for you!
