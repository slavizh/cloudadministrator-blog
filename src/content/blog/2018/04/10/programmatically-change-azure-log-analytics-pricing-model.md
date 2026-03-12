---
title: "Programmatically Change Azure Log Analytics Pricing Model"
excerpt: "Microsoft recently introduced a new model for [purchasing Azure Log Analytics]( To use this new model you will basically have to enable it on per subscription bases. In short you can either continu…"
description: "Microsoft recently introduced a new model for [purchasing Azure Log Analytics]( To use this new model you will basically have to enable it on per subscriptio..."
pubDate: 2018-04-10
updatedDate: 2018-04-11
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/04/10/programmatically-change-azure-log-analytics-pricing-model/"
tags: 
  - "Azure"
  - "Azure Log Analytics"
  - "Azure Monitor"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Automation"
  - "Automation & Control"
  - "Azure Automation"
  - "Azure Operational Insights Preview"
  - "Azure Resource Manager"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Pricing"
---
Microsoft recently introduced a new model for [purchasing Azure Log Analytics](https://azure.microsoft.com/en-us/blog/introducing-a-new-way-to-purchase-azure-monitoring-services/). To use this new model you will basically have to enable it on per subscription bases. In short you can either continue to use the old models or flip a switch on your subscription to use the new model. You cannot use both models for different workspaces in your subscription and you cannot move between the old models and the new ones without flipping that switch. Of course flipping that switch is easy as going into the Azure Portal -> Azure Monitor -> Usage and estimated costs blade but what about if you want to do this programmatically? Apparently there is a way to do it that way and in this blog post I will show you how.

In order to be able to do this programmatically we will use PowerShell and the AzureRM PS modules. The first thing to do is to get what is the current state of your Azure subscription. We can get it by executing Azure resource action listmigrationdate on the Microsoft.Inisghts (Azure Monitor) resource provider.

```powershell
Invoke-AzureRmResourceAction `
        -ResourceId "/subscriptions/3c1d68b5-4064-4622-92e4-e0378145922c/providers/microsoft.insights" `
        -ApiVersion "2017-10-01" `
        -Action listmigrationdate `
        -Force
```

By executing the command above you will get similar output. Remember to change the subscription ID to yours.

```powershell
isGrandFatherableSubscription optedInDate
----------------------------- -----------
                         True
```

The output shows two things:

-   If your subscription is allowed to use the old models. If the value for isGrandFatherableSubscription is False that basically means that you can only use the new pricing model. This is because your subscription was created after the announced changes. If the value is True your subscription was created before the announcement of the new model which means you can opt-in if you want.
-   If you have opted-in for using the new model. If the value of optedInDate is populated with a date you basically have enabled the new model on your subscription. If there is no value for optedInDate you are still using the old models.

Now that we know how to get the state how we can actually switch to the new model with code? This is easy as executing the command below:

```powershell
Invoke-AzureRmResourceAction `
        -ResourceId "/subscriptions/3c1d68b5-4064-4622-92e4-e0378145922c/providers/microsoft.insights" `
        -ApiVersion "2017-10-01" `
        -Action migratetonewpricingmodel `
        -Force
```

As you can see we are again invoking an action but this time is migratetonewpricingmodel. After executing that action optedInDate value will be populated with the date when the migration was done. In case you want to go back to the old models there is action for that as well:

```powershell
Invoke-AzureRmResourceAction `
        -ResourceId "/subscriptions/3c1d68b5-4064-4622-92e4-e0378145922c/providers/microsoft.insights" `
        -ApiVersion "2017-10-01" `
        -Action rollbacktolegacypricingmodel `
        -Force
```

Remember that you can only execute the above two actions if the value for isGrandFatherableSubscription is True.

**Note**: Customers who purchased Microsoft Operations Management Suite E1 and E2 are eligible for per-node data ingestion entitlements for [Log Analytics](https://www.microsoft.com/en-us/cloud-platform/operations-management-suite) and [Application Insights](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-pricing#the-price-plans). To receive these entitlements for Log Analytics workspaces or Application Insights resources in a given subscription, that subscription’s pricing model must remain in the pre-April 2018 pricing model where the Log Analytics “Per-node (OMS)” pricing tier and the Application Insights “Enterprise” pricing plan are available. Depending on the number of nodes of the suite that your organization purchased, moving some subscriptions to the new pricing model may still be advantageous, but this requires careful consideration. [Source here](https://docs.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-usage-and-estimated-costs#new-pricing-model-and-operations-management-suite-subscription-entitlements).

I hope this was helpful.
