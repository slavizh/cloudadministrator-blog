---
title: "Deploying Azure Policy Definitions via ARM Template"
excerpt: "Lately you haven’t seen new blog posts by me due to diverting my community time and efforts towards Inside Azure Management book. As now I have finished most of my work on the book I can focu…"
description: "Lately you haven’t seen new blog posts by me due to diverting my community time and efforts towards Inside Azure Management book. As now I have finished most..."
pubDate: 2019-03-13
updatedDate: 2019-03-13
heroImage: "/media/wordpress/2019/03/deployed-policy-native.png"
sourceUrl: "https://cloudadministrator.net/2019/03/13/deploying-azure-policy-definitions-via-arm-template/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure Policy"
  - "CI CD"
  - "Configuration Management"
  - "Azure Resource Manager"
  - "Governance"
  - "Template"
---
Lately you haven’t seen new blog posts by me due to diverting my community time and efforts towards Inside Azure Management book. As now I have finished most of my work on the book I can focus again on blogging.

I very often work closely with the ARM team by giving them feedback and features like [Azure Resource Manager template language additions](https://azure.microsoft.com/en-us/updates/azure-resource-manager-template-language-additions/) are appearing because of that feedback and I am sure the feedback by many other MVPs, partners and customers. Because of that I never settle for workarounds where you can do something natively within ARM template. I have previously blogged about an issue with deploying Azure Policy definitions via ARM template:

-   [Defining Input Parameters For Policy Definitions in ARM Template](/2018/07/17/defining-input-parameters-for-policy-definitions-in-arm-template/)
-   [Demystifying Azure Policies with ARM Templates](/2018/08/30/demystifying-azure-policies-with-arm-templates/)

As Azure Policy grows in features that workaround became uglier and uglier so I have started to chase for native support more aggressively. Thankfully to [David Coulter](https://twitter.com/DCtheGeek) who tipped me that there is native support to escape ARM functions. You can read about the problem in the two articles above but the latest solution to this is very simple. When using ARM functions in policy rules we just need to put ‘\[‘ in front of the syntax. To demonstrate this let’s take the example from one of my blog posts. With the ugly workaround the ARM Template will look like this:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "vNetId": {
            "type": "string"
        }
    },
    "variables": {
        "singleQuote": "'",
        "virtualNetworkId" : "[concat('[concat(parameters(', variables('singleQuote') ,'virtualNetworkId', variables('singleQuote'), '),', variables('singleQuote'), '*', variables('singleQuote') ,')]')]"
    },
    "resources": [
        {
            "name": "vm-creation-in-approved-vnet-definition",
            "type": "Microsoft.Authorization/policyDefinitions",
            "apiVersion": "2018-05-01",
            "location": "West Europe",
            "properties": {
                "displayName" : "Use approved vNet for VM network interfaces",
                "policyType": "Custom",
                "mode": "All",
                "description" : "Use approved vNet for VM network interfaces",
                "parameters": {
                    "virtualNetworkId": {
                        "type": "string",
                        "metadata": {
                            "description": "Resource Id for the vNet",
                            "displayName": "vNet Id"
                        }
                    }
                },
                 "policyRule": {
                    "if": {
                        "allOf": [
                            {
                                "field": "type",
                                "equals": "Microsoft.Network/networkInterfaces"
                            },
                            {
                                "not": {
                                    "field": "Microsoft.Network/networkInterfaces/ipconfigurations[*].subnet.id",
                                    "like": "[variables('virtualNetworkId')]"
                                }
                            }
                        ]
                    },
                    "then": {
                        "effect": "deny"
                    }
                }
            }
        },
        {
            "name": "vm-creation-in-approved-vnet-assignment",
            "type": "Microsoft.Authorization/policyAssignments",
            "apiVersion": "2018-05-01",
            "location": "West Europe",
            "dependsOn": [
                "[resourceId('Microsoft.Authorization/policyDefinitions/', 'vm-creation-in-approved-vnet-definition')]"
            ],
            "properties": {
                "displayName" : "Use approved vNet for VM network interfaces",
                "description" : "Use approved vNet for VM network interfaces",
                "metadata" : {
                    "assignedBy" : "Admin"
                },
                "scope": "[subscription().id]",
                "policyDefinitionId": "[resourceId('Microsoft.Authorization/policyDefinitions', 'vm-creation-in-approved-vnet-definition')]",
                "parameters" : {
                    "virtualNetworkId" : {
                        "value": "[parameters('vNetId')]"
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

With the native support the above template will become:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "vNetId": {
            "type": "string"
        }
    },
    "variables": {},
    "resources": [
        {
            "name": "vm-creation-in-approved-vnet-definition",
            "type": "Microsoft.Authorization/policyDefinitions",
            "apiVersion": "2018-05-01",
            "location": "West Europe",
            "properties": {
                "displayName" : "Use approved vNet for VM network interfaces",
                "policyType": "Custom",
                "mode": "All",
                "description" : "Use approved vNet for VM network interfaces",
                "parameters": {
                    "virtualNetworkId": {
                        "type": "string",
                        "metadata": {
                            "description": "Resource Id for the vNet",
                            "displayName": "vNet Id"
                        }
                    }
                },
                 "policyRule": {
                    "if": {
                        "allOf": [
                            {
                                "field": "type",
                                "equals": "Microsoft.Network/networkInterfaces"
                            },
                            {
                                "not": {
                                    "field": "Microsoft.Network/networkInterfaces/ipconfigurations[*].subnet.id",
                                    "like": "[[concat(parameters('virtualNetworkId'), '*')]"
                                }
                            }
                        ]
                    },
                    "then": {
                        "effect": "deny"
                    }
                }
            }
        },
        {
            "name": "vm-creation-in-approved-vnet-assignment",
            "type": "Microsoft.Authorization/policyAssignments",
            "apiVersion": "2018-05-01",
            "location": "West Europe",
            "dependsOn": [
                "[resourceId('Microsoft.Authorization/policyDefinitions/', 'vm-creation-in-approved-vnet-definition')]"
            ],
            "properties": {
                "displayName" : "Use approved vNet for VM network interfaces",
                "description" : "Use approved vNet for VM network interfaces",
                "metadata" : {
                    "assignedBy" : "Admin"
                },
                "scope": "[subscription().id]",
                "policyDefinitionId": "[resourceId('Microsoft.Authorization/policyDefinitions', 'vm-creation-in-approved-vnet-definition')]",
                "parameters" : {
                    "virtualNetworkId" : {
                        "value": "[parameters('vNetId')]"
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

Specifically you should focus on these parts of the template:

![](/media/wordpress/2019/03/policy-arm-native.png)

*Azure Policy Nateively in ARM template*

As you can see we are using "\[" to escape the ARM template function. That way when deployed this will not be interpreted by ARM but when the deployed policy definition is used it will be:

![](/media/wordpress/2019/03/deployed-policy-native.png)

*Deployed policy definition*

This escaping becomes very useful in deployIfNotExists policies where you basically put ARM template within policy definitions. I hope this will help you in your ARM template deployments.
