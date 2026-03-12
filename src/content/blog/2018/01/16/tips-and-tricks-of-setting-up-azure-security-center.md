---
title: "Tips and Tricks of Setting up Azure Security Center"
excerpt: "Since Ignite 2017 Security & Compliance offering is now part of Azure Service Center service. Because of that some of the controls of that offering are moved to ASC but still the integration is…"
description: "Since Ignite 2017 Security & Compliance offering is now part of Azure Service Center service. Because of that some of the controls of that offering are moved..."
pubDate: 2018-01-16
updatedDate: 2018-01-16
heroImage: "/media/wordpress/2018/01/image.png"
sourceUrl: "https://cloudadministrator.net/2018/01/16/tips-and-tricks-of-setting-up-azure-security-center/"
tags: 
  - "Azure"
  - "Azure Security Center"
  - "Configuration"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Security"
  - "Security Compliance"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Security & Compliance"
  - "Security and Audit"
---
Since Ignite 2017 Security & Compliance offering is now part of Azure Service Center service. Because of that some of the controls of that offering are moved to ASC but still the integration is not complete at least to me. With this blog post I will focus on two of the ASC settings that you should set up when you start with ASC – Changing to another Log Analytics workspace and Security Events level (filtering).

**Changing to another Log Analytics workspace**

By default Azure Security Center creates Log Analytics workspace on its own. In many cases that is not customers want especially in enterprises. You can easily change that by going into Azure Security Center –> Security Policy –> <the name of the subscription> –> Data Collection.

[![image](/media/wordpress/2018/01/image.png "image")](/media/wordpress/2018/01/image.png)

Remember to pre-create the workspace so it can be visible. At the time of this writing the workspace needs to be in the same subscription for which you configure the policy. Keep in mind that when you click save you will be asked if the agents that may already be deployed to VMs in your subscription should re-connect to the new workspace. Click Yes when you are asked about this. The actual re-connection of agents actually takes some unknown time and also no data is being transferred from the default ASC workspace to the new one. Because of those two things you should not delete the default workspace right away. My recommendations is to wait 30 days so the data in the default workspace expires before proceeding with deletion. The Actual reconnection of agents depends on the number of your VM resources but it is safe to say that for around 2 days all agents should be connected to the new workspace. There are few more things to consider when you configure Data collection policy. In order to switch from Free to Standard pricing tier you will have to go to Azure Security Center –> Security Policy –> <the name of the Log Analytics Workspace> –> Pricing Tier. Notice that we configure this on Log Analytics workspace level rather subscription level. I believe that if you configure them on subscription policy level it works only if default workspace is selected instead of another.

[![image](/media/wordpress/2018/01/image1.png "image")](/media/wordpress/2018/01/image1.png)

Whether you are configuring with another workspace or the default one keep in mind that when you change to Standard tier you will have to go to the Log Analytics workspace and deploy both Security & Audit and Antimalware solutions when you have non-Azure machines. These two solutions are not deployed by default.

So these are the things you have to take into consideration when configuring another workspace for ASC.

**Security Events level (filtering)**

With Security and Audit solution we have a setting that we can configure the Security Events level which basically tells which security events should be ingested. By default the value is All Events and best practice is to set this to Common to avoid any overcharges. Keep in mind that there might be some additional settings that needs to be configured via local or group policy like AppLocker auditing but this blog post will not cover that. You can read about those in [Inside the Microsoft Operations Management Suite book](https://gallery.technet.microsoft.com/Inside-the-Operations-2928e342). To configure Security Events level there are two options here – from Azure Security Center or OMS Portal. Depending on the scenario you have you will have to choose one of them. OMS Portal covers all scenarios but as at some point in the future will be deprecated (this is personal view not statement by the Log Analytics/OMS product group at Microsoft) I suggest use Azure Portal when you can.

_Scenario 1: When you have selected another workspace_

For this scenario just go to Azure Security Center –> Security Policy –> <the name of the Log Analytics Workspace> –> Data collection. From there you can select the level and click Save.

[![image](/media/wordpress/2018/01/image2.png "image")](/media/wordpress/2018/01/image2.png)

Notice that we configure this on workspace level and not subscription level. Previously this option was also available on subscription level but lately it has disappeared at least in all of my subscriptions. I suspect because it was working only for the default workspace. When it was available if you have configured another workspace and you have selected Security Events level it would apply that setting on the default workspace rather on the selected one.

Scenario 2: When you are using the default ASC workspace

As I’ve mentioned you previously could configure that option from subscription level but now it is removed. Also the ASC UI does not list the default workspace along with your other workspaces. It only lists those that were not created by ASC. In this case there is no other way to configure this setting via ASC you will have to go to OMS Portal for that. Below are the steps to execute.

1\. Locate which is your default Log Analytics workspace created by ASC. You can read about it [here](https://docs.microsoft.com/en-us/azure/security-center/security-center-platform-migration#workspace).

2\. From Azure Portal by opening the Log Analytics workspace you have link to the OMS Portal. Click on it and login.

3\. If you haven’t deployed Security and Audit solution deployed it from the OMS Gallery.

4\. You will have to wait until you have some time until Security and Audit is is filled with some data. If you do not want to wait you can just access it via URL “https://<your workspace name>.portal.mms.microsoft.com/#Workspace/overview/Security and Audit/details/Security Settings/details/index?\_timeInterval.intervalDuration=86400”.

5\. From the UI configure the security events level and click Save.

[![image](/media/wordpress/2018/01/image3.png "image")](/media/wordpress/2018/01/image3.png)

I would guess over time this experience will be improved and it will be easier to setup Azure Security Center.

Pro tip: These configurations can be configured via ASC and Log Analytics APIs.

I hope this was helpful.
