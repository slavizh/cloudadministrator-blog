---
title: "Defining Input Parameters For Policy Definitions in ARM Template"
excerpt: "My good friend and fellow MVP Tao Yang wrote a great post on Using ARM Templates to Deploying Azure Policy Definitions That Requires Input Parameters. Azure Policy has two terms that you should be …"
description: "My good friend and fellow MVP Tao Yang wrote a great post on Using ARM Templates to Deploying Azure Policy Definitions That Requires Input Parameters. Azure..."
pubDate: 2018-07-17
updatedDate: 2018-07-19
heroImage: "/media/wordpress/2018/07/policy-assign.png"
sourceUrl: "https://cloudadministrator.net/2018/07/17/defining-input-parameters-for-policy-definitions-in-arm-template/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure Policy"
  - "Azure Resource Manager"
  - "Microsoft"
  - "Operations Management Suite"
  - "Subscription Level Deployment"
---
My good friend and fellow MVP Tao Yang wrote a great post on [Using ARM Templates to Deploying Azure Policy Definitions That Requires Input Parameters](https://blog.tyang.org/2018/06/06/using-arm-templates-to-deploying-azure-policy-definitions-that-requires-input-parameters/). Azure Policy has two terms that you should be aware:

-   **Policy Definition** – This is the policy itself. This is the definition of what will be governed. The policy definition when created does not do anything until it is assigned. There are policy definitions available out of the box (created by Microsoft) and such that can be created on your own. Out of box policies are of type built-in and the ones created by you are custom.
-   **Policy Assignment** – This assigns policy definition to be applied at specific level like subscription, management group or resource group.

Some policy definitions can also have input parameter(s). When such policy definition is assigned you will need to enter value for the parameter(s). For example if we try to assign built-in policy ‘Not allowed resource types’ we are offered to enter value for parameter and choose which resource types should not be allowed:

![Policy Definition Assigned with Parameter](/media/wordpress/2018/07/policy-assign.png)

So the scenario Tao is describing is to create a custom policy definition that has parameter(s) with ARM template. In such case a problem occurs because in the policy definition we reference the parameter for the policy like this.

![Custom Ploicy Definition with Parameter](/media/wordpress/2018/07/custom-policy-param.png)

In red I’ve highlighted how we define that a policy definition should have parameter. And in yellow is the policy rule itself how it reference that the parameter should be used when the policy definition is assigned. The problem comes because **parameters()** function is already used in Azure Resource Manager Templates for referencing input parameter for the template but not for the policy. The workaround is to have such input parameter of type string in your template and to pass to that parameter a value **\[parameters(‘resourcesNamePattern’)\]** at the time of the deployment. Basically that way you are tricking the ARM Template deployment. The problem with that approach is basically have to define parameters for which you already know what will be the input and you will have to pass that input as string value via PowerShell. You cannot even skip this process with putting default value as the ARM template will get confused again and throw an error. As this was static value I was thinking wouldn’t be better such value to be passed as variable instead of parameter. That way it will be less confusing. And here is my solution:

![Custom Policy Definition with Paramter - easier way](/media/wordpress/2018/07/custom-policy-param-easier.png)

In this case I am using concat to construct the value for the variable. I cannot directly just enter value **\[parameters(‘resourcesNamePattern’)\]** as I will end up in the same situation where the ARM template gets confused. By using concat I can construct the value without upsetting ARM. The downside of this is that I also cannot use single quotes when using concat as the function itself uses them. The good thing is that you can actually define the single quote as a variable and than use it in concat. I’ve highlighted in yellow how we define the single quote. In red is how we build the value **\[parameters(‘resourcesNamePattern’)\]** as string. In green down below we just reference the variable. As you can see in this example I have zero parameters so this policy definition is easier to deploy.

Remember that Policy Definitions are subscription level objects. Because of that ARM templates for policy definitions are deployed at subscription. Recently Azure CLI was updated with command for subscription level deployment and we are waiting such command in AzureRM PowerShell module.

I hope this ARM template trick was useful for you.
