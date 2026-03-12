---
title: "Monitoring canceled Azure Subscriptions"
excerpt: "The text explains the process of managing Azure subscriptions, particularly how to cancel a subscription and track its status using Azure Monitor and Log Analytics. It includes steps to configure a…"
description: "The text explains the process of managing Azure subscriptions, particularly how to cancel a subscription and track its status using Azure Monitor and Log Ana..."
pubDate: 2025-03-12
updatedDate: 2025-03-12
heroImage: "/media/wordpress/2025/03/an-image-illustrating-monitoring-azure-subscriptions-canceled.png"
sourceUrl: "https://cloudadministrator.net/2025/03/12/monitoring-canceled-azure-subscriptions/"
tags: 
  - "Azure"
  - "Azure Activity Logs"
  - "Azure Monitor"
  - "Azure Subscription"
  - "Bicep"
  - "Canceled"
  - "Cloud"
  - "Deleted"
  - "Diagnostic Settings"
  - "Log Alerts"
  - "Log Analytics"
  - "Management Groups"
  - "Microsoft"
  - "Security"
---
Azure Subscription cannot be just deleted. They go trough [different states](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/subscription-states?WT.mc_id=AZ-MVP-5000120). Although you might have taken all necessary to secure your Azure tenant sometimes mistakes happen or your environment might be compromised by bad actors. The first step of removing Azure Subscription is to cancel it. That is critical action that you may want to monitor although you should have in place other ways to monitor resources that will signal that they are not available. In any case additional alert that this action was done could be useful information to be alerted upon. In this blog posts we will take a look how we can do that by using Azure Monitor. The deployment of the Azure Monitor resource will be done via Azure Bicep.

To make this happen I am assuming that you have the following resources in place:

-   one or more management group where your Azure subscription are placed.
-   Log Analytics workspace to store Azure activity logs.
-   Action Group that will be fired by the alert rule we will create.
-   User Assigned identity that has permissions to execute queries on your Log Analytics workspace.

When Azure subscription is canceled that subscription is no longer active and the resources in it will stop working. In order to know when subscription is canceled we will rely on [Azure Activity logs](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log?tabs=powershell?WT.mc_id=AZ-MVP-5000120). Those can be easily send to Log Analytics workspace via Azure Portal for each Azure Subscription but what we want is to send the Activity logs from management group to Log Analytics workspace. That functionality is not available in the Azure Portal but can be configured via Bicep template:

```bicep
targetScope = 'managementGroup'

@description('The subscription ID of the Log Analytics workspace.')
param subscriptionId string
@description('The resource group name of the Log Analytics workspace.')
param resourceGroupName string
@description('The name of the Log Analytics workspace.')
param logAnalyticsWorkspaceName string

resource logAnalyticsWorkspaceResource 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  scope: resourceGroup(subscriptionId, resourceGroupName)
  name: logAnalyticsWorkspaceName
}

resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'sendLogs'
  properties: {
    workspaceId: logAnalyticsWorkspaceResource.id
    logAnalyticsDestinationType: null
    eventHubAuthorizationRuleId: null
    eventHubName: null
    marketplacePartnerId: null
    serviceBusRuleId: null
    storageAccountId: null
    logs: [
      {
        category: 'Administrative'
        enabled: true
        categoryGroup: null
        retentionPolicy: {
          days: 0
          enabled: false
        }
      }
      {
        category: 'Policy'
        enabled: true
        categoryGroup: null
        retentionPolicy: {
          days: 0
          enabled: false
        }
      }
    ]
    metrics: []
  }
}
```

The template is deployed at management group scope and you have to deploy it to every management group that has subscriptions under it. I would suggest to deploy it to every management group you have to make sure you have all your activity logs at one place. This makes sure that we have logs from the cancel operations even when the subscription is no longer Active.

Once we are sending the Administrative logs from the management group to Log Analytics and we have canceled an Azure subscription we can use the query below to see the event in Log Analytics:

```kusto
AzureActivity
| where CategoryValue == "Administrative"
    and ResourceProviderValue == "MICROSOFT.SUBSCRIPTION"
    and ActivityStatusValue == "Success"
    and OperationNameValue =~ 'Microsoft.Subscription/cancel/action'
| extend managementGroup = tostring(split(tostring(todynamic(Properties).hierarchy), '/')[-2])
| extend subscriptionId = tostring(todynamic(Properties).subscriptionId)
```

![](/media/wordpress/2025/03/query-results.png)

*Query results*

With that query we can easily create Log alert that will signal us for every such event for each different management group and subscription ID. The alert rule can be created with the below Bicep Template by deploying it to resource group of your choice.

```bicep
targetScope = 'resourceGroup'

type logAnalyticsWorkspaceType = {
  @description('The subscription ID of the Log Analytics workspace. Default value: current subscription.')
  subscriptionId: string?
  @description('The resource group name of the Log Analytics workspace.')
  resourceGroupName: string
  @description('The name of the Log Analytics workspace.')
  name: string
}

type identityType = {
  @description('The subscription ID of the identity. Default value: current subscription.')
  subscriptionId: string?
  @description('The resource group name of the identity.')
  resourceGroupName: string
  @description('The name of the identity.')
  name: string
}

type actionGroupType = {
  @description('The subscription ID of the action group. Default value: current subscription.')
  subscriptionId: string?
  @description('The resource group name of the action group.')
  resourceGroupName: string
  @description('The name of the action group.')
  name: string
}

@description('The log analytics workspace for the alert.')
param logAnalyticsWorkspace logAnalyticsWorkspaceType

@description('The managed identity for the alert.')
param managedIdentity identityType

@description('The action group for the alert.')
param actionGroup actionGroupType

resource logAnalyticsWorkspaceResource 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: logAnalyticsWorkspace.name
  scope: resourceGroup(logAnalyticsWorkspace.?subscriptionId ?? subscription().subscriptionId, logAnalyticsWorkspace.?resourceGroupName!)
}

resource managedIdentityResource 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-preview' existing = {
  name: managedIdentity.name
  scope: resourceGroup(managedIdentity.?subscriptionId ?? subscription().subscriptionId, managedIdentity.resourceGroupName)
}

resource actionGroupResource 'Microsoft.Insights/actionGroups@2024-10-01-preview' existing = {
  name: actionGroup.name
  scope: resourceGroup(actionGroup.?subscriptionId ?? subscription().subscriptionId, actionGroup.resourceGroupName)
}

resource logAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'Azure Subscription was cancelled'
  location: resourceGroup().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityResource.id}': {}
    }
  }
  kind: 'LogAlert'
  properties: {
    scopes: [
      logAnalyticsWorkspaceResource.id
    ]
    displayName: 'Azure Subscription was cancelled'
    autoMitigate: false
    description: 'Alert triggered when a subscription is cancelled'
    enabled: true
    windowSize: 'PT15M'
    evaluationFrequency: 'PT15M'
    severity: 1
    muteActionsDuration: null
    overrideQueryTimeRange: null
    criteria: {
      allOf: [
        {
          query: '''AzureActivity
| where CategoryValue == "Administrative"
    and ResourceProviderValue == "MICROSOFT.SUBSCRIPTION"
    and ActivityStatusValue == "Success"
    and OperationNameValue =~ 'Microsoft.Subscription/cancel/action'
| extend managementGroup = tostring(split(tostring(todynamic(Properties).hierarchy), '/')[-2])
| extend subscriptionId = tostring(todynamic(Properties).subscriptionId)'''
          timeAggregation: 'Count'
          metricMeasureColumn: null
          resourceIdColumn: null
          operator: 'GreaterThan'
          threshold: 0
          dimensions: [
            {
              name: 'managementGroup'
              operator: 'Include'
              values: ['*']
            }
            {
              name: 'subscriptionId'
              operator: 'Include'
              values: ['*']
            }
          ]
          failingPeriods: {
            minFailingPeriodsToAlert: 1
            numberOfEvaluationPeriods: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [
        actionGroupResource.id
      ]
      customProperties: {}
    }
    checkWorkspaceAlertsStorageConfigured: false
    skipQueryValidation: false
  }
}
```

You can change some of the settings of the alert rule to your liking. Note that you can basically create similar alert when the subscription goes into deleted state or for example when subscription is moved from management group. The latter can be used for transferring subscriptions scenario. Example query for moving in or out subscription to/from management group is:

```kusto
AzureActivity
| where CategoryValue == "Administrative"
    and ActivityStatusValue == "Succeeded"
    and ResourceProviderValue == "Microsoft.Management"
    and tostring(todynamic(Properties).message) startswith "Entity"
    and tostring(todynamic(Properties).message) contains "changed the parent entity value from"
| extend managementGroup = split(Hierarchy, '/')[-1]
```

Example query for deleted Azure subscription:

```kusto
AzureActivity
| where CategoryValue == "Administrative"
    and ActivityStatusValue == "Succeeded"
    and ResourceProviderValue == "Microsoft.Management"
    and tostring(todynamic(Properties).message) startswith "Entity"
    and tostring(todynamic(Properties).message) contains "deleted from parent entity"
| extend managementGroup = split(Hierarchy, '/')[-1]
```

You will just need to change the query and some other properties of the alert.

Bicep Templates examples are available at GitHub:

-   [Configuring diagnostic settings for management](https://github.com/slavizh/BicepTemplates/tree/main/diagnostic-settings-mg)
-   [Alert rule](https://github.com/slavizh/BicepTemplates/tree/main/log-alert-cancelled-subscription)

I hope this was useful scenario.
