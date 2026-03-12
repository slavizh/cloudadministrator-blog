---
title: "Less Than Thresholds in OMS View Designer"
excerpt: "I saw that a few folks were struggling of expressing less than thresholds in Operations Management Suite View Designer. There’s more than one way to skin a cat. This is just idiom and I do no…"
description: "I saw that a few folks were struggling of expressing less than thresholds in Operations Management Suite View Designer. There’s more than one way to skin a c..."
pubDate: 2016-10-03
updatedDate: 2016-10-03
heroImage: "/media/wordpress/2016/10/image.png"
sourceUrl: "https://cloudadministrator.net/2016/10/03/less-than-thresholds-in-oms-view-designer/"
tags: 
  - "Insights Analytics"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Security Compliance"
  - "Threshold"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operations Management Suite"
  - "Security & Compliance"
  - "View Designer"
---
I saw that a few folks were struggling of expressing less than thresholds in Operations Management Suite View Designer. There’s more than one way to skin a cat. This is just idiom and I do not have anything against cats.

Where is the exact problem?

When you create view in OMS View Designer you have the option for Thresholds but the options only allow for greater values as you see in the example:

[![image](/media/wordpress/2016/10/image.png "image")](/media/wordpress/2016/10/image.png)

So some folks are confused on how do you express those thresholds for example if you want to have red (error) on value lower than 10 for example. Such example is if you want to monitor % Free Disk space.

The solution is simple. Use reverse logic. Here is example:

For List query I use: _**Type:Perf (ObjectName=LogicalDisk) (CounterName=”% Free Space”)   | Measure Avg(CounterValue) as AVGFreeSpace by InstanceName, Computer | sort AVGFreeSpace ASC**_

As you can see first I am sorting the results so the lowest values are at the top. That way I will guarantee that my top 10 results will be those with lowest values.

Second I am renaming the default value to Error and putting red color. Warning is for those that are above 10 and Normal is for those above 15.

[![image](/media/wordpress/2016/10/image1.png "image")](/media/wordpress/2016/10/image1.png)

This is basically the reverse logic so if a drive is below 10% it will be red (error), between 10% and 15% it will be yellow (warning) and above 15 % will be green (normal).

Hope this helps you and let your imagination to be limited by feature limitations.
