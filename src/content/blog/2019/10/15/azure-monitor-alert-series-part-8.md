---
title: "Azure Monitor Alert Series – Part 8"
excerpt: "We are now on part 9 of these series. This blog post will be shorter compared to the others due to the nature of the alert we will cover in it. This time we will explore Azure Monitor for VMs alert…"
description: "We are now on part 9 of these series. This blog post will be shorter compared to the others due to the nature of the alert we will cover in it. This time we..."
pubDate: 2019-10-15
updatedDate: 2020-01-19
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2019/10/15/azure-monitor-alert-series-part-8/"
tags: 
  - "Azure"
  - "Azure Alerts"
  - "Azure Management"
  - "Azure Monitor"
  - "Azure Monitor Alert Series"
  - "Azure Monitor for VMs"
  - "Log Analytics"
  - "ARM"
  - "Azure Resource Manager"
  - "VM Insights"
---
We are now on part 8 of these series. This blog post will be shorter compared to the others due to the nature of the alert we will cover in it. This time we will explore Azure Monitor for VMs alerts. Before proceeding to the alert part I should mention that Azure Monitor for VMs is in public preview. Always proceed with caution when using preview features as there might be some things missing compared to services/features that are general available.

**Update 16.10.2019**: A few hours after I have released this blog post the following announcement was made [Updates to Azure Monitor for virtual machines (preview) before general availability release](https://azure.microsoft.com/en-us/updates/updates-to-azure-monitor-for-virtual-machines-preview-before-general-availability-release/)

To understand better the Azure Monitor for VMs alerts we need to understand better how the solution works. The solution itself consists of 3 major features:

-   Gathering performance data trough performance counters from Windows and Linux VMs
-   Visualizing maps of TCP communication on the VMs (via Service Map)
-   Discovering and showing VM health data

To understand better the Azure Monitor for VMs alerts we need to understand better how the solution works. The solution itself consists of 3 major features:

-   Gathering performance data trough performance counters from Windows and Linux VMs
-   Visualizing maps of TCP communication on the VMs (via Service Map)
-   Discovering and showing VM health data

The last one is the part that contains the alerts. If you have used SCOM the next workflow might be familiar for you but if not here is a brief explanation.

1.  First part of having the VM health data is to deploy solution called Infrastructure Insights
2.  Next you deploy the Log Analaytics agent and optionally Dependency agent on your Azure VM.
3.  Once the agent is deployed and connected to the workspace it sees that Infrastructure Insights solution is deploys and deploys the bits for VM health feature
4.  VM health bits do discovery on the machine. For example they discover the OS type, number of disks, etc.
5.  Once discovery is done certain monitors are available on the machine depending on its OS type. For example a monitor for the Total CPU starts to run so when CPU is too high alert to be generated.
6.  The monitors itself and its data it is not send to Log Analytics workspace as records but instead it appears as resource type under Azure VMs Resource provider (Microsoft.Computer/virtualMachines API). When monitor because unhealthy due to threshold reached this information is reflected in the API.

It is important to note that the APIs are present only when the machine is running and configured for Azure Monitor for VMs. All the monitors are build by the solution and you can modify some parts of time like threshold and/or being enabled or disabled. The monitors are basically the alerts that you can just re-configure some properties per VM. Notifications (action groups) instead of being able to configure those per monitor you configure for all monitors per VM. Here is the time also to mention some of the qualities and limitations of these alerts/monitors:

-   Alerts are fired per resource and instance. For example you can alert for low disk space for one VM and one volume.
-   Severity cannot be assigned or modified
-   They do not support common alert schema so your action groups should fire only e-mails
-   Although alerts are fired per instance the monitor itself can be modified only per VM
-   Alerts are automatically resolved if issue is fixed on the VM
-   Monitors are bound to the location of the VM
-   Action groups are configured per VM rather per alert rule or for all alert rules in a subscription
-   Monitors API does not support ARM templates

As you can see one of the biggest limitations for me is the last bullet point. Because I still want to show you some examples in this blog post I will use [armclient tool](https://github.com/projectkudu/ARMClient) which can do web calls to any Azure API no matter if it is ARM template compliant or not. I am not going to show something quite new as this was [already documented](https://azure.microsoft.com/sv-se/blog/understanding-health-criteria-in-azure-monitor-for-vms/) by Microsoft.

```powershell
# Login to Azure
armclient login

# Set Action Group Resource ID and VM Resource ID
$actionGroupResourceId = "/subscriptions/9ba5fa45-99c6-4cfe-8bb6-6c0e120dd37c/resourceGroups/Default-ActivityLogAlerts/providers/microsoft.insights/actiongroups/TestWebhook"
$vmResourceId = "/subscriptions/9ba5fa45-99c6-4cfe-8bb6-6c0e120dd37c/resourcegroups/vmhealth/providers/Microsoft.Compute/virtualMachines/vm002"

# Update monitor Microsoft_PhysicalDisk_AvgDiskSecPerWrite threshold value
$payload ="{'properties':{'criteria': [{'healthState': 'Warning','comparisonOperator': 'GreaterThan','threshold': 0.05}] }}"
armclient patch "$($vmResourceId)/providers/Microsoft.WorkloadMonitor/monitors/Microsoft_PhysicalDisk_AvgDiskSecPerWrite?api-version=2018-08-31-preview" $payload
armclient get "$($vmResourceId)/providers/Microsoft.WorkloadMonitor/monitors/Microsoft_PhysicalDisk_AvgDiskSecPerWrite?api-version=2018-08-31-preview"

# Add action group to Azure Monitor for VMs alerts. They are added per VM
$payload = "{'properties': { 'actionGroupResourceIds': ['$($actionGroupResourceId)']} }"
armclient PUT "$($vmResourceId)/providers/Microsoft.WorkloadMonitor/notificationSettings/default?api-version=2018-08-31-preview" $payload
armclient get "$($vmResourceId)/providers/Microsoft.WorkloadMonitor/notificationSettings/default?api-version=2018-08-31-preview"

# Get all Azure Monitor for VMs alerts
armclient get "$($vmResourceId)/providers/Microsoft.WorkloadMonitor/monitors?api-version=2018-08-31-preview"
```

As you can see from the example I have put some comments so it is easier to understand every line. In general I am doing 4 things:

-   Logging to Azure
-   Modifying the threshold of one monitor for one VM
-   Setting action group for the monitors of one VM
-   Listing all monitors available for a single VM

When I have modification request I also do get request so you can see the change implemented.

As someone who has a lot of experience with Azure ARM API I certainly see a lot of things that needs to be improved in the future:

-   Ability to modify monitors at scale. For example I should be able to modify the rules for any monitor at subscription level or management group level. I should be able to do that even if I do not have VMs in the subscription so when the new VMs are added they automatically inherit those overrides
-   Same applies for setting action group setup
-   Ability to apply exclusions. For example I may want to disable certain alerts for certain volumes
-   Ability to modify threshold per instance. For example I should be able to modify monitors thresholds per instance
-   Ability to do every Azure Monitor for VMs configuration via ARM template

There are of course more improvements that can be done but I wanted to focus specifically from API perspective.

I hope this was useful part for you on the series.
