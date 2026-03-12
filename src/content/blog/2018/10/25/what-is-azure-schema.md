---
title: "What is Azure Schema?"
excerpt: "Recently I’ve published blog post [Subscription Level Deployment Schema]( When I published it I was not aware that not so many people know what the schemas are used and needed for. With this …"
description: "Recently I’ve published blog post [Subscription Level Deployment Schema]( When I published it I was not aware that not so many people know what the schemas a..."
pubDate: 2018-10-25
updatedDate: 2018-10-25
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/10/25/what-is-azure-schema/"
tags: 
  - "ARM"
  - "ARM Tools"
  - "Azure"
  - "Azure Resource Manager"
  - "Deployment"
  - "Development"
  - "Resource Group"
  - "Schema"
  - "Subscription"
  - "VSC"
---
Recently I’ve published blog post [Subscription Level Deployment Schema](/2018/10/03/subscription-level-deployment-schema/). When I published it I was not aware that not so many people know what the schemas are used and needed for. With this blog post I want to address this.

Currently with Azure Resource Manager templates we have two deployment models:

-   Resource Group Level Deployment
-   Subscription Level Deployment

With Resource Group Level Deployment you do deployment of resources that reside in a resource group and with Subscription Level deployment you do deployment of resources that reside in a subscription (outside of resource group). Of course with subscription level deployment you can create resource group (subscription level resource) and start resource group level deployment via nested or linked templates. Also keep in mind that some resources are only resource group level or subscription level but there are some that can be both. For example Policy Definitions are only subscription level resource, SQL logical server is only resource group level resource and Policy assignments can be either subscription level or resource group level resource. This in short describes the differences between those deployments.

Now back to the schemas. The schemas basically describe the structure of the ARM template and ARM language (syntax and functions), what resources can be deployed and the structure of the resources definitions. It is important to note that when you deploy a template to the ARM service the ARM service does not reads that schema. The ARM services is already aware what is possible and not because it has contract with all Azure services and if something is not correct you will get error on validation or deployment depending on the error. The schema is useful when you use tools like [VSC](https://code.visualstudio.com/) and [Azure Resource Manager Tools extension](https://marketplace.visualstudio.com/items?itemName=msazurermtools.azurerm-vscode-tools) to have things like IntelliSense, warnings and errors on syntax. As we’ve mentioned before the two different deployment models have two different schema because the deployable resources will be different between those so you may have different IntelliSense, warnings and errors on the syntax. The two schemas inside them are also referencing other schemas that are specific to a resource provider. For example the schema for the Compute resource provider is referenced in the resource group deployment schema but not in the subscription deployment schema. That way we know that in resource group we can deploy only resources from Compute provider. All the schemas are available publicly [here](https://github.com/Azure/azure-resource-manager-schemas/tree/master/schemas). To be honest Microsoft hasn’t been keeping the schemas up to date to my opinion and sometimes even missing schemas for some resources. On top of that the ARM Tools extension does not seems to be working with the subscription level deployment schema. I am constantly trying to address these issues as I think these are essentials for proper ARM development and I hope that Microsoft will start to invest more in that direction. For example I see more and more resources being documented in [Azure REST API Reference site](https://docs.microsoft.com/en-us/rest/api/azure/).

I hope this helps you in your ARM development and understanding ARM better.
