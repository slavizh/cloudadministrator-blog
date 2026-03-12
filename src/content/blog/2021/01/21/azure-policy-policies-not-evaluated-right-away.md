---
title: "Azure Policy Policies not evaluated right away"
excerpt: "[Azure Policy]( has a unique feature compared to other competitors when it comes to evaluating Azure Resources. As Azure Policy is built along Azure Resource Manager (ARM) policies are in effect ri…"
description: "[Azure Policy]( has a unique feature compared to other competitors when it comes to evaluating Azure Resources. As Azure Policy is built along Azure Resource..."
pubDate: 2021-01-21
updatedDate: 2021-01-21
heroImage: "/media/wordpress/2021/01/security-center-scans.png"
sourceUrl: "https://cloudadministrator.net/2021/01/21/azure-policy-policies-not-evaluated-right-away/"
tags: 
  - "ASC"
  - "Azure"
  - "Azure Governance"
  - "Azure Policy"
  - "Azure Security Center"
  - "Azure Security Center"
---
[Azure Policy](https://docs.microsoft.com/en-us/azure/governance/policy/overview?WT.mc_id=AZ-MVP-5000120) has a unique feature compared to other competitors when it comes to evaluating Azure Resources. As Azure Policy is built along Azure Resource Manager (ARM) policies are in effect right away. This means if you have policy that blocks location and you try to deploy to that location a resource you will not be able to. The effect is enforced no matter if you use ARM Template Deployments, Portal, PowerShell, CLI, SDK or just plain old REST API. Of course on existing resources the policies are evaluated once 24 hours but you can of course [trigger on-demand evaluation scan](https://docs.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data#evaluation-triggers?WT.mc_id=AZ-MVP-5000120). The time that the scan will run depends on how many resources the policy will need to evaluate. Obviously policies that evaluate many resources (such as policies for tags or locations) will take longer (also dependable on the number of resources for the applied scope).

You might have noticed that in the first sentence I have tied this behavior to only Azure Resources. As Azure Policy does not evaluate only Azure resource the above behavior differs a little bit when evaluation is done on non-Azure resources. Most notably you will notice inconsistencies with some Azure Security Center policies. To understand why is that I will start with some history on the Security Center policies feature. The next information is based on my assumption of how things happened without having any internal information. Security center had recommendations for quite some time even before Azure Policy was a service. These recommendations were based on scans that Security center has performed on resources and surfaced the information in Security Center UI. Once Azure Policy came into the picture many of these recommendations could be done via native Azure Policy policies and that is what the Security Center did. Other recommendations couldn’t be done via Azure Policy because the scans that Security Center was doing were not on Azure resources thus not available trough ARM API. What the Security Center did was to keep their own scans and publish the results of those scans trough ARM API. With that they have created Azure Policy policies that were checking the results in that API and thus all Security Center recommendations are available as policies but some are just a little bit different when it comes to evaluation. The diagram below represents high overview of the workflow:

![](/media/wordpress/2021/01/security-center-scans.png)

*Security Center Policy Flow*

As you can see you basically have two scans/evaluations that have schedules on their own. Also you cannot trigger on-demand scan on the Security Center recommendations as far as I am aware. So if you come across such policy and let’s say you have made a change that changes the results of compliant and non-compliant results if you trigger Azure Policy policy evaluation you probably will not see results of the policy changing. You will have to wait for the Security Center scan to kick in again and publish new results to the ARM API. We can take a close look at one such policy called ‘External accounts with owner permissions should be removed from your subscription’

![](/media/wordpress/2021/01/external-accounts-policy.png)

*Security Center policy – external accounts*

As you can see this is built-in policy from Security Center. You will notice that the policy applies only to subscriptions as a resource. For those type of resources the policy is looking into resource ‘Microsoft.Security/assessments’ with name ‘c3b6ae71-f1f0-31b4-e6c1-d5951285d03d’ and property ‘Microsoft.Security/assessments/status.code’. If the values of that property are not Healthy or NotApplicable than the resource will be non-compliant. If you are familiar with Azure RBAC you might say that role assignments (permissions) are actually ARM resource so why this is not native policy based on role assignments ARM API? The reason is that the role assignments API does not know if account is external or not or let alone if an Azure Active Directory group contains external accounts. All this information is available in Azure Active Directory which is not ARM resource.

If you see Azure Policy that looks into Microsoft.Security/assessments API this means that Security Center is doing the actual scan and you will have to wait for it before you see results in the actual Azure Policy policy. The above workflow is very similar to the one for [Guest Configuration policies](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/guest-configuration?WT.mc_id=AZ-MVP-5000120). Those have similar behavior where the only difference is that the guest configuration scans within the VMs are done on shorter frequency so unlikely you will notice inconsistencies.

I hope you will find this information useful in understanding how some Security Center policies work.
