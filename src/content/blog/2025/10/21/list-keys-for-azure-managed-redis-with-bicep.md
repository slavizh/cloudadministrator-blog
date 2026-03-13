---
title: "List Keys for Azure Managed Redis with Bicep"
excerpt: "Azure has announced the retirement of Azure Cache for Redis and Azure Cache for Redis Enterprise, prompting users to consider Azure Managed Redis. While both share resource types, they differ in ar…"
description: "Azure has announced the retirement of Azure Cache for Redis and Azure Cache for Redis Enterprise, prompting users to consider Azure Managed Redis. While both..."
pubDate: 2025-10-21
updatedDate: 2025-10-21
heroImage: "/media/2025/10/image-1.png"
sourceUrl: "https://cloudadministrator.net/2025/10/21/list-keys-for-azure-managed-redis-with-bicep/"
tags: 
  - "AI"
  - "Azure"
  - "Azure Bicep"
  - "Azure Cache for Redis"
  - "Azure Managed Redis"
  - "Cloud"
  - "DevOps"
  - "IaC"
  - "List Keys"
  - "Microsoft"
  - "Redis"
  - "Bicep"
  - "Technology"
---
Recently Azure has announced retirement of [Azure Cache for Redis](https://azure.microsoft.com/en-us/updates?id=499577) and [Azure Cache for Redis Enterprise](https://azure.microsoft.com/en-us/updates?id=499606). This of course leads folks to look at [Azure Managed Redis](https://learn.microsoft.com/en-us/azure/redis/overview?WT.mc_id=AZ-MVP-5000120). Note that underneath Azure Cache for Redis and Azure Managed Redis use the same resource type but with different SKUs. Overall my general impression is that not many existing customers have moved from Azure Cache for Redis to Azure Cache for Redis Enterprise. The integration with Redis to other services and applications in most cases happen via providing connection string with credentials. It is well known how to list the credentials from Azure Cache for Redis with Bicep but may be it is not so known with how to do that with Azure Managed Redis due its different Azure architecture.

With Azure Cache for Redis you only had one main resource type Microsoft.Cache/redis. So to get the credentials you had to use list function on that resource. Azure Managed Redis on the other hand besides the main resource type Microsoft.Cache/redisEnterprise also child resource type Microsoft.Cache/redisEnterprise/databases is introduced. Basically you have an actual deployed Azure Managed Redis when both of these resources are deployed. This may be opens a future for the service to have more than one database but that is just speculation from my side. Currently you can only created one database and its name must be default. Due to that the actual credentials are on the database rather on the main resource. Note that the hostname is still on the Managed Redis resource. The following Bicep template example provides code to list the primary key and connection string for Azure Managed Redis instance.

```bicep
@description('The name of the Managed Redis cache.')
param redisName string

resource redis 'Microsoft.Cache/redisEnterprise@2025-05-01-preview' existing = {
  name: redisName
}

resource redisDatabase 'Microsoft.Cache/redisEnterprise/databases@2025-05-01-preview' = {
  name: 'default'
  parent: redis
}

@description('The primary key of the Redis database.')
@secure()
output primaryKey string = redisDatabase.listKeys().primaryKey

@description('The connection string of the Redis database.')
@secure()
output connectionString string = '${redis.properties.hostName}:${redisDatabase!.properties.port},password=${redisDatabase.listKeys().primaryKey},ssl=True,abortConnect=False'
```

Note that the port is also taken from the database resource. Always pass these values securely by either marking them as secure output or putting it into secure property on another service.

I hope this was useful Azure Bicep blog post for you. The example can also be found in [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/managed-redis-list-keys).
