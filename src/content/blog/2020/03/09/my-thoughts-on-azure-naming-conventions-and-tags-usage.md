---
title: "My Thoughts on Azure Naming Conventions and Tags Usage"
excerpt: "In IT naming of resources has been around for quite some time. In some of the early days IT personal was using super hero names, constellation names, etc. to name their servers. That was when the n…"
description: "In IT naming of resources has been around for quite some time. In some of the early days IT personal was using super hero names, constellation names, etc. to..."
pubDate: 2020-03-09
updatedDate: 2020-03-09
heroImage: "/media/wordpress/2020/03/all-resources.png"
sourceUrl: "https://cloudadministrator.net/2020/03/09/my-thoughts-on-azure-naming-conventions-and-tags-usage/"
tags: 
  - "ARM Templates"
  - "Azure"
  - "Azure Management"
  - "Azure Policy"
  - "Naming Convention"
  - "ARM"
  - "Cost Management"
  - "Governance"
  - "Tags"
---
In IT naming of resources has been around for quite some time. In some of the early days IT personal was using super hero names, constellation names, etc. to name their servers. That was when the number of servers count was equal or less than your fingers. Over the years the number of servers has went up which required using naming convention. Another need for the naming convention was also the different role each server had. Of course with the coming of the cloud the result is that even more resource started to be generated. Strangely though we haven’t changed much our guidelines for naming resources much compared to how we did it on-premises. But may be it is time to change them?

Often in my work I am asked different questions around Azure naming conventions and tags usage which I will try to address in the bullets below:

-   Don’t use prefix or suffix values that indicate the resource type in the name of resource. Microsoft actually recommends to use [prefixes and suffixes](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging) but I think they very wrong on this. The usage of some prefix or suffix for the resource type comes from legacy naming convention where we had mostly servers and network devices as resource. Because the server could be SQL or front end for some web application people were putting these prefixes or suffixes to know what is the role of the server. For example: sqlappb001. I do not know why this was brought to the cloud but with some of the recent innovations in Azure this is useless for the following reasons:
    -   Azure has this service called [Resource Graph](https://docs.microsoft.com/en-us/azure/governance/resource-graph/overview). It can give you instant information for almost any resource. I say any as there are still some resources that are not supported but at least those that are related to some usage data are. By using resource graph you can get the type of the resource, location and basically any property of the configuration for that resource. On top of that Azure Resource Graph now powers almost any view in Azure Portal that lists resource. Just go to All resource view and see how you can filter and group by type, location, resource group, etc. And if that is not enough just open Resource Graph blade and make your own query. Those queries you can use in Azure Dashboards and workbooks.

![](/media/wordpress/2020/03/all-resources.png)

*All resources grouped and filtered*

-   Prefix and suffixes are inconsistent. Different Azure resources have different rules for allowed characters in names. For example storage accounts have some specific restrictions that are very different from most resources: lower case names only, cannot use ‘-‘, etc. Even the official Microsoft document recommendations does not provide consistency as for VMs example is ‘vm’ prefix and for VM scale set ‘vmss-‘ prefix. It becomes complete mess if you ask me.
    -   Some resources have name and display name as options. In those cases for example the name will be some GUID that is unique and the display name will be how the resource will be viewed in Azure Portal. Such example is Log Alerts.
    -   If you need some additional information to be added to the resource just use tags. Tags has come a long way where they are now basically in any place in the portal so you can easily manage them, group by tags, filter, etc.
    -   Some resource names are also visible public. For example the name of Azure SQL server is something that is used to connect to Azure SQL Database. By having information like the resource type in the name you are exposing that information. It is not so big security risk but it is good to hide as many information as you can for your resources from public. Of course the Azure SQL server might not be exposed publicly at all but still attack can come from inside as well.
    -   This applies even for resource groups. Resource groups support tags and are also in Resource Graph.
    -   Every time a new service is developed in Azure you will have to add new prefix/suffix to your naming convention. That sounds easy but in reality not many companies will act upon such changes in time.
-   Use tags. With tags you can put so many metadata information for your resources. I already mentioned that the tags experience is significantly improved so you do not have excuse to not use them. Tags are not just for using it with Cost Management. Even if tags get wiped out or modified intentionally or unintentionally you have [Change History in Activity Log](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/activity-log-view#view-change-history) to track those.
-   You can still have naming convention. For sure naming conventions should not go away, just be careful on what information you put for resource in the naming convention. For sure have naming convention for subscriptions. Recommended is also for resources that usually are associated with some cost data. For example you would not put some naming convention on diagnostics settings resource or VM extension resource.
    -   for subscription names – I would recommend to put some information about the environment (like TST, PRD, etc.), for the application or team/department (Finance, HR, etc.). Some numbers at the end when you need to have the same name of two or more subscriptions.
    -   for other resources – I would recommend the name of the application or team/department to be added. Try to use abbreviations and not expose the full names. Numbers also should be added for resources that might have similar names.
-   Set some rules for tag names. As name of tag can be just one word or more I usually recommend some rules as using camelCase syntax. Some examples: environment, costCenter, serviceOwner, etc. Avoid using abbreviations in tag names.
-   Set some rules for tag values. The rules for tags values can be less restricted than tag names but still set some to avoid multiple values that are different in writing but the same in meaning like: prd, PRD, PROD, Production, etc. It is important to set some standard if you will use white spaces or not in values, if you will use only upper cases, lower cases or mixed, etc.
-   Do not try to set tag rules that apply to multiple clouds. Different clouds offer similar services but there are differences on how these services work from cloud to cloud. Also limits on tag names and tag values might be different between clouds. For example Google Cloud (GCP) has labels instead of tags and those have quite odd limits (thanks to my friend [Tao Yang](https://twitter.com/MrTaoYang) for the tip).
-   Ways to apply tags. There are different ways to apply tags but the order should be the following:
    -   Apply them from deployment. Deploy your resources via code (for example ARM Templates) and apply tags from resource creation trough the whole life-cycle of the resource.
    -   Use Azure Policy. There could be some subscriptions where tags cannot be apply from deployment like Dev/Test ones. In those cases make sure that tags are applied at least with Azure Policy. In any case Azure Policy is a must go to monitor tag compliance

So these are some of my recommendations that I want to share with you. Although I do not agree with Microsoft on the prefix/suffix stuff the other information in their documentation is extremely useful to plan your naming convention and tagging. Feel free to provide some of your recommendations in the comments below. I hope this was helpful for you.
