---
title: "Introduction to Azure Bicep roleDefinitions() function"
excerpt: "Learn when to use Azure Bicep roleDefinitions() versus existing role definition resources for Azure RBAC role assignments, with practical guidance for built-in and custom roles."
description: "A practical guide to Azure Bicep roleDefinitions(): when it improves role assignment templates, when GUID-based existing resources are still the better choice, and common pitfalls to avoid."
pubDate: 2026-06-18
updatedDate: 2026-06-18
heroImage: "/media/bicep-role-definitions-function/role-definitions-hero-image.png"
sourceUrl: "https://cloudadministrator.net/bicep-role-definitions-function/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "IaC"
  - "Infrastructure as Code"
  - "DevOps"
  - "roleDefinitions()"
  - "Idempotence"
  - "Deployment"
  - "Role Definitions"
  - "Azure RBAC"
  - "Role assignments"
---
If you have worked with role assignments in Bicep or other IaC tools, you know that built-in role definitions use GUIDs as names. In those situations, you usually [look up the GUID in the official documentation](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles?WT.mc_id=AZ-MVP-5000120) and add it to your Bicep template. The situation is not much better for custom role definitions, because creating a custom role also requires a GUID resource name. GUIDs are not human-friendly, which is why this becomes an issue. Azure Bicep addressed this in [Bicep CLI v0.42.1](https://github.com/Azure/bicep/releases/tag/v0.42.1) by introducing the `roleDefinitions()` function.

At the time of writing, documentation for the function was not yet published, but its usage is straightforward. The function takes the role definition display name (role name) as input and returns either the full resource ID or just the role definition ID:

```bicep
output roleDefinitionId string = roleDefinitions('Reader').id
output resourceName string = roleDefinitions('Reader').roleDefinitionId
```

This is the simplest example you can run to inspect the output without deploying resources. So now we have two ways to get a role definition resource ID: the `roleDefinitions()` function and existing resource syntax for `Microsoft.Authorization/roleDefinitions`. Which one should you use, and when? Let's start with existing syntax:

- If you create the role definition and role assignment in the same module, use the resource reference syntax.

```bicep

param principalId string

resource roleDef 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' ={
  name: guid('Test role')
  properties: {
    roleName: 'Test role'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Storage/*/read'
        ]
      }
    ]
  }

}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'Test role assignment')
  properties: {
    roleDefinitionId: roleDef.id
    principalId: principalId
    description: 'Test role assignment'
    condition: null
    conditionVersion: '2.0'
  }
}
```

- If you deploy a role assignment and the role is not user input, you can also use existing syntax. A common example is assigning permissions to a system- or user-assigned identity together with the target resource. In that case, you know exactly which role should be assigned, and you can add a comment for readability:


```bicep
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' existing = {
  name: 'myUserAssignedIdentity'
}

resource roleDefinition 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  // Virtual Machine Contributor role
  name: '9980e02c-c2be-4d73-94e8-173b1dc7cf3c'
  scope: subscription()
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'Test role assignment')
  properties: {
    roleDefinitionId: roleDefinition.id
    principalId: userAssignedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    description: 'Test role assignment'
    condition: null
    conditionVersion: '2.0'
  }
}
```

For `roleDefinitions()`, there is one primary scenario:

- When the user selects which role to assign:

```bicep
param roleDefinitionName string
param principalId string

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'Test role assignment')
  properties: {
    roleDefinitionId: roleDefinitions(roleDefinitionName).id
    principalId: principalId
    description: 'Test role assignment'
    condition: null
    conditionVersion: '2.0'
  }
}
```

In short: use `roleDefinitions()` when user input determines the role. If the role is fixed and not expected to change, use `resource`/`existing` syntax with the GUID. The reason is simple: role display names can change, while role definition GUIDs do not. Built-in role names can change, for example when a role moves from preview to GA, or when a service is renamed. Those are the two most common cases I have seen.

If the role name comes from user input, deployment failures caused by name changes are easier to handle because users can adjust the input. But if you hardcode role names in a module and use `roleDefinitions()`, you may need to update and release a new module version after a display name change. Using GUIDs with existing syntax avoids that problem. You can track built-in role name changes at [azadvertizer.net](https://www.azadvertizer.net/azrolesadvertizer_history.html#%7B%22col_4%22%3A%7B%22flt%22%3A%22DisplayName%22%7D%2C%22page%22%3A3%2C%22page_length%22%3A500%7D).

Also, avoid patterns like this:

```bicep
param roleDefinitionName string
param principalId string

resource roleDef 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roleDefinitions(roleDefinitionName).roleDefinitionId
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'Test role assignment')
  properties: {
    roleDefinitionId: roleDef.id
    principalId: principalId
    description: 'Test role assignment'
    condition: null
    conditionVersion: '2.0'
  }
}
```

This adds extra code for no benefit and does exactly what the previous example already does.

Role assignment deployment gets even easier when you combine this with the Microsoft Graph extension for Azure Bicep, because you do not need GUIDs for principals:

**types.bicep**
```bicep
@export()
@discriminator('type')
type principal = principalManagedIdentity | principalApplication | principalGroup | principalUser

type principalManagedIdentity = {
  @description('The type of the principal.')
  type: 'ManagedIdentity'
  @description('The name of the managed identity.')
  name: string
  @description('The resource group of the managed identity.')
  resourceGroup: string
  @description('The subscription ID of the managed identity. Default is the current subscription.')
  subscriptionId: string?
}

type principalApplication = {
  @description('The type of the principal.')
  type: 'Application'
  @description('The unique name of the Entra Application.')
  name: string
}

type principalGroup = {
  @description('The type of the principal.')
  type: 'Group'
  @description('The name of the Entra group.')
  name: string
}

type principalUser = {
  @description('The type of the principal.')
  type: 'User'
  @description('The user principal name (UPN) of the user.')
  upn: string
}

```

**main.bicep**
```bicep
extension 'br:mcr.microsoft.com/bicep/extensions/microsoftgraph/v1.0:1.0.0' as microsoftGraph

import * as types from './types.bicep'

param roleDefinitionName string
param principal types.principal
param roleAssignmentDescription string = ''
param roleAssignmentCondition string = ''


resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2025-05-31-preview' existing = if (principal.type == 'ManagedIdentity') {
  name: principal.name
  scope: resourceGroup(principal.?subscriptionId ?? subscription().subscriptionId, principal.resourceGroup)
}

resource application 'Microsoft.Graph/applications@v1.0' existing = if (principal.type =~ 'Application') {
  uniqueName: principal.name
}

resource servicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' existing = if (principal.type =~ 'Application') {
  appId:application!.appId
}

resource group 'Microsoft.Graph/groups@v1.0' existing = if (principal.type =~ 'Group') {
  uniqueName: principal.name
}

resource user 'Microsoft.Graph/users@v1.0' existing = if (principal.type =~ 'User') {
  userPrincipalName: principal.upn
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'Test role assignment')
  properties: {
    roleDefinitionId: roleDefinitions(roleDefinitionName).id
    principalId: principal.type == 'ManagedIdentity'
      ? managedIdentity!.properties.principalId
      : principal.type =~ 'Application'
        ? servicePrincipal!.id
        : principal.type =~ 'Group'
          ? group!.id
          : user!.id
    description: roleAssignmentDescription
    condition: empty(roleAssignmentCondition) ? null : roleAssignmentCondition
    conditionVersion: '2.0'
  }
}

```

When this information is provided as input, it is much easier to understand who has which permissions. You can find the last example on [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/role-assignment). In that repository, you will also find [Bicep snapshots (tests)](https://cloudadministrator.net/2026/02/18/azure-bicep-snapshots-test-and-validate-your-code-and-deployments/) that verify the logic.

I hope this is not the end, and that we will see similar functionality for policy definitions. For custom policy definitions, you do not need a GUID for the resource name, but custom names often do not clearly describe the policy being assigned, and built-in Azure policy definitions use GUIDs. Policy display names also change fairly often; ideally, they would follow the same naming stability practices as role definitions and change only when necessary.

I hope this blog post was useful.
