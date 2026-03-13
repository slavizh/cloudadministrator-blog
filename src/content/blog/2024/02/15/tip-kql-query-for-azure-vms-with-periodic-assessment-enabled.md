---
title: "Tip: KQL Query for Azure VMs with Periodic Assessment Enabled"
excerpt: "Unfortunately due to personal reasons I haven’t been able to blog for a while. I am hoping I can change that and this will be one of those small blog posts. Recently on Microsoft Q&A ther…"
description: "Unfortunately due to personal reasons I haven’t been able to blog for a while. I am hoping I can change that and this will be one of those small blog posts...."
pubDate: 2024-02-15
updatedDate: 2024-02-15
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2024/02/15/tip-kql-query-for-azure-vms-with-periodic-assessment-enabled/"
tags: 
  - "Azure"
  - "Azure Resource Graph"
  - "Azure Update Manager"
  - "Update Management"
  - "Update Manager"
  - "KQL"
---
Unfortunately due to personal reasons I haven’t been able to blog for a while. I am hoping I can change that and this will be one of those small blog posts. Recently on Microsoft Q&A there was question if you can get all Azure VMs with Period Assessment (Azure Update Manager feature) enabled.

This can be achieved easily by using Azure Resource Graph and Kusto Query Language (KQL) query.

```kusto
resources
| where type =~ "microsoft.compute/virtualmachines"
| where properties.storageProfile.osDisk.osType in~ ('Linux','Windows')
| extend patchSettingsObject = iff(properties.storageProfile.osDisk.osType =~ "windows", properties.osProfile.windowsConfiguration.patchSettings, properties.osProfile.linuxConfiguration.patchSettings)
| extend assessMode = tostring(patchSettingsObject.assessmentMode)
| extend periodicAssessment = iff(isnotnull(assessMode) and assessMode =~ "AutomaticByPlatform", "Yes", "No")
```

The result with Yes or No you can see in periodicAssessment column. I hope you will find this useful.
