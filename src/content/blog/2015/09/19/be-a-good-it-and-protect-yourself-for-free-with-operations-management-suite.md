---
title: "Be A Good IT and Protect Yourself for Free with Operations Management Suite"
excerpt: "When I cover new Operations Management Suite features I do not just introduce them. I put them in a real world scenario so I can give you more value from reading my blog posts. Whether you are an I…"
description: "When I cover new Operations Management Suite features I do not just introduce them. I put them in a real world scenario so I can give you more value from rea..."
pubDate: 2015-09-19
updatedDate: 2015-09-21
heroImage: "/media/2015/09/image16.png"
sourceUrl: "https://cloudadministrator.net/2015/09/19/be-a-good-it-and-protect-yourself-for-free-with-operations-management-suite/"
tags: 
  - "Azure"
  - "Azure Operational Insights"
  - "Malicious IP"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "Protection"
  - "SCOM"
  - "Security"
  - "System Center Operations Manager"
  - "Wire Data"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "Windows"
  - "Windows Server 2016"
  - "Windows Servers 2012 R2"
  - "Wiredata"
---
When I cover new Operations Management Suite features I do not just introduce them. I put them in a real world scenario so I can give you more value from reading my blog posts. Whether you are an IT Pro, Dev or DevOps I hope you will find this blog post useful.  For the past several years there have been a numerous of public security breaches. Security has become even more important topic that everyone in the IT industry should care about no matter it is in personal life or at work. With this blog post I would like to introduce you to a solution that will help you stay more secure. Depends on the scale and features you use it can be free or you will be paying reasonable price. That solution is Operations Management Suite (MSOMS) and more specifically feature called [“Malcious IP” introduced a couple of weeks ago](http://blogs.technet.com/b/momteam/archive/2015/09/10/find-out-if-your-servers-are-talking-to-a-malicious-ip-address-with-operations-management-suite.aspx).

Malicious IP is enabled when one of the following solutions/features are used:

-   Firewall Logs
-   IIS Logs
-   WireData

But even if you use just one enough is sufficient to show results. Using more than one will give you results from different perspective.

Now as an IT you definitely have personal computer or work computer or may be both. If these machines are Windows 8.1 or higher you are good to go for using WireData solution on client. Operations Management Suite (OMS) has a [free tier](http://azure.microsoft.com/en-us/pricing/details/operational-insights/) which will give you the possibility to upload 500 MB of data every day to the service. That data will be retained for 7 days in the service. For the way we will use OMS to protect our PCs this free tier is perfect.

First we will start by creating OMS workspace with free tier. If you have Azure subscription you can do it trough the Azure Portal:

[![image](/media/2015/09/image16.png "image")](/media/2015/09/image16.png)

If you do not have Azure subscription do not worry. You can logon to the [OMS Portal](https://login.mms.microsoft.com/signin.aspx?ref=ms_mms) with Microsoft Account and create free tier there. It is super easy.

Now that you have logged to the OMS portal you can go to the Solutions Gallery and add Wire Data solution:

[![image](/media/2015/09/image17.png "image")](/media/2015/09/image17.png)

The next step is to install the Microsoft Management Agent and connect it to your newly created OMS workspace. For that purpose you need to go to Settings tile in OMS. There you will find link to download the agent for 32-bit windows or 64-bit windows operating system. On that page you will also see your OMS workspace ID and your Primary Key. Those are needed as input when you install the agent to connect it to your OMS workspace.

[![image](/media/2015/09/image18.png "image")](/media/2015/09/image18.png)

I’ve downloaded the agent and started the installation on my personal computer. I am using Windows 10 but as I’ve said it will work on 8.1 as well:

[![image](/media/2015/09/image19.png "image")](/media/2015/09/image19.png)

Make sure to select “Connect the agent to Microsoft Azure Operational Insights”:

[![image](/media/2015/09/image20.png "image")](/media/2015/09/image20.png)

Enter your workspace ID and Workspace Primary Key:

[![image](/media/2015/09/image21.png "image")](/media/2015/09/image21.png)

When the installation finishes successfully you are already uploading data to OMS:

[![image](/media/2015/09/image22.png "image")](/media/2015/09/image22.png)

In several minutes you will see data visible in OMS:

[![image](/media/2015/09/image23.png "image")](/media/2015/09/image23.png)

To be able to see data related for Malicious IP you will have to wait a couple of hours. I’ve waited and when I’ve executed the following query:

_\* | measure count() by MaliciousIP_

[![image](/media/2015/09/image24.png "image")](/media/2015/09/image24.png)

I was already seeing my computer communicating with a few IPs from the dark corners of Internet.

Now seeing that is normal. Seeing a lot more communication to such IPs and traffic going to them that is probably not normal and can signal that may be your machine is infected. With OMS you can dig deeper into the logs and see more information of course like the Process that is sending data to that IP and so on. I encourage you to explore it.

The beauty of this solution is that is free and it is uploading a very small amount of data to OMS. For around 12 hours my PC uploaded around 1.4 MBs to OMS:

[![image](/media/2015/09/image25.png "image")](/media/2015/09/image25.png)

So you can even attach more than one PC to your OMS workspace and monitor the traffic. With the search query syntax in OMS you can view data for different computers easily.

I encourage you to test this scenario and protect yourself with Operations Management Suite and why not even protect your company as well.
