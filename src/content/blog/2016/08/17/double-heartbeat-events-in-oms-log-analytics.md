---
title: "Double Heartbeat Events in OMS Log Analytics"
excerpt: "I was testing the new Agent Health solution in OMS and I’ve noticed that I have two Heartbeat events generated at the same time for the same computer but having different values for SCAgentChannel …"
description: "I was testing the new Agent Health solution in OMS and I’ve noticed that I have two Heartbeat events generated at the same time for the same computer but hav..."
pubDate: 2016-08-17
updatedDate: 2016-08-17
heroImage: "/media/2016/08/image2.png"
sourceUrl: "https://cloudadministrator.net/2016/08/17/double-heartbeat-events-in-oms-log-analytics/"
tags: 
  - "Agent"
  - "Health"
  - "Heartbeat"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Scagentchannel"
  - "SCOM"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Operational Insights"
  - "Software"
  - "System Center"
  - "System Center Operations Manager"
  - "System Center Operations Manager"
---
I was testing the new Agent Health solution in OMS and I’ve noticed that I have two Heartbeat events generated at the same time for the same computer but having different values for SCAgentChannel field. At first I thought it was some kind of bug related that this server is connected to SCOM management group and the MG is connected to OMS but also the server has direct connection to Internet.

[![image](/media/2016/08/image2.png "image")](/media/2016/08/image2.png)

I was wrong. I’ve reached out to my favorite PG (OMS) and I’ve got the reason why there are double events. When an agent is connected to OMS via SCOM Management group some data passes trough the SCOM Management servers other data like performance data, IIS logs and Security logs are being passed directly to the OMS service because of the high velocity of that data. So the two heartbeats are correct and very clever approach because basically you have two channels trough which you are passing data to OMS. Kudos to the OMS team for implementing this and thanks to Satya Vel for explaining me the reason for this behavior.
I hope this tip was useful for you.
