---
title: "Deleting Custom Table from Azure Log Analytics"
excerpt: "If you are familiar with Log Analytics you will know that you can delete custom field/column directly from the UI as you can see below: For example I can delete custom field _ResourceId_s for MyLog…"
description: "If you are familiar with Log Analytics you will know that you can delete custom field/column directly from the UI as you can see below: For example I can del..."
pubDate: 2021-05-12
updatedDate: 2021-05-12
heroImage: "/media/2021/05/custom-field-delete.png"
sourceUrl: "https://cloudadministrator.net/2021/05/12/deleting-custom-table-from-azure-log-analytics/"
tags: []
---
If you are familiar with Log Analytics you will know that you can delete custom field/column directly from the UI as you can see below:

![](/media/2021/05/custom-field-delete.png)

*Custom Field Delete*

For example I can delete custom field \_ResourceId\_s for MyLog0001\_CL table. That option has been there for quite some time. A couple of years ago an API was made available so you can delete specific data from a table. This was also know as the [purge API](https://docs.microsoft.com/en-us/rest/api/loganalytics/workspacepurge/purge?WT.mc_id=AZ-MVP-5000120). The purge API is basically deleting data based on KQL query. With these APIs you could delete specific fields and data but the table that was created by custom log will still be in the Log Analytics.

A few months ago a [new API](https://docs.microsoft.com/en-us/rest/api/loganalytics/data%20collector%20logs%20\(preview\)/delete?WT.mc_id=AZ-MVP-5000120) was released that allows you to delete a whole table. If you look at the picture above I have MyLog00001\_CL table. When I search that table I do not have any recent data:

![](/media/2021/05/my-table.png)

*My Table*

By using [armclient tool](https://github.com/projectkudu/ARMClient) I can easily execute that API to delete that specific table:

![](/media/2021/05/delete-table.png)

*Delete Table*

When executing the request there is no any output but if I check custom fields UI you can see that I no longer have \_ResourceId field for MyLog0001\_CL table:

![](/media/2021/05/custom-field-deleted-table.png)

*Custom Field Delete table*

If I try to search MyLog0001\_CL table I will get an error:

![](/media/2021/05/search-failed.png)

*Search failed*

The above shows how you can delete a custom table from Log Analytics workspace. Keep in mind that any delete/purge operation on your Log Analytics workspace can have performance impact on it so execute such actions carefully, rarely and after significant consideration.

Any of these actions will also be logged in Azure Activity log in case someone has done this without authorization or by mistake:

![](/media/2021/05/delete-table-log.png)

*Activity Log*

I hope this was another useful blog post for you!
