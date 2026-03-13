---
title: "Demystifying Azure Policies with ARM Templates"
excerpt: "In my blog post [Defining Input Parameters For Policy Definitions in ARM Template]( I’ve showed you how to use deploy policy definitions with parameters via ARM template. I didn’t descr…"
description: "In my blog post [Defining Input Parameters For Policy Definitions in ARM Template]( I’ve showed you how to use deploy policy definitions with parameters via..."
pubDate: 2018-08-30
updatedDate: 2018-11-12
heroImage: "/media/2018/08/policy_definition.png"
sourceUrl: "https://cloudadministrator.net/2018/08/30/demystifying-azure-policies-with-arm-templates/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure Policy"
  - "Azure Resource Manager"
  - "Policy Assignment"
  - "Policy Definition"
---
In my blog post [Defining Input Parameters For Policy Definitions in ARM Template](/2018/07/17/defining-input-parameters-for-policy-definitions-in-arm-template/) I’ve showed you how to use deploy policy definitions with parameters via ARM template. I didn’t described completely on why such workaround is needed but I think now it is good time to explain that as well. The topic is a little bit complex so I hope my explanation will help you understand it.

First need to explain some basics in order to dive into the topic. We can look at the time from deploying Policy definition from ARM template to actual policy being into affect in 3 stages:

-   The stage the Policy definition is being deployed via ARM template
-   The stage the Policy definition is deployed
-   The stage the Policy definition is started to work by creating Policy Assignment

It is essential to understand that Policy definition is not in effect until Policy Assignment is created for it. If not policy assignment is created the policy definition is just a resource that doesn’t do anything. Both policy definition and policy assignment can be created via ARM template so the policy definition can starts its effect seconds after it is created when the assignment is completed. When you create policy definitions it is best to create them dynamic is possible in a way that you do not hard code specific values in it but instead provide them as parameters that can be provided via the policy assignment. You can do that when you define the security rule in the policy definition. Here comes the complex part. Both ARM Templates and Policy Definitions rules support the same ARM template functions. You can find [ARM template function doc here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions). [Policy supported functions doc here](https://docs.microsoft.com/en-us/azure/azure-policy/policy-definition#policy-functions). You will notice that ARM templates support way more functions and policy definitions support only four functions:

-   parameters()
-   concat()
-   resourceGroup()
-   subscription()

Specifically for Policy definitions you can only use those functions in policyRules section of policy definition. When you create policy definition via Portal UI or via AzureRM Policy cmdlets you can use these functions in policy definitions directly because those experiences use direct calls to Azure Policy Resource provider (API) but when you have to use them in ARM template there is a challenge. The challenge is that ARM templates will try to interpreter the functions in policyRules during the deployment of the ARM template and we do not want that. Remember the 3 stages? When the Policy definition is deployed it needs contain those functions and not the result of the functions during the deployment. This is because when the policy definition is assigned that is the time those functions are used by the policy definition. To visualize this a bit. If you have part of a rule that is like this in ARM template:

```json
 "policyRule": {
            "if": {
                "allOf": [
                    {
                        "field": "type",
                        "equals": "Microsoft.Network/loadbalancers"
                    },
                    {
                        "not": {
                            "field": "Microsoft.Network/loadbalancers/sku.name",
                            "in": "[parameters('listOfAllowedSKUs')]"
                        }
                    }
                ]
            },
            "then": {
                "effect": "Deny"
            }
}
```

when the policy definition is deployed you will end with something like this:

```json
 "policyRule": {
            "if": {
                "allOf": [
                    {
                        "field": "type",
                        "equals": "Microsoft.Network/loadbalancers"
                    },
                    {
                        "not": {
                            "field": "Microsoft.Network/loadbalancers/sku.name",
                            "in": [
                                "value1",
                                "value2"
                            ]
                        }
                    }
                ]
            },
            "then": {
                "effect": "Deny"
            }
}
```

As you can see the policy definition will be hard-coded with values and you will not be able to assign them as parameters when you do policy assignment. To achieve parameterization with Policy definitions that are deployed via ARM template you somehow have to trick the ARM template deployment mechanism that you are not using ARM functions in policyRule section. That can be achieved by passing those parts where there are functions as simple strings. This I showed you in my previous blog post mentioned above. I will go further and show you another example that has a few new things compared to the last blog post. Let’s take [Use approved vNet for VM network interfaces](https://github.com/Azure/azure-policy/tree/master/samples/Network/vm-creation-in-approved-vnet) sample and create ARM template that will deploy both the policy but the definition as well:

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
            "apiVersion": "2018-03-01",
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
            "apiVersion": "2018-03-01",
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

After the deployment is done notice how my definition looks from the portal:

![Azure Policy Definition](/media/2018/08/policy_definition.png)

My functions are retained and not interpreted by the ARM template deployment. You can also see how the value from vNetId template parameter is passed to the virtualNetworkId parameter of the assignment.

![Azure Policy Assignment](/media/2018/08/policy_assignment.png)

In the ARM template you will notice a few more things:

-   We now have assignment also created via ARM template
-   The Assignment is passing a parameter to the defintion
-   The Assignment waits for the definition to be deployed
-   The assignment is scoped to the subscription
-   I am using the same method to pass the functions in policyRule but this time I am using two functions – concat() and parameters(). They both need to be passed as string in order to avoid being used by the ARM template deployment mechanism.

I hope this helps in explaining how Azure Policy works with ARM Template deployments.
