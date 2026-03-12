---
title: "Quick Look at the New SQL Server 2012 Analysis Services Management Pack"
excerpt: "Release several hours ago a new Management Pack for SQL Server 2012 Analysis Services. There is also a version for SQL 2008 Analysis Services. But I will focus this blog post on the 2012 version. T…"
description: "Release several hours ago a new Management Pack for SQL Server 2012 Analysis Services. There is also a version for SQL 2008 Analysis Services. But I will foc..."
pubDate: 2014-01-24
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2014/01/image3.png"
sourceUrl: "https://cloudadministrator.net/2014/01/24/quick-look-at-the-new-sql-server-2012-analysis-services-management-pack/"
tags: 
  - "Management Pack"
  - "Monitor"
  - "Monitoring"
  - "MP"
  - "SCOM"
  - "SQL"
  - "SQL Analysis Services"
  - "System Center"
  - "Management Packs"
  - "Microsoft"
  - "Software"
  - "SQL 2012"
  - "System Center Operations Manager"
  - "System Center Operations Manager"
---
Release several hours ago a new Management Pack for [SQL Server 2012 Analysis Services](http://www.microsoft.com/en-us/download/details.aspx?id=41658). There is also a version for [SQL 2008 Analysis Services](http://www.microsoft.com/en-us/download/details.aspx?id=41659). But I will focus this blog post on the 2012 version. The SQL Server Management Pack provides some monitoring for SQL Analysis Services but does not goes too deep and now with this new MP you have that option. Let’s look on how to install it and import it:

[![image](/media/wordpress/2014/01/image3.png "image")](/media/wordpress/2014/01/image3.png)

As we can see from the installation the MP is done probably by the same team that brought the SQL Server MP which hints probably will be a good MP.

[![image](/media/wordpress/2014/01/image4.png "image")](/media/wordpress/2014/01/image4.png)

[![image](/media/wordpress/2014/01/image5.png "image")](/media/wordpress/2014/01/image5.png)

After installation you can import the MP files.

A Run As account needs to be created for monitoring your SQL Analysis Services. That account needs to be local administrator on the SQL Server Analysis services servers and administrator in the Analysis Services instances. Distribute the account only to the servers that have Analysis Services installed.

[![image](/media/wordpress/2014/01/image6.png "image")](/media/wordpress/2014/01/image6.png)

Than assign that account to the two profiles for Analysis Services:

[![image](/media/wordpress/2014/01/image7.png "image")](/media/wordpress/2014/01/image7.png)

You can see what views we have for usage:

[![image](/media/wordpress/2014/01/image8.png "image")](/media/wordpress/2014/01/image8.png)

We are also getting some alerts as soon as the objects are being discovered:

[![image](/media/wordpress/2014/01/image9.png "image")](/media/wordpress/2014/01/image9.png)

You can see my databases are discovered:

[![image](/media/wordpress/2014/01/image10.png "image")](/media/wordpress/2014/01/image10.png)

As with SQL Server 2012 MP in this one we also have some nice Dashboards:

[![image](/media/wordpress/2014/01/image11.png "image")](/media/wordpress/2014/01/image11.png)

My instances are also discovered:

[![image](/media/wordpress/2014/01/image12.png "image")](/media/wordpress/2014/01/image12.png)

Instance Dashboard:

[![image](/media/wordpress/2014/01/image13.png "image")](/media/wordpress/2014/01/image13.png)

We also have separate views for different types of Analysis Services:

[![image](/media/wordpress/2014/01/image14.png "image")](/media/wordpress/2014/01/image14.png)

[![image](/media/wordpress/2014/01/image15.png "image")](/media/wordpress/2014/01/image15.png)

The MP seems very solid and with a lot of information that will bring your SQL Analysis Services monitoring on another level.

Remember that if you will implement it to make some proper testing on your own and definitely read the included guide before importing.
