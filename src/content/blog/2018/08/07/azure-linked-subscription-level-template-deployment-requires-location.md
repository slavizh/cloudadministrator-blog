---
title: "Azure Linked Subscription Level Template Deployment Requires Location"
excerpt: "Subscription Level Template deployments is relatively new feature. Support for Azure CLI was added in version and for AzureRM PowerShell module is yet to come. Basically instead of deploying resour…"
description: "Subscription Level Template deployments is relatively new feature. Support for Azure CLI was added in version and for AzureRM PowerShell module is yet to com..."
pubDate: 2018-08-07
updatedDate: 2018-10-03
heroImage: "/media/2018/08/sub-level-templates1.png"
sourceUrl: "https://cloudadministrator.net/2018/08/07/azure-linked-subscription-level-template-deployment-requires-location/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure CLI"
  - "Azure Resource Manager"
  - "AzureRM"
  - "Idempotence"
  - "PowerShell"
  - "Resources"
  - "Subscription Level"
  - "Template"
---
Subscription Level Template deployments is relatively new feature. Support for [Azure CLI was added in version 2.0.40](https://docs.microsoft.com/en-us/cli/azure/release-notes-azure-cli?toc=%2Fcli%2Fazure%2Ftoc.json&bc=%2Fcli%2Fazure%2Fbreadcrumb%2Ftoc.json&view=azure-cli-latest#july-3-2018-1) and for AzureRM PowerShell module is yet to come. Basically instead of deploying resources at resource group you are doing that at subscription level. This opens a lot of possibilities some of which are:

-   Ability to deploy subscription level resources like Policy Definitions, Policy Assignemnts, Azure Security Settings, etc.
-   Ability to create resource groups from ARM Template and deploy to them [Example](https://github.com/krnese/AzureDeploy/blob/master/ARM/deployments/rgCreate.json)
-   Orchestrate end to end deployments to multiple resource groups

When you are doing Azure subscription level template deployment either via Azure CLI or AzureRM in the future providing location as parameter is required. Think of location in this case as where the metadata of your template deployment will be located not where your resources. For example subscription level resources are global and they do not have location and resource group level resources can be in another region different from your template deployment. Just like how resource group can be located in region A and the resources within can be in region B. Same logic applies here. Imagine you have a scenario where you are deploying subscription level template but inside that template you are linking to another subscription level template. In such case you will need to provide location for that template deployment as well. Comparing to linked resource group level template that location property is not required. To make things clear let’s look at the following template:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "resourceGroupName": {
            "type": "string",
            "metadata": {
                "description": "The name of the resource group to be created."
            }
        },
        "resourceGroupLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of the resource group to be created."
            }
        },
        "storageAccountName": {
            "type": "string",
            "metadata": {
                "description": "The name of the storage account to be created."
            }
        },
        "deploymentLocation" : {
            "type": "string",
            "metadata": {
                "description" : "Location for subscription level deployment."
            }
        },
        "_artifactsLocation": {
            "type": "string",
            "metadata": {
                "description": "The location of resources, such as templates and DSC modules, that the template depends on."
            },
            "defaultValue": ""
        },
        "_artifactsLocationSasToken": {
            "type": "securestring",
            "metadata": {
                "description": "Auto-generated token to access _artifactsLocation."
            },
            "defaultValue": ""
        }
    },
    "variables":
        "templateUris" : {
            "storageAccount": "[concat(parameters('_artifactsLocation'),'/nestedtemplates/storageAccount.json', parameters('_artifactsLocationSasToken'))]",
            "policyAuditNonManagedDiskVM": "[concat(parameters('_artifactsLocation'),'/policies/compute/audit-non-managed-disk-vm.json', parameters('_artifactsLocationSasToken'))]"
        }
    },
    "resources": [
        {
            "name": "[parameters('resourceGroupName')]",
            "type": "Microsoft.Resources/resourceGroups",
            "apiVersion": "2018-05-01",
            "location": "[parameters('resourceGroupLocation')]",
            "properties": {}
        },
        {
            "name": "PolicyAuditNonManagedDiskVM",
            "type": "Microsoft.Resources/deployments",
            "apiVersion": "2018-05-01",
            "location" : "[parameters('deploymentLocation')]",
            "dependsOn": [
            ],
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[variables('templateUris').policyAuditNonManagedDiskVM]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                }
            }
        },
        {
            "name": "storageDeployment",
            "type": "Microsoft.Resources/deployments",
            "apiVersion": "2018-05-01",
            "resourceGroup": "[parameters('resourceGroupName')]",
            "dependsOn": [
                "[resourceId('Microsoft.Resources/resourceGroups/', parameters('resourceGroupName'))]"
            ],
            "properties": {
                "mode": "Incremental",
                "templateLink": {
                    "uri": "[variables('templateUris').storageAccount]",
                    "contentVersion": "1.0.0.0"
                },
                "parameters": {
                    "storageAccountName": {
                        "value": "[parameters('storageAccountName')]"
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

You will notice that we are deploying 3 resources with this template:

-   One resource group
-   A linked subscription Level deployment
-   A linked resource group level deployment

You will notice also that the links to the linked templates are constructed as variables. Notice how the subscription level template deployment and the resource group deployment have additional property location.

![Azure Subscription Level Deployment](/media/2018/08/sub-level-templates1.png)

*Azure Subscription Level Deployment*

With resource group location is part of its definition and for subscription level deployments it is the same. You can see that the third resource that is being deployment is deployed in a resource group and because of that we do not need location parameter for linked resource group level deployments.

I hope this tip was useful to you and encourage you to start trying subscription level deployments and why not in many cases replace your resource group level deployments with subscription level deployments. That for example will allow you to create the resource group via ARM template instead of doing that via PowerShell or Azure CLI. You can achieve even higher level of idempotence.
