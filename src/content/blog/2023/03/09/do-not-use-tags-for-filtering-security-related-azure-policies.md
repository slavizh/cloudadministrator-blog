---
title: "Do not use tags for filtering security related Azure Policies"
excerpt: "I spend a lot of time on Microsoft Q&A trying to help people by not just providing with answers but also educating them and pushing them to learn more. Recently I was asked to help with Azure P…"
description: "I spend a lot of time on Microsoft Q&A trying to help people by not just providing with answers but also educating them and pushing them to learn more. Recen..."
pubDate: 2023-03-09
updatedDate: 2023-03-09
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2023/03/09/do-not-use-tags-for-filtering-security-related-azure-policies/"
tags: 
  - "Azure"
  - "Azure Policy"
  - "Azure Security"
  - "Governance"
  - "Security"
---
I spend a lot of time on [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/) trying to help people by not just providing with answers but also educating them and pushing them to learn more. Recently I was asked to help with [Azure Policy rule](https://learn.microsoft.com/en-us/answers/questions/1180339/azure-policy-with-anyof-condition?page=1&orderby=Helpful&comment=answer-1175344#newest-answer-comment) and I did.

Looking at the rule though got me thinking about using tags for filtering which policy to which resources to apply. Overall I am two hands up for that approach. I think it is good approach for doing management at scale and not having to deal with micro-management. At the same time such approach should be used with cautiousness. For me the stop line for this approach is security related policies where you may be try to enforce TLS 1.2 or disable public network access. The reason is that you are basically allowing people to avoid certain policy by just changing a tag or its value. There is a reason why Azure Policies are mainly subscription/management group scoped resource that you need additional permissions to control. So I highly recommend to not use tags filtering in your policy rules when the policy relates to security setting. Instead I would recommend to use [Azure Policy exemptions](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure?WT.mc_id=AZ-MVP-5000120) or [Azure Policy exclusions](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/assignment-structure#excluded-scopes?WT.mc_id=AZ-MVP-5000120). Never the less if you decide to go that route I would also strongly recommend to do two things:

-   Create another policy with similar rule but to not include the tags filtering and be just in audit effect. That way you will have overview of which resources are not compliant due to having tag that filters them out by the other policy.
-   Regularly review the resources that are not compliant due tag exclusion. You can do that on daily or at least weekly bases. You can even use Log Analytics to alert on the Azure Policy states. You can check the [blog post](https://blog.tyang.org/2021/12/06/monitoring-azure-policy-compliance-states-2021-edition/) by my friend Tao Yang.
