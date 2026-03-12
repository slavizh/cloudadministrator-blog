---
title: "OMSSearch PowerShell Module 6.0.0 Release"
excerpt: "I’ve just updated the OMSSearch PowerShell module. New version is 6.0.0. Here are the changes:"
description: "I’ve just updated the OMSSearch PowerShell module. New version is 6.0.0. Here are the changes:"
pubDate: 2016-01-17
updatedDate: 2016-01-17
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2016/01/17/omssearch-powershell-module-6-0-0-release/"
tags: 
  - "API"
  - "ARM"
  - "Azure Automation"
  - "Azure Resource Manager"
  - "Gallery"
  - "GitHub"
  - "Log Analytics"
  - "Module"
  - "MSOMS"
  - "OMS"
  - "OMS Automation"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpInsights"
  - "PowerShell"
  - "Automation"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Hybrid Security"
  - "Microsoft"
  - "Script"
  - "Windows"
  - "SCOM"
---
I’ve just updated the OMSSearch PowerShell module. New version is 6.0.0. Here are the changes:

\*   SMAConnection parameter set changed to OMSConnection in Get-AADToken
\*   IndividualParameter parameter set changed to – DefaultParameterSet – in Get-AADToken
\*   Changes in code for better reading the code – all functions
\*   DefaultParameterSetName used – for all functions
\*   Improved Help for all functions
\*   Changed resourceAppIdURI to [https://management.azure.com/](https://management.azure.com/)
\*   Changed authority to [https://login.microsoftonline.com/](https://login.microsoftonline.com/)
\*   Option to authenticate by TenantID or TenantADName
\*   Added TenantID field in OMSConnection (might not appear if you have previously imported the module in Azure Automation)
\*   Get-Help for parameters added for all functions
\*   Added Name parameter to find individual saved searches in Get-OMSSavedSearch. You can now get a single saved search.
\*   Improved Invoke-OMSSavedSearch algorithm. Now it will find saved search by Name instead by ID. ID can be GUID for some saved searches which previously resulted in faulty results.
\*   Removed function Invoke-ARMGet – Not needed.
\*   Deprecated Get-ARMAzureSubscription. Official AzureRM cmdlets can be used to get Subscriptions.

\*   You can use OMSConnection parameter in almost all cmdlets instead of providing individual parameters like subscriptionID, ResourceGroupName and OMSWorkspaceName
\*   new cmdlet – New-OMSSavedSearch
\*   new cmdlet – Remove-OMSSavedSearch

You can find the new version in [PowerShell Gallery](https://www.powershellgallery.com/packages/OMSSearch/6.0.0) or [GitHub](https://github.com/slavizh/OMSSearch). If you spot any issues. Log them on GitHub.
