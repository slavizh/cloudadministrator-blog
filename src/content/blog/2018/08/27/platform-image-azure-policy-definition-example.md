---
title: "Platform Image Azure Policy Definition Example"
excerpt: "Azure Policy team has a GitHub repository of [Policy definitions examples]( Recently I’ve been looking at some of the examples there and I’ve noticed that one of them was not working co…"
description: "Azure Policy team has a GitHub repository of [Policy definitions examples]( Recently I’ve been looking at some of the examples there and I’ve noticed that on..."
pubDate: 2018-08-27
updatedDate: 2018-10-03
heroImage: "/media/2018/08/image-sku.png"
sourceUrl: "https://cloudadministrator.net/2018/08/27/platform-image-azure-policy-definition-example/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure Policy"
  - "Azure Resource Manager"
  - "Compute"
  - "Definition"
---
Azure Policy team has a GitHub repository of [Policy definitions examples](https://github.com/Azure/azure-policy). Recently I’ve been looking at some of the examples there and I’ve noticed that one of them was not working correctly. Specifically I am referring to [Platform Image Policy](https://github.com/Azure/azure-policy/tree/master/samples/Compute/platform-image-policy). Additionally the example contains only the rules. It does not have ARM template for deploying the definition. You will notice also that the policy is pretty static as it does not contain parameters. Because of that based on that sample I would like to create an example on my own and show it to you.

Let’s first start by explaining what is not working and after that I will comment what other changes I’ve made. In the policy definition rule you will notice that we want only the latest image version to be allowed for deployment.

![Image SKU rule](/media/2018/08/image-sku.png)

If you try to deploy a machine the deployment will start and you will not get error that a policy is blocking it. That may signal to you that the policy is working but you are wrong. As soon as you start deployment and reach the actual VM deployment you will get an error like this:

![Platform Image Policy Error](/media/2018/08/platform-image-policy-error.png)

```json
{
  "status": "Failed",
  "error": {
    "code": "ResourceDeploymentFailure",
    "message": "The resource operation completed with terminal provisioning state 'Failed'.",
    "details": [
      {
        "code": "RequestDisallowedByPolicy",
        "message": "Resource 'UB004_OsDisk_1_279de820ed0642e69de6cac28e011c24' was disallowed by policy. Policy identifiers: '[{\"policyAssignment\":{\"name\":\"Test servers 5\",\"id\":\"/subscriptions/XXXXXXXXXXXXXXXX/resourceGroups/TestVM6/providers/Microsoft.Authorization/policyAssignments/dccd7d6e657e44dca8885858\"},\"policyDefinition\":{\"name\":\"Test servers 5\",\"id\":\"/subscriptions/XXXXXXXXXXXXXX/providers/Microsoft.Authorization/policyDefinitions/390a3f4c-2f01-407c-abaf-eb453eafa3e0\"}}]'.  Target: '/subscriptions/XXXXXXXXXXXXXXXXXX/resourceGroups/TestVM6/providers/Microsoft.Compute/disks/UB004_OsDisk_1_279de820ed0642e69de6cac28e011c24'."
      }
    ]
  }
}
```

My opinion is that this is a bug and Azure Policy team needs to fix it. Basically besides specifying only **latest** as image SKUs you will have to specify the actual version of the latest SKU. For example:

```json
...
{
    "field": "Microsoft.Compute/imageVersion",
    "in": [
        "latest",
        "20180827082810"
    ]
}
...
```

For me such approach does not make sense because you will have to update that policy every month at least, may be even more by adding the latest version. Imagine doing that for at least 10 images. You will also have to create some automation just to get notified that there is a new latest version. It is a nightmare to maintain. Also policies should prevent you in advance if you are not allowed to do something and after the deployment has started. Because of that I think that this is a bug on the policy. Taking that into consideration here are the changes I want to make:

-   Remove the specification for imageVersion
-   parameterize imagePublisher, imageOffer and imageSKU
-   Put the policy definition into ARM template for deployment

The end result I came up with is this:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
    },
    "variables": {
        "singleQuote": "'",
        "imagePublishers" : "[concat('[parameters(', variables('singleQuote'), 'imagePublishers', variables('singleQuote'), ')]')]",
        "imageOffers" : "[concat('[parameters(', variables('singleQuote'), 'imageOffers', variables('singleQuote'), ')]')]",
        "imageSkus" : "[concat('[parameters(', variables('singleQuote'), 'imageSkus', variables('singleQuote'), ')]')]"
    },
    "resources": [
        {
            "type": "Microsoft.Authorization/policyDefinitions",
            "name": "platform-image-policy",
            "apiVersion": "2018-03-01",
            "properties": {
                "displayName": "Only allow a certain VM platform image",
                "policyType": "Custom",
                "mode": "All",
                "description": "This policy ensures that only UbuntuServer, Canonical is allowed from the image repository",
                "metadata" : {
                    "category" : "Compute"
                },
                "parameters": {
                    "imagePublishers": {
                        "type": "array",
                        "metadata": {
                            "description": "Provide an array of image Publishers.",
                            "displayName" : "Image Publishers List"
                        }
                    },
                    "imageOffers": {
                        "type": "array",
                        "metadata": {
                            "description": "Provide an array of image Offers.",
                            "displayName" : "Image Offers List"
                        }
                    },
                    "imageSkus": {
                        "type": "array",
                        "metadata": {
                            "description": "Provide an array of image SKUs.",
                            "displayName" : "Image SKUs List"
                        }
                    }
                },
                "policyRule": {
                    "if": {
                        "allOf": [
                            {
                                "field": "type",
                                "in": [
                                    "Microsoft.Compute/disks",
                                    "Microsoft.Compute/virtualMachines",
                                    "Microsoft.Compute/VirtualMachineScaleSets"
                                ]
                            },
                            {
                                "not": {
                                    "allOf": [
                                        {
                                            "field": "Microsoft.Compute/imagePublisher",
                                            "in": "[variables('imagePublishers')]"
                                        },
                                        {
                                            "field": "Microsoft.Compute/imageOffer",
                                            "in": "[variables('imageOffers')]"
                                        },
                                        {
                                            "field": "Microsoft.Compute/imageSku",
                                            "in": "[variables('imageSkus')]"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "then": {
                        "effect": "deny"
                    }
                }
            }
        }
    ],
    "outputs": {
    }
}
```

Note that I am using the same approach for parameterizing as in my blog post [Defining Input Parameters For Policy Definitions in ARM Template](/2018/07/17/defining-input-parameters-for-policy-definitions-in-arm-template/).

After that when the policy definition is deployed it is easy to assign and change values depending on your scenario.

![Platform Image Policy Assignment](/media/2018/08/final-platform-image-policy.png)

I hope this helps! Happy policing!
