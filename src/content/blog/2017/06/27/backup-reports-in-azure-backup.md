---
title: "Backup Reports in Azure Backup with Log Analytics and PowerBI"
excerpt: "A new feature just popped up in my Recovery Services Vault named Backup Reports:"
description: "A new feature just popped up in my Recovery Services Vault named Backup Reports:"
pubDate: 2017-06-27
updatedDate: 2017-06-27
heroImage: "/media/2017/06/image.png"
sourceUrl: "https://cloudadministrator.net/2017/06/27/backup-reports-in-azure-backup/"
tags: 
  - "Azure Backup"
  - "Backup"
  - "Backup Reports"
  - "Diagnostics"
  - "Events"
  - "Jobs"
  - "Log Analytics"
  - "Logs"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Power BI"
  - "Report"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Azure Site Recovery"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Solution"
---
A new feature just popped up in my Recovery Services Vault named Backup Reports:

[![image](/media/2017/06/image.png "image")](/media/2017/06/image.png)

This new feature is easily find under Settings blade –> Monitoring and Reports –> Backup Reports as stated in the message. When you click on that you are introduced with two-step configuration:

[![image](/media/2017/06/image1.png "image")](/media/2017/06/image1.png)

First we will configure Storage Account where the data will be stored for these reports.

Surprisingly you can also configure OMS Log Analytics as target for the data as well:

[![image](/media/2017/06/image2.png "image")](/media/2017/06/image2.png)

As you can see you will get report data, jobs data, event data and replicated items data for your Azure Backups.

Keep in mind that is best to wait until insights-logs-azurebackupreport container appears before moving to the next step.

[![image](/media/2017/06/image3.png "image")](/media/2017/06/image3.png)

The second step is to Sing in to PowerBI and find Azure Backup Content Pack:

[![image](/media/2017/06/image4.png "image")](/media/2017/06/image4.png)

We will need to provide the storage account we had configured previously:

[![image](/media/2017/06/image5.png "image")](/media/2017/06/image5.png)

And primary access key for the storage:

[![image](/media/2017/06/image6.png "image")](/media/2017/06/image6.png)

After sign in the data will start to upload.

After successful import you can see the data in Azure Backup dashboard.

[![image](/media/2017/06/image7.png "image")](/media/2017/06/image7.png)

In my case I do not have much data but you can see what kind of data will appear in yours over some time.

What about Log Analytics? Luckily that data is there as well:

[![image](/media/2017/06/image8.png "image")](/media/2017/06/image8.png)

You can see that I get Azure Backup data directly in AzureDiagnostics type. This data is immediately transferred to your workspace once it is generated. In the above case I’ve triggered a backup to a VM that does not exists and Report event is generated.

Currently there is no out of the box solution for this data but I hope it will be coming at some point. Till that time you can always use the view designer to build some to yourself.
