---
title: "Finding Diagnostic Logs for Azure Services"
excerpt: "For the last a couple of years many Azure services has started to produce diagnostic logs and metrics. These two allows you to monitor and troubleshoot the Azure Services. Unfortunately still there…"
description: "For the last a couple of years many Azure services has started to produce diagnostic logs and metrics. These two allows you to monitor and troubleshoot the A..."
pubDate: 2018-12-17
updatedDate: 2018-12-17
heroImage: "/media/2018/12/diagnostic-logs.png"
sourceUrl: "https://cloudadministrator.net/2018/12/17/finding-diagnostic-logs-for-azure-services/"
tags: 
  - "ARM"
  - "Azure"
  - "Azure Log Analytics"
  - "Azure Monitor"
  - "Azure Resource Manager"
  - "Diagnostic Logs"
  - "Azure Operational Insights Preview"
  - "Log Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Log Analytics"
---
For the last a couple of years many Azure services has started to produce diagnostic logs and metrics. These two allows you to monitor and troubleshoot the Azure Services. Unfortunately still there are some services that are missing those. To pull diagnostic logs and metrics Azure Monitor has capability called Diagnostic settings which allows you to place them on Azure Storage, Event Hub or Log Analytics. Microsoft has done a good job [to document many of diagnostic logs available](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/tutorial-dashboards) but still I find some services that haven’t be documented. Luckily there is a way to find what diagnostic logs are available for a service (resource) and this blog post will focus on that.

After some digging I’ve found that there is ARM API call that returns the available diagnostic logs. Keep in mind that the call will only return the diagnostic logs but not the schema for them but once you have the names of those logs you can configure diagnostic settings and send them to Log Analytics or storage account to see what information will be send. From the example below I am looking for the logs available for Recovery Services vault. I use armclient tool but you can use any other tool that can query the ARM API as long as you provide the right web request.

```powershell
PS C:\WINDOWS\system32> ARMClient.exe get "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourceGroups/asr/providers/Microsoft.RecoveryServices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories?api-version=2017-05-01-preview"
{
  "value": [
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureBackupReport",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureBackupReport",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryJobs",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryJobs",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryEvents",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryEvents",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryReplicatedItems",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryReplicatedItems",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryReplicationStats",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryReplicationStats",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryRecoveryPoints",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryRecoveryPoints",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryReplicationDataUploadRate",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryReplicationDataUploadRate",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    },
    {
      "id": "/subscriptions/3c1c78a4-4064-4522-94c4-e0428165922e/resourcegroups/asr/providers/microsoft.recoveryservices/vaults/stan5/providers/microsoft.insights/diagnosticSettingsCategories/AzureSiteRecoveryProtectedDiskDataChurn",
      "type": "microsoft.insights/diagnosticSettingsCategories",
      "name": "AzureSiteRecoveryProtectedDiskDataChurn",
      "location": null,
      "kind": null,
      "tags": null,
      "properties": {
        "categoryType": "Logs"
      },
      "identity": null
    }
  ]
}
```

![](/media/2018/12/diagnostic-logs.png)

*Azure Diagnostic Logs*

I hope this small tip was useful for you.
