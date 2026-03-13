---
title: "Azure Deployment Options"
excerpt: "Before Ignite 2018 Azure Resource Manager (ARM) and specifically ARM templates are the only deployment option available. I am excluding Azure CLI, AzureRM PowerShell, SDKs, etc. from this list of c…"
description: "Before Ignite 2018 Azure Resource Manager (ARM) and specifically ARM templates are the only deployment option available. I am excluding Azure CLI, AzureRM Po..."
pubDate: 2018-12-10
updatedDate: 2018-12-10
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/12/10/azure-deployment-options/"
tags: 
  - "ADM"
  - "ARM"
  - "Azure"
  - "Azure Blueprints"
  - "Azure Deployment Manager"
  - "Azure Resource Manager"
  - "JSON"
  - "Governance"
  - "Template"
---
Before Ignite 2018 Azure Resource Manager (ARM) and specifically ARM templates are the only deployment option available. I am excluding Azure CLI, AzureRM PowerShell, SDKs, etc. from this list of course. At Ignite 2018 Microsoft has announced two other options – [Azure Blueprints](https://azure.microsoft.com/en-us/services/blueprints/) and [Azure Deployment Manager (ADM)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/deployment-manager-overview). This blog will express my opinion on this matter. You are free to express your opinion as well and to disagree with me. I will not focus on comparing heavily those 3 nor trying to bash one service over another instead I will write the reasons why I think still Azure Resource Manager deployments should be your first choice as they are mine.

The most important thing that I want to clarify is that ARM is still the central deployment service for Azure. No matter if you are using Azure CLI, AzureRM PowerShell, SDKs, Azure Blueprints or Azure Deployment Manager they all use ARM API to do deployments or/and directly calling the Resource Provider (RP) APIs of the different services. In the simplest form you can think of Azure Blueprints and ADM as wrappers around ARM that offer some additional functionality. I also want to address the matter that some people will say that ARM template language has some limitations and other deployment options overcome those limitations easily. I agree with that but also will say the other deployment options also have their own limitations to overcome. As I’ve said before this blog post is not about comparing those in depth, nor is about forcing you to adopt my opinion. It is about laying off my thoughts why I choose ARM deployments.

Before explaining my choice of ARM Template deployments let’s briefly mention why Azure Blueprints and ADM are not options for me:

-   **ADM** – It addresses very specific type of deployment. Mainly around gradually rolling out deployment of multi-region application. This is achievable even without ADM but you have to use CI/CD. The benefit of placing such functionality out of CI/CD to ADM is that offers native Azure experience, your CI/CD might not be so powerful to offer the functionalities that are available in ADM, you might not have CI/CD at all, your roll out logic is also stored as code (although most CI/CD allows you to store your pipeline definitions as code already). To start deployment via the service you have a separate PS cmdlets. I will let you to read and try the service on your own to discover the service features in details.
-   **Azure Blueprints** – Addresses deployments related to compliance scenarios. I personally see the service more suitable for SMBs at this point due to the scenarios are mostly related to using the UI and template support is very limited to my opinion. To start the deployment you will have to use the RP REST API or Azure Portal UI.

If I have to compare those services to ARM template deployments ADM is more close to those because it uses a little bit more ARM deployments native approach without trying to create features that overlaps it. ADM is also very focused on resource group deployments. Azure Blueprints on the other hand I would say that it tries to overlap with some features in ARM deployments and it is focusing on both resource group and subscription level deployments. I would like to say that no matter if you choose any of these 3 deployments strongly consider using CI/CD as well.

Now back to ARM deployments. I think there was a time when ARM deployments weren’t producing much new features like functions, options, etc. but lately there were some notable improvements that have brought significant advantage. The most notable improvements I am talking about is subscription level deployment. If you are still stuck with resource group level deployments I would strongly advise you to look at subscription level deployments adoption. With those you can create the resource group directly within the template for example. So no more using PS or CLI to create that. Additionally this allows you to deploy some subscription level resource along with your resource group level ones. You can even deploy resource within multiple resource groups. The recommendation here though is still to limit your deployments per application/solution. Do not try to deploy resource from multiple application/solutions via single template deployment. As I’ve mentioned before ADM and Azure Blueprints both still use ARM template deployments so in Azure they are represented like regular Azure resource with their own RPs. So at the end you will still have to develop some ARM templates in order use those as well. For example with ADM you directly reference ARM templates and ARM template parameter files where with Azure Blueprints the ARM templates are uploaded to the service as artifacts. The latter creates a little bit complex approach if you try to deploy Azure Blueprints artifact that is ARM template via ARM template. You will have to experience it to understand it but overall you have ARM template that deploys Blueprint artifact resource. Within the properties of the resource you will have the ARM template that will be artifact. It becomes something like ARM template within ARM template similar to nested templates approach which I personally do not like and do not recommend to use. To be blunt I prefer linked templates instead of nested templates. For me linked templates allows more modular approach that I am used to when working with more complex languages. Because of the artifacts approach of Azure Blueprints more complex deployments are hard to achieve in my opinion or at least not in an easy way. Better way is to just take advantage of ARM deployments native features to allow complex deployments. On the other hand ADM is very scoped for specific scenario which makes it hard to use in general way. Due to those limitation and because of the latest changes in ARM template deployments I currently think that ARM templates is the best way to go in most cases. Other features that are the reason to use ARM deployments are:

-   Idempotent deployment
-   Passing complex objects to deployments
-   Declarative model
-   RP API versioning control
-   Parallel deployments with minimal effort on code writing

There are many more of course but these are the most important to me. Of course some of the other options provide some of these but I feel like for me ARM deployments provide the most important suitable for my needs. To be honest both ADM and Azure Blueprints provide some features that I like and are not present in pure ARM deployments but due to immaturity of the services and the scenarios they offer are currently not relevant to me. For me first choice is always ARM deployments.

As a summary I would like to see ADM, Blueprints and ARM as one service or at least ARM taking the lead of deployments and Blueprints and ADM being more of a helper services that integrate tightly with ARM where ARM is the only point for doing deployment and the helper services are used/referenced within the ARM template definition or deployment command. Also I would like to see those services more tightly integrated with CI/CD and I do not mind some overlapping with CI/CD as long as the integration with it is also better.

I hope this blog post was useful and has helped you to understand my thinking around this topic!
