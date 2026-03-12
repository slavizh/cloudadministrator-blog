---
title: "Azure Bicep fail() function explained"
excerpt: "Azure Bicep fail() function was introduced in Bicep CLI v0.33.93. In short this function allows you to fail your deployment when certain conditions are met. In this blog post we will look at how to…"
description: "Azure Bicep fail() function was introduced in Bicep CLI v0.33.93. In short this function allows you to fail your deployment when certain conditions are met...."
pubDate: 2025-02-10
updatedDate: 2025-02-10
heroImage: "/media/wordpress/2025/02/screen-with-azure-bicep-code-with-fail-function-in-it.png"
sourceUrl: "https://cloudadministrator.net/2025/02/10/azure-bicep-fail-function-explained/"
tags: 
  - "Azure"
  - "Azure Bicep"
  - "Cloud"
  - "Custom Error"
  - "Deployment"
  - "Fail"
  - "Bicep"
  - "Microsoft"
---
Azure Bicep [fail() function](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions#deployment-value-functions?WT.mc_id=AZ-MVP-5000120) was introduced in Bicep CLI v0.33.93. In short this function allows you to fail your deployment when certain conditions are met. In this blog post we will look at how to use it in real world example.

The example I would like to introduce the following:

-   We have Bicep template for deploying Storage account
-   The template configures some basic Storage account settings
-   The template configures Microsoft Entra Kerberos authentication for file shares identity-based access.
-   The template can specify domain name and domain GUID as optional parameters for the identity-based authentication.

To visualize better identity-based authentication let’s see how it looks in Azure Portal -> Storage Account -> Data Storage -> File Shares -> Identity-based access.

![](/media/wordpress/2025/02/identity-based-access.png)

*Identity-based access*

As you can see fairly easy configuration. If we try to enter only domain name and save you will notice that the portal does not allows that and we should also provided domain GUID as well.

![](/media/wordpress/2025/02/identity-based-access-error.png)

*Identity-based access error*

Now let’s look at how this setting can be achieve via Bicep Template:

```bicep
@description('The name of the storage account.')
param storageAccountName string

@description('The location of the storage account.')
param storageAccountLocation string = 'West Europe'

@description('The SKU of the storage account. Default value: Standard_LRS.')
@allowed([
  'Premium_LRS'
  'Premium_ZRS'
  'Standard_GRS'
  'Standard_GZRS'
  'Standard_LRS'
  'Standard_RAGRS'
  'Standard_RAGZRS'
  'Standard_ZRS'
])
param storageAccountSku string = 'Standard_LRS'

@description('The kind of the storage account. Default value: StorageV2.')
@allowed([
  'BlobStorage'
  'BlockBlobStorage'
  'FileStorage'
  'Storage'
  'StorageV2'
])
param storageAccountKind string = 'StorageV2'

@description('Enable Files shares identity-based authentication to Microsoft Entra Kerberos Authentication. Default value: false.')
param enableMicrosoftEntraKerberosAuthentication bool = false

@description('The default share permission for the files shared identity-based authentication. Default value: None.')
@allowed([
  'None'
  'StorageFileDataSmbShareContributor'
  'StorageFileDataSmbShareElevatedContributor'
  'StorageFileDataSmbShareReader'
])
param defaultSharePermission string = 'None'

@description('The domain name for the files shared identity-based authentication.')
param domainName string = ''

@description('The domain GUID for the files shared identity-based authentication.')
param domainGuid string = ''

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: storageAccountLocation
  sku: {
    name: storageAccountSku
  }
  kind: storageAccountKind
  properties: {
    azureFilesIdentityBasedAuthentication: {
      directoryServiceOptions: enableMicrosoftEntraKerberosAuthentication ? 'AADKERB' : 'None'
      defaultSharePermission: defaultSharePermission
      activeDirectoryProperties: !empty(domainName) && enableMicrosoftEntraKerberosAuthentication ? {
        domainName: domainName
        domainGuid: domainGuid
      } : null
    }
  }
}
```

As you can see from the template we have parameters for the main configurations. Note that by default identity-based access is not enabled. Now let’s deploy the template with the following parameters file:

```bicep
using 'example1.bicep'

param storageAccountName = 'enter your own account name'

param enableMicrosoftEntraKerberosAuthentication = true

param domainName = 'mydomain.com'
```

![](/media/wordpress/2025/02/deployment-domain-name-only.png)

*Deployment Domain Name only*

As you can see we have provided only domainName without domainGuid but the deployment still succeeds. Wait? What? Why? Well it seems the API allows this option although it is not something you want to do in production. We can check the configuration in Portal to verify it.

![](/media/wordpress/2025/02/identity-based-access-configured-without-domain-guid.png)

*Identity-based access configured without domain GUID*

So the Portal also displays correctly what we have done. It is not correct configuration but it is acceptable. In this particular case to make sure nobody applies such configuration in production we can use fail() function. Here is Bicep Template with modified code to use fail() function:

```bicep
@description('The name of the storage account.')
param storageAccountName string

@description('The location of the storage account.')
param storageAccountLocation string = 'West Europe'

@description('The SKU of the storage account. Default value: Standard_LRS.')
@allowed([
  'Premium_LRS'
  'Premium_ZRS'
  'Standard_GRS'
  'Standard_GZRS'
  'Standard_LRS'
  'Standard_RAGRS'
  'Standard_RAGZRS'
  'Standard_ZRS'
])
param storageAccountSku string = 'Standard_LRS'

@description('The kind of the storage account. Default value: StorageV2.')
@allowed([
  'BlobStorage'
  'BlockBlobStorage'
  'FileStorage'
  'Storage'
  'StorageV2'
])
param storageAccountKind string = 'StorageV2'

@description('Enable Files shares identity-based authentication to Microsoft Entra Kerberos Authentication. Default value: false.')
param enableMicrosoftEntraKerberosAuthentication bool = false

@description('The default share permission for the files shared identity-based authentication. Default value: None.')
@allowed([
  'None'
  'StorageFileDataSmbShareContributor'
  'StorageFileDataSmbShareElevatedContributor'
  'StorageFileDataSmbShareReader'
])
param defaultSharePermission string = 'None'

@description('The domain name for the files shared identity-based authentication.')
param domainName string = ''

@description('The domain GUID for the files shared identity-based authentication.')
param domainGuid string = ''

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: storageAccountLocation
  sku: {
    name: storageAccountSku
  }
  kind: storageAccountKind
  properties: {
    azureFilesIdentityBasedAuthentication: {
      directoryServiceOptions: enableMicrosoftEntraKerberosAuthentication ? 'AADKERB' : 'None'
      defaultSharePermission: defaultSharePermission
      activeDirectoryProperties: !empty(domainName) && enableMicrosoftEntraKerberosAuthentication ? {
        domainName: domainName
        domainGuid: !empty(domainGuid) ? domainGuid : fail('Parameter domainGuid is required when domainName is configured.')
      } : null
    }
  }
}
```

We have changed only one line of code to check for the value of domainGUID and if it is empty to fail the deployment with specific message that will stir the end user to change its Bicep parameters file and re-deploy. Let’s redeploy with our parameters file the new template:

![](/media/wordpress/2025/02/deployment-domain-only-error.png)

*Deployment domain only error*

Now the deployment fails and note that our custom error message is visible. We can see the same message in Azure Portal as well:

![](/media/wordpress/2025/02/deployment-domain-only-error-portal.png)

*Deployment domain name only error in Portal*

And if we re-deploy with providing domainGuid value everything works as expected:

![](/media/wordpress/2025/02/deployment-domain-name-and-guid-1.png)

*Deployment domain name and GUID*

It is important to remember that you should use [user-defined data types](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/user-defined-data-types?WT.mc_id=AZ-MVP-5000120) to steer the user who will fill in the Bicep Parameters file into correct configuration and when that is not possible use fail() function. User-defined data types will also detected incorrect configurations while editing to avoid failing deployment in first place.

I hope this helps you to figure scenarios in your Bicep Templates where you can use the fail() function. Another scenario that I can think of is if the API throws some strange error on specific configuration. Some APIs throw errors that are not easily understandable. In such cases you can use the fail() function to write better error message that will be more understandable.

The examples above you can find at [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/fail-function-example).

P.S. Initially I thought that the fail() function would surface errors on validation process of the template but that is not the case. Thus I have logged that and other improvements suggestions at [Bicep GitHub issue #16344](https://github.com/Azure/bicep/issues/16344). Feel free to chime in.
