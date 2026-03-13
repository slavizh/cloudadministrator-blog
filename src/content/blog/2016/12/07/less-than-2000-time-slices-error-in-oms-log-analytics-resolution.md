---
title: "Less Than 2000 Time Slices Error in OMS Log Analytics – Resolution"
excerpt: "I’ve seen a lot of people having the following error appear when they do measurement functions in OMS Log Analytics Search: Intervals for aggregate functions must result in less than 2000 time slic…"
description: "I’ve seen a lot of people having the following error appear when they do measurement functions in OMS Log Analytics Search: Intervals for aggregate functions..."
pubDate: 2016-12-07
updatedDate: 2016-12-07
heroImage: "/media/2016/12/image.png"
sourceUrl: "https://cloudadministrator.net/2016/12/07/less-than-2000-time-slices-error-in-oms-log-analytics-resolution/"
tags: 
  - "Error"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Search"
---
I’ve seen a lot of people having the following error appear when they do measurement functions in OMS Log Analytics Search:

Intervals for aggregate functions must result in less than 2000 time slices Unexpected ‘measure’ at position XX.

[![image](/media/2016/12/image.png "image")](/media/2016/12/image.png)

The reason for this error is that we are running measurement query for the past 1 day but we are slicing the intervals into 30 seconds results which results in more than 2000 time slices (results per computer).

The solution for this is simple like increasing the 30 seconds interval in the query or decreasing the time interval of the data:

60 Seconds interval (Option A)

_Type=Perf ObjectName=Processor CounterName=”% Processor Time” InstanceName=\_Total | measure avg(CounterValue) by Computer Interval 60seconds_

[![image](/media/2016/12/image1.png "image")](/media/2016/12/image1.png)

6 Hours time frame (Option B)

Type=Perf ObjectName=Processor CounterName=”% Processor Time” InstanceName=\_Total | measure avg(CounterValue) by Computer Interval 30seconds

[![image](/media/2016/12/image2.png "image")](/media/2016/12/image2.png)

As you can see both options work although they are not very pretty. That is why there is option C and I think it might be the best option for most of folks out there using OMS Log Analytics.

Option is to get rid of interval at all and use display instead. That way the query is dynamic and it fits in every time frame:

_Type=Perf ObjectName=Processor CounterName=”% Processor Time” InstanceName=\_Total | measure avg(CounterValue) by Computer | display LineChart_

6 hours time frame

[![image](/media/2016/12/image3.png "image")](/media/2016/12/image3.png)

7 days time frame

[![image](/media/2016/12/image4.png "image")](/media/2016/12/image4.png)

30 days time frame

[![image](/media/2016/12/image5.png "image")](/media/2016/12/image5.png)

Of course if you need more granular slicer you always can go in advanced mode and use the interval.

I must say that previously this error hasn’t appeared but some changes on the platform in the last month cause more people to see it so I had to address it with proper answer.

I hope this will help in less questions about this error.
