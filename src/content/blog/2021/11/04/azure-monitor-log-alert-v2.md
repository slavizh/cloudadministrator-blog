---
title: "Azure Monitor Log Alert V2"
excerpt: "Log Alerts have been available in Log Analytics for quite some time. Initially they were available via [legacy Log Alert API]( that was specific for Log Analytics. In order to make Log Alert more n…"
description: "Log Alerts have been available in Log Analytics for quite some time. Initially they were available via [legacy Log Alert API]( that was specific for Log Anal..."
pubDate: 2021-11-04
updatedDate: 2021-11-05
heroImage: "/media/wordpress/2021/11/log-alert-v1-condtion.png"
sourceUrl: "https://cloudadministrator.net/2021/11/04/azure-monitor-log-alert-v2/"
tags: 
  - "Azure"
  - "Azure Alerts"
  - "Azure Bicep"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "Kusto"
  - "Log Alert V2"
  - "Log Analytics"
  - "Log Analytics"
---
Log Alerts have been available in Log Analytics for quite some time. Initially they were available via [legacy Log Alert API](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/api-alerts?WT.mc_id=AZ-MVP-5000120) that was specific for Log Analytics. In order to make Log Alert more native to Azure a new [Log Alert API](https://docs.microsoft.com/en-us/rest/api/monitor/scheduledqueryrule-2018-04-16/scheduled-query-rules/create-or-update?WT.mc_id=AZ-MVP-5000120) was available. With a few minor features like (custom webhook payload) that API was direct translate from the legacy one offering the same features. Now Azure Monitor team is introducing a new Log Alert that is named Log Alert V2. That new alert is using the same [API](https://docs.microsoft.com/en-us/rest/api/monitor/scheduledqueryrule-2021-02-01-preview/scheduled-query-rules/create-or-update?WT.mc_id=AZ-MVP-5000120) but with new version. So if you use the API version 2018-04-16 to create Log Alert you are creating v1 and if you use version 2021-08-01 you are creating v2. Log Alert v2 will be generally available probably very soon as I have received e-mail notification containing the following information:

-   any API version like 2021-02-01-preview will be deprecated and replaced by version 2021-08-01
-   billing for Log Alert v2 will start from 30th of November.

This for me signals that before 30th of November or several weeks after the service will be generally available. I am not aware of specific information just the official e-mail notification leads me to these conclusions. The Log Alert v2 has been in preview for a couple of months which I have been testing and providing feedback.

So what are the Log Alert v2 new capabilities or changes compared to v1?

-   [Stateful alert](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#state-and-resolving-alerts?WT.mc_id=AZ-MVP-5000120) – Let’s say you have some alert that has frequency of 5 minutes and if the threshold is met every 5 minutes you will separate alert instance every 5 minutes. With this new functionality that you can enable you will get one alert instance with state Fired when the threshold is met for first time and once the threshold is no longer met you will receive the same alert instance but with Resolved state. It is important to know that you should enable this feature only for data that is logged on certain frequency in your Log Analytics workspace. For example this feature is useful for data like metrics/performance counters. If your data is based on events that does not have specific defined frequency you should disable it otherwise you will not get desired results.
-   [1-minute frequency](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#frequency?WT.mc_id=AZ-MVP-5000120) – You can now have log alert rule that is executed every minute. This is useful if you have critical resources that needs to be monitor in near real time (real time monitoring does not exists as any data send has some latency due to physical laws 🙂 ). Of course usually with such kind of feature it is also good that the time difference between when data is generated and logged to Log Analytics is low as possible like 1-5 minutes.
-   [New webhook payload](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions#monitoringservice--log-alerts-v2?WT.mc_id=AZ-MVP-5000120) – The payload of the webhook is slightly different. This is due to how the alert rule is defined on API level and the new features. One downside compared to Log Alert v1 is that the whole query results are no longer send in the webhook payload. Instead you get direct links to the results by using the [Query API](https://docs.microsoft.com/en-us/rest/api/loganalytics/dataaccess/query/execute?WT.mc_id=AZ-MVP-5000120). You also get the values from the dimensions that you have defined. More on dimensions later.
-   You can scope the alert to specific subscription or resource group instead to Log Analytics workspace – By scoping the alert rule to resource group the rule will apply only to the resource from that resource group. These resources still need to send their data to Log Analytics workspace, the alert rule will take care of making sure it is scoped to data only from those resource. This is useful if you want to apply different thresholds for your alert rules depending on the container (resource group/subscription) of the resources.
-   No longer you need to distinguish between metric measurement alert or number of results alert – This is now solved by just defining property in the alert rule that you measure [Table rows](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#count-of-the-results-table-rows?WT.mc_id=AZ-MVP-5000120) (number of results) instead of a specific column name (metric measurement) of your results.
-   No longer need to define AggregatedValue – you no longer need to define AggregatedValue column in your search query. Basically the whole aggregation no longer needs to be defined in the query as it is controlled by properties on the alert rule. By default there are 5 aggregations supported – Average, Total, Maximum, Minimum and Count. Of course you are still allowed to define your query with aggregation as Kusto query language supports some advanced aggregations like percentile().
-   No longer need to define bin() – as aggregation can be controlled by properties of the rules you no longer need to define bin() as well. Of course if you define the aggregation within the query you still have to do that.
-   Separate alert instance instance per results – This was possible in v1 as well but was somehow not very discoverable and limited to 3 columns you can define. For example let’s say you have Azure VM for which you monitor the free disk space on each disk. In order to get alert for each VM you want to define \_ResourceId column as [dimension](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#split-by-alert-dimensions?WT.mc_id=AZ-MVP-5000120) but if you want to get separate alert instance for each disk on each VM you will need to define the column that contains the name of the disk as dimension as well. These dimensions can also serve as filter to exclude or include certain values. Keep in mind that you do not have limit for how many dimensions you can add but you have a limit of 6000 time-series. Something important to keep in mind is that if you want to add a column of type that is not string (let’s say for example array) it is best to convert it to string in inside the query.
-   Setting custom e-mail subject is no longer an option – Custom e-mail subject is no longer an option in v2.
-   mute actions should work now per alert instance – I have not checked that but as far as I understood muting should no longer apply for the whole alert rule but it should be per alert instance. This might have been the case for v1 as well but I also haven’t been able to verify it. Note that mute actions cannot be enabled if auto-mitigate (Automatically resolve alerts/Stateful) is enabled.
-   queries will now be verified – Kusto queries that you provide in the alert rule will now be verified. For example if in the query rule you are using table or column that do not exists in the Log Analytics workspace the alert rule will fail to deploy. You can disable this feature in case you are deploying an alert which uses data that hasn’t appeared yet in Log Analytics. The verification works only if the alert rule is scoped to Log Analytics workspace and it does not work if it is scoped to subscription or resource group. There are also plugins like bag\_unpack that you will not be able to use in queries, instead use parse\_json() for example.
-   alert rules can be verified for encryption – Basically Log Analytics has option to encrypt alert rules by placing them on your own [Azure Storage account](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/private-storage?WT.mc_id=AZ-MVP-5000120). This feature verifies that the alert rule will be placed on custom storage account when deployed.
-   Consecutive and Total breaches removed – This option is removed but replaced by [Number of violations to trigger the alert](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#number-of-violations-to-trigger-alert?WT.mc_id=AZ-MVP-5000120). Basically same concept but different way to configure it.
-   Billing – The [billing is different between v1 and v2](https://azure.microsoft.com/en-us/pricing/details/monitor/). v1 definitely seems more cost effective for at scale monitoring but are also not having the many useful features of v2. At the pricing page Log alert v1 are listed as Log under Alert rules and v2 as At Scale Log Monitoring under Alert Rules. Note that v2 pricing depends on the time series so you must be careful how many dimensions you configure and how many different values you have for those dimensions.

I have not seen any announcement for deprecation of Log Alert v1 at this point so you are free to use them if you find them suitable for your scenarios. I would expect if there is some deprecation announcement in the future to have the standard 3 year in advance notice.

One thing important to note that from feature and billing and later as you will see from API perspective Log Alert v2 looks very similar to [Azure Monitor Metric alerts](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-metric-overview?WT.mc_id=AZ-MVP-5000120).

Now that we have looked at the differences let’s look at how these two alert rules look from the Portal.

If you got to Log Analytics workspace and execute some query you will see the option to create alert from it.

For Log Alert v1 on configure logic (condition) page you will see the properties that you have seen before:

![](/media/wordpress/2021/11/log-alert-v1-condtion.png)

*Log Alert v1 Condition*

You will notice that the ability to configure columns for alert instances is not even exposed in the UI.

If we go to a resource group where we have resources sending logs to Log Analytics and we type some query in the Logs blade for the whole resource group we will see different experience that is tied to create Log Alert v2.

![](/media/wordpress/2021/11/log-alert-v2-condtion.png)

*Log Alert v2 Condition*

Note that we have defined a query without aggregation and instead of choosing metric measurement or number of results we choose Table rows measure. You can also notice that aggregation is now something we define in the alert rule rather the query. Dimensions are now visible to choose and if you click you can see all the column names you can add as dimensions

![](/media/wordpress/2021/11/log-alert-v2-dimensions.png)

*Log Alert v2 Dimensions*

Resource ID column option is usually something we choose if the alert is scoped to subscription or resource group. Usually the name of the column that we will choose will be \_ResourceId in order to split alert instances for each resource. Act in similar way if you add \_ResourceId to dimensions. It is ok if you add it there as well.

With this new UI experience you also have an option to see how the final query will look. This is the query that will be executed based on how the alert rule is defined.

![](/media/wordpress/2021/11/log-alert-v2-final-query.png)

*Log Alert v2 Final query*

At the end of the condition you have the advanced options.

For Log Alert v2 when you got to Details tab you will see some of the other new options like Automatically resolve alerts and Check workspace linked storage:

![](/media/wordpress/2021/11/log-alert-v2-details.png)

*Log Alert v2 Details*

Note that when alert is scoped to resource group or subscription you need to define region. For alerts scoped to workspace the region of the Log Analytics workspace is used. You can read [more about the location here](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-unified-log#location-selection-in-log-alerts?WT.mc_id=AZ-MVP-5000120).

We took a look from UI perspective and let’s look now from API perspective. For this example I will use Bicep file example instead of ARM one. You can find ARM examples [here](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-log-create-templates#template-for-all-resource-types-from-api-version-2021-08-01?WT.mc_id=AZ-MVP-5000120). As example alerts I will use the ones that I have blogged about before in [Azure Monitor Alert Series – Part 7](/2019/10/07/azure-monitor-alert-series-part-7/). Let’s start with alert ‘Low Disk space on a volume’:

```powershell
resource lowDiskCpuAlert 'Microsoft.Insights/scheduledQueryRules@2021-08-01' = {
  name: 'b206bfaf-f760-4aaf-b815-1ff242cea99b'
  location: 'eastus' // should be the location of the Log Analytics workspace if it is scoped to such
  tags: {}
  kind: 'LogAlert'
  properties: {
    displayName: 'Low Disk space on a volume'
    description: 'The volume on a computer is below 10%.'
    enabled: true
    autoMitigate: true // False if auto resolve is not suitable for the log in the query
    severity: 1
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    muteActionsDuration: null // Another example PT5M
    overrideQueryTimeRange: null
    scopes: [
      // Resource Group scope example
      // '/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourceGroups/rg0001'
      // Subscription scope example
      //'/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9'
      // Log Analytics scope example
      '/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourcegroups/kustotest/providers/microsoft.operationalinsights/workspaces/ws00008'
    ]
    checkWorkspaceAlertsStorageConfigured: false
    skipQueryValidation: false
    actions: {
      actionGroups: [
        '/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourceGroups/KustoTest/providers/Microsoft.Insights/actiongroups/mgmtDemo'
      ]
      customProperties: {
        customProperty1: 'value1'
        customProperty2: 'value2'
      }
    }
    criteria: {
      allOf: [
        {
          query: 'Perf | where ObjectName =~ "LogicalDisk" and CounterName =~ "% Free Space" and InstanceName !~ "_Total"'
          timeAggregation: 'Average'
          metricMeasureColumn: 'CounterValue'
          resourceIdColumn: null // null if scope is Log Analytics workspace, _ResourceId if scope is subscription or resource group
          operator: 'LessThan'
          threshold: 10
          dimensions: [
            {
              name: '_ResourceId'
              operator: 'Include'
              values: [
                '*'
              ]
            }
            {
              name: 'InstanceName'
              operator: 'Include'
              values: [
                '*'
              ]
            }
          ]
          failingPeriods: {
            minFailingPeriodsToAlert: 1
            numberOfEvaluationPeriods: 1
          }
        }
      ]
    }
  }
}
```

In the example I have provided some useful comments but take a note on some of the things:

-   For name of the resource I am using GUID but friendly name is defined in displayName property. This is possible for Log Alert v1 as well.
-   You will notice that some of the types for different properties have changed. Most notably enable, severity, etc.
-   Examples for different types of scoping is provided. Currently you can only scope to one subscription or resource group and multiple workspaces
-   I have added an example for custom webhook payload properties
-   Most of the main properties of the alert are now within criteria property. Currently you can have only one criteria. For example with metric alerts you can have multiple criteria.
-   We aggregated upon \_ResourceId and InstanceName columns (defined in dimensions) with Average aggregation on CounterValue column. Each record will be compared to the threshold operator and value.
-   As the data from Perf table is send on certain interval auto mitigate is enabled.
-   I have not parameterized the Bicep template as it is easy process and the goal is to show you the options in Log Alert v2

The example Bicep code for alert ‘A critical service has stopped’ is:

```powershell
resource criticalServiceHasStoppedAlert 'Microsoft.Insights/scheduledQueryRules@2021-08-01' = {
  name: 'f04cff8f-caeb-4e31-8c87-d4c840fbe0db'
  location: 'eastus'
  tags: {}
  kind: 'LogAlert'
  properties: {
    displayName: 'A critical service has stopped'
    description: 'A critical service has stopped'
    enabled: true
    autoMitigate: false
    severity: 1
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    muteActionsDuration: null // Another example PT5M
    overrideQueryTimeRange: null
    scopes: [
      // Resource Group scope example
      '/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourceGroups/rg0001'
      // Subscription scope example
      //'/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9'
      // Log Analytics scope example
      //'/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourcegroups/kustotest/providers/microsoft.operationalinsights/workspaces/ws00008'
    ]
    checkWorkspaceAlertsStorageConfigured: false
    skipQueryValidation: false
    actions: {
      actionGroups: [
        '/subscriptions/3045ba70-8cc8-4cdf-949a-ed6122ff68c9/resourceGroups/KustoTest/providers/Microsoft.Insights/actiongroups/mgmtDemo'
      ]
      customProperties: {
        customProperty1: 'value1'
        customProperty2: 'value2'
      }
    }
    criteria: {
      allOf: [
        {
          query: 'ConfigurationChange | where ConfigChangeType =~ "WindowsServices" and SvcChangeType =~ "State" and SvcState =~ "Stopped" | where SvcDisplayName in ("Computer Browser", "DHCP Client", "Server", "Windows Event Log", "Windows Firewall",  "Remote Procedure Call (RPC)", "Workstation" ) | summarize arg_max(TimeGenerated, *) by _ResourceId, SvcDisplayName'
          timeAggregation: 'Count'
          metricMeasureColumn: null // null for Table Rows option
          resourceIdColumn: '_ResourceId' //_ResourceId when scope is resource group, no need to add it to dimensions as well
          operator: 'GreaterThan'
          threshold: 0
          dimensions: [
            {
              name: 'SvcDisplayName'
              operator: 'Include'
              values: [
                '*'
              ]
            }
          ]
          failingPeriods: {
            minFailingPeriodsToAlert: 1
            numberOfEvaluationPeriods: 1
          }
        }
      ]
    }
  }
}
```

From this example note the following features:

-   This is table rows alert so when we alert when the results are greater than 0 thus metricMeasureColumn is null and timeAggregation is Count.
-   The query is also reduced here and I still using arg\_max() aggregation just to get a single record for each unique \_ResourceId and SvcDisplayName pair.
-   We are scoping the alert to resource group so we have \_ResourceId value for resourceIdColumn property and we are skipping adding \_ResourceId to dimensions
-   SvcDisplayName is in dimensions so we get separate alert instance for each Azure VM and service name.
-   The logs in table ConfigurationChange are send only when there is actual change so they are not being send on frequency thus auto mitigate is set to false.

I hope this gives you a good start at understanding Log Alert v2 and the changes compared to v1. I hope also that if you decide to migrate the examples will help you with that task.
