---
title: "Noise Reduction with What-If Results for Deployment Stacks"
excerpt: ""
description: ""
pubDate: 2026-08-14
updatedDate: 2026-08-4
heroImage: "/media/noise-reduction-what-if-deployment-stacks/noise-reduction-what-if-deployment-stacks-hero.png"
sourceUrl: "https://cloudadministrator.net/noise-reduction-what-if-deployment-stacks/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "IaC"
  - "Infrastructure as Code"
  - "DevOps"
  - "What-If"
  - "Deployment Stacks"
  - "Deployment"
  - "Noise"
  - "What If"
---

When doing Azure Deployments via ARM or Bicep it is essential to preview the changes that will happen before the deployment. Up until now we only had [What-If for regular (classic) deployments](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if?tabs=azure-cli%2CCLI). That functionality wasn't perfect as it was relaying on the teams writing the [Resource Providers](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types) (RPs) to make sure they are not introducing noise. Unfortunately having to align the different Azure Resource provider teams (which are probably over 100) to write the code so they do not produce noise is costly and challenging task. So the end result was that many of the RPs were producing a lo to noise. Some more other less but those which didn't produce any noise was minority. If you are more experience in Bicep and ARM you could understand which was noise and which was actual change but the majority of folks aren't and they shouldn't be in order to deploy and manage their resource. With that said all this noise is almost or completely gone with the new [What-If for deployment stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-what-if?tabs=azure-cli).

So let's start with the changes:

- What-If for deployment stacks is completely new engine that is different from the What-If available for deployments.
- What-If results are now an Azure resource which you can retain for specific period of time. This helps if you need to see what kind of changes were made before a specific deployment. Due to What-If results being a resource the PS cmdlets for getting What-If results are New-Az...
- The new engine will most likely fix 99% of your noise. That 1% I leave for some edge scenarios. Those scenarios most likely can be overcome with changes in your bicep code.

To demonstrate the power of the new What-If for deployment stacks I will take a simple example from my Bicep Template library - [azure-resource-encryption-examples - option2.bicep](https://github.com/slavizh/BicepTemplates/tree/main/azure-resource-encryption-examples).

For the example I will use Bicep parameters file like this one below:

```bicep
using 'option2.bicep'

param entraUserDisplayName = 'Stanislav Zhelyazkov'
param entraUserPrincipalId = '{redacted}'
param keyVaultSubscriptionId = '{redacted}'
param keyVaultKeyName = 'key0033'
param keyVaultName = '{redacted}'
param keyVaultResourceGroup = '{redacted}s'
param sqlServerName = 'sql000233aass'
param userAssignedIdentityName = '{redacted}'
param userAssignedIdentityResourceGroup = '{redacted}'
param userAssignedIdentitySubscriptionId = '{redacted}'

```

So my first step is to create a stack at resource group scope.

![Create Stack](/media/noise-reduction-what-if-deployment-stacks/created-stack.png)

Once created I execute commands for regular What-If and see what is the noise:

![Regular What-if Results](/media/noise-reduction-what-if-deployment-stacks/regular-what-if-results.png)

The template is quite small and there are only a few features implemented for the resource and one of them is encryption but that is giving a noise.

Now when I run the What-If for deployment stacks I get a different result.

![Deployment stacks What-if Results](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-results.png)

There is no change at all as it should be. The input and the template are the same as on the initial deployment. Note that the cmdlets show you when the What-If results resource will expire and be purged. To demonstrate that it can actually detect the change for encryption functionality I will change the Key Vault key name and run the what-if results once again.

![Deployment stacks What-if Results with changes](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-resultsw-with-changes.png)

As you can see it picks that a new key will be used for the encryption.

Another feature that is new because we are using deployment stacks is that will detect any deletes if there are such. To demonstrate I will just delete the resource from the template and execute what-if once again. This is the simplest way to demonstrate but if you have templates with condition on a resource and that condition changes via parameter in parameters files the experience is the same.

![Deployment stacks What-if Results with delete](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-resultsw-with-delete.png)

Note that the commands for What-If require stack resource ID but if you want to see the changes without the stack being created just put an Stack Resource ID for non-existing one and they will still work.

![Deployment stacks What-if Results without-stack](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-resultsw-with-delete.png)

So I would strongly suggest from moving from regular deployments to deployment stacks and new what-if functionality.

If you find issues or have ideas you can log them at [Deployment Stacks repo at GitHub](https://github.com/Azure/deployment-stacks/issues). I already logged some bugs and ideas about better formatting that you can support if you find them useful.

I hope this was informative blog post.
