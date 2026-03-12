---
title: "Why My Newly Added Event Log to OMS Not Appearing in Search"
excerpt: "This blog post it is kind of short tip but also something you should pay attention to. You might end up adding a event log to OMS but the events from that log not appearing in OMS."
description: "This blog post it is kind of short tip but also something you should pay attention to. You might end up adding a event log to OMS but the events from that lo..."
pubDate: 2016-02-29
updatedDate: 2016-02-29
heroImage: "/media/wordpress/2016/02/image5.png"
sourceUrl: "https://cloudadministrator.net/2016/02/29/why-my-newly-added-event-log-to-oms-not-appearing-in-search/"
tags: 
  - "Azure Operational Insights"
  - "Event Log"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpInsights"
  - "Search"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Troubleshoot"
---
This blog post it is kind of short tip but also something you should pay attention to.

You might end up adding a event log to OMS but the events from that log not appearing in OMS.

Let’s say you want to add the Admin event log for Hyper-V-VMMS. In that case you will usually go to Event viewer and find the needed log.

[![image](/media/wordpress/2016/02/image5.png "image")](/media/wordpress/2016/02/image5.png)

You will copy the log name and add it to OMS and save changes:

[![image](/media/wordpress/2016/02/image6.png "image")](/media/wordpress/2016/02/image6.png)

After adding it of course you may have to wait 5 to 10 minutes until events starts showing up in OMS Search. Keep in mind that also new events have to be generated in order to be fetch by the OMS agent.

If new events are not shown after that time you will also see Event ID 26002 showing up in the Operations Manager log. That event will which particular log was not found on this machine:

[![image](/media/wordpress/2016/02/image7.png "image")](/media/wordpress/2016/02/image7.png)

We can clearly see that the event log with that name cannot be found.

So where is the problem than?

The problem is that not always the Log name is also the Full Name of the log. How to find the Full Name?

Just go to the properties of the event log itself and you will be able to find the full name:

[![image](/media/wordpress/2016/02/image8.png "image")](/media/wordpress/2016/02/image8.png)

After that you just need to add that name to OMS:

[![image](/media/wordpress/2016/02/image9.png "image")](/media/wordpress/2016/02/image9.png)

After that everything should be ok.

Remember always check for the full name when you add event logs.
