---
title: "Reserved Common Fields in Log Analytics"
excerpt: "I’ve recently been playing with some solution development and I’ve noticed something interesting. When we are using the OMS Data Collector API we send data by creating json file. That json file is …"
description: "I’ve recently been playing with some solution development and I’ve noticed something interesting. When we are using the OMS Data Collector API we send data b..."
pubDate: 2017-05-24
updatedDate: 2017-05-31
heroImage: "/media/wordpress/2017/05/image6.png"
sourceUrl: "https://cloudadministrator.net/2017/05/24/reserved-common-fields-in-log-analytics/"
tags: 
  - "Azure"
  - "Common Fields"
  - "Custom Data"
  - "Custom Field"
  - "Data Collector API"
  - "Log Analytics"
  - "Log Search"
  - "Log Search API"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Reserved Common Fields"
  - "Automation & Control"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Reservedcommonfields"
---
I’ve recently been playing with some solution development and I’ve noticed something interesting.

When we are using the [OMS Data Collector API](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-data-collector-api) we send data by creating json file. That json file is in simple format like this:

```
{
"property1": "value1",
"property2": "value2"
"property3": "value3",
"property4": "value4"
}
```

In this pseudo code property is the name of our fields. So when the data is uploaded to OMS the name for field property1 will turn to property1\_s. Basically OMS adds suffix to the name of each field and this suffix represents the data type of the value for the field.

There are some exception though. For example if our property is called Computer that will not turn into Computer\_s in Log Analytics. Basically the Computer field is a special one. Turned out there are more such fields actually and they are called Reserved Common Fields.

I’ve found these by uploading some custom logs via the OMS Data Collector API. When I’ve uploaded my logs I’ve noticed the following fields were not changed:

```

```

After finding this I’ve started digging some more. All the Reserved Common Fields can be seen by going to the OMS Portal –> Search –> Click Add on the left filter bar.

[![image](/media/wordpress/2017/05/image7.png "image")](/media/wordpress/2017/05/image7.png)

As you can see there are 15 such fields. If we count Computer and TimeGenerated that is 17 in total.

There is on little trick when using those. When you are constructing the json the value needs to be in the data type for the respected common field. Most of these are strings but there are a few others. As I was playing before with the Log Search API I knew where I can find that information. For Log Search there is metadata that can be queries with REST calls. This is described in the [documentation for Log Search API.](https://docs.microsoft.com/en-us/azure/log-analytics/log-analytics-log-search-api) Below are the common fields that I’ve extracted from the API and you can see the additional information about them like type. Notice for example that the Severity common field is of type Int.

I hope this will be helpful when you work with the OMS Data collector API.

{

“name“: “OperationVersion“,

“displayName“: “OperationVersion“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResultSignature“,

“displayName“: “ResultSignature“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “DurationMs“,

“displayName“: “DurationMs“,

“type“: “BigInt“,

“indexed“: true,

“stored“: true,

“facet“: false,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Severity“,

“displayName“: “Severity“,

“type“: “Int“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“DnsEvents“,

“ReservedCommonFields“,

“W3CIISLog“,

“WindowsFirewall“,

“WireData“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Level“,

“displayName“: “Level“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AzureActivity“,

“ETWEvent“,

“ReservedCommonFields“,

“SecurityEvent“,

“ServiceFabricOperationalEvent“,

“ServiceFabricReliableActorEvent“,

“ServiceFabricReliableServiceEvent“

\],

“extraction“: null,

“common“: true

},

{

“name“: “SourceIP“,

“displayName“: “SourceIP“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“CommonSecurityLog“,

“ReservedCommonFields“,

“WindowsFirewall“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Message“,

“displayName“: “Message“,

“type“: “String“,

“indexed“: false,

“stored“: true,

“facet“: false,

“hidden“: false,

“display“: false,

“ownerType“: \[

“CommonSecurityLog“,

“DnsEvents“,

“ETWEvent“,

“Event“,

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “IPAddress“,

“displayName“: “IPAddress“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “CallerIPAddress“,

“displayName“: “CallerIPAddress“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“ReservedCommonFields“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResultDescription“,

“displayName“: “ResultDescription“,

“type“: “String“,

“indexed“: false,

“stored“: true,

“facet“: false,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“ReservedCommonFields“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “SubscriptionId“,

“displayName“: “SubscriptionId“,

“type“: “Guid“,

“indexed“: true,

“stored“: true,

“facet“: false,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SecurityDetection“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “CorrelationId“,

“displayName“: “CorrelationId“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: false,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Operation“,

“ReservedCommonFields“,

“UpdateRunProgress“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResourceId“,

“displayName“: “ResourceId“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“Alert“,

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“,

“ServiceMapComputer\_CL“,

“ServiceMapProcess\_CL“

\],

“extraction“: null,

“common“: true

},

{

“name“: “OperationName“,

“displayName“: “OperationName“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“ApplicationInsights“,

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“ReservedCommonFields“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResultType“,

“displayName“: “ResultType“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AutomationAccounts“,

“AzureMetrics“,

“ReservedCommonFields“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Category“,

“displayName“: “Category“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ReservedCommonFields“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResourceGroup“,

“displayName“: “ResourceGroup“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResourceProvider“,

“displayName“: “ResourceProvider“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Resource“,

“displayName“: “Resource“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“AutomationAccounts“,

“AzureActivity“,

“AzureMetrics“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “ResourceType“,

“displayName“: “ResourceType“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“Alert“,

“Heartbeat“,

“ProtectionStatus“,

“ReservedCommonFields“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SysmonEvent“,

“Update“,

“UpdateRunProgress“,

“UpdateSummary“,

“AzureDiagnostics“

\],

“extraction“: null,

“common“: true

},

{

“name“: “SourceSystem“,

“displayName“: “SourceSystem“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: false,

“ownerType“: \[

“ADAssessmentRecommendation“,

“ADReplicationResult“,

“Alert“,

“AlertHistory“,

“ApplicationInsights“,

“AutomationAccounts“,

“AzureActivity“,

“AzureAudit“,

“AzureMetrics“,

“CommonSecurityLog“,

“CompatApp“,

“CompatComputer“,

“CompatDriver“,

“CompatSysReqIssue“,

“ComputerGroup“,

“ConfigurationChange“,

“ContainerImageInventory“,

“ContainerInventory“,

“ContainerLog“,

“ContainerServiceLog“,

“DeviceAppCrash“,

“DeviceAppLaunch“,

“DeviceCalendar“,

“DeviceCleanup“,

“DeviceConnectSession“,

“DeviceEtw“,

“DeviceHardwareHealth“,

“DeviceHealth“,

“DeviceHeartbeat“,

“DeviceSkypeHeartbeat“,

“DeviceSkypeSignIn“,

“DeviceSleepState“,

“DnsEvents“,

“DnsInventory“,

“ETWEvent“,

“Event“,

“ExtraHopDBLogin“,

“ExtraHopDBTransaction“,

“ExtraHopDNSResponse“,

“ExtraHopFTPResponse“,

“ExtraHopHTTPTransaction“,

“ExtraHopSMTPMessage“,

“ExtraHopSYNScanDetect“,

“ExtraHopTCPOpen“,

“Heartbeat“,

“LinuxAuditLog“,

“NetworkMonitoring“,

“OfficeActivity“,

“Operation“,

“Perf“,

“ProtectionStatus“,

“RequiredUpdate“,

“ReservedAzureCommonFields“,

“ReservedCommonFields“,

“SCOMAssessmentRecommendation“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SecurityDetection“,

“SecurityEvent“,

“ServiceFabricOperationalEvent“,

“ServiceFabricReliableActorEvent“,

“ServiceFabricReliableServiceEvent“,

“SQLAssessmentRecommendation“,

“SurfaceHubCalendar“,

“SurfaceHubConnectSession“,

“SurfaceHubEtw“,

“SurfaceHubHeartbeat“,

“SurfaceHubSkypeSignIn“,

“Syslog“,

“SysmonEvent“,

“UAApp“,

“UAComputer“,

“UADriver“,

“UAIESiteDiscovery“,

“UAOfficeAddIn“,

“UAProposedActionPlan“,

“UASysReqIssue“,

“UAUpgradedComputer“,

“Update“,

“UpdateAgent“,

“UpdateRunProgress“,

“UpdateSummary“,

“Usage“,

“W3CIISLog“,

“WaaSDeploymentStatus“,

“WaaSUpdateStatus“,

“WDAVStatus“,

“WDAVThreat“,

“WindowsFirewall“,

“WireData“,

“AzureDiagnostics“,

“ServiceMapComputer\_CL“,

“AdmComputer\_CL“,

“AdmProcess\_CL“,

“ServiceMapProcess\_CL“

\],

“extraction“: null,

“common“: true

},

{

“name“: “Computer“,

“displayName“: “Computer“,

“type“: “String“,

“indexed“: true,

“stored“: true,

“facet“: true,

“hidden“: false,

“display“: true,

“ownerType“: \[

“ADAssessmentRecommendation“,

“ADReplicationResult“,

“Alert“,

“ApplicationInsights“,

“CommonSecurityLog“,

“CompatApp“,

“CompatComputer“,

“CompatDriver“,

“CompatSysReqIssue“,

“ComputerGroup“,

“ConfigurationChange“,

“ContainerImageInventory“,

“ContainerInventory“,

“ContainerLog“,

“ContainerServiceLog“,

“DeviceAppCrash“,

“DeviceAppLaunch“,

“DeviceCalendar“,

“DeviceCleanup“,

“DeviceConnectSession“,

“DeviceEtw“,

“DeviceHardwareHealth“,

“DeviceHealth“,

“DeviceHeartbeat“,

“DeviceSkypeHeartbeat“,

“DeviceSkypeSignIn“,

“DeviceSleepState“,

“DnsEvents“,

“DnsInventory“,

“ETWEvent“,

“Event“,

“Heartbeat“,

“LinuxAuditLog“,

“NetworkMonitoring“,

“Operation“,

“Perf“,

“ProtectionStatus“,

“RequiredUpdate“,

“ReservedCommonFields“,

“SCOMAssessmentRecommendation“,

“SecurityBaseline“,

“SecurityBaselineSummary“,

“SecurityDetection“,

“SecurityEvent“,

“ServiceFabricOperationalEvent“,

“ServiceFabricReliableActorEvent“,

“ServiceFabricReliableServiceEvent“,

“SQLAssessmentRecommendation“,

“SurfaceHubCalendar“,

“SurfaceHubConnectSession“,

“SurfaceHubEtw“,

“SurfaceHubHeartbeat“,

“SurfaceHubSkypeSignIn“,

“Syslog“,

“SysmonEvent“,

“UAApp“,

“UAComputer“,

“UADriver“,

“UAIESiteDiscovery“,

“UAOfficeAddIn“,

“UASysReqIssue“,

“UAUpgradedComputer“,

“Update“,

“UpdateAgent“,

“UpdateRunProgress“,

“UpdateSummary“,

“Usage“,

“W3CIISLog“,

“WaaSDeploymentStatus“,

“WaaSUpdateStatus“,

“WDAVStatus“,

“WDAVThreat“,

“WindowsFirewall“,

“WireData“,

“AzureDiagnostics“,

“ServiceMapComputer\_CL“,

“AdmComputer\_CL“,

“AdmProcess\_CL“,

“ServiceMapProcess\_CL“

\],

“extraction“: null,

“common“: true

},
