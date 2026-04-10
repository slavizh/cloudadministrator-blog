---
title: "Practical Use of this.exists() and this.existingResource() in Azure Bicep"
excerpt: "Learn how to use the new Azure Bicep this.exists() and this.existingResource() functions to achieve full idempotency when deploying Azure MySQL Flexible Server replicas, working around poorly written resource provider APIs."
description: "A practical guide to using Azure Bicep this.exists() and this.existingResource() functions to handle idempotent deployments of Azure MySQL Flexible Server replicas."
pubDate: 2026-04-10
updatedDate: 2026-04-10
heroImage: "/media/bicep-this-exists-function/bicep-this-exists-hero.png"
sourceUrl: "https://cloudadministrator.net/bicep-this-exists-function/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "IaC"
  - "Infrastructure as Code"
  - "DevOps"
  - "Azure MySQL Flexible Server"
  - "Azure MySQL Flexible Server Replica"
  - "Idempotence"
  - "Deployment"
  - "What If"
  - "Troubleshoot"
---
The Azure Bicep functions this.exists() and this.existingResource() are a continuation of the already available [@onlyIfNotExists() decorator](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/resource-declaration?tabs=azure-powershell#onlyifnotexists?WT.mc_id=AZ-MVP-5000120). At the time of writing this blog post, the functions are in preview, released with [v0.40.2 Bicep CLI](https://github.com/Azure/bicep/releases/tag/v0.40.2). The usage of these functions, including the decorator, is something that you should consider carefully and in most cases should be limited to scenarios where the resource provider API is not well written. In this blog post, we will take a look at such a case and a practical example for these two functions.

[Azure Database for MySQL](https://learn.microsoft.com/en-us/azure/mysql/?WT.mc_id=AZ-MVP-5000120) is a commonly used resource for databases. With the service, you create a MySQL flexible server, and to achieve scale and improve performance you can create [replicas](https://learn.microsoft.com/en-us/azure/mysql/flexible-server/concepts-read-replicas?WT.mc_id=AZ-MVP-5000120). The replicas are the same resource as the flexible server, but certain properties are configured differently to designate it as a replica. Although it is fairly easy to specify those properties in a Bicep module and deploy the replica, re-deploying it will throw errors. The two properties that will throw an error are createMode and sourceServerResourceId. Upon initial deployment and creation of the replica, createMode requires a value of 'Replica'. However, on any subsequent deployments you either have to omit createMode or provide a value different from Replica, for example Update. If you re-deploy with the Replica value, the actual deployment will time out due to an internal server error. When an internal server error occurs, it usually does not fail the deployment but instead runs until it times out. In the Azure Portal you will see the error as:

![internal server error](/media/bicep-this-exists-function/internal-server-error.png)

```json
{
    "status": "Failed",
    "error": {
        "code": "InternalServerError",
        "message": "An unexpected error occured while processing the request. Tracking ID: 'aa86eee1-f9aa-4d15-9821-e4536b296f82'"
    }
}
```

In such cases, it is best to cancel the deployment as the timeout takes around 2 hours before you see a failed deployment and error. For the sourceServerResourceId property, on initial deployment you need to provide the source resource ID of the MySQL Flexible Server. If you try to re-deploy with that value, the deployment fails with:

```txt
Status Message: Invalid value given for parameter Properties.SourceServerResourceId. Specify a valid parameter value. (Code:InvalidParameterValue)
```

![invalid value](/media/bicep-this-exists-function/invalid-value.png)

For subsequent deployments, you need to pass null as the value for the parameter in order to succeed. Now that we have this knowledge, we can use the this.exists() function to provide a different value depending on whether the replica server exists or not. When the replica does not exist, we will pass the values required for initial deployment, and when the replica exists, we will provide the values required for subsequent deployments to avoid the errors demonstrated above. Note that you can achieve the same results without using this.exists(), but that requires having a boolean parameter that the end user of the module needs to provide in order to indicate whether the replica is already deployed. This makes the experience less pleasant, as the end user will have to start with one bicepparam file for initial deployment and then change that parameter for subsequent deployments. After all, one of the main features of Bicep is idempotency, and in this case, because of a poorly written API, we do not have it fully. However, with this.exists(), Bicep is able to overcome such issues in APIs and provide full idempotency. Here is how our code using this.exists() looks for a MySQL Flexible Server replica:

**types.bicep**

```bicep
@export()
type replicaMySqlFlexibleSever = {
  @description('The name of the MySQL flexible server replica.')
  name: string
  @description('The location of the MySQL flexible server replica. Default: resource group location.')
  location: string?
  sku: sku
  sourceServer: sourceServer
}

type sku = {
  @description('The name of the SKU.')
  name: string
  @description('The tier of the SKU.')
  // Replicas cannot be burstable tier
  tier: 'GeneralPurpose' | 'MemoryOptimized'
}

type sourceServer = {
  @description('The name of the source MySQL flexible server.')
  name: string
  @description('The resource group name of the source MySQL flexible server.')
  resourceGroupName: string
  @description('The subscription ID of the source MySQL flexible server. Default: current subscription.')
  subscriptionId: string?
}
```

**main.bicep**

 ```bicep
import * as types from './types.bicep'

param replicaMySqlFlexibleSever types.replicaMySqlFlexibleSever

resource sourceServer 'Microsoft.DBforMySQL/flexibleServers@2025-06-01-preview' existing = {
  name: replicaMySqlFlexibleSever.sourceServer.name
  scope: resourceGroup(replicaMySqlFlexibleSever.sourceServer.?subscriptionId ?? subscription().subscriptionId, replicaMySqlFlexibleSever.sourceServer.resourceGroupName)
}

resource replicaServer 'Microsoft.DBforMySQL/flexibleServers@2025-06-01-preview' = {
  name: replicaMySqlFlexibleSever.name
  location: replicaMySqlFlexibleSever.?location ?? resourceGroup().location
  sku: {
    name: replicaMySqlFlexibleSever.sku.name
    tier: replicaMySqlFlexibleSever.sku.tier
  }
  properties: {
    createMode: this.exists() ? 'Update' : 'Replica'
    sourceServerResourceId: this.exists() ? null : sourceServer.id
    replicationRole: 'Replica'
    administratorLogin: null
    administratorLoginPassword: null
    version: this.exists() ? this.existingResource()!.properties.version : null
    storage: {
      storageSizeGB: 64
      autoGrow: 'Enabled'
      autoIoScaling: 'Enabled'
      storageRedundancy: 'LocalRedundancy'
      iops: 492
      logOnDisk: 'Disabled'
    }
    availabilityZone: ''
    network: {
      delegatedSubnetResourceId: null
      privateDnsZoneResourceId: null
      publicNetworkAccess: 'Enabled'
    }
    backup: {
      backupIntervalHours: 24
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    databasePort: 3306
    dataEncryption: null
    highAvailability: {
      mode: 'Disabled'
      replicationMode: 'BinaryLog'
      standbyAvailabilityZone: ''
    }
    maintenancePolicy: {
      patchStrategy: 'Regular'
    }
    maintenanceWindow: {
      batchOfMaintenance: 'Default'
      customWindow: 'Disabled'
      dayOfWeek: 0
      startHour: 0
      startMinute: 0
    }
  }
}
 ```

 Some of the properties for the replica have to match the source, but others can be different. For this demo, I have not exposed them as input in the bicepparam file.

**params.bicepparam**

 ```bicep
 using 'main.bicep'

param replicaMySqlFlexibleSever = {
  name: 'replica0008'
  location: 'West US 2'
  sku: {
    name: 'Standard_D2ads_v5'
    tier: 'GeneralPurpose'
  }
  sourceServer: {
    name: 'source0004'
    resourceGroupName: 'mysql-database'
  }
}

 ```

To use the feature during preview, it needs to be enabled via the bicepconfig.json file:

```json
{
    "experimentalFeaturesEnabled": {
        "thisNamespace": true
    }
}
```

Initial deployment + what-if results will look like this:

![initial deployment what if](/media/bicep-this-exists-function/initial-deployment-what-if.png)

![initial deployment](/media/bicep-this-exists-function/initial-deployment.png)

Re-deployment + what-if results will look like this:

![re deployment what if](/media/bicep-this-exists-function/re-deployment-what-if.png)

![re-deployment](/media/bicep-this-exists-function/re-deployment.png)

From the code, you can also see that I am using the this.existingResource() function in the version property. That property is not something you can change, as the version will always be the same as the source, but it gives you another example of how you can use the function to apply a different value depending on whether the resource is deployed or not. In this case, when the resource is already deployed, I simply apply the existing value to the property.

From the what-if results, you can see that you lose the ability to see exactly what value will be applied, but I hope that will change in the future. What-if should be able to determine whether the resource is deployed or not and display the actual value accordingly, instead of displaying the raw code.

Note that in my demo I am using the same resource group for the source and replica, but if your replica is in a different region than the source, it is best to deploy it in a separate resource group that has the same location as your replica.

I was planning to release this blog post in March, but I stumbled on an issue with this.exists() which I reported to the Bicep team and it is now fixed. I suggest reporting any issues that you spot during the preview so they can be fixed before GA.

The example code can be found at [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/this-exists).

I hope this was a useful blog post for you!
