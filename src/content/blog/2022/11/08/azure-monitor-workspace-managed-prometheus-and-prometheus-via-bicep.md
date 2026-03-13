---
title: "Azure Monitor Workspace, Managed Prometheus and Prometheus Alerts via Bicep"
excerpt: "Recently Azure Monitor team has introduced Azure Monitor workspace. This is a new resource that is described as “Azure Monitor workspaces will eventually contain all metric data collected by …"
description: "Recently Azure Monitor team has introduced Azure Monitor workspace. This is a new resource that is described as “Azure Monitor workspaces will eventually con..."
pubDate: 2022-11-08
updatedDate: 2022-11-08
heroImage: "/media/2022/11/monitor-resources.png"
sourceUrl: "https://cloudadministrator.net/2022/11/08/azure-monitor-workspace-managed-prometheus-and-prometheus-via-bicep/"
tags: 
  - "AKS"
  - "Azure"
  - "Azure Alerts"
  - "Azure Monitor"
  - "Grafana"
  - "Kubernetes"
  - "Bicep"
  - "Prometheus"
---
Recently Azure Monitor team has introduced Azure Monitor workspace. This is a new resource that is described as "Azure Monitor workspaces will eventually contain all metric data collected by Azure Monitor. Currently, the only data hosted by an Azure Monitor workspace is Prometheus metrics.". So basically this new resource is a store for metrics and in future will also support Azure resource metrics. This is similar to Azure Log Analytics workspace which is store for logs. Of course Azure Log Analytics can also store metrics but Azure Monitor workspace is optimized for the structure of metrics data. We are yet to see full picture of this initiative. Currently Azure Monitor workspace is known also as Azure Monitor managed service for Prometheus (Managed Prometheus). The full documentation on this new [feature/service you can find here](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/prometheus-metrics-overview). As a long time user and expert on Azure Monitor and Log Analytics I wanted to try this feature and test its capabilities. My knowledge on Prometheus and Grafana is very little so I always like to challenge myself with such exercises. This new feature has 3 distinct scenarios:

-   Using Prometheus and Grafana only – you do not have to use Log Analytics and Container Insights
-   Using Prometheus and Grafana along with Log Analytics and Container Insights
-   Use your own Prometheus server and send data to Azure Monitor workspace and visualize it in Grafana. You can use Log Analytics and Container Insights as additional monitoring as well.

In this blog post I will take a look at the first scenario and set it up via Bicep templates. On the official documentation that for some of the setup you already have ARM templates but I wanted to make a single deployment and modernize it via Bicep. Before giving you a link to the templates I have build let’s have a look at which resources are deployed at that scenario:

-   Azure Monitor workspace – Serves as a store where data will be send
-   Managed Grafana – Serves as visualization tool for the data
-   Azure Monitor Data collection Rules – Serves as collector for getting the metrics from AKS and sending them to the Azure Monitor workspace
-   Managed Identities and Role assignments – Used by Grafana to get the data from Azure Monitor workspace
-   Prometheus rule groups – This is another new resource that serves two purposes:
    -   Recording purpose – From official documentation: ‘Recording rules allow you to pre-compute frequently needed or computationally extensive expressions and store their result as a new set of time series. Querying the precomputed result will then often be much faster than executing the original expression every time it’s needed. This is especially useful for dashboards, which need to query the same expression repeatedly every time they refresh, or for use in alert rules, where multiple alert rules may be based on the same complex query. Time series created by recording rules are ingested back to your Azure Monitor workspace as new Prometheus metrics.’ – In short normalizes some data so it is easier to use it.
    -   Alert purpose – Basically new type of Azure Monitor alert that has the characteristics of all other Azure Monitor alert types but with the ability to use Prometheus Query Language (Prom QL) query. In essence is it similar to Log Alerts as a query language is used to define some of the logic and source of data for the alert.

You can find the Bicep templates for the [deployment here](https://github.com/slavizh/BicepTemplates/tree/main/monitor-prometheus). In order to try it you will need the following resources as prerequisites:

-   Azure Monitor Action group
-   AKS cluster with System Managed Identity configured (not service principal).
-   You may need to register the following resource providers on the subscriptions you will use: Microsoft.ContainerService, Microsoft.Insights, Microsoft.AlertsManagement
-   Register provider feature – `Register-AzProviderFeature -FeatureName AKS-PrometheusAddonPreview -ProviderNamespace Microsoft.ContainerService` The AKS cluster is onboarded to this monitoring via a new setting on the AKS cluster resource.

I would suggest to check all the available documentation for all prerequisites. Once everything is setup you will end up with the following Azure Monitor resources:

![](/media/2022/11/monitor-resources.png)

*Azure Monitor resources*

When you check the Azure Monitor workspace resource metrics you can see events/metrics being processed by the service:

![](/media/2022/11/monitor-workspace-metrics.png)

*Azure Monitor Workspace metrics*

When you login with user who has permissions on the Managed Grafana the Data source to the managed Prometheus is automatically setup:

![](/media/2022/11/grafana-prometheus-data-source.png)

*Grafana Prometheus data source*

There are built-in dashboards available in Grafana as well:

![](/media/2022/11/prometheus-dashboard.png)

*Prometheus Dashboard*

By modifying the thresholds on one of the alerts I have managed to generate such alert and those alert instances appear in Azure Monitor blade:

![](/media/2022/11/prometheus-alert-instnaces.png)

*Prometheus Alert instances*

You are able to see the details for each alert as well:

![](/media/2022/11/alert-details.png)

*Alert Details*

These alerts also support e-mail notification:

![](/media/2022/11/alert-e-mail-notification.png)

*Alert e-mail notification*

And of course common alerts schema is also supported:

```json
{
  "schemaId": "azureMonitorCommonAlertSchema",
  "data": {
    "essentials": {
      "alertId": "/subscriptions/<subscription id>/providers/Microsoft.AlertsManagement/alerts/2e0b05ad-6367-db4d-efed-f1cd039d5592",
      "alertRule": "RecommendedCIAlerts-aks0001/Average node CPU utilization is greater than 80%",
      "severity": "Sev4",
      "signalType": "Metric",
      "monitorCondition": "Fired",
      "monitoringService": "Prometheus",
      "alertTargetIDs": [
        "/subscriptions/<subscription id>/resourcegroups/mon/providers/microsoft.monitor/accounts/prom007"
      ],
      "configurationItems": [
        "aks0001"
      ],
      "originAlertId": "3b72be0b-4bcb-3713-ee7c-67e71b100dab",
      "firedDateTime": "2022-11-08T08:01:02.3929824Z",
      "description": "Average node CPU utilization is greater than 80%",
      "essentialsVersion": "1.0",
      "alertContextVersion": "1.0"
    },
    "alertContext": {
      "interval": "PT5M",
      "expression": "(  (1 - rate(node_cpu_seconds_total{job=\"node\", mode=\"idle\"}[5m]) ) / ignoring(cpu) group_left count without (cpu)( node_cpu_seconds_total{job=\"node\", mode=\"idle\"}) ) < .8 ",
      "expressionValue": "12.7m",
      "for": "PT5M",
      "labels": {
        "alertname": "Average node CPU utilization is greater than 80%",
        "cluster": "aks0001",
        "cpu": "0",
        "instance": "aks-agentpool-27465642-vmss000000",
        "job": "node",
        "metrics_path": "/metrics",
        "mode": "idle"
      },
      "annotations": {},
      "ruleGroup": "/subscriptions/<subscription id>/resourcegroups/mon/providers/Microsoft.AlertsManagement/prometheusRuleGroups/RecommendedCIAlerts-aks0001"
    },
    "customProperties": null
  }
}
```

Of course this is a preview feature and there was a lot of findings and feedback:

-   Overall setup is easy – I like the integration between Azure Monitor workspace and Grafana when everything is configured inside with just linking the workspace to Grafana in ARM/Bicep.
-   If you use portal or the provided ARM templates by Azure you are most likely to hit error like "Azure Monitor Metrics addon only supports MSI clusters" when you try to configure the AKS cluster with the integration. This is due to having to define the System Managed identity `identity: {type: 'SystemAssigned'}` on the AKS resource even if it was configured before.
-   There are data collection rule and endpoint resources created when you create the Azure Monitor workspace. For example when you create Azure Monitor workspace resource another resource group with name ‘MA\_\_\_managed’ and data collection rule and endpoint with name ” are created. These resources are also linked to the Azure Monitor workspace. I really do not like when resources are created by other resources. Those resources are hard to manage. I would prefer to have a guidance what resources to create and with what configuration instead of being created automatically by other resources.
-   The schema for resource type Microsoft.AlertsManagement/prometheusRuleGroups is not published so currently it is unclear what are all properties available. For example we do not know if you can define custom properties for the common alert schema or not.
-   I would wish that Microsoft.AlertsManagement/prometheusRuleGroups did not combined two type of resources – recording rules and alert rules. This makes it strange for me as you could define both types into a single such resource. How these rules will be visualized in alert rules it is unclear to me?
-   I do not like that Microsoft.AlertsManagement/prometheusRuleGroups allows you to define multiple alert rules in a single resource. For me this is not very logical and does not aligns well with other alert rules in Azure Monitor. Because of this setup this creates a problem like:
    -   the name of the alert rule when exposed in Portal, common alert schema and e-mail is like this – /. This is confusing and you have to be very think of how you define the name of the group and the name of the alert.
-   The threshold for the alert is defined within the Prometheus query expression. I wish it would be possible to define the threshold via the rule similar to how it is made in Log Alerts.
-   The interval for all alert rules in a group is the same. You cannot define interval for each alert rule separately.
-   Affected resource is not tied to the AKS cluster. The affected resource is tied to the Azure Monitor workspace rather to the AKS cluster resource. I hope that this will be fixed. These alerts should know if the affected resource is Azure resource and which is it. In fact when you have alert for node in a pool you the affected resource should be the node or the pool at least.
-   If these metrics are inside the Azure Monitor workspace resource I wonder if some integration will be created to visualize those in Azure Metrics and Azure Monitor workbooks. After all as far as I understand these are stored as time series data which is how Azure metrics are stored.

In summary this new service makes it easier to use Prometheus without having to spin up a bunch of servers and maintain them. There is also initial good integration with Azure built-in but I also see a lot of room for improvement to make the Azure integration better and more consistent with other Azure Monitor features.
