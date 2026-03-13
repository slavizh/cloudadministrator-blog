---
title: "#MSOMS Is Not #SCOM"
excerpt: "I’ve been meaning to write this blog post for a long time. The reason for that is because since the first preview of OMS (Operational Insights back in the day) I’ve received question like “I’ve rem…"
description: "I’ve been meaning to write this blog post for a long time. The reason for that is because since the first preview of OMS (Operational Insights back in the da..."
pubDate: 2016-08-12
updatedDate: 2016-08-12
heroImage: "/media/2016/08/wlemoticon-smile.png"
sourceUrl: "https://cloudadministrator.net/2016/08/12/msoms-is-not-scom/"
tags: 
  - "Agent"
  - "Data"
  - "Heartbeat"
  - "Log Analytics"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpsMgr"
  - "SCOM"
  - "SQL"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "System Center Operations Manager"
  - "System Center Operations Manager"
---
I’ve been meaning to write this blog post for a long time. The reason for that is because since the first preview of OMS (Operational Insights back in the day) I’ve received question like “I’ve removed the Microsoft Monitoring Agent from my server but why I still see the server in OMS?” trough various channels. And btw if you wonder how long I’ve been using OMS today is exactly 2 years and 3 months since it was announced at TechEd North America 2014. I probably should be getting some honorable badge for this achievement ![Smile](/media/2016/08/wlemoticon-smile.png) . Back to the topic. While there are scenarios in which you can think of OMS like it is SCOM in many ways you should not and there is reason for that. I will try with this blog post to explain why and answer the above question. We can summarize the differences between Operations Management Suite and SCOM in the following statements:

-   SCOM is storing data into two databases – Operational database and data warehouse.
-   OMS is storing the data on azure storage (Azure File share last time I’ve heard about it).
-   SCOM data is processed from Operational database and moved to data warehouse (think of maintenance jobs).
-   OMS data is moved from hot blocks to cold blocks on the azure Storage ( I assume ).
-   SCOM data is constrained in SQL. Yes I’ve said it.
-   SCOM data is viewed by creating views and reports and running reports to two different databases.
-   OMS data can be searched freely with simple syntax.
-   SCOM data relies on SQL language for the data to be processed and crunched.
-   OMS has built in functions for processing and crunching data.

And I can continue on and on with this but you get the idea. The comparison is only on data (architectural) level as that is the part that I need to answer the question. To answer the question we will need to dig into SCOM first to see what happens when agent is removed from it. That process can be described in the following steps:

-   You have agent that reports to SCOM Management Group.
-   You remove the agent from the console console. For example uninstalling it remotely.
-   Server is not longer showing in SCOM console

Your first thought would be that the data for that agent has been removed at least from the Operational database but that is actually not true. What happens is that the data related to that server is marked with IsDeleted value thus disappearing every where from the console. The actual data is still in both databases and can be found with SQL queries. Over time of course the data will be gone depending on your retention periods for both databases. This brings us closer to our answer. OMS does not have console it has portal. You can remove agent by either uninstalling the agent or changing your workspace keys. Both will result in agent no longer able to report to OMS thus no data for that server will be available in OMS from the time it was removed. Remember OMS is all about data and time period. As you are free to search for any data in OMS no data is hidden from you in the portal. When you remove agent in the Settings dashboard you will still see those agent as reporting. The reason behind that is because behind those numbers

[![image](/media/2016/08/image.png "image")](/media/2016/08/image.png)

there is simple query that that is scoped to specific time frame and for that time frame there is still data for those removed agents. As data in OMS can be accessed freely you can easily create your own query that is not something general and tied to your needs. Example

_MG:”00000000-0000-0000-0000-000000000001″ or MG:”00000000-0000-0000-0000-000000000002″ TimeGenerated>NOW-5MINUTES | Measure Max(TimeGenerated) as LastData by Computer | top 500000 | Sort Computer_

[![image](/media/2016/08/image1.png "image")](/media/2016/08/image1.png)

So remember that OMS is all about data and you are in control of the data. You do not have to maintain the data by purging or not. All data is there  according to your plan and it is up to you to make the query to show the data that will give you the desired results. With the recently released view designer you can now be even more creative with visualizing your data with queries.

Remember also that OMS is a suite of service and not just the Log Analytics part that was subject of the blog post. Don’t treat OMS like SCOM. Think differently.

While we are on the subject you should check blog post [#MSOMS is heartbeating](https://nocentdocent.wordpress.com/2016/08/12/msoms-is-heartbeating/) by my dear friend [Daniele](https://twitter.com/DanieleGrandini).

I hope this blog post was informative and helpful for you.

P.S. The name of blog post is intentionally catchy.
