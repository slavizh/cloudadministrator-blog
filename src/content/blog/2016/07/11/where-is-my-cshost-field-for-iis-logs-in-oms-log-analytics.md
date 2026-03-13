---
title: "Where is My csHost Field for IIS Logs in OMS Log Analytics?"
excerpt: "This is one of those quick blog posts. You may end up in situation where csHost field is missing when you ingest IIS logs."
description: "This is one of those quick blog posts. You may end up in situation where csHost field is missing when you ingest IIS logs."
pubDate: 2016-07-11
updatedDate: 2016-07-11
heroImage: "/media/2016/07/image.png"
sourceUrl: "https://cloudadministrator.net/2016/07/11/where-is-my-cshost-field-for-iis-logs-in-oms-log-analytics/"
tags: 
  - "Cshost"
  - "IIS"
  - "Log Analytics"
  - "Logs"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpInsights"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "W3C"
---
This is one of those quick blog posts. You may end up in situation where csHost field is missing when you ingest IIS logs.

[![image](/media/2016/07/image.png "image")](/media/2016/07/image.png)

This is just the default behavior. By default IIS web server generates a log with certain fields and host header name is not one of them. The solution is simple. On every IIS server add the fields that you want to be in W3C log. Go to IIS Manager and on the whole server or for specific site click on Logging.

[![image](/media/2016/07/image1.png "image")](/media/2016/07/image1.png)

Click on Select Fields and select the fields that you want to be added to the log.

[![image](/media/2016/07/image2.png "image")](/media/2016/07/image2.png)

Note that custom created fields are not ingested by OMS Log Analytics. After that change new logs will contain that field.

[![image](/media/2016/07/image3.png "image")](/media/2016/07/image3.png)

I hope this was helpful.
