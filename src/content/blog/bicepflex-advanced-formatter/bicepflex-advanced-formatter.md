---
title: "BicepFlex - Advanced Formatter for Bicep"
excerpt: "BicepFlex is a Visual Studio Code extension that uses Prettier to provide a configurable, opinionated formatter for Azure Bicep files."
description: "Explore BicepFlex, a Visual Studio Code extension for formatting Azure Bicep with Prettier. Learn why I built it, how its extensive settings help make templates more readable, and where to find the extension and source code."
pubDate: 2026-10-07
updatedDate: 2026-10-07
heroImage: "/media/bicepflex-advanced-formatter/bicepflex-advanced-formatter-hero.png"
sourceUrl: "https://cloudadministrator.net/bicepflex-advanced-formatter/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "BicepFlex"
  - "IaC"
  - "Infrastructure as Code"
  - "DevOps"
  - "Visual Studio Code"
  - "Prettier"
  - "Code Formatter"
---

The Bicep CLI has supported formatting configuration and a [format command](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli?tabs=bicep-cli#format) for some time. Those options are useful, but I found them too limited for the formatting style I wanted. In some cases, the result was not as readable as I would like.

Consistent, readable formatting makes it easier to follow the logic in a template. That becomes especially important when you maintain many templates and a large amount of infrastructure code. I wanted more control over how Bicep files are formatted, so I started looking for an alternative.

I came across [Prettier](https://prettier.io/), which has a Visual Studio Code extension and supports community plugins for additional languages. Bicep was not among its built-in languages, so I initially tried using GitHub Copilot to create a Bicep plugin. After spending several hours exploring that approach, I decided to build a separate Visual Studio Code extension instead.

Using a Prettier plugin would be a good fit for formatting Bicep programmatically. However, it would require each project to add the plugin as an npm dependency and install it. My goal was to make the formatter easier to set up and use directly in Visual Studio Code, without requiring that extra project-level setup.

During development, I also needed to depend on the `Azure.Bicep.Core` package. It is not a supported public API, so breaking changes could occur over time. I accepted that trade-off because the functionality I needed was not available through the Bicep language server included with the Bicep Visual Studio Code extension.

After finishing the initial implementation, I needed a name. I chose **BicepFlex** to reflect the flexibility of its formatting options.

The extension is available in the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=cloudadministrator.bicepflex&ssr=false#overview), and its source code is in the [vsc-bicepflex repository](https://github.com/slavizh/vsc-bicepflex).

I will not cover every setting in this post; there are many, and you can browse the repository for the full list. You can also explore and adjust the settings in Visual Studio Code:

![BicepFlex VSC Settings](/media/bicepflex-advanced-formatter/bicepflex-vsc-settings.png)

The screenshot shows only some of the available options. BicepFlex provides an opinionated default style while letting you customize each setting to suit your preferences. In addition to familiar options such as print width and tab width, you can configure how properties in resources and modules are ordered, as well as the order of decorators.

These options are useful because formatting is not only about line breaks and indentation. A consistent property order can make it easier to scan similar resources across a template, while consistent decorator ordering helps readers know where to look for metadata and validation rules. The particular order is a matter of style, but applying it consistently can make large templates easier to review and maintain.

The defaults give you a starting point, and the individual settings let you adapt the output to your team's conventions. That flexibility is the reason for the name: you do not have to accept one fixed style, but you also do not have to configure every detail before you can start using the formatter. You can begin with the defaults and adjust the options that matter to you.

As with any formatter, BicepFlex is not a substitute for reviewing or validating your templates. Its purpose is to make the code's presentation more consistent and readable; deployment validation and testing remain separate steps in the development workflow.

One of my goals is to encourage discussion about whether similar formatting capabilities could be built directly into the Bicep CLI and Visual Studio Code extension. The Bicep team could potentially implement them without relying on Prettier, using its direct knowledge of the language and tooling. Needless to say, they also have more AI credits than I do.

In the meantime, I will maintain BicepFlex as long as I can. Give the extension a try, and if you have feedback or find an issue, please share it in the repository's issue tracker.