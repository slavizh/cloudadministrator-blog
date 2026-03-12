---
title: "Audit Tags on Azure Subscriptions"
excerpt: "I have been away for a while but now I am back again. As always this blog post will cover Azure services, particularly Azure subscriptions, tags, Azure Policy and ARM Templates. Azure recently intr…"
description: "I have been away for a while but now I am back again. As always this blog post will cover Azure services, particularly Azure subscriptions, tags, Azure Polic..."
pubDate: 2020-09-02
updatedDate: 2020-09-02
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2020/09/02/audit-tags-on-azure-subscriptions/"
tags: []
---
I have been away for a while but now I am back again. As always this blog post will cover Azure services, particularly Azure subscriptions, tags, Azure Policy and ARM Templates.

Azure recently introduced the possibility to assign tags on Azure Subscriptions. Currently the full support for that is still in progress but there are few things possible currently like:

-   [Assigning tags on subscriptions via ARM templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources#apply-tags-to-resource-groups-or-subscriptions?WT.mc_id=AZ-MVP-5000120)
-   Assigning tags on subscriptions via Portal

This of course let me to think if we can audit the tags on subscriptions. We already have policies for auditing tags on [resources and resource groups](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/tag-policies?WT.mc_id=AZ-MVP-5000120). Looking at those policies it was easy to figure out what the policy for auditing the tags on subscriptions would be. I have created [such one that can be deployed via ARM template](https://github.com/slavizh/ARMTemplates/blob/master/policies/tags/audit-subscription-tags.json):

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "tagName": {
            "type": "string",
            "metadata": {
                "description": "The name of the tag to audit"
            }
        },
        "enforcementMode": {
            "type": "string",
            "defaultValue": "DoNotEnforce",
            "allowedValues": [
                "Default",
                "DoNotEnforce"
            ],
            "metadata": {
                "description": "The policy assignment enforcement mode. Possible values are Default and DoNotEnforce."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "policyDefinitions": "2019-09-01",
            "policyAssignments": "2019-09-01"
        }
    },
    "resources": [
        {
            "name": "[guid('tag-on-subscription')]",
            "type": "Microsoft.Authorization/policyDefinitions",
            "apiVersion": "[variables('apiVersions').policyDefinitions]",
            "properties": {
                "displayName": "Require a tag on subscription",
                "policyType": "Custom",
                "mode": "All",
                "description": "Enforces existence of a tag on subscription.",
                "metadata": {
                    "category": "Tags",
                    "version": "1.0.0"
                },
                "parameters": {
                    "tagName": {
                        "type": "string",
                        "metadata": {
                            "description": "Name of the tag, such as 'environment'",
                            "displayName": "Tag Name"
                        }
                    }
                },
                "policyRule": {
                    "if": {
                        "allOf": [
                            {
                                "field": "type",
                                "equals": "Microsoft.Resources/subscriptions"
                            },
                            {
                                "field": "[[concat('tags[', parameters('tagName'), ']')]",
                                "exists": "false"
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
            "dependsOn": [
                "[resourceId('Microsoft.Authorization/policyDefinitions', guid('tag-on-subscription'))]"
            ],
            "name": "[guid('tag-on-subscription')]",
            "type": "Microsoft.Authorization/policyAssignments",
            "apiVersion": "[variables('apiVersions').policyAssignments]",
            "location": "[deployment().location]",
            "properties": {
                "displayName": "Require a tag on subscription",
                "description": "Enforces existence of a tag on subscription.",
                "scope": "[subscription().id]",
                "policyDefinitionId": "[resourceId('Microsoft.Authorization/policyDefinitions', guid('tag-on-subscription'))]",
                "enforcementMode": "[parameters('enforcementMode')]",
                "parameters": {
                    "tagName": {
                        "value": "[parameters('tagName')]"
                    }
                }
            }
        }
    ],
    "outputs": {}
}
```

The template above is deployed at subscription level to the subscription you want to audit. It will create one policy assignment but you can modify it to create multiple ones if you need to audit the existence of more then one tag. The template can also be modified to be deployed on management group level if you prefer that. Azure Policy also provides some policies to add and replace tags if they are missing but unfortunately such ones currently do not work on subscriptions as resource. I suspect that in the next months we will see this being possible as well.

I hope this was useful for you!
