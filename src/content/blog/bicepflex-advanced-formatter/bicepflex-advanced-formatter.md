---
title: "BicepFlex - Advanced Formatter for Bicep"
excerpt: ""
description: ""
pubDate: 2026-10-07
updatedDate: 2026-10-07
heroImage: "/media/bicepflex-advanced-formatter/bicepflex-advanced-formatter-hero.png"
sourceUrl: "https://cloudadministrator.net/bicepflex-advanced-formatter/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "IaC"
  - "Infrastructure as Code"
  - "DevOps"
  - "Idempotence"
---
Bicep CLI introduced formatting configuration and [format command](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli?tabs=bicep-cli#format) a couple of years ago.
However to me those options were pretty basic. So basic that sometimes the code will be formatted in a way that is not very readable to me. 
When you have consistent and readable code is a lot easier to read it and understand the code logic. 
This is important when you have hundreds of templates and millions lines of code to support. 
I have recently stumbled upon [Prettier](https://prettier.io/) which also have Visual Studio Code (VSC) extension. 
Unfortunately Bicep was not one of the supported languages but there was option to add community plugin to the extension for other languages. 
That lead me to try to use GitHub Copilot to create such plugin so I have invested several hours into doing that. 
During the process I have decided to create my own extension that is using Prettier underneath instead of having a plugin. 
The plugin option is more suitable if you need to format programmatically because you need to create dependency on the plugin and install it via npm.
That approach was not suitable currently for my goal. I wanted something that would be easier to setup and use in VSC.
During development I also had to take dependency on Azure.Bicep.Core package. That package is not supported and there could be breaking changes happening over time.
That is something I had to accept at that point as the functionality that was needed was not on the Bicep language server that is present when you install the Bicep VSC extension.
Once I was done with the code I only needed to come up with a name. I have decided to name it BicepFlex.
With that said the extension is available in [VSC Marketplace](https://marketplace.visualstudio.com/items?itemName=cloudadministrator.bicepflex&ssr=false#overview) and also it has its own repository [vsc-bicepflex](https://github.com/slavizh/vsc-bicepflex).
In this blog post I will not go trough every setting available as you can just browser the repository for more information or just change every setting in VSC:

![BicepFlex VSC Settings](/media/bicepflex-advanced-formatter/bicepflex-vsc-settings.png)

Note that the screenshot does not list all of them - there are a lot. I wanted to create opinionated Bicep formatted but at the same time to offer to change every setting to your liking.
Besides the standard settings for width, tab width, etc there are also setting for ordering properties on resources and modules, decorator ordering, etc.
The current intent is to may be inspire the Bicep team to implement this functionality directly in Bicep CLI and Bicep VSC extension. 
I am confident that by them owning the CLI code this can be done even without having to depend on Prettier. Needless to say they also have more AI credits than me.
Of course while I can I will try to maintain the extension. Try the extension and if you have any feedback feel free to log it at the issues in the repository.