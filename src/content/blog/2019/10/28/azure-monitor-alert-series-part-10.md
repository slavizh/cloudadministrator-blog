---
title: "Azure Monitor Alert Series – Part 10"
excerpt: "Note that the first command will give you the current rule configuration. From it you can find what is the value of etag property. After that you enter it in guid variable. And than you can execute…"
description: "Note that the first command will give you the current rule configuration. From it you can find what is the value of etag property. After that you enter it in..."
pubDate: 2019-10-28
updatedDate: 2020-01-19
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/10/28/azure-monitor-alert-series-part-10/"
tags: 
  - "Azure"
  - "Azure Alerts"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "ARM"
  - "Azure Security Center"
  - "Azure Sentinel"
  - "Governance"
  - "Azure Sentinel"
---
We are getting to one of the last blog post of these series. I still haven’t decided how much more I will publish but this one won’t be the last one. If not else there will be at least another one after this one. Today we will cover Azure Sentinel alerts. To be honest I was not sure if I will cover these alert types. I have tons of feedback for Azure Sentinel in general and specifically for their alerts. That feedback focuses more on APIs and alignment with other Azure teams. I am sure that from security functionality perspective the service is doing great. But let’s start looking at Azure Sentinel alerts and I will express my feedback trough the blog post.

Before going into details about the alerts I think it is important to give a brief explanation of Azure Sentinel from API perspective as many of the feedback I have is towards that area. Azure Sentinel is fairly new service and official API hasn’t been announced as far as I know. The closest I have found as official on the API is [this repository](https://github.com/Azure/azure-rest-api-specs/tree/master/specification/securityinsights/resource-manager/Microsoft.SecurityInsights/preview/2019-01-01-preview/examples). If you check it out you will see that the whole resource provider (RP) and the different types are sub resource of Microsoft.OperationalInsights/workspaces (Log Analytics RP API). To be precise Microsoft.SecurityInsights (Sentinel RP) is extension resource. In general there is nothing wrong with such kind of resource. For example Microsoft.Insights/diagnosticSettings is such kind of resource as well. It is important to know that these resources follow the lifecycle of their parent resource. In the case of Sentinel, it needs to follow the lifecycle of the wokrspace. You might think that is not such big problem but we can look in the past where Log Analytics alerts and View Designer views were child resources (although not extension resources) of the workspace. With such kind of approach it is very difficult to manage different resources like alerts and views as package. Such kind of resources go trough different lifecycles where they are modified and even deleted. Recently you can see that Log Analytics alerts are now separate resource that just reference the workspace. Same applies to workbooks which for me are natural view designer views replacement. Putting these as separate resources that can be deployed to resource groups allows for a lot of flexibility like:

-   alert can span across multiple workspaces if needed
-   you can treat resources deployed into resource group like package for a custom monitoring solution thus have proper lifecycle
-   Alerts might work when a workspace is deleted but at least they are not deleted as well

I think that is enough on this topic so let’s continue to the actual alerts. With Azure Sentinel we currently have 4 sub-types of alerts:

-   Fusion – Currently there is only one alert in that category
-   Microsoft Security – These alerts are based on alerts that you can send from other Microsoft security products to Azure Sentinel. For example when you send data from Azure Active Directory Identity Protection you can create alert that will generate alert in Sentinel when alert in that service is generated.
-   Machine learning behavioral analytics – Currently there is only one alert in that type
-   Scheduled – These are based on Kusto (Log Analytics) queries

You can read more about these [types here](https://docs.microsoft.com/en-us/azure/sentinel/tutorial-detect-threats-built-in). Currently the type also defines what you can configure. For example for Fusion, Microsoft Security and Machine learning behavioral analytics you can configure only predefined alerts and only certain aspects of the alerts. If we take alert ‘Advanced Multistage Attack Detection’ that is of sub-type Fusion you can only disable or enable the alert. I order to know which alerts you can define and what kind of properties you can configure the Sentinel team has created an API that basically allows you to pull their definitions. I think this is good idea. To show you that API I will use [ARM client tool again](https://github.com/projectkudu/ARMClient):

```powershell
# Get all alert templates
ARMClient.exe get "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/AlertRuleTemplates?api-version=2019-01-01-preview"

# Get alert Advanced Multistage Attack Detection
ARMClient.exe get "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/AlertRuleTemplates/f71aba3d-28fb-450b-b192-4e76a83015c8?api-version=2019-01-01-preview"

{
  "id": "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/AlertRuleTemplates/f71aba3d-28fb-450b-b192-4e76a83015c8",
  "name": "f71aba3d-28fb-450b-b192-4e76a83015c8",
  "type": "Microsoft.SecurityInsights/AlertRuleTemplates",
  "kind": "Fusion",
  "properties": {
    "severity": "High",
    "displayName": "Advanced Multistage Attack Detection",
    "description": "By using Fusion technology that's based on machine learning, Azure Sentinel can automatically detect multistage attacks by combining anomalous behaviors and suspicious activities that are observed at various stages of the kill-chain. Azure Sentinel then generates incidents that would otherwise be very difficult to catch. These incidents encase two or more alerts or activities. By design, these incidents are low volume, high fidelity, and high severity - which is why this detection is turned ON by default.\n\nThere are currently 35 incident types that include a combination of suspicious Azure Active Directory sign-in events followed by anomalous Office 365 activity. \n\nTo detect these multistage attacks, the following data connectors must be configured:\n- Azure Active Directory Identity Protection\n- Microsoft Cloud App Security\n\nFor a full list and description of each scenario that is supported for these multistage attacks, go to https://aka.ms/SentinelFusion.",
    "tactics": [
      "Persistence",
      "LateralMovement",
      "Exfiltration",
      "CommandAndControl"
    ],
    "createdDateUTC": "2019-07-25T00:00:00Z",
    "status": "Installed",
    "alertRulesCreatedByTemplateCount": 1
  }
}

# Get alert Cisco - firewall block but success logon to Azure AD
ARMClient.exe get "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/AlertRuleTemplates/157c0cfc-d76d-463b-8755-c781608cdc1a?api-version=2019-01-01-preview"

{
  "id": "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/AlertRuleTemplates/157c0cfc-d76d-463b-8755-c781608cdc1a",
  "name": "157c0cfc-d76d-463b-8755-c781608cdc1a",
  "type": "Microsoft.SecurityInsights/AlertRuleTemplates",
  "kind": "Scheduled",
  "properties": {
    "severity": "Medium",
    "query": "let PrivateIPregex = @'^127\\.|^10\\.|^172\\.1[6-9]\\.|^172\\.2[0-9]\\.|^172\\.3[0-1]\\.|^192\\.168\\.';\nlet endtime = 1d;\nCommonSecurityLog\n| where TimeGenerated >= ago(endtime) \n| where DeviceVendor =~ \"Cisco\"\n| where DeviceAction =~ \"denied\"\n| extend SourceIPType = iff(SourceIP matches regex PrivateIPregex,\"private\" ,\"public\" )\n| where SourceIPType == \"public\"\n| summarize count() by SourceIP\n| join (\n    // Successful signins from IPs blocked by the firewall solution are suspect\n    // Include fully successful sign-ins, but also ones that failed only at MFA stage\n    // as that supposes the password was sucessfully guessed.\n  SigninLogs\n  | where ResultType in (\"0\", \"50574\", \"50576\") \n) on $left.SourceIP == $right.IPAddress\n| extend timestamp = TimeGenerated, IPCustomEntity = SourceIP, AccountCustomEntity = UserPrincipalName",
    "queryFrequency": "P1D",
    "queryPeriod": "P1D",
    "triggerOperator": "GreaterThan",
    "triggerThreshold": 0,
    "displayName": "Cisco - firewall block but success logon to Azure AD",
    "description": "Correlate IPs blocked by a Cisco firewall appliance with successful Azure Active Directory signins. \nBecause the IP was blocked by the firewall, that same IP logging on successfully to AAD is potentially suspect\nand could indicate credential compromise for the user account.",
    "tactics": [
      "InitialAccess"
    ],
    "createdDateUTC": "2019-07-08T00:00:00Z",
    "status": "Available",
    "requiredDataConnectors": [
      {
        "dataTypes": {
          "CommonSecurityLog": "Exist"
        }
      },
      {
        "connectorId": "AzureActiveDirectory",
        "dataTypes": {
          "SigninLogs": "Exist"
        }
      }
    ],
    "alertRulesCreatedByTemplateCount": 0
  }
}
```

In the example you can see also the output of the last two commands. The output of the first command is too long to show it here. As I have pointed before although alert ‘Advanced Multistage Attack Detection’ has other properties, only enabled property (which is not shown in the template for some reason) can be configured when you create alert rule. You can also see the type of the alert in the kind property. The second example is Scheduled alert type where you can even configure the query that will be used. Scheduled alerts are similar as Log Analytics alerts (number of results type only) but not quite. Some of the differences I have noticed:

-   The alerts are tied to specific workspace due to being sub-resource of it. They cannot span multiple workspaces or cannot exist outside of the workspace
-   time window and frequency are defined differently
-   severity values are different
-   no way to use metric measurement type
-   no integrations with action groups

For me these are big differences which does not align with Azure Monitor alerts. For me it would have made much more logic if the api of Log Analytics alerts was used for Scheduled alerts and only certain limitations or extensions were made when that alert is used for Azure Sentinel. Example would be that Severity values were still 0-4 but in when you use alert for Sentinel you can use only from 0-3 and when alert is generated 0-3 translates as High, Medium, Low and Informational in portal and other integrations. The most I am missing is action groups integration. Instead the only integration available is with Logic App. To my onion such kind of integration is very narrow and hardly covers the majority of customer needs. So in this case I think customers are forced to use Logic App due to other options not available. Another bad thing that I have found is that the integration with the logic app is defined as separate resource called [actions](https://github.com/Azure/azure-rest-api-specs/blob/master/specification/securityinsights/resource-manager/Microsoft.SecurityInsights/preview/2019-01-01-preview/examples/actions/CreateActionOfAlertRule.json) that is child resource of [alertRules](https://github.com/Azure/azure-rest-api-specs/blob/master/specification/securityinsights/resource-manager/Microsoft.SecurityInsights/preview/2019-01-01-preview/examples/alertRules/CreateScheduledAlertRule.json). This is the same API concept of the old Log Analytics API which to me it is failed API concept. Unfortunately these are not the only problems from API perspective. I have actually tried to create Azure Sentinel alert using the following example template:

```json
{
    "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "logAnalyticsWorkspaceName": {
            "type": "string",
            "metadata": {
                "description": "The name of the log analytics workspace"
            }
        },
        "alertRuleName": {
            "type": "string",
            "defaultValue": "7a3a3838-b627-4474-b38b-16d45cf958b",
            "metadata": {
                "description": "The alert rule name."
            }
        }
    },
    "variables": {
        "apiVersions": {
            "alertRules": "2019-01-01-preview"
        }
    },
    "resources": [
        {
            "name": "[concat(parameters('logAnalyticsWorkspaceName'), '/Microsoft.SecurityInsights/', parameters('alertRuleName'))]",
            "type": "Microsoft.OperationalInsights/workspaces/providers/alertRules",
            "apiVersion": "[variables('apiVersions').alertRules]",
            "kind": "Scheduled",
            "properties": {
                "alertRuleTemplateName": "23de46ea-c425-4a77-b456-511ae4855d69",
                "description": "This query looks for a few sensitive subscription-level events based on Azure Activity Logs. ↵ For example this monitors for the operation name 'Create or Update Snapshot' which is used for creating backups but could be misused by attackers ↵ to dump hashes or extract sensitive information from the disk.",
                "displayName": "Rare subscription-level operations in Azure",
                "enabled": true,
                "query": "let timeframe = 1d;\nlet SensitiveOperationList = dynamic(\n[\"List keys\", \"List Storage Account Keys\", \"Register Subscription\", \"Create or Update Snapshot\", \"Create or Update Network Security Group\"]);\nAzureActivity\n| where TimeGenerated >= ago(timeframe)\n| where ActivityStatus =~ \"Succeeded\"\n| where OperationName in~ (SensitiveOperationList)\n| project TimeGenerated, OperationName, ActivityStatus, Resource, Caller, CallerIpAddress, ResourceGroup, SubscriptionId, Authorization\n| extend timestamp = TimeGenerated, AccountCustomEntity = Caller, IPCustomEntity = CallerIpAddress",
                "queryFrequency": "P1D",
                "queryPeriod": "P1D",
                "severity": "Low",
                "suppressionDuration": "PT5H",
                "suppressionEnabled": false,
                "tactics": [
                    "CredentialAccess",
                    "Persistence"
                ],
                "triggerOperator": "GreaterThan",
                "triggerThreshold": 0
            }
        }
    ],
    "outputs": {
    }
}
```

The above template works but only when the alert is created for a first time. If you try to apply it again you will get error similar to this one:

```json
{"code":"DeploymentFailed","message":"At least one resource deployment operation failed. Please list deployment operations for details. Please see https://aka.ms/arm-debug for usage details.","details":[{"code":"Conflict","message":"{\r\n \"error\": {\r\n \"code\": \"Conflict\",\r\n \"message\": \"Newer instance of rule 'BuiltInFusion' exists for workspace 'cee85205-9d22-40f7-8f3f-58f9a5330eff' (Etag does not match). Data was not saved.\"\r\n }\r\n}"}]}
```

In short every time a resource is updated the property etag is changed. ARM templates do not use that property when you develop them. Basically this makes the Sentinel API not ARM template compliant. If you want to update an alert rule you can use ARM client:

```powershell
ARMClient.exe get "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/alertRules/BuiltInFusion?api-version=2019-01-01-preview"
$guid = ''
ARMClient.exe put "/subscriptions/383d4078-4d4c-46b6-bc9c-abd178760d0f/resourceGroups/KustoTest/providers/Microsoft.OperationalInsights/workspaces/workspace1/providers/Microsoft.SecurityInsights/alertRules/BuiltInFusion?api-version=2019-01-01-preview" "{'etag': '$($guid)','kind': 'Fusion','properties':{'alertRuleTemplateName': 'f71aba3d-28fb-450b-b192-4e76a83015c8','enabled': true}}"
```

Note that the first command will give you the current rule configuration. From it you can find what is the value of etag property. After that you enter it in guid variable. And than you can execute update on the resource. When the resource is update the etag value changes again. To be clear I haven’t seen any other ARM API that needs etag to be defined so this is definitely issue with the API and probably why the API is not officially announced. If you need to automate Sentinel in better way than using arm client tool I would suggest to check [AZSentinel PowerShell module](https://github.com/wortell/AZSentinel) developed by [Pouyan Khabazi](https://pkm-technology.com/).

Please do not take this blog as reason not to use or adopt Azure Sentinel. I think Azure Sentinel is very solid service from functionality perspective. It might be the case that any of the remarks above does not apply to you or are not important for your adoption. For me these are important as I think will make it easier to manage Azure Sentinel at scale with lifecycle. The current APIs for me are a step backwards to times when Log Analytics was called OMS and not part of Azure Monitor. Personally I am happy that these days have passed as now Azure Monitor (Log Analytics) is way better integrated within Azure services. I really hope that Azure Sentinel will improve those although I know that API changes are not done easily – for example we haven’t seen wider migration of some solutions in Log Analytics to workbooks.

I hope this was insightful and helpful blog post for you.
