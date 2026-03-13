---
title: "Passing Resources between Azure Bicep modules"
excerpt: "This blog post discusses methods for passing resource information, primarily focusing on Azure Bicep modules. It outlines two approaches: passing full resource IDs and using user-defined data types…"
description: "This blog post discusses methods for passing resource information, primarily focusing on Azure Bicep modules. It outlines two approaches: passing full resour..."
pubDate: 2025-03-06
updatedDate: 2025-03-06
heroImage: "/media/2025/03/monitor-with-azure-bicep-code-showing-resource.png"
sourceUrl: "https://cloudadministrator.net/2025/03/06/passing-resources-between-azure-bicep-modules/"
tags: 
  - "Azure"
  - "Azure Bicep"
  - "Best Practices"
  - "Bicep"
  - "DevOps"
---
[Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules?WT.mc_id=AZ-MVP-5000120) is core feature for structuring your code and achieving certain functionality when deploying Azure resources. When using modules quite often you will have to pass pass resource information like resource ID in order to be used within the module. Another use case is when an end user have to provide information for existing resource so that resource can be used for the deployment of another resource. This blog post will focus on the different methods for passing resources between modules or from bicep parameters file to module.

There are mainly two methods to pass resources between modules that I am aware. I will demonstrate those via examples with Bicep parameters file and module but the same approach applies to passing resources between two modules.

The first method is to pass the full resource ID of the resource. Example code for that method is:

```bicep
@description('The name of the SQL server.')
param sqlServerName string
@description('The user name for the SQL server login.')
param sqlServerUserName string
@description('The password for the SQL server login.')
@secure()
param sqlServerPassword string
@description('The virtual Network rule name. Requires to configure virtualNetworkSubnetId as well.')
param virtualNetworkRuleName string = ''
@description('Ignores missing virtual network service endpoint. Default value: false.')
param ignoreMissingVnetServiceEndpoint bool = false
@description('The resource ID of the virtual network subnet to be added for the virtual network rule. Requires to configure virtualNetworkRuleName as well.')
param virtualNetworkSubnetId string = ''

resource server 'Microsoft.Sql/servers@2024-05-01-preview' = {
  name: sqlServerName
  location: resourceGroup().location
  properties: {
    administratorLogin: sqlServerUserName
    administratorLoginPassword: sqlServerPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = if (!empty(virtualNetworkSubnetId)) {
  name: split(virtualNetworkSubnetId, '/')[8]
  scope: resourceGroup(split(virtualNetworkSubnetId, '/')[2], split(virtualNetworkSubnetId, '/')[4])
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' existing = if (!empty(virtualNetworkSubnetId)) {
  name:  split(virtualNetworkSubnetId, '/')[10]
  parent: virtualNetwork
}

resource virtualNetworkRules 'Microsoft.Sql/servers/virtualNetworkRules@2024-05-01-preview' = if (!empty(virtualNetworkSubnetId) && !empty(virtualNetworkRuleName)) {
  name: virtualNetworkRuleName
  parent: server
  properties: {
    virtualNetworkSubnetId: subnet.id
    ignoreMissingVnetServiceEndpoint: ignoreMissingVnetServiceEndpoint
  }
}
```

Example bicep parameters will be:

```bicep
using 'main.bicep'

param sqlServerName = 'srv00232asfd'
param sqlServerUserName = 'sqla001'
param sqlServerPassword = '<REPLACE-WITH-A-PASSWORD>'
param virtualNetworkRuleName = 'vnetrule001'
param ignoreMissingVnetServiceEndpoint = true
param virtualNetworkSubnetId = '/subscriptions/<SUBSCRIPTION ID>/resourceGroups/<RESOURCE GROUP NAME>/providers/Microsoft.Network/virtualNetworks/<VIRTUAL NETWORK NAME>/subnets/<SUBNET NAME>'
```

In the example we pass the resource ID of virtual network subnet and by using the split() function we figure out which value is subscription ID, resource group name, virtual network name and subnet name. Note that I can just pass subnet resource ID and not use the existing syntax at all but I consider using that as best practice. Additionally sometimes you might not need the resource ID of the resource only and you might need some other properties of the resource as well for which you will need to use the existing syntax. Also note if the Bicep template is compiled to [ARM Template language version 2](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/syntax?WT.mc_id=AZ-MVP-5000120) the existing syntax will also check if the account used for the deployment has access to the resource. To my opinion that is advantage.

The second method that you can use is the following:

```bicep
type virtualNetworkRuleType = {
  @description('The name of the virtual network rule.')
  name: string
  @description('Ignores missing virtual network service endpoint. Default value: false.')
  ignoreMissingVnetServiceEndpoint: bool?
  @description('The virtual network subnet to be added for the virtual network rule.')
  virtualNetwork: {
    @description('The subscription ID where the virtual network is located. Default value: current subscription for deployment.')
    subscriptionId: string?
    @description('The name of the resource group where the virtual network is located.')
    resourceGroupName: string
    @description('The virtual network name.')
    name: string
    @description('The name of the subnet.')
    subnetName: string
  }
}

@description('The name of the SQL server.')
param sqlServerName string
@description('The user name for the SQL server login.')
param sqlServerUserName string
@description('The password for the SQL server login.')
@secure()
param sqlServerPassword string
@description('Configures virtual network rules for the SQL server.')
param virtualNetworkRule virtualNetworkRuleType?

resource server 'Microsoft.Sql/servers@2024-05-01-preview' = {
  name: sqlServerName
  location: resourceGroup().location
  properties: {
    administratorLogin: sqlServerUserName
    administratorLoginPassword: sqlServerPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = if (virtualNetworkRule != null) {
  name: virtualNetworkRule.?virtualNetwork.?name!
  scope: resourceGroup(virtualNetworkRule.?virtualNetwork.?subscriptionId ?? subscription().subscriptionId, virtualNetworkRule.?virtualNetwork.?resourceGroupName!)
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' existing = if (virtualNetworkRule != null) {
  name: virtualNetworkRule.?virtualNetwork.?subnetName!
  parent: virtualNetwork
}

resource virtualNetworkRules 'Microsoft.Sql/servers/virtualNetworkRules@2024-05-01-preview' = if (virtualNetworkRule != null) {
  name: virtualNetworkRule.?name!
  parent: server
  properties: {
    virtualNetworkSubnetId: subnet.id
    ignoreMissingVnetServiceEndpoint: virtualNetworkRule.?ignoreMissingVnetServiceEndpoint ?? false
  }
}
```

And example Bicep parameters file would be:

```bicep
using 'main.bicep'

param sqlServerName = 'srv00232asfd'
param sqlServerUserName = 'sqla001'
param sqlServerPassword = '<REPLACE-WITH-A-PASSWORD>'
param virtualNetworkRule = {
  name: 'vnetrule001'
  ignoreMissingVnetServiceEndpoint: true
  virtualNetwork: {
    resourceGroupName: '<RESOURCE GROUP NAME>'
    name: '<VIRTUAL NETWORK NAME>'
    subnetName: '<SUBNET NAME>'
  }
}
```

This method is my preferred for method for several reasons:

-   The user who will configure the Bicep parameters file does not have to understand Azure Resource Types. He/she can just provide subscription ID, resource group name, virtual network name and subnet name.
-   The user does not have to provide the subscription ID if the virtual network is in the same subscription as the deployment. Note that you can do the same for resourceGroupName parameter but as I believe resources should be placed in separate resource groups I have not done it.
-   As you can see I am using [user-defined data types](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/user-defined-data-types?WT.mc_id=AZ-MVP-5000120) to make things easier for entering the information. That drives the user to provide all the required information without having to see the description what other parameter is required like in the first method.
-   Not using the split() function for me it makes the code easier to read and manage.

At the end it is your choice to use the method that you prefer but I would suggest to look at second method and adopt it if it is to your liking. It is important to note that may be in the future we will see [easier way of passing resources between modules](https://github.com/Azure/bicep/issues/2246) though I think that will apply only to modules and not Bicep parameters.

Both examples can be found at [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/pass-resources-examples).

Hope you are finding this blog post useful.
