---
title: "Enable Defender for Cloud Auto provisioning agents via Bicep"
excerpt: "I hope this was useful information for you."
description: "I hope this was useful information for you."
pubDate: 2022-10-20
updatedDate: 2022-10-25
heroImage: "/media/2022/10/auto-provisioning-agents.png"
sourceUrl: "https://cloudadministrator.net/2022/10/20/enable-defender-for-cloud-auto-provisioning-agents-via-bicep/"
tags: 
  - "AKS"
  - "Azure"
  - "Azure Bicep"
  - "Azure Monitor"
  - "Azure Policy"
  - "Defender for Cloud"
  - "Log Analytics"
  - "Azure Security Center"
  - "Bicep"
  - "Security"
---
Often I see questions around how I can the auto provisioning agents capabilities (now renamed to Settings & monitoring) in Defender for Cloud via API.

![](/media/2022/10/auto-provisioning-agents.png)

*Defender for Cloud Settings and Monitoring*

In this blog post I will show you how to do it via Bicep and doing that via ARM REST API will be similar.

Previously when there is only one agent, the Log Analytics one this was possible via Security Center API [Microsoft.Security/autoProvisioningSettings@2017-08-01-preview](https://learn.microsoft.com/en-us/azure/templates/microsoft.security/2017-08-01-preview/autoprovisioningsettings?pivots=deployment-language-bicep) but with the latest changes including renaming Security Center to Defender for Cloud this was changed to be done via Azure Policy policies mostly. In below Bicep template you will see setting the three Defender for Cloud Plans. Once those are enabled the policies associated with those plans are deployed. The only difference with doing this via the template compared via doing it in Azure Portal is that the template uses one User Assigned identity instead of system managed identity for each policy assignment. I would suggest using one identity for your policies. You can create the identity in advance and assign it Contributor permissions or check each policy definition which role requires at minimum. I have also included an option for using Qualys or Defender vulnerability management for vulnerability assessment. Defender vulnerability management seems to be enabled via setting but it seems the policy used for Qualys has option for Defender vulnerability management as well. May be in the future that will also be configured via policy. I have not included option for using Log Analytics agent as that is in path to be deprecated and you should use Microsoft Monitroing Agent. The template also assumes that you already have Log Analytics workspace to connect the agent to. You can find [the code on GitHub](https://github.com/slavizh/BicepTemplates/blob/main/defender-for-cloud/agents.bicep) as well. The Bicep template is deployed at subscription scope to the subscriptions where you want to enable these settings.

```powershell
targetScope = 'subscription'

param userAssignedIdentityId string
param logAnalyticsWorkspaceResourceId string
param logAnalyticsRegion string
@description('default is Qualys, mdeTvm is Defender vulnerability management')
@allowed([
  'default'
  'mdeTvm'
])
param vulnerabilityAssessmentProviderType string = 'mdeTvm'

resource cspmPlan 'Microsoft.Security/pricings@2022-03-01' = {
  name: 'CloudPosture'
  properties: {
    pricingTier: 'Standard'
  }
}

resource serversPlan 'Microsoft.Security/pricings@2022-03-01' = {
  name: 'VirtualMachines'
  dependsOn: [
    cspmPlan
  ]
  properties: {
    pricingTier: 'Standard'
    subPlan: 'P2'
  }
}

resource containersPlan 'Microsoft.Security/pricings@2022-03-01' = {
  name: 'Containers'
  dependsOn: [
    serversPlan
  ]
  properties: {
    pricingTier: 'Standard'
  }
}

resource containersAddonPolicyDefinition 'Microsoft.Authorization/policyDefinitions@2021-06-01' existing = {
  name: 'a8eff44f-8c92-45c3-a3fb-9880802d67a7'
  scope: tenant()
}

resource containersAddonPolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' = {
  name: 'Defender for Containers provisioning Azure Policy Addon for Kub'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    containersPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'Defender for Containers provisioning Azure Policy Addon for Kubernetes'
    enforcementMode: 'Default'
    policyDefinitionId: containersAddonPolicyDefinition.id
  }
}

resource containersArcExtensionPolicyDefinition 'Microsoft.Authorization/policyDefinitions@2021-06-01' existing = {
  name: '0adc5395-9169-4b9b-8687-af838d69410a'
  scope: tenant()
}

resource containersArcExtensionPolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' = {
  name: 'Defender for Containers provisioning Policy extension for Arc-e'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    containersPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'Defender for Containers provisioning Policy extension for Arc-enabled Kubernetes'
    enforcementMode: 'Default'
    policyDefinitionId: containersArcExtensionPolicyDefinition.id
  }
}

resource containersProvisioningArcPolicyDefinition 'Microsoft.Authorization/policyDefinitions@2021-06-01' existing = {
  name: '708b60a6-d253-4fe0-9114-4be4c00f012c'
  scope: tenant()
}

resource containersProvisioningArcPolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' = {
  name: 'Defender for Containers provisioning ARC k8s Enabled'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    containersPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'Defender for Containers provisioning ARC k8s Enabled'
    enforcementMode: 'Default'
    policyDefinitionId: containersProvisioningArcPolicyDefinition.id
  }
}

resource containersSecurityProfilePolicyDefinition 'Microsoft.Authorization/policyDefinitions@2021-06-01' existing = {
  name: '64def556-fbad-4622-930e-72d1d5589bf5'
  scope: tenant()
}

resource containersSecurityProfilePolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' = {
  name: 'Defender for Containers provisioning AKS Security Profile'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    containersPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'Defender for Containers provisioning AKS Security Profile'
    enforcementMode: 'Default'
    policyDefinitionId: containersSecurityProfilePolicyDefinition.id
  }
}

#disable-next-line BCP081
resource defenderVulnerabilityManagement 'Microsoft.Security/serverVulnerabilityAssessmentsSettings@2022-01-01-preview' = if (vulnerabilityAssessmentProviderType =~ 'mdeTvm') {
  name: 'AzureServersSetting'
  kind: 'AzureServersSetting'
  dependsOn: [
    cspmPlan
    serversPlan
  ]
  properties: {
    selectedProvider: 'MdeTvm'
  }
}

resource vulnerabilityAssessmentQualysPolicyDefinition 'Microsoft.Authorization/policyDefinitions@2021-06-01' existing = {
  name: '13ce0167-8ca6-4048-8e6b-f996402e3c1b'
  scope: tenant()
}

// May be in the future Defender Vulnerability Management will also be configured via policy as the policy supports type
resource vulnerabilityAssessmentQualysPolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' =  if (vulnerabilityAssessmentProviderType =~ 'default') {
  name: 'ASC auto provisioning of vulnerability assessment agent for mac'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    cspmPlan
    serversPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'ASC auto provisioning of vulnerability assessment agent for mac'
    enforcementMode: 'Default'
    policyDefinitionId: vulnerabilityAssessmentQualysPolicyDefinition.id
    parameters: {
      vaType: {
        value: vulnerabilityAssessmentProviderType
      }
    }
  }
}

resource autoProvisioning 'Microsoft.Security/autoProvisioningSettings@2017-08-01-preview' = {
  name: 'default'
  dependsOn: [
    serversPlan
  ]
  properties: {
    autoProvision: 'Off'
  }
}

resource serversMonitorAgentPolicyDefinition 'Microsoft.Authorization/policySetDefinitions@2021-06-01' existing = {
  name: '500ab3a2-f1bd-4a5a-8e47-3e09d9a294c3'
  scope: tenant()
}

resource serversMonitorAgentPolicy 'Microsoft.Authorization/policyAssignments@2021-06-01' = {
  name: 'Custom Defender for Cloud provisioning Azure Monitor agent'
  #disable-next-line no-loc-expr-outside-params
  location: deployment().location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  }
  dependsOn: [
    containersPlan
  ]
  properties: {
    description: 'This policy assignment was automatically created by Azure Security Center for agent installation as configured in Security Center auto provisioning.'
    displayName: 'Custom Defender for Cloud provisioning Azure Monitor agent'
    enforcementMode: 'Default'
    policyDefinitionId: serversMonitorAgentPolicyDefinition.id
    parameters: {
      userWorkspaceResourceId: {
        value: logAnalyticsWorkspaceResourceId
      }
      workspaceRegion: {
        value: logAnalyticsRegion
      }
    }
  }
}

#disable-next-line BCP081
resource agentlessScanning 'Microsoft.Security/VmScanners@2022-03-01-preview' = {
  name: 'default'
  dependsOn: [
    cspmPlan
    serversPlan
  ]
  properties: {
    scanningMode: 'Default'
    // You can add exclusion tags to Agentless scanning for machines feature
    exclusionTags: {}
  }
}
```

I hope this was useful information for you.

Tip: If you want to exclude specific servers you can either add [notScopes property](https://learn.microsoft.com/en-us/azure/templates/microsoft.authorization/policyassignments?pivots=deployment-language-bicep#policyassignmentproperties) (excluded resources) with resource ID values to policy assignments to exclude specific resources or use [exemptions resource](https://learn.microsoft.com/en-us/azure/templates/microsoft.authorization/policyexemptions?pivots=deployment-language-bicep).
