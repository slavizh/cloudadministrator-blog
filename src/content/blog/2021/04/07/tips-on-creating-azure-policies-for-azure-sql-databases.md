---
title: "Tips on creating Azure policies for Azure SQL Databases"
excerpt: "Azure SQL Databases is quite a big service and it is also one of the oldest. Because of these two there are a few architectural designs that you should be aware. Some of these are: * with every SQL…"
description: "Azure SQL Databases is quite a big service and it is also one of the oldest. Because of these two there are a few architectural designs that you should be aw..."
pubDate: 2021-04-07
updatedDate: 2021-04-07
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2021/04/07/tips-on-creating-azure-policies-for-azure-sql-databases/"
tags: 
  - "ARM"
  - "Azure"
  - "Azure Governance"
  - "Azure Management"
  - "Azure Policy"
  - "Azure Resource Manager"
  - "Azure SQL"
  - "Azure Synapse"
---
Azure SQL Databases is quite a big service and it is also one of the oldest. Because of these two there are a few architectural designs that you should be aware. Some of these are:

-   with every SQL logical server there is a master database resource that is created. This resource is not directly managed but for example when you configure diagnostic settings on server level you need to configure those against the master database resource rather the SQL logical server
-   The SKUs of Azure SQL Databases are mostly divided into DTU and vCore based. Among the vCore based we also have Hyperscale and Serverless variants. You can also have elastic pools for some SKUs and than the databases under those elastic pools inherit their SKUs. Not all Azure SQL SKUs support all of the features of the service. Some of the features that may not be available or have some limitations across different SKUs are:
    -   Zone redundancy
    -   Hybrid benefit
    -   Read replicas
    -   Failover Group support – for example not supported on Hyperscale SKUs and supported on Serverless SKUs only auto pause delay is disabled
    -   Geo replication
    -   Short term backup
    -   Long term backup

Among these we also have Datawarehouses (now known as Azure Synapse Analytics) which underneath are the same resource as Azure SQL databases but have completely different options.

When you create policies around auditing these features or Azure SQL in general you will need to create the policy rule in a way that excludes the database resources that do not support the feature that you are auditing to avoid non-compliant resources. This blog post aims to give you a few examples of parts of policy rules so you can understand what you need to do when you build your own Azure SQL policies.

Lets say you want to audit the short term retention backup of Azure SQL database. In such kind of policy the ‘if’ part of policy rule will look like this:

```json
{
    "policyRule": {
        "if": {
            "allOf": [
                {
                    "field": "type",
                    "equals": "Microsoft.Sql/servers/databases"
                },
                {
                    "field": "Microsoft.Sql/servers/databases/edition",
                    "notEquals": "DataWarehouse"
                },
                {
                    "field": "name",
                    "notEquals": "master"
                },
                {
                    "field": "Microsoft.Sql/servers/databases/sku.tier",
                    "notEquals": "Basic"
                },
                {
                    "field": "Microsoft.Sql/servers/databases/sku.tier",
                    "notEquals": "Hyperscale"
                }
            ]
        },
        "then": {
            ...
        }
    }
}
```

Let’s look at all the conditions available in this example:

-   First we are making sure that we scope only to Azure SQL databases with type field
-   Second we are removing any Azure SQL Datawarehouse (now known as Azure Synapse Analytics) from the scope
-   The master database is also removed that is system database
-   The Basic SKU is also excluded as that one supports only short term backup set to 7 days, cannot be increased to higher value
-   Hyperscale databases are also excluded as those do not support short term backup at all

In general you can see that we are excluding specific databases on some properties that are available for all.

The next example is based on the above but a little bit more complex. This one is based if we want to audit long term backup:

```json
{
    "policyRule": {
        "if": {
            "anyOf": [
                {
                    "allOf": [
                        {
                            "field": "type",
                            "equals": "Microsoft.Sql/servers/databases"
                        },
                        {
                            "field": "Microsoft.Sql/servers/databases/edition",
                            "notEquals": "DataWarehouse"
                        },
                        {
                            "field": "name",
                            "notEquals": "master"
                        },
                        {
                            "field": "Microsoft.Sql/servers/databases/sku.tier",
                            "notEquals": "Basic"
                        },
                        {
                            "field": "Microsoft.Sql/servers/databases/sku.tier",
                            "notEquals": "Hyperscale"
                        },
                        {
                            "field": "Microsoft.Sql/servers/databases/autoPauseDelay",
                            "exists": "false"
                        }
                    ]
                },
                {
                    "allOf": [
                        {
                            "field": "Microsoft.Sql/servers/databases/autoPauseDelay",
                            "exists": "true"
                        },
                        {
                            "field": "Microsoft.Sql/servers/databases/autoPauseDelay",
                            "less": 0
                        }
                    ]
                }
            ]
        },
        "then": {
            ...
        }
    }
}
```

The main difference in this example is that with anyOf condition we are taking the combined results of each filter. In the first filter we exclude databases that have autoPauseDelay property. That property is available only on Serverless SKUs. That way we exclude all Serverless databases from the first filter. The Serverless databases support long term backup but only if auto pause delay is disabled. Because of that we have the second filter which will return only Serverless SKU databases and from those only the ones for which autoPauseDelay property is configured with value less than 0. When auto pause delay is disabled the value for the property will be -1. The returned resources from both filters will be combined and evaluated in ‘then’ section. This kind of filtering for Serverless SKUs is clearer as if I had to filter on the actual SKU name would have been harder due to the main difference is additional ‘_S_‘ in the name.

I hope these tips will help you in building your policies for Azure SQL.
