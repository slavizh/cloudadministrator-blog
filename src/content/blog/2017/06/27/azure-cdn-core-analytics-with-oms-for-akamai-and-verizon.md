---
title: "Azure CDN Core Analytics with OMS for Akamai and Verizon"
excerpt: "There is a new OMS solution in town but you will not find it in the OMS Gallery. It is located in Azure Marketplace. My tip is to start to deploy OMS solutions via the Azure Marketplace. The new so…"
description: "There is a new OMS solution in town but you will not find it in the OMS Gallery. It is located in Azure Marketplace. My tip is to start to deploy OMS solutio..."
pubDate: 2017-06-27
updatedDate: 2017-06-27
heroImage: "/media/2017/06/image9.png"
sourceUrl: "https://cloudadministrator.net/2017/06/27/azure-cdn-core-analytics-with-oms-for-akamai-and-verizon/"
tags: 
  - "Akamai"
  - "Analytics"
  - "Azure"
  - "Azure CDN"
  - "Core Analytics"
  - "Log Analytics"
  - "Logs"
  - "Microsoft Operations Management Suite"
  - "Monitoring"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Solution"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Operational Insights"
  - "Verizon"
---
There is a new OMS solution in town but you will not find it in the OMS Gallery. It is located in Azure Marketplace. My tip is to start to deploy OMS solutions via the Azure Marketplace. The new solution in town is called Azure CDN Core Analytics.

[![image](/media/2017/06/image9.png "image")](/media/2017/06/image9.png)

I will not go into details about what Azure CDN is but I will mention that basically there are two types of those: Akamai and Verizon. There are a few differences between those and one is related to the CDN Analytics part. Verizon type instances have Core Analytics feature but it is opened in a very old fashioned separate portal from Azure. Akamai does not have such portal. Luckily both types support sending logs to Azure Storage, Event Hub and OMS Log Analytics workspace. And for Log Analytics we now have solution for this. Before proceeding with the configuration there are few things you need to know about the other differences between Akamai and Verizon:

– Akamai Endpoints are created right away and you can basically start to use them right away

– Verizon Endpoints are created right away but in order to content appear on the endpoint it might take a couple of hours

– Verizon Endpoints log data is 1 hour delayed, and take up to 2 hours to start appearing after endpoint propagation completion

– Akamai Endpoints log data is 24 hours delayed, and takes up to 2 hours to start appearing if it was created more than 24 hours ago. If it was just created, it can take up to 25 hours for the logs to start appearing.

After we have cleared this out we can go and just deploy the solution to a Log Analytics Workspace. When successful completed you will see the solution’s resource in Azure Portal:

[![image](/media/2017/06/image10.png "image")](/media/2017/06/image10.png)

Now let’s pump some data. I have created Verizon CDN profile and Endpoint that originates from Storage account. To configure sending diagnostics logs we just go to the Endpoint resource and choose Diagnostics logs from the settings menu:

[![image](/media/2017/06/image11.png "image")](/media/2017/06/image11.png)

We will send those logs to particular OMS Log Analytics workspace. These logs are generated every hour and send to OMS but I guess if it is Akamai type it will be every 24 hours.

After some waiting period we can see data is being send to our workspace:

[![image](/media/2017/06/image12.png "image")](/media/2017/06/image12.png)

Inside the dashboards for the solution you will see that data show in different visualizations:

[![image](/media/2017/06/image13.png "image")](/media/2017/06/image13.png)

[![image](/media/2017/06/image14.png "image")](/media/2017/06/image14.png)

So this solution resolves the following problems:

– Analytics for Akamai endpoints right from Azure

– Analytics for Verizon and Akamai endpoints with the Azure Portal experience

– Analyzing  multiple Verizon and Akamai endpoints data at the same time.

The solution is very cost-effective and it is no brainer for deploying it you just need to have some patience until data appears in OMS. Additional information about the logs you can find on [Azure Docs](https://docs.microsoft.com/en-us/azure/cdn/cdn-log-analysis).
