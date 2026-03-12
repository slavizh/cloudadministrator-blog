---
title: "Go with the Cloud’s Native Management"
excerpt: "Lately I have seen some questions and discussions that I have also been involved around which management services/tools should be used when you are doing multi-cloud. Before diving into that area l…"
description: "Lately I have seen some questions and discussions that I have also been involved around which management services/tools should be used when you are doing mul..."
pubDate: 2019-04-23
updatedDate: 2019-04-23
heroImage: "/media/wordpress/2019/04/management-capabilities.png"
sourceUrl: "https://cloudadministrator.net/2019/04/23/go-with-the-clouds-native-management/"
tags: 
  - "AWS"
  - "Azure"
  - "Azure Governance"
  - "Azure Management"
  - "Google Cloud"
  - "Hybrid Cloud"
  - "ARM"
  - "Azure Automation"
  - "Azure Monitor"
  - "Azure Operational Insights Preview"
  - "Azure Policy"
  - "Azure Resource Manager"
  - "Azure Security Center"
  - "Azure Site Recovery"
  - "Governance"
  - "Log Analytics"
  - "Update Management"
  - "Multi Cloud"
---
![Credits to docs.microsoft.com](/media/wordpress/2019/04/management-capabilities.png)

*Azure Management*

Lately I have seen some questions and discussions that I have also been involved around which management services/tools should be used when you are doing multi-cloud. Before diving into that area let’s first dive into the multi-cloud thingy. RightScale has report for year 2019 called [STATE OF THE CLOUDREPORT](https://media.flexera.com/documents/rightscale-2019-state-of-the-cloud-report-from-flexera.pdf) that give us what is the current state of companies in that area. If we look at the report we will see that multi-cloud strategy is rising but if we look in the details the strategy of having multiple public or private clouds is actually starting to decline, slightly but still decline. I think that decline will continue over the next years. For me it makes sense if you have the bigger part of your cloud workloads in a single public cloud and may be some small part into another public cloud. My opinion is that it is better to put your bets into a single public cloud. I do not think there are much of benefits if you do multi-public cloud strategy. As for putting workloads on-premises the hybrid cloud strategy I think will be still valid at least for the next 10 years. With that said never the less there are still companies that have multi-cloud strategy with multiple public clouds. And this brings us back to our topic. You have probably heard similar questions like:

-   If I am using AWS and Azure should I go with Terraform for both or should I use CloudFormaton for AWS and ARM templates for Azure?
-   If I use Azure and Google Cloud should I use something like RedLock just because google does not have policy service?
-   Should I use Stackdriver to monitor my resources in both Azure and Google Cloud?

The list of the questions just goes on and on. Before proceeding of expressing my own opinion I would like to say I do not have anything personal against any of these products/services nor the intent of this blog post is to shame them. I am sure they are all pretty good and have their own strengths. To answer the above questions I think you should go with the management services that are from the cloud where your resources are. To clarify this here are little examples:

-   If you have resources both in Azure and Google Cloud, monitor the Azure resources with Azure Monitor and monitor the Google Cloud resources with Stackdriver.
-   Govern your Azure resources with Azure Policy and not with third party just because Google Cloud does not have such service. For Google Cloud you can go with third party tool but do not abandon Azure Policy.
-   If you are deploying to Azure use ARM templates, if you are deploying to AWS use CloudFormation. Do not go with third party like Terraform for both.

There are a lot of more examples that can be given but I think from the above you can grasp the pattern.

So why I recommend this approach? It is simple. The management services in their respective clouds will always offer the best experience. For example if we take Azure Policy there is no way that a third party can offer such kind of experience. Azure Policy is embedded within ARM and will govern your resources no matter if you use ARM Templates, Azure CLI, Az PowerShell or language SDK to deploy your resources. ARM templates would always provide the latest what is available in Azure as resources so you do not have to wait for Terraform to provide support for that resource or that property. It is important to understand although all these cloud providers they try to have matching services the services itself are very different so you will never achieve something like one code that can deploy to multiple clouds or service that can represents multiple clouds the same way. With servers it is easy to abstract them and there are a lot of tools and services that will work equally fine when you use them among different clouds but once you go above IaaS that is no longer the case. With these kind of approach I see 3 major benefits:

-   You can innovate better instead of waiting the third party tools/services to provide support for new things that come from the cloud
-   Your management services are along your resources giving you better experience
-   You can take advantage of certain features that you just cannot receive from third parties due to the native management services being able to embed deep within the cloud.

Of course with every rule there could always be exceptions and I have lured to some with IaaS but before deciding to make exception you must really weigh in is it worth it making it. Also when you are looking for management services/tools to adopt always make sure they have these two requirements:

-   Are they offered as server software that you need to support or as SaaS? – I would always choose SaaS.
-   Do they allow for Hybrid scenarios? – I would always choose tools that have and invest in Hybrid.

If you know me I like to focus more on technical blogs but sometimes I think I need to address my opinion especially when I see it is shared by others as well. I hope no matter if you agree with the above or not you will find it valuable.
