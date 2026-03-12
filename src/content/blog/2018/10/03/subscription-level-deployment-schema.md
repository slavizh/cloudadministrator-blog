---
title: "Subscription Level Deployment Schema"
excerpt: "Not so long ago in Azure we only had resource group level deployment but a couple of months ago [subscription level deployments]( were implemented. On resource group level we deploy resources like …"
description: "Not so long ago in Azure we only had resource group level deployment but a couple of months ago [subscription level deployments]( were implemented. On resour..."
pubDate: 2018-10-03
updatedDate: 2018-10-03
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/10/03/subscription-level-deployment-schema/"
tags: 
  - "ARM"
  - "Azure"
  - "Azure Resource Manager"
  - "Deployment"
  - "Resource Group"
  - "Schema"
  - "Subscription"
  - "Template"
---
Not so long ago in Azure we only had resource group level deployment but a couple of months ago [subscription level deployments](https://docs.microsoft.com/en-us/azure/azure-resource-manager/deploy-to-subscription) were implemented. On resource group level we deploy resources like Azure VMs, Service Apps, Azure SQL databases, etc and on subscription level we deploy policy definitions and assignments, resource groups (yes they are resource as well), custom RBAC roles, etc. Because of that it the schema in the ARM templates for resource group and subscription level deployments is different. This is something I haven’t thought about it around the excitement of this new deployment method but my good friend [Kristian Nese](https://twitter.com/KristianNese) tipped me. So here are the schemas you should use depending on your deployment:

-   Resource Group level deployment –

    ```text
    https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#
    ```

-   Subscription level deployment –

    ```text
    https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#
    ```

Keep in mind that if from subscription level deployment you have started nested or linked template deployment to resource group, the linked or nested template will have resource group level deployment schema.

I hope this tip will be helpful for you.
