---
title: "Azure Resources CMK Encryption with Azure Bicep"
excerpt: "Azure Customer Managed Key (CMK) Encryption enhances security across Azure resources and ensures compliance. The configuration varies by resource, requiring Key Vault, key, version, and identity ac…"
description: "Azure Customer Managed Key (CMK) Encryption enhances security across Azure resources and ensures compliance. The configuration varies by resource, requiring..."
pubDate: 2024-12-10
updatedDate: 2024-12-10
heroImage: "/media/2024/12/image.png"
sourceUrl: "https://cloudadministrator.net/2024/12/10/azure-resources-cmk-encryption-with-azure-bicep/"
tags: 
  - "Azure"
  - "Azure Bicep"
  - "Azure Compliance"
  - "Azure Management"
  - "Azure Security"
  - "Cloud"
  - "Customer Managed Key"
  - "DevOps"
  - "Encryption"
  - "IaC"
  - "Infrastructure as Code"
  - "Microsoft"
  - "Bicep"
  - "Security"
---
Azure Customer Managed Key (CMK) Encryption is quite used feature across Azure resources in order to make sure you are compliant against various certifications and increase your security posture. I have been configuring this feature via IaC since there was only ARM Templates and Bicep was not available. If you have the same experience with me you will notice that the input required for this feature varies from one resource to another. If have to summarize what is required as information that would be:

-   Key Vault
-   A key from Key Vault
-   A version for a key. Some might not require a version.
-   Identity that will be used to access the key from the Key Vault. Most resources will offer the ability to choose between system assigned or user assigned identity although there are sill some resources that will use the identity of the account that is configuring the feature.

With that said in this blog I would like to show you how I used to configured the feature when using ARM templates and how I think it is the better approach when using Bicep code.

I have already mentioned that encryption input looks differently across the Azure resources that supports it but overall the example that I will provider will give you a pattern that you can use on all resources. As an example I will use SQL logical server resource. First let me show you the code I was using when configuring encryption via ARM templates. Of course I will use Bicep to illustrate better the difference as that code is perfectly valid for use in Bicep as well.

```bicep
@description('The name of the SQL logical server.')
param sqlServerName string
@description('The subscription ID of the user-assigned identity. Default: current subscription.')
param userAssignedIdentitySubscriptionId string = subscription().subscriptionId
@description('The resource group of the user-assigned identity.')
param userAssignedIdentityResourceGroup string
@description('The name of the user-assigned identity.')
param userAssignedIdentityName string
@description('The principal ID of Microsoft Entra user.')
param entraUserPrincipalId string
@description('The display name of Microsoft Entra user.')
param entraUserDisplayName string
@description('The name of the key vault. If not provided, no CMK encryption is applied.')
param keyVaultName string = ''
@description('The name of the key in the key vault.')
param keyVaultKeyName string = ''
@description('The version of the key in the key vault.')
param keyVaultKeyVersion string = ''

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-preview' existing = {
  name: userAssignedIdentityName
  scope: resourceGroup(userAssignedIdentitySubscriptionId, userAssignedIdentityResourceGroup)
}

resource sqlServer 'Microsoft.Sql/servers@2024-05-01-preview' = {
  name: sqlServerName
  location: resourceGroup().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    administrators: {
      administratorType: 'ActiveDirectory'
      azureADOnlyAuthentication: true
      login: entraUserDisplayName
      principalType: 'User'
      sid: entraUserPrincipalId
      tenantId: subscription().tenantId
    }
    primaryUserAssignedIdentityId: userAssignedIdentity.id
    keyId: !empty(keyVaultName)
      ? 'https://${toLower(keyVaultName)}${environment().suffixes.keyvaultDns}/keys/${toLower(keyVaultKeyName)}/${keyVaultKeyVersion}'
      : null
  }
}
```

As you can see from the code here the requirement is to provide key ID which should contain the version of the key as well. In order to provide the value I am using concatenation if the different values. I also have static strings and usage of environment() function. The identity that will be used for encryption here is configured by configuring the primary identity. Overall a pretty standard code there. In other resources you might have specific property for the identity of the encryption. For me personally the above code is harder to read compared to the next option that I will show you.

```bicep
@description('The name of the SQL logical server.')
param sqlServerName string
@description('The subscription ID of the user-assigned identity. Default: current subscription.')
param userAssignedIdentitySubscriptionId string = subscription().subscriptionId
@description('The resource group of the user-assigned identity.')
param userAssignedIdentityResourceGroup string
@description('The name of the user-assigned identity.')
param userAssignedIdentityName string
@description('The principal ID of Microsoft Entra user.')
param entraUserPrincipalId string
@description('The display name of Microsoft Entra user.')
param entraUserDisplayName string
@description('The subscription ID of the key vault. Default: current subscription.')
param keyVaultSubscriptionId string = subscription().subscriptionId
@description('The resource group of the key vault.')
param keyVaultResourceGroup string = ''
@description('The name of the key vault. If not provided, no CMK encryption is applied.')
param keyVaultName string = ''
@description('The name of the key in the key vault.')
param keyVaultKeyName string = ''
@description('The version of the key in the key vault. Default: latest version available at deployment time.')
param keyVaultKeyVersion string = ''

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-preview' existing = {
  name: userAssignedIdentityName
  scope: resourceGroup(userAssignedIdentitySubscriptionId, userAssignedIdentityResourceGroup)
}

resource keyVault 'Microsoft.KeyVault/vaults@2024-04-01-preview' existing = if(!empty(keyVaultKeyName) && !empty(keyVaultName) && !empty(keyVaultResourceGroup)) {
  name: keyVaultName
  scope: resourceGroup(keyVaultSubscriptionId, keyVaultResourceGroup)
}

resource keyVaultKey 'Microsoft.KeyVault/vaults/keys@2024-04-01-preview' existing = if(!empty(keyVaultKeyName) && !empty(keyVaultName) && !empty(keyVaultResourceGroup)) {
  name: keyVaultKeyName
  parent: keyVault
}

resource keyVaultKeyVersionRes 'Microsoft.KeyVault/vaults/keys/versions@2024-04-01-preview' existing = if(!empty(keyVaultKeyVersion)) {
  name: keyVaultKeyVersion
  parent: keyVaultKey
}

resource sqlServer 'Microsoft.Sql/servers@2024-05-01-preview' = {
  name: sqlServerName
  location: resourceGroup().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    administrators: {
      administratorType: 'ActiveDirectory'
      azureADOnlyAuthentication: true
      login: entraUserDisplayName
      principalType: 'User'
      sid: entraUserPrincipalId
      tenantId: subscription().tenantId
    }
    primaryUserAssignedIdentityId: userAssignedIdentity.id
    keyId: !empty(keyVaultName)
      ? !empty(keyVaultKeyVersion)
        ? keyVaultKeyVersionRes.properties.keyUriWithVersion
        : keyVaultKey.properties.keyUriWithVersion
      : null
  }
}
```

The first thing you will notice from the second option is that the code is longer. That is due to using the existing syntax to find the Key Vault, key and version. The two main benefits that you should notice are:

-   We are taking the key ID directly from the properties of the resources without having to concatenate.
-   We do not have to provide the key version as if the version is not explicitly configured we will just take the latest version available on the key. That also allows you to easily switch to the latest version of the key by just doing redeploy and not having to look what is the latest value.

Additionally the existing syntax will check if these resources exist before actually using them. One downside of this approach is that you need to provide the resource group of the Key Vault that is of course if the Key Vault is not in the same resource group as your resource for encryption. Another downside is that this will break what-if feature but that is due to bug in the feature which hopefully will be fixed in the near future.

I personally find the second option more dynamic and easier to read along with the benefit of having to provide the version of a key which does not have easy readable name. As last example I would like to show you a snippet with option 2 code of encryption pattern quite used in other Azure resources:

```bicep
keyVaultProperties: {
  keyVaultUri: keyVault.properties.vaultUri
  keyName: keyVaultKey.name
  keyVersion: !empty(keyVaultKeyVersion)
    ? keyVaultKeyVersionRes.name
    : last(split(keyVaultKey.properties.keyUriWithVersion, '/'))
}
```

xisting syntax is not included as it is the same as previous example. As you can see the format of the input is slightly different but the pattern is the same so the person who will use the Bicep template will have pretty much the same or similar experience of configuring the parameters for encryption no matter the template for the resource.

The examples you can find at [GitHub as well](https://github.com/slavizh/BicepTemplates/tree/main/azure-resource-encryption-examples).

I hope these were useful tips on how to write better Bicep code.
