---
title: "Controlling Azure SQL Firewall Rules"
excerpt: "Recently on Microsoft Q&A there was question on how you can control Azure SQL Firewall rule in a way that only certain IP addresses are allowed to be configured. Naturally I gave general answer…"
description: "Recently on Microsoft Q&A there was question on how you can control Azure SQL Firewall rule in a way that only certain IP addresses are allowed to be configu..."
pubDate: 2021-03-31
updatedDate: 2021-03-31
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2021/03/31/controlling-azure-sql-firewall-rules/"
tags: 
  - "Audit"
  - "Azure"
  - "Azure Governance"
  - "Azure Policy"
  - "Azure SQL"
  - "Firewall"
  - "Security"
---
Recently on Microsoft Q&A there was question on how you can control Azure SQL Firewall rule in a way that only certain IP addresses are allowed to be configured. Naturally I gave general answer that you can do that via Azure Policy. Initially I didn’t give the person an actual policy as I haven’t done such before. Of course creating Azure Policy definition can be challenging so the person asked him if I can provide him with example.

Needless to say a few hours later I was ready with the following policy rule definition:

```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "Microsoft.Sql/servers/firewallRules/startIpAddress",
          "notIn": "[parameters('listOfStartIpAddresses')]"
        },
        {
          "field": "Microsoft.Sql/servers/firewallRules/endIpAddress",
          "notIn": "[parameters('listOfEndIpAddresses')]"
        }
      ]
    },
    "then": {
      "effect": "[parameters('effect')]"
    }
  },
  "parameters": {
    "effect": {
      "type": "String",
      "metadata": {
        "displayName": "Effect",
        "description": "Enable or disable the execution of the policy"
      },
      "allowedValues": [
        "Audit",
        "Deny",
        "Disabled"
      ],
      "defaultValue": "Deny"
    },
    "listOfStartIpAddresses": {
      "type": "Array",
      "metadata": {
        "displayName": "List of Start IP Addresses for SQL",
        "description": "List of Start IP Addresses for SQL"
      }
    },
    "listOfEndIpAddresses": {
      "type": "Array",
      "metadata": {
        "displayName": "List of End IP Addresses for SQL",
        "description": "List of End IP Addresses for SQL"
      }
    }
  }
}
```

A few things to notice:

-   I was able to find the resource aliases via Get-AzPolicyAlias -ResourceTypeMatch ‘servers/firewallRules’ -NamespaceMatch ‘Microsoft.Sql’
-   mode is set to All as this resource does not support tags or location
-   The effect can be chosen via parameter
-   In case you need to allow specific IP address rather range the IP address needs to be in both list of addresses

It is important to note that a policy to audit if specific rule exists is available on [GitHub](https://github.com/Azure/azure-policy/blob/master/samples/SQL/audit-sql-server-firewall-rule/azurepolicy.json). That policy will only monitor if the rule for specific range exists but you cannot enforce it like the example above as it has auditIfNotExists effect.
