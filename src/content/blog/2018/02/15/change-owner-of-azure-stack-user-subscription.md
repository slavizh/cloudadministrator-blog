---
title: "Change Owner of Azure Stack User Subscription"
excerpt: "Azure Stack is extension of Azure and as such I am dealing with it as well. You may end up in a situation where you’ve created User Subscriptions in Azure Stack and after some time you want t…"
description: "Azure Stack is extension of Azure and as such I am dealing with it as well. You may end up in a situation where you’ve created User Subscriptions in Azure St..."
pubDate: 2018-02-15
updatedDate: 2018-02-15
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/02/15/change-owner-of-azure-stack-user-subscription/"
tags: 
  - "Azure"
  - "Azure Stack"
  - "Change"
  - "Operator"
  - "Owner"
  - "PowerShell"
  - "Script"
  - "Subscription"
---
Azure Stack is extension of Azure and as such I am dealing with it as well. You may end up in a situation where you’ve created User Subscriptions in Azure Stack and after some time you want to delete them. Before deleting them you will need first to delete all the resources inside those subscriptions but the accounts of the owners of these subscriptions are no longer available or the do not want to cooperate. In such cases you can actually change the owners by using PowerShell. For example you can assign your Azure Stack Operator account as owner, login to the subscriptions with it via the User Portal and delete the resources before deleting the subscriptions.

To do this operation you will need the following things first:

-   [Azure Stack Tools Installed and Setup](https://github.com/Azure/AzureStack-Tools)
-   [Connect to Default Provider Subscription as Operator](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-powershell-configure-admin)

After that you can execute simple commands below to find the right subscription and set the owner to it:

```powershell
# List all user subscriptions and find the one that you need
Get-AzsUserSubscription

# Get the subscription that you want to change the owner
$subscriptionToUpdate = Get-AzsUserSubscription -SubscriptionId "919e24f6-25b3-4d5f-bd3e-3ad36d5e619c"

# Update the owner value of the subscription
$subscriptionToUpdate.Owner = "stan@contoso.com"

# Apply the change
Set-AzsUserSubscription -Subscription $subscriptionToUpdate
```

After that login to the User portal with the new owner and delete the resources.

Hope this helps
