---
title: "Deploying Azure APIM MCP Servers with Bicep"
excerpt: "Azure API Management (APIM) facilitates AI applications through Model Context Protocol (MCP) servers. This functionality allows existing APIs to be exposed as MCP servers, simplified via Azure Bice…"
description: "Azure API Management (APIM) facilitates AI applications through Model Context Protocol (MCP) servers. This functionality allows existing APIs to be exposed a..."
pubDate: 2025-09-23
updatedDate: 2025-09-23
heroImage: "/media/2025/09/generate-a-featured-image-for-a-blog-post-about-deploying.png"
sourceUrl: "https://cloudadministrator.net/2025/09/23/deploying-azure-apim-mcp-servers-with-bicep/"
tags: 
  - "AI"
  - "APIM"
  - "Azure"
  - "Azure API Management"
  - "Azure Bicep"
  - "Cloud"
  - "DevOps"
  - "IaC"
  - "MCP"
  - "MCP Servers"
  - "Security"
  - "ARM"
  - "Bicep"
  - "Technology"
---
Azure API Management (APIM) service is one of the building blocks for AI applications. At the same time [MCP (Model Context Protocol) server](https://github.com/modelcontextprotocol) is one of the latest capabilities around AI. Not so long ago APIM announced support for exposing either [existing MCP servers or existing APIs as MCP servers](https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview?WT.mc_id=AZ-MVP-5000120). I have played around with this functionality lately and what it turned out is that these MCPs Servers in APIM are just API resource underneath which means it can be easily deployed with Azure Bicep. In this blog post I will show you how to do it with examples.

After investigating what the Azure Portal does when it creates such resource the conclusion is that this scenarios consists of two types of resources Microsoft.ApiManagement/service/backends and Microsoft.ApiManagement/service/apis. In the example below we are creating backend and the URL for the backend should point to your existing MCP server. The name of the created backend is than used on the API resource.

**existing-mcp-server-types.bicep**

```bicep
@export()
type backend = {
  @description('The name of the backend.')
  @minLength(1)
  @maxLength(80)
  name: string
  @description('The URL of the backend.')
  @minLength(1)
  @maxLength(2000)
  url: string
  @description('The description of the backend.')
  @minLength(1)
  @maxLength(2000)
  description: string?
  @description('The title of the backend.')
  @minLength(1)
  @maxLength(300)
  title: string?
}

@export()
type mcpServer = {
  @description('The name of the MCP server.')
  @minLength(1)
  @maxLength(80)
  name: string
  @description('Relative URL uniquely identifying this MCP server.')
  @minLength(1)
  @maxLength(400)
  path: string
  @description('The display name of the MCP server.')
  @minLength(1)
  @maxLength(300)
  displayName: string
  @description('The description of the MCP server.')
  description: string?
  @description('The policy content for the MCP server.')
  policy: string?
}
```

**existing-mcp-server.bicep**

```bicep
import * as types from './existing-mcp-server-types.bicep'

@description('The name of the API Management service instance.')
param apiManagementServiceName string
@description('The backend configuration for the MCP server.')
param backend types.backend
@description('The MCP server configuration.')
param mcpServer types.mcpServer

resource apiManagementService 'Microsoft.ApiManagement/service@2024-06-01-preview' existing = {
  name: apiManagementServiceName
}

resource mcpBackend 'Microsoft.ApiManagement/service/backends@2024-06-01-preview' = {
  name: backend.name
  parent: apiManagementService
  properties: {
    protocol: 'http'
    url: backend.url
    title: backend.?title ?? null
    description: backend.?description ?? null
    circuitBreaker: null
    credentials: null
    pool: null
    properties: null
    proxy: null
    resourceId: null
    tls: null
    type: null
  }
}

resource mcp 'Microsoft.ApiManagement/service/apis@2024-06-01-preview' = {
  name: mcpServer.name
  parent: apiManagementService
  properties: {
    path: mcpServer.path
    displayName: mcpServer.displayName
    description: mcpServer.?description ?? null
    apiType: 'mcp'
    type: 'mcp'
    protocols: [
      'https'
    ]
    backendId: mcpBackend.name
    mcpProperties: {
      endpoints: null
      transportType: 'streamable'
    }
    subscriptionKeyParameterNames: {
      header: 'Ocp-Apim-Subscription-Key'
      query: 'subscription-key'
    }
    subscriptionRequired: false
    contact: null
    format: null
    serviceUrl: null
    sourceApiId: null
    termsOfServiceUrl: null
    wsdlSelector: null
    value: null
    translateRequiredQueryParameters: null
    apiVersionDescription: null
    apiVersionSet: null
    apiVersionSetId: null
    apiRevisionDescription: null
    apiVersion: null
    license: null
    authenticationSettings: {
      oAuth2: null
      openid: null
    }
  }
}

resource mcpPolicy 'Microsoft.ApiManagement/service/apis/policies@2024-06-01-preview' = if (contains(mcpServer, 'policy')) {
  name: 'policy'
  parent: mcp
  properties: {
    format: 'rawxml'
    value: mcpServer.?policy ?? ''
  }
}
```

## Exposing API as MCP server

My investigation on the API as MCP server showed that you only need API resource in which you define which API and which of its operations are exposed.

**exposing-api-mcp-server-types.bicep**

```bicep
@export()
type mcpServer = {
  @description('The name of the MCP server.')
  @minLength(1)
  @maxLength(80)
  name: string
  @description('Relative URL uniquely identifying this MCP server.')
  @minLength(1)
  @maxLength(400)
  path: string
  @description('The display name of the MCP server.')
  @minLength(1)
  @maxLength(300)
  displayName: string
  @description('The description of the MCP server.')
  description: string?
  @description('The name of the API.')
  apiName: string
  @description('The operations exposed by the MCP server.')
  operations: string[]
  @description('The policy content for the MCP server.')
  policy: string?
}
```

**exposing-api-mcp-server.bicep**

```bicep
import * as types from './exposing-api-mcp-server-types.bicep'

@description('The name of the API Management service instance.')
param apiManagementServiceName string
@description('The MCP server configuration.')
param mcpServer types.mcpServer

resource apiManagementService 'Microsoft.ApiManagement/service@2024-06-01-preview' existing = {
  name: apiManagementServiceName
}

resource api 'Microsoft.ApiManagement/service/apis@2024-06-01-preview' existing = {
  name: mcpServer.apiName
  parent: apiManagementService
}

resource operations 'Microsoft.ApiManagement/service/apis/operations@2024-06-01-preview' existing = [for operation in mcpServer.operations: {
  name: operation
  parent: api
}]

resource mcp 'Microsoft.ApiManagement/service/apis@2024-06-01-preview' = {
  name: mcpServer.name
  parent: apiManagementService
  properties: {
    path: mcpServer.path
    displayName: mcpServer.displayName
    description: mcpServer.?description ?? null
    apiType: 'mcp'
    type: 'mcp'
    protocols: [
      'https'
    ]
    mcpTools: [for (operation, i) in mcpServer.operations: {
      name: operations[i].name
      operationId: operations[i].id
    }]
    subscriptionKeyParameterNames: {
      header: 'Ocp-Apim-Subscription-Key'
      query: 'subscription-key'
    }
    subscriptionRequired: false
    contact: null
    format: null
    serviceUrl: null
    sourceApiId: null
    termsOfServiceUrl: null
    wsdlSelector: null
    value: null
    translateRequiredQueryParameters: null
    apiVersionDescription: null
    apiVersionSet: null
    apiVersionSetId: null
    apiRevisionDescription: null
    apiVersion: null
    license: null
    authenticationSettings: {
      oAuth2: null
      openid: null
    }
  }
}

resource mcpPolicy 'Microsoft.ApiManagement/service/apis/policies@2024-06-01-preview' = if (contains(mcpServer, 'policy')) {
  name: 'policy'
  parent: mcp
  properties: {
    format: 'rawxml'
    value: mcpServer.?policy ?? ''
  }
}
```

## Conclusion

Here are some conclusions and explanations on things you might have noticed in the examples:

-   In both examples you will notice that the MCP specific properties are currently (Bicep CLI 0.37.4) are shown in warnings as they are not available in the schema of the resource. Nevertheless using these properties applies them and creates the resources correctly.
-   You will also notice that the type/apiType is mcp which is not currently available on the documented values.
-   All the properties that are set to null to my knowledge are currently not applicable to MCP servers. That ay change in the future as the feature is being in developed.
-   Besides creating the MCP server you can also set a policy of it – after all that is a key feature in APIM.
-   Most of the settings that are null for the backend can be configured in case you need the functionality.
-   For exposing API as MCP server you need at least one operation available. You can expose multiple such and even remove them as long as there is at least one left.

The examples can be found on [GitHub](https://github.com/slavizh/BicepTemplates/tree/main/apim-mcp-servers).

I hope this was useful information for you!
