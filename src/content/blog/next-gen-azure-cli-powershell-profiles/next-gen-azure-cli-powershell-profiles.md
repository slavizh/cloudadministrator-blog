---
title: "Next Gen Azure CLI and Azure PowerShell: Switching Profiles"
excerpt: "Learn how to use profiles in Next Gen Azure CLI and Azure PowerShell to switch between tenants and subscriptions, target commands, and share sign-in."
description: "Explore profiles in Next Gen Azure CLI and Azure PowerShell: name tenant and subscription contexts, switch targets, and share sign-in between tools."
pubDate: 2026-11-18
heroImage: "/media/next-gen-azure-cli-and-azure-powershell-profiles/profiles-hero.png"
tags:
  - "Azure"
  - "Azure PowerShell"
  - "PowerShell"
  - "Azure CLI"
  - "Azure CLI Profiles"
  - "Azure Profiles"
  - "Azure Subscriptions"
  - "Azure Tenants"
---

Working across Azure often means working across **multiple tenants as well as multiple subscriptions**. That could be separate customer tenants, personal and work accounts, or development and production subscriptions. Remembering identifiers is not particularly convenient, and checking which context a command will use is important.

The **Next Gen Azure CLI and Azure PowerShell** preview introduces a profile-based sign-in workflow. The project is available in the [Azure/azclips repository](https://github.com/Azure/azclips). A profile saves the tenant, subscription, cloud, and sign-in information under a name I choose. Once authenticated, I can switch between those saved contexts without signing in again while the credentials remain valid.

The idea behind this preview is to **bridge the gap between Azure CLI and Azure PowerShell**, making them more similar where applicable through consistent capabilities, parameters, and sign-in behavior, while retaining the conventions of each shell.

Azure PowerShell already supports [named contexts and context persistence](https://learn.microsoft.com/en-us/powershell/azure/context-persistence), so subscription switching itself is not new. What I want to highlight here is the explicit profile workflow, its naming convenience, and its shared experience across the two tools.

**The profiles are shared between Azure CLI and Azure PowerShell.** A profile created in PowerShell can be used in the CLI, and one created in the CLI can be used in PowerShell, without a separate sign-in on the same machine using the same profile store. I will keep the commands in this walkthrough PowerShell-only.

Meaningful names make this especially useful when tenants and subscriptions multiply. A pattern such as `<tenant-alias>-<subscription-alias>` lets me use names like `contoso-dev`, `contoso-shared`, and `fabrikam-dev`. I can add an environment or account alias when needed. Rather than looking up an ID each time, I select a name that tells me where I intend to work. The aliases are my own naming convention, not Azure tenant or subscription names that the tool resolves automatically.

For the demo, I use two subscriptions in my personal tenant and name the profiles `personal-dev` and `personal-tools`. The same approach works across tenants: each profile is created with the appropriate tenant and subscription IDs, then selected by name. A second tenant is not required for this particular demonstration.

With the [PowerShell modules](https://github.com/Azure/azclips/blob/main/docs/azure-powershell/docs-conceptual/install-powershell-modules.md) installed and loaded, I sign in and save each context using `-OutProfile`. Replace the placeholders with your own identifiers.

```powershell
Connect-AzAccount `
    -TenantId '<personal-tenant-id>' `
    -SubscriptionId '<dev-subscription-id>' `
    -OutProfile personal-dev

Connect-AzAccount `
    -TenantId '<personal-tenant-id>' `
    -SubscriptionId '<tools-subscription-id>' `
    -OutProfile personal-tools

Get-AzProfile |
    Select-Object Name, TenantId, SubscriptionId, IsActive
```

The most recently signed-in profile becomes active, so `personal-tools` should be active here. The output also shows how each friendly name maps to its tenant and subscription.

![Creating personal-dev and personal-tools profiles, with personal-tools active.](/media/next-gen-azure-cli-and-azure-powershell-profiles/profiles-created.png)

To make the target visible, I create one empty resource group in each subscription. The suffix keeps the names specific to this demo. After checking the active profile's subscription, I run the corresponding creation command.

```powershell
$demoSuffix = [guid]::NewGuid().ToString('N').Substring(0, 8)
$devResourceGroup = "rg-nextgen-demo-dev-$demoSuffix"
$toolsResourceGroup = "rg-nextgen-demo-tools-$demoSuffix"

Set-AzProfile -Name personal-dev
Get-AzProfile -Active | Select-Object Name, SubscriptionId
```

```powershell
New-AzResourceGroup -Name $devResourceGroup -Location westeurope -ErrorAction Stop

Set-AzProfile -Name personal-tools
Get-AzProfile -Active | Select-Object Name, SubscriptionId
```

After verifying the tools subscription, I create its group:

```powershell
New-AzResourceGroup -Name $toolsResourceGroup -Location westeurope -ErrorAction Stop
```

Neither creation command includes a subscription ID: the active profile supplies the target. The groups stay empty; there is no need to deploy workloads to demonstrate profiles.

Now I switch between the profiles and query their respective demo groups:

```powershell
Set-AzProfile -Name personal-dev
Get-AzProfile -Active | Select-Object Name
Get-AzResourceGroup -Name $devResourceGroup |
    Select-Object Name, Location, Id

Set-AzProfile -Name personal-tools
Get-AzProfile -Active | Select-Object Name
Get-AzResourceGroup -Name $toolsResourceGroup |
    Select-Object Name, Location, Id
```

The selected name changes the context for subsequent commands. With profiles for different tenants, switching uses the saved tenant and identity as well as the subscription. That is where a consistent naming pattern becomes much more convenient than keeping track of identifiers.

![Switching between personal-dev and personal-tools and querying the resource group in each subscription.](/media/next-gen-azure-cli-and-azure-powershell-profiles/profiles-switching.png)

Sometimes I only want to query another subscription without changing my active context. Subscription-scoped cmdlets accept `-Profile` for this:

```powershell
Set-AzProfile -Name personal-dev

Get-AzResourceGroup -Name $toolsResourceGroup -Profile personal-tools |
    Select-Object Name, Location

Get-AzProfile -Active | Select-Object Name

Get-AzResourceGroup -Name $devResourceGroup |
    Select-Object Name, Location
```

The first query should return the tools group, but the active profile should remain `personal-dev`. The final query omits `-Profile` and uses the development subscription again. **`Set-AzProfile` changes the active context; `-Profile` targets an individual command.**

![Querying the tools resource group with -Profile while personal-dev remains active, then querying the development group.](/media/next-gen-azure-cli-and-azure-powershell-profiles/profile-command-target.png)

Subscription-scoped commands now also expose a consistent **`-SubscriptionId` parameter**, aligning with explicit subscription targeting in Azure CLI through `--subscription-id`. I can supply a subscription ID directly for an individual command instead of switching profiles.

For me, the value is combining **recognizable names, easy switching across tenants and subscriptions, and profiles shared between CLI and PowerShell**. I can organize my contexts around how I work, rather than around identifiers, and use either tool without maintaining separate sign-ins. Profiles do not change permissions or make the target automatically safe, so checking the subscription behind the name remains important.

Note that this is initial preview and any limitations will be addressed over time. Any feedback can be logged at the [azclips repository](https://github.com/Azure/azclips/issues).
