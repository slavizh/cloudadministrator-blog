---
title: "Azure Policy for Sending Azure Activity Logs"
excerpt: "One of my blog readers has asked me about policy for sending Azure Activity logs to Log Analytics. As I have [written before]( this is now possible via diagnostic settings at subscription level and…"
description: "One of my blog readers has asked me about policy for sending Azure Activity logs to Log Analytics. As I have [written before]( this is now possible via diagn..."
pubDate: 2020-09-29
updatedDate: 2020-09-29
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2020/09/29/azure-policy-for-sending-azure-activity-logs/"
tags: 
  - "ARM Templates"
  - "Azure"
  - "Azure Log Analytics"
  - "ARM"
  - "Azure Policy"
  - "Log Analytics"
  - "Azure Policy"
---
One of my blog readers has asked me about policy for sending Azure Activity logs to Log Analytics. As I have [written before](/2019/12/03/send-subscription-activity-logs-via-arm-template/) this is now possible via diagnostic settings at subscription level and thus is easier to make this into policy.

Below you can find the policy I came up with which you can deploy with ARM Template on subscription level. Note that the mode of the policy definition is All so it can cover the subscription resource. Another interesting thing is that the existence scope and deployment scope are both at subscription level. The condition is more complex as it looks if the diagnostic settings are configured for specific Log Analytics workspace and that all activity logs are send. When we do the policy assignment note that we also do role assignment. We are giving contributor permissions on subscription level to the policy assignment managed identity. Not also that role assignments can have description.

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceResourceId": {
            "type": "string",
            "metadata": {
                "description": "The resource ID of Log Analytics workspace."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "policyDefinitions": "2020-03-01",
            "policyAssignments": "2020-03-01",
            "roleAssignments": "2020-04-01-preview"
        }
    },
    "resources": [
        {
            "name": "[guid('diagnostic-settings-subscription')]",
            "type": "Microsoft.Authorization/policyDefinitions",
            "apiVersion": "[variables('apiVersions').policyDefinitions]",
            "properties": {
                "displayName": "Deploy Diagnostic Settings for Subscriptions",
                "description": "Deploys diagnostic settings for subscription activity logs to be send to Log Analytics workspace.",
                "policyType": "Custom",
                "mode": "All",
                "metadata": {
                    "category": "Monitoring",
                    "authoredBy": "Stanislav Zhelyazkov"
                },
                "parameters": {
                    "effect": {
                        "type": "String",
                        "metadata": {
                            "displayName": "Effect",
                            "description": "Enable or disable the execution of the policy"
                        },
                        "allowedValues": [
                            "DeployIfNotExists",
                            "Disabled"
                        ],
                        "defaultValue": "DeployIfNotExists"
                    },
                    "profileName": {
                        "type": "String",
                        "metadata": {
                            "displayName": "Profile name",
                            "description": "The diagnostic settings profile name"
                        },
                        "defaultValue": "setbypolicy_logAnalytics"
                    },
                    "logAnalytics": {
                        "type": "String",
                        "metadata": {
                            "displayName": "Log Analytics workspace",
                            "description": "Select Log Analytics workspace from dropdown list. If this workspace is outside of the scope of the assignment you must manually grant 'Log Analytics Contributor' permissions (or similar) to the policy assignment's principal ID.",
                            "strongType": "omsWorkspace",
                            "assignPermissions": true
                        }
                    }
                },
                "policyRule": {
                    "if": {
                        "field": "type",
                        "equals": "Microsoft.Resources/subscriptions"
                    },
                    "then": {
                        "effect": "[[parameters('effect')]",
                        "details": {
                            "type": "Microsoft.Insights/diagnosticSettings",
                            "existenceCondition": {
                                "allOf": [
                                    {
                                        "field": "Microsoft.Insights/diagnosticSettings/workspaceId",
                                        "equals": "[[parameters('logAnalytics')]"
                                    },
                                    {
                                        "count": {
                                            "field": "Microsoft.Insights/diagnosticSettings/logs[*]",
                                            "where": {
                                                "allof": [
                                                    {
                                                        "field": "Microsoft.Insights/diagnosticSettings/logs[*].Category",
                                                        "in": [
                                                            "Administrative",
                                                            "Security",
                                                            "ServiceHealth",
                                                            "Alert",
                                                            "Recommendation",
                                                            "Policy",
                                                            "Autoscale",
                                                            "ResourceHealth"
                                                        ]
                                                    },
                                                    {
                                                        "field": "Microsoft.Insights/diagnosticSettings/logs[*].Enabled",
                                                        "equals": "True"
                                                    }
                                                ]
                                            }
                                        },
                                        "Equals": 8
                                    }
                                ]
                            },
                            "existenceScope": "subscription",
                            "roleDefinitionIds": [
                                "/providers/microsoft.authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
                            ],
                            "deploymentScope": "subscription",
                            "deployment": {
                                "location": "westeurope",
                                "properties": {
                                    "mode": "incremental",
                                    "template": {
                                        "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                                        "contentVersion": "1.0.0.0",
                                        "parameters": {
                                            "logAnalytics": {
                                                "type": "string"
                                            },
                                            "profileName": {
                                                "type": "string"
                                            }
                                        },
                                        "variables": {},
                                        "resources": [
                                            {
                                                "type": "Microsoft.Insights/diagnosticSettings",
                                                "apiVersion": "2017-05-01-preview",
                                                "name": "[[parameters('profileName')]",
                                                "location": "Global",
                                                "dependsOn": [],
                                                "properties": {
                                                    "workspaceId": "[[parameters('logAnalytics')]",
                                                    "logs": [
                                                        {
                                                            "category": "Administrative",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "Security",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "ServiceHealth",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "Alert",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "Recommendation",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "Policy",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "Autoscale",
                                                            "enabled": "True"
                                                        },
                                                        {
                                                            "category": "ResourceHealth",
                                                            "enabled": "True"
                                                        }
                                                    ]
                                                }
                                            }
                                        ],
                                        "outputs": {}
                                    },
                                    "parameters": {
                                        "logAnalytics": {
                                            "value": "[[parameters('logAnalytics')]"
                                        },
                                        "profileName": {
                                            "value": "[[parameters('profileName')]"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "dependsOn": [
                "[resourceId('Microsoft.Authorization/policyDefinitions', guid('diagnostic-settings-subscription'))]"
            ],
            "name": "[guid('diagnostic-settings-subscription')]",
            "type": "Microsoft.Authorization/policyAssignments",
            "apiVersion": "[variables('apiVersions').policyAssignments]",
            "location": "[deployment().location]",
            "identity": {
                "type": "SystemAssigned"
            },
            "properties": {
                "displayName": "Deploy Diagnostic Settings for Subscriptions",
                "description": "Deploys diagnostic settings for subscription activity logs to be send to Log Analytics workspace.",
                "scope": "[subscription().id]",
                "policyDefinitionId": "[resourceId('Microsoft.Authorization/policyDefinitions', guid('diagnostic-settings-subscription'))]",
                "parameters": {
                    "logAnalytics": {
                        "value": "[parameters('logAnalyticsWorkspaceResourceId')]"
                    }
                }
            }
        },
        {
            "dependsOn": [
                "[resourceId('Microsoft.Authorization/policyDefinitions', guid('diagnostic-settings-subscription'))]",
                "[resourceId('Microsoft.Authorization/policyAssignments', guid('diagnostic-settings-subscription'))]"
            ],
            "name": "[guid('diagnostic-settings-subscription')]",
            "type": "Microsoft.Authorization/roleAssignments",
            "apiVersion": "[variables( 'apiVersions' ).roleAssignments]",
            "properties": {
                "roleDefinitionId": "[concat( subscription().id, '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c' )]",
                "principalId": "[reference(resourceId( 'Microsoft.Authorization/policyAssignments', guid('diagnostic-settings-subscription')), variables( 'apiVersions' ).policyAssignments, 'Full').identity.principalId]",
                "principalType": "ServicePrincipal",
                "description": "Assigned by Azure Policy"
            }
        }
    ],
    "outputs": {}
}
```

After making this policy I have noticed that there is another one similar to mine also available at [Enterprise-Scale architecture](https://github.com/Azure/Enterprise-Scale/blob/422c944d5d3b54502486d497f31d6465aa3b56f8/docs/reference/adventureworks/armTemplates/auxiliary/policies.json#L1532). Both policies does the same but they have different rules for finding if the resource is compliant or not. You can of course modify any of both and customize it to your liking.

The example is available also at [GitHub](https://github.com/slavizh/ARMTemplates/blob/master/policies/diagnostic-settings/subscription-activity-log.json)

I hope this was useful example for you!
