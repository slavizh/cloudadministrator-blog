---
title: "Notes from System Center Battlefield: Monitoring Guest Clusters with SCOM"
excerpt: "So what is guest cluster? A guest cluster is when you create cluster inside of virtual machines. In the past we’ve done that trough ISCSI or FC and lately with Shared VHDX in Windows Server 2012 R2…"
description: "So what is guest cluster? A guest cluster is when you create cluster inside of virtual machines. In the past we’ve done that trough ISCSI or FC and lately wi..."
pubDate: 2014-01-16
updatedDate: 2015-09-20
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2014/01/16/notes-from-system-center-battlefield-monitoring-guest-clusters-with-scom/"
tags: 
  - "Alerts"
  - "Clusters"
  - "Guest Clustering"
  - "Guest Clusters"
  - "Hyper V"
  - "Monitoring"
  - "Noise"
  - "SCOM"
  - "Shared Vhdx"
  - "System Center"
  - "System Center Operations Manager"
  - "Cluster"
  - "Hyper-V"
  - "Microsoft"
  - "Network"
  - "Software"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "Windows Server 2012 R2"
---
So what is guest cluster? A guest cluster is when you create cluster inside of virtual machines. In the past we’ve done that trough ISCSI or FC and lately with Shared VHDX in Windows Server 2012 R2. And like any other cluster you will want to monitor these clusters with SCOM but as they are just like any other cluster where is the catch? The catch is from time to time these guest clusters will be live migrated to different hosts and sometimes the cluster can sense these live migrations and raise some alerts which of course will show in SCOM. Not that the live migration of virtual machine is something bad just clusters are very sensitive on network side. There is a resolution to this and it is all described [here](http://technet.microsoft.com/en-us/library/dn440540.aspx). Basically you need to execute the following commands to increase the threshold of the cluster heartbeat:

```
Get-Cluster | fl *subnet*
```

```
(Get-Cluster).CrossSubnetThreshold = 20
```

```
(Get-Cluster).SameSubnetThreshold = 20
```

```
Get-Cluster | fl *subnet*
```

So if you have guest clusters and SCOM definitely change that settings on the guest clusters.
