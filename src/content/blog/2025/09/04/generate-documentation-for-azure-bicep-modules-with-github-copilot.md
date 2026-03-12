---
title: "Generate Documentation for Azure Bicep Modules with GitHub Copilot"
excerpt: "Bicep modules provide this awesome feature to be able to create schema for your Bicep modules via User-defined data types. When you reference Bicep module in bicep template or bicep parameters file…"
description: "Bicep modules provide this awesome feature to be able to create schema for your Bicep modules via User-defined data types. When you reference Bicep module in..."
pubDate: 2025-09-04
updatedDate: 2025-09-04
heroImage: "/media/wordpress/2025/09/image.png"
sourceUrl: "https://cloudadministrator.net/2025/09/04/generate-documentation-for-azure-bicep-modules-with-github-copilot/"
tags: 
  - "Azure"
  - "Documentation"
  - "Schema"
  - "Azure Bicep"
  - "GitHub Copilot"
  - "AI"
  - "Markdown"
  - "Artificial Intelligence"
  - "Technology"
  - "Bicep"
  - "Copilot"
---
Bicep modules provide this awesome feature to be able to create schema for your Bicep modules via [User-defined data types](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/user-defined-data-types?WT.mc_id=AZ-MVP-5000120). When you reference Bicep module in bicep template or bicep parameters file you get nice intellisense in VSC to understand the structure of the parameters, whether they are required or not and additional information. This is the same experience when you start to define a resource. I was one of the first requestors and adopters of the feature and I heavily use it every day. Although the feature provides great experience within VSC there is still a need to document that schema in some other place just like it is done for [Azure resource](https://learn.microsoft.com/en-us/azure/templates/?WT.mc_id=AZ-MVP-5000120). This trivial task is not so easy to do but today I will show you how easy it is by using GitHub Copilot.

When I say it is not easy to do I have some options in the past by compiling the Bicep module to ARM template and using the definitions part of the template to create a document. Using some available open source tools I couldn’t achieve decent results. Note that I have done such tests long time ago so things might have changed since than. I have also tried using GitHub Copilot (GPT 3.5) in the past and it was not possible as well but with the latest releases of GitHub Copilot and newer modules it is now possible with very good results. Of course for the output format of documentation we will use Markdown. Markdown is the standard and it can be displayed on GitHub repository. For my example I will use one of modules I have demoed in my Azure Bootcamp session this year. I have uploaded [the same example along with my other Bicep templates](https://github.com/slavizh/BicepTemplates/tree/main/sql-server-database). I have opened new GitHub Copilot Chat in VSC, selected agent mode and GPT-4.1 model. You can try other models and see the results. I have also included main.bicep and types.bicep files as a context. After that I have execute the following prompt:

Execute the following tasks:

-   Convert the bicep schema into markdown document
-   Make the parameters (defined as param) top parameters of the schema in the document
-   Add column Required. If the property contains ? It is not required, if it does not it is required
-   For enum values display the actual type (int or string) in Type column and in description add sentence for allowed values.
-   In the markdown set links between the different parameters defined when they are not string or int
-   Save the file as readme.md in the folder of the other files.

The results that I’ve got were the following:

![](/media/wordpress/2025/09/readme-generated.png)

*GitHub Copilot Generated Markdown*

As you can see the format is very similar to the one available for Azure resource. The [full readme.md you can see at GitHub](https://github.com/slavizh/BicepTemplates/blob/main/sql-server-database/readme.md).

From here you can try to improve or fix any issues (there are such in the example) by tweaking the prompt according to your liking. And from markdown you can easily convert it with different tools to other formats like PDF for example.

I hope this was insightful blog post for you.

P.S. Always be critical to results generated to AI. I am certainly such person. I have my own ups and downs with different AIs but for things that I know they are good at I am not shy at using them.
