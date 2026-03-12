---
title: "Find The Resources Which Use Particular User Assigned Managed Identity"
excerpt: "I have been busy lately (answering on Q&A, Bicep testing, working, etc.) which prevented me from writing new blog posts but I hope to do more blogging again. This blog post will be a quick tip.…"
description: "I have been busy lately (answering on Q&A, Bicep testing, working, etc.) which prevented me from writing new blog posts but I hope to do more blogging again...."
pubDate: 2021-10-14
updatedDate: 2021-10-14
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2021/10/14/find-the-resources-which-use-particular-user-assigned-managed-identity/"
tags: 
  - "Azure"
  - "Azure Resource Graph"
  - "Kusto"
  - "Managed Identity"
---
I have been busy lately (answering on Q&A, Bicep testing, working, etc.) which prevented me from writing new blog posts but I hope to do more blogging again. This blog post will be a quick tip.

If you have wondered in which resources a particular user assigned managed identity was used you can see that information quickly by using Azure Resource Graph. The query is very simple:

```kusto
resources
| where identity contains "userAssignedIdentities/<managed identity name>"
```

As managed identities can be used on policies as well it might worth checking if it is used there as well with:

```kusto
policyresources
| where type =~ 'microsoft.authorization/policyassignments'
| where identity contains "userAssignedIdentities/<managed identity name>"
```

I hope this quick tip will be useful for you.
