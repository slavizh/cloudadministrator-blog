---
title: "Configure OMS Linux Agent Heartbeat Interval"
excerpt: "As you know both OMS Linux and Windows agent send heartbeat events and they are free of charge. The problem is that the interval of these heartbeat events is different for both operating systems. F…"
description: "As you know both OMS Linux and Windows agent send heartbeat events and they are free of charge. The problem is that the interval of these heartbeat events is..."
pubDate: 2018-02-23
updatedDate: 2018-02-23
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2018/02/23/configure-oms-linux-agent-heartbeat-interval/"
tags: 
  - "Agent"
  - "Azure"
  - "Heartbeat"
  - "Linux"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Operations Management Suite"
  - "Script"
  - "Operations Management Suite"
---
As you know both OMS Linux and Windows agent send heartbeat events and they are free of charge. The problem is that the interval of these heartbeat events is different for both operating systems. For Windows it is every 1 minute and for Linux is every 5 minutes. I do not know exactly the reason for this decision but I prefer that all my servers report at the same interval. The beautiful thing with the OMS Linux agent that is extendable and configurable. So this blog post will focus on how you can easily change the heartbeat interval on OMS Linux agent to 1 minute.

-   Login to your distro via SSH.
-   Make sure that you know the Workspace ID to which your Linux agents are connected.
-   Execute the command below by replacing the ID with your own. You can use your favorite editor if you want.

```bash
sudo vi /etc/opt/microsoft/omsagent/<workspace id>/conf/omsagent.d/monitor.conf
```

-   After that you will need to change the following configuration from:

```xml
<source>
  type oms_heartbeat
  interval 5m
</source>
```

to

```xml
<source>
  type oms_heartbeat
  interval 1m
</source>
```

-   Insert key is used to go into editing mode and Esc key us used for entering into command mode. Executing :qw in command mode saves the configuraiton.
-   After that you only need to restart the OMS agent service:

```bash
sudo /opt/microsoft/omsagent/bin/service_control restart
```

-   You will start to see that the linux agents now report heartbeat every minute instead of every 5 minutes

Keep in mind that I am not aware if this change is supported or not but I would strongly advise you to not decrease the value below 1 minute.
