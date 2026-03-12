---
title: "The Resource Type behind Azure Update Manager Dynamic Scope"
excerpt: "When helping folks at Microsoft Q&A I saw a question regarding creating Dynamic scope with Bicep or Terraform. That led to creating this blog post where we will see what is the resource type be…"
description: "When helping folks at Microsoft Q&A I saw a question regarding creating Dynamic scope with Bicep or Terraform. That led to creating this blog post where we w..."
pubDate: 2024-10-30
updatedDate: 2024-10-30
heroImage: "/media/wordpress/2024/10/create-dynamic-scope.png"
sourceUrl: "https://cloudadministrator.net/2024/10/30/the-resource-type-behind-azure-update-manager-dynamic-scope/"
tags: 
  - "Azure"
  - "Azure Bicep"
  - "Azure Update Manager"
  - "Bicep"
  - "Cloud"
  - "Deployment"
  - "Dynamic Scope"
  - "Microsoft"
  - "ARM"
  - "Update Manager"
  - "Security"
---
When helping folks at Microsoft Q&A I saw a question regarding creating Dynamic scope with Bicep or Terraform. That led to creating this blog post where we will see what is the resource type behind Azure Update Manager Dynamic scope and how it can be created with Bicep. Of course the same thing applies to Terraform and [AzAPI provider](https://learn.microsoft.com/en-us/azure/developer/terraform/overview-azapi-provider?WT.mc_id=AZ-MVP-5000120).

Let’s start by first looking at the Portal experience for better understanding. The Azure Update Manager portal experience does not offer standalone view to see all your Dynamic scopes. Instead you can see dynamic scopes by editing maintenance configuration or by creating a new one and creating dynamic scopes for it.

![](/media/wordpress/2024/10/add-dynamic-scopes.png)

*Add Dynamic Scope*

When you click add dynamic scope you are presented with one or more subscriptions to choose.

![](/media/wordpress/2024/10/create-dynamic-scope.png)

*Create Dynamic Scope*

As you can see the subscriptions are the only required setting. If you do not configure filter the dynamic scope applies to all resource groups, all locations, all supported resource types, no matter the tags for all subscriptions chosen. Underneath when you choose more than one subscription a separate Azure resource is created for each subscription. The other interesting part is that those resources are not resources that are created inside resource group. They are resource that are created at subscription scope, so each resource will be created at its own subscription. Another example for a resource that can be deployed at subscription scope is Policy Assignment. The third interesting detail is the type of the resource – Microsoft.Maintenance/configurationAssignments. This is the same type if you would assign maintenance configuration to Azure VM for example. When you assign maintenance configuration to Azure VM the resource type is deployed at resource group scope and the resource itself is scoped to the Azure VM. The bicep code for that scenario looks like this:

```bicep
targetScope = 'resourceGroup'

@description('The name of the Azure VM.')
param vmName string

@description('The Azure VM location.')
param vmLocation string

@description('The name of the maintenance configuration assignment.')
param assignmentName string

@description('The subscription ID where the maintenance configuration is located.')
param maintenanceConfigurationSubscriptionId string = subscription().id

@description('The resource group name where the maintenance configuration is located.')
param maintenanceConfigurationResourceGroupName string

@description('The maintenance configuration name.')
param maintenanceConfigurationName string

resource vm 'Microsoft.Compute/virtualMachines@2024-07-01' existing = {
  name: vmName
}

resource maintenanceConfiguration 'Microsoft.Maintenance/maintenanceConfigurations@2023-10-01-preview' existing = {
  name: maintenanceConfigurationName
  scope: resourceGroup(maintenanceConfigurationSubscriptionId, maintenanceConfigurationResourceGroupName)
}

resource assignment 'Microsoft.Maintenance/configurationAssignments@2023-10-01-preview' = {
  name: assignmentName
  location: vmLocation
  scope: vm
  properties: {
    maintenanceConfigurationId: maintenanceConfiguration.id
    resourceId: vm.id
  }
}
```

As you can see when you create maintenance configuration assignment you need to specify two properties for the resource – maintenanceConfigurationId and resourceId. The scope of the deployment (resource group) is defined via targetScope and the scope of the resource (the VM) is defined via scope property. It is important also to mention that the above code is for one maintenance configuration assignment but you can do multiple as long as you assign different maintenance configuration with different assignment name.

Now let’s look at how to deploy Dynamic scope via Bicep which is the topic of this blog post:

```bicep
targetScope = 'subscription'

type filterTagOperatorType = 'All' | 'Any'

type tagsFilterType = {
  @description('The values for the tags.')
  *: string[]
}

@description('The name of the maintenance configuration assignment.')
param assignmentName string

@description('The Azure location for filter by. Default value: all locations.')
param filterLocations array = []

@description('The operating systems to filter by. Default value: Linux and Windows.')
@allowed([
  'Linux'
  'Windows'
])
param filterOsTypes array = []

@description('The resource group names to filter by. Default value: all resource groups.')
param filterResourceGroups array = []

@description('The resource types to filter by. Default value: microsoft.hybridcompute/machines and Microsoft.Compute/virtualMachines.')
@allowed([
  'microsoft.hybridcompute/machines'
  'Microsoft.Compute/virtualMachines'
])
param filterResourceTypes array = []

@description('The operator to use when filtering by tags. Default value: All.')
param filterTagOperator filterTagOperatorType = 'All'

@description('Tags and multiple values for each tag to filter by. Default value: any tag.')
param filterTags tagsFilterType = {}

@description('The subscription ID where the maintenance configuration is located.')
param maintenanceConfigurationSubscriptionId string = subscription().id

@description('The resource group name where the maintenance configuration is located.')
param maintenanceConfigurationResourceGroupName string

@description('The maintenance configuration name.')
param maintenanceConfigurationName string

resource maintenanceConfiguration 'Microsoft.Maintenance/maintenanceConfigurations@2023-10-01-preview' existing = {
  name: maintenanceConfigurationName
  scope: resourceGroup(maintenanceConfigurationSubscriptionId, maintenanceConfigurationResourceGroupName)
}

resource dynamicScope 'Microsoft.Maintenance/configurationAssignments@2023-10-01-preview' = {
  name: assignmentName
  properties: {
    #disable-next-line use-resource-id-functions
    resourceId: subscription().id // The format of the value is /subscriptions/{sub id}
    filter: {
      locations: filterLocations
      osTypes: filterOsTypes
      resourceGroups: filterResourceGroups
      resourceTypes: filterResourceTypes
      tagSettings: {
        tags: filterTags
        filterOperator: filterTagOperator
      }
    }
    maintenanceConfigurationId: maintenanceConfiguration.id
  }
}
```

There are several difference to notice:

-   The target scope is now subscription which means the template is deployed to subscription.
-   The Microsoft.Maintenance/configurationAssignments does not have scope.
-   The resourceId property now takes the value of the current subscription ID for deployment. Note that this is the full subscription resource ID not just only the ID.
-   The filter property is optional and it is available only when the resource is deployed at subscription scope. No such property exists when deployed at resource group scope.

To make things easier I have put all properties in parameters with descriptions for easier usage. You can also find the examples at my [GitHub repository](https://github.com/slavizh/BicepTemplates/tree/main/azure-update-manager).

I hope with this example you have better understanding of Azure Update Manager dynamic scopes and will help you in your IaC work.
