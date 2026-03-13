---
title: "Find if You Are Using Only TLS 1.2 Protocol with Log Analytics"
excerpt: "I’ve stumbled on a great article by Brandon Wilson named Demystifying Schannel on which he explains how we can enable verbose logging for Schannel to found out what protocols our machines are using…"
description: "I’ve stumbled on a great article by Brandon Wilson named Demystifying Schannel on which he explains how we can enable verbose logging for Schannel to found o..."
pubDate: 2017-11-14
updatedDate: 2022-08-17
heroImage: "/media/2017/11/image.png"
sourceUrl: "https://cloudadministrator.net/2017/11/14/find-if-you-are-using-only-tls-1-2-protocol-with-log-analytics/"
tags: 
  - "Azure"
  - "Event Log"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "OMS"
  - "Operations Management Suite Msoms"
  - "Query"
  - "Schannel"
  - "Search"
  - "TLS 1 0"
  - "Azure Operational Insights Preview"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Operations Management Suite"
  - "Security & Compliance"
  - "Windows"
  - "TLS 1 2"
---
I’ve stumbled on a great article by [Brandon Wilson](https://social.technet.microsoft.com/profile/BrandonWilson) named [Demystifying Schannel](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/demystifying-schannel/ba-p/259233) on which he explains how we can enable verbose logging for Schannel to found out what protocols our machines are using. As I leave and breathe Log Analytics and love to crunch data I thought would be cool example if we can ingest that data into it  and show you some cool example with the new query language on transforming data.

So first a few important things:

-   In the article you can find out how to enable the verbose logging for Schannel and you can use the procedure to enable it on multiple machines
-   After that is enabled you can simply add the System log into data sources if it is not added already
-   I would strongly suggest to enable this for only short period 1-2 hours maximum to avoid big increase in your Log Analytics usage. 1-2 hours should be enough to get a good sample across your environment what protocol is being used.

After the above you could just wait until the data is in your Log Analytics workspace. When you have the data you can query it:

_Event_

_| where EventID == 36880_

[![image](/media/2017/11/image.png "image")](/media/2017/11/image.png)

As we can see the data is not very well formatted. It will be a struggle if we try to make some sense out of it in its current state. But do not worry. With the new language we can easily transform the data by using parse:

_Event_

_| where EventID == 36880_

_| parse kind=relaxed EventData with \* “<Protocol>” Protocol ‘</Protocol><CipherSuite>’ CipherSuite ‘</CipherSuite><ExchangeStrength>’ ExchangeStrength ‘</ExchangeStrength><ContextHandle>’ ContextHandle ‘</ContextHandle><TargetName>’ TargetName ‘</TargetName><LocalCertSubjectName>’ LocalCertSubjectName ‘</LocalCertSubjectName><RemoteCertSubjectName>’ RemoteCertSubjectName ‘</RemoteCertSubjectName>’ \*_

_| sort by TimeGenerated desc_

_| project Computer, TimeGenerated, Protocol, CipherSuite, ExchangeStrength, ContextHandle, TargetName, RemoteCertSubjectName, UserName_

[![image](/media/2017/11/image1.png "image")](/media/2017/11/image1.png)

With this query we get completely different picture. Now that the data is transformed we can do some summarization on it:

_Event_

_| where EventID == 36880_

_| parse kind=relaxed EventData with \* “<Protocol>” Protocol ‘</Protocol><CipherSuite>’ CipherSuite ‘</CipherSuite><ExchangeStrength>’ ExchangeStrength ‘</ExchangeStrength><ContextHandle>’ ContextHandle ‘</ContextHandle><TargetName>’ TargetName ‘</TargetName><LocalCertSubjectName>’ LocalCertSubjectName ‘</LocalCertSubjectName><RemoteCertSubjectName>’ RemoteCertSubjectName ‘</RemoteCertSubjectName>’ \*_

_| sort by TimeGenerated desc_

_| summarize count() by Protocol | render piechart_

[![image](/media/2017/11/image2.png "image")](/media/2017/11/image2.png)

and

_Event_

_| where EventID == 36880_

_| parse kind=relaxed EventData with \* “<Protocol>” Protocol ‘</Protocol><CipherSuite>’ CipherSuite ‘</CipherSuite><ExchangeStrength>’ ExchangeStrength ‘</ExchangeStrength><ContextHandle>’ ContextHandle ‘</ContextHandle><TargetName>’ TargetName ‘</TargetName><LocalCertSubjectName>’ LocalCertSubjectName ‘</LocalCertSubjectName><RemoteCertSubjectName>’ RemoteCertSubjectName ‘</RemoteCertSubjectName>’ \*_

_| sort by TimeGenerated desc_

_| where Protocol != ‘TLS 1.2’_

_| summarize count() by RemoteCertSubjectName | render piechart_

### [![image](/media/2017/11/image3.png "image")](/media/2017/11/image3.png)

This is the power the power of Log Analytics – Analyze data with ease.

I hope this example would be helpful for you.
