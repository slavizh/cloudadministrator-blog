---
title: "Escape Double Quotes For Strings in ARM Templates"
excerpt: "Recently I’ve came into the following situation. I needed to store a json as Azure Automation string variable. To do that is easy as you just need to pass the json as text by first escaping i…"
description: "Recently I’ve came into the following situation. I needed to store a json as Azure Automation string variable. To do that is easy as you just need to pass th..."
pubDate: 2018-08-17
updatedDate: 2018-08-17
heroImage: "/media/wordpress/2018/08/azure_automation_variable.png"
sourceUrl: "https://cloudadministrator.net/2018/08/17/escape-double-quotes-for-strings-in-arm-templates/"
tags: 
  - "ARM"
  - "ARM Templates"
  - "Azure"
  - "Azure Automation"
  - "Azure Resource Manager"
  - "Double Quotes"
  - "Automation"
  - "Automation & Control"
  - "Operations Management Suite"
  - "Functions"
---
Recently I’ve came into the following situation. I needed to store a json as Azure Automation string variable. To do that is easy as you just need to pass the json as text by first escaping it. That is easy peasy when using PowerShell. But what if you want to pass the json as object parameter via ARM template parameters file and do the escape completely within the ARM template. Apparently that is possible as well and I will show you how.

Below you can see the parameters file I have created as example:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "automationAccountName": {
            "value": "stantest4777"
        },
        "automationAccountLocation": {
            "value": "West Europe"
        },
        "textToEscape" : {
            "value": {
                "test1": "p1",
                "test2": "p2"
            }
        }
    }
}
```

The parameter I will be escaping is “textToEscape”. The value of that parameter will become string value in Azure Automation variable. The end result is this:

![Azure Automation Variable](/media/wordpress/2018/08/azure_automation_variable.png)

*Azure Automation Variable*

As you can see string value containing the json as text. Below you can see the example of how to achieve that:

```json
{
    "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "automationAccountName": {
            "type": "string"
        },
        "automationAccountLocation": {
            "type": "string"
        },
        "textToEscape" : {
            "type": "object"
        }
    },
    "variables": {
    },
    "functions": [
        {
            "namespace": "stan",
            "members": {
                "escape": {
                    "parameters": [
                        {
                            "name": "stringToEscape",
                            "type": "string"
                        }
                    ],
                    "output": {
                        "type": "string",
                        "value": "[replace(parameters('stringToEscape'), substring('\"',0,1), '\\\"')]"
                    }
                }
            }
        }
    ],
    "resources": [
        {
            "name": "[parameters('automationAccountName')]",
            "type": "Microsoft.Automation/automationAccounts",
            "apiVersion": "2018-01-15",
            "location": "[parameters('automationAccountLocation')]",
            "dependsOn": [],
            "properties": {
                "comment": "",
                "sku": {
                    "name": "Basic"
                }
            }
        },
        {
            "name": "[concat(parameters('automationAccountName'), '/', 'TestVar')]",
            "type": "Microsoft.Automation/automationAccounts/variables",
            "apiVersion": "2018-01-15",
            "dependsOn": [
                "[resourceId('Microsoft.Automation/automationAccounts', parameters('automationAccountName'))]"
            ],
            "properties": {
                "description": "",
                "isEncrypted": 0,
                "type": "string",
                "value": "[concat('\"', stan.escape(string(parameters('textToEscape'))) ,'\"')]"
            }
        }
    ],
    "outputs": {
        "test" : {
            "type": "string",
            "value": "[stan.escape(string(parameters('textToEscape')))]"
        }
    }
}
```

From the template you will notice a few things:

-   I am using custom functions in ARM templates to create my own function which will do the processing. More on [custom functions](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates#functions)
-   Before using the custom function I am converting the object to string by using string() function
-   My escape() function basically replaces character **“** with character **\\”**
-   In order to reference correctly the **“** character I have to use some “magic” with substring() to get it
-   In the variables resources I am using my **escape** function which is located in **stan** namespace
-   Note that in order to add string Azure Automation variable you use concat() to add quotes around the variable otherwise it won’t be accepted as string

In the output I’ve also used the same function just to show you what is being passed to the value property of Azure Automation variable resource:

![ARM Template Output](/media/wordpress/2018/08/template-output.png)

I hope this cool Azure Resource Manager template trick will be useful for you.
