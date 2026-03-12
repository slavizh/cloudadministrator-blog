---
title: "Using Optional parameter if not configured in Azure Monitor workbooks with KQL query"
excerpt: "Azure Monitor workbooks facilitate Azure data visualization for monitoring and analysis. While documentation exists for creating them, advanced scenario examples are scarce. A recent inquiry explor…"
description: "Azure Monitor workbooks facilitate Azure data visualization for monitoring and analysis. While documentation exists for creating them, advanced scenario exam..."
pubDate: 2025-02-05
updatedDate: 2025-02-05
heroImage: "/media/wordpress/2025/02/generate-image-that-looks-at-computer-screen-with-azure-monitor.png"
sourceUrl: "https://cloudadministrator.net/2025/02/05/using-optional-parameter-if-not-configured-in-azure-monitor-workbooks-with-kql-query/"
tags: 
  - "Azure"
  - "Azure Monitor"
  - "Azure Monitor Workbooks"
  - "Cloud"
  - "Dashboards"
  - "KQL"
  - "Kusto"
  - "Log Analytics"
  - "Log Analytics"
---
[Azure Monitor workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview?WT.mc_id=AZ-MVP-5000120) are great way to visualize Azure data for monitoring and analysis. Although there is a good documentation on how to built them I would say that examples for more advanced scenarios are lacking in there. Recently I was asked a question about such scenario: “How do I set KQL query in a way that the filter for optional parameter in Azure Monitor workbook is not applied if value is not provided for that parameter?”.

To illustrate how this is possible let’s start by creating brand new workbook.

![](/media/wordpress/2025/02/new-workbook.png)

*New workbook*

Next let’s add an optional (not required) parameter of type text.

![](/media/wordpress/2025/02/optional-parameter.png)

*Optional parameter*

Now that we have the parameter we can click Done editing for that part and add new one by clicking on Add query:

![](/media/wordpress/2025/02/add-query.png)

*Add query*

For simplicity we just going to use static value for the Log Analytics workspace we will query and use simple query as:

```kusto
AzureActivity
| where ActivityStatusValue =~ 'Success'
```

and run the query:

![](/media/wordpress/2025/02/static-query.png)

*Static query*

As you can see we get results but the condition is static value not such coming from the parameter. If we replace the static value from the value of the parameter and run the query we get error:

![](/media/wordpress/2025/02/error.png)

*KQL error*

The way we can overcome that error if the parameter value is not configured is by using KQL to have where clause based on if the parameter is provided or not:

```kusto
AzureActivity
|  where isempty('{ActivityStatus}') or (ActivityStatusValue =~ '{ActivityStatus}')
```

After running the query we get results for all activity logs regarding of the ActivityStatusValue value and as you can see our parameter is not configured:

![](/media/wordpress/2025/02/results-without-parameter.png)

*Results without parameter*

As soon as I provide value for the parameter the filtering works:

![](/media/wordpress/2025/02/results-with-parameter.png)

*Results with parameter*

I hope this little tip was useful for you!
