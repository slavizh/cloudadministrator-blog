---
title: "Linear or Logarithmic View for Performance Data in OMS Log Analytics?"
excerpt: "As you may have noticed in OMS Log Analytics for performance data you can now choose between linear or logarithmic view."
description: "As you may have noticed in OMS Log Analytics for performance data you can now choose between linear or logarithmic view."
pubDate: 2016-07-13
updatedDate: 2016-07-13
heroImage: "/media/2016/07/image4.png"
sourceUrl: "https://cloudadministrator.net/2016/07/13/linear-or-logarithmic-view-for-performance-data-in-oms-log-analytics/"
tags: 
  - "Analysis"
  - "Big Data"
  - "Data"
  - "Linear"
  - "Log Analytics"
  - "Logarithmic"
  - "MSOMS"
  - "OMS"
  - "Operational Insights"
  - "Operations Management Suite"
  - "OpInsights"
  - "Pattern"
  - "Azure"
  - "Azure Operational Insights Preview"
  - "Microsoft"
  - "Performance Data"
---
As you may have noticed in OMS Log Analytics for performance data you can now choose between linear or logarithmic view.

[![image](/media/2016/07/image4.png "image")](/media/2016/07/image4.png)

Don’t worry this is not [tabs vs. spaces discussion](https://www.youtube.com/watch?v=SsoOG6ZeyUI). It is more of which scale is right for specific performance data or specific case. You can search over Internet for different definitions of those scales and even a lot of examples. The quote below provides simple explanation for those two scales:

-   On a linear scale, a change between two values is perceived on the basis of the **difference** between the values. Thus, for example, a change from 1 to 2 would be perceived as the same amount of increase as from 4 to 5.
-   On a logarithmic scale, a change between two values is perceived on the basis of the **ratio** of the two values. That is, a change from 1 to 2 (ratio of 1:2) would be perceived as the same amount of increase as a change from 4 to 8 (also a ratio of 1:2).

From [http://www.sfu.ca/](http://www.sfu.ca/ "http://www.sfu.ca/")

Let’s look at some examples in OMS to see where looking at the different scales could make some difference.

In the chart below shown as Linear scale (this is the default one) I am tracking with a query the connection attempts to a number of web sites. From the graphic  below we can see that a lot of web sites have close to 0 connection attempts and only one has some serious activity.

[![image](/media/2016/07/image5.png "image")](/media/2016/07/image5.png)

But if we switch to Logarithmic view that is not exactly true. We have some activity on another site as well. It is not big the blue one but still it has similar curve and the same growth.

[![image](/media/2016/07/image6.png "image")](/media/2016/07/image6.png)

The reason why these sites have similarities in Logarithmic view is because these sites are communicating with each other.

If we query the requests count for these sites you will again see some differences between Linear and Logarithmic views:

[![image](/media/2016/07/image7.png "image")](/media/2016/07/image7.png)

[![image](/media/2016/07/image8.png "image")](/media/2016/07/image8.png)

Taking a look at these small examples we could make two conclusions when we should use Logarithmic view instead of Linear one:

-   In some cases when we are tracking some precise numbers that have a lot of numbers after the decimal point and the pattern of increase and decrease matter mores than the actual numbers.
-   When we track some patters between two objects because they can have different values but the pattern of increase and decrease is the same

My recommendation is to always try the different views to visualize the data.

I hope this was helpful for you and if you have more examples please share them in comments, forums or your own blog post.
