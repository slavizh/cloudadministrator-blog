---
title: "Noise Reduction with What-If Results for Deployment Stacks"
excerpt: "Deployment stacks introduce a new What-If engine that significantly reduces noisy Azure Resource Manager change previews and makes real infrastructure changes easier to identify."
description: "Learn how deployment stacks reduce noise in Azure What-If results, retain preview results as resources, and detect encryption changes and resource deletions."
pubDate: 2026-08-14
updatedDate: 2026-08-04
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

When deploying Azure resources with ARM or Bicep, it is essential to preview the changes before deployment. Until now, we only had [What-If for regular (classic) deployments](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if?tabs=azure-cli%2CCLI?WT.mc_id=AZ-MVP-5000120). That functionality was not perfect because it relied on the teams writing the [resource providers](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types?WT.mc_id=AZ-MVP-5000120) (RPs) to ensure that they did not introduce noise.

Unfortunately, coordinating the many Azure resource provider teams, likely more than 100, so that their implementations do not produce noise is costly and challenging. As a result, many RPs produced a lot of noise. Some produced more than others, but only a minority produced no noise at all. If you are experienced with Bicep and ARM, you may be able to distinguish noise from actual changes. However, most people should not need that level of expertise to deploy and manage their resources. With the new [What-If for deployment stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-what-if?tabs=azure-cli?WT.mc_id=AZ-MVP-5000120), almost all of this noise is gone.

Here are the key changes:

- What-If for deployment stacks uses a completely new engine that is different from the What-If engine available for regular deployments.
- What-If results are now Azure resources that you can retain for a specific period. This is useful when you need to review the changes associated with a deployment after it has completed. Because What-If results are resources, the PowerShell cmdlets used to retrieve them are `New-Az...` cmdlets.
- The new engine will most likely eliminate 99% of the noise. The remaining 1% is limited to edge cases that can often be addressed by changing your Bicep code.

To demonstrate the new deployment-stack What-If experience, I will use a simple example from my Bicep template library: [azure-resource-encryption-examples - option2.bicep](https://github.com/slavizh/BicepTemplates/tree/main/azure-resource-encryption-examples).

For this example, I will use a Bicep parameters file like the one below:

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

My first step is to create a stack at resource-group scope.

![Create Stack](/media/noise-reduction-what-if-deployment-stacks/created-stack.png)

Once it is created, I execute the commands for a regular What-If and inspect the noise:

![Regular What-if Results](/media/noise-reduction-what-if-deployment-stacks/regular-what-if-results.png)

The template is quite small, and only a few features are implemented for the resource. One of those features is encryption, but it produces noise in the results.

When I run What-If for deployment stacks, I get a different result:

![Deployment stacks What-if Results](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-results.png)

There are no changes, as expected. The input and template are the same as they were during the initial deployment. Note that the cmdlets show when the What-If results resource will expire and be purged. To demonstrate that the engine can detect a change to the encryption configuration, I will change the Key Vault key name and run What-If again.

![Deployment stacks What-if Results with changes](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-results-with-changes.png)

As you can see, it detects that a new key will be used for encryption.

Another feature enabled by deployment stacks is the ability to detect deletions. To demonstrate, I will delete a resource from the template and run What-If again. This is the simplest way to demonstrate the behavior, but the experience is the same when a template contains a condition on a resource and that condition changes through a parameter in a parameters file.

![Deployment stacks What-if Results with delete](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-results-with-delete.png)

Note that the What-If commands require a stack resource ID. However, if you want to see the changes without creating the stack, provide a stack resource ID for a non-existent stack, and the commands will still work.

![Deployment stacks What-if Results without-stack](/media/noise-reduction-what-if-deployment-stacks/deployment-stacks-what-if-results-without-stack.png)

I strongly recommend moving from regular deployments to deployment stacks and using the new What-If functionality.

If you find issues or have ideas you can log them at [Deployment Stacks repo at GitHub](https://github.com/Azure/deployment-stacks/issues). I already logged some bugs and ideas about better formatting that you can support if you find them useful.

I hope you found this blog post informative.
