---
title: "Testing Data Processing Azure Bicep Functions Easily"
excerpt: "These days Azure Bicep has a lot of more functions that can be used for processing data. Most notably I am referring to the [lambda Azure Bicep functions]( Often times I use two or more of these fu…"
description: "These days Azure Bicep has a lot of more functions that can be used for processing data. Most notably I am referring to the [lambda Azure Bicep functions]( O..."
pubDate: 2025-01-07
updatedDate: 2025-01-07
heroImage: "/media/wordpress/2025/01/image-1.png"
sourceUrl: "https://cloudadministrator.net/2025/01/07/testing-data-processing-azure-bicep-functions-easily/"
tags: 
  - "Azure"
  - "Azure Bicep"
  - "Azure DevOps"
  - "Bicep"
  - "Cloud"
  - "DevOps"
  - "Lambda Functions"
  - "ARM"
  - "Test"
---
These days Azure Bicep has a lot of more functions that can be used for processing data. Most notably I am referring to the [lambda Azure Bicep functions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions-lambda?WT.mc_id=AZ-MVP-5000120). Often times I use two or more of these functions all together in Bicep templates. When using several of these functions chained one after another it is easier to get lost how data will be processed. Also to test all the different input that will be passed to those functions will results in doing several different deployments. That is time consuming process as deployments takes time to run not to mention that along I have several other resources also deployed via those templates. Thankfully just to test if the data is processed according to how I have imagine it there is easier method by using Bicep parameters files.

Like Bicep templates, Bicep parameters files also allows you to use the majority of the functions available in the Bicep language. And that is where the trick is you can put your data processing functions into Bicep Parameters files and convert it to ARM template parameters file via VSC (Visual Studio Code) to see the end result. To visualize this let’s have the following simple example in Bicep Parameters file:

```bicep
using none

var dataInput = [
  {
    name: 'foo1'
    location: 'loc1'
    target: 3
  }
  {
    name: 'foo2'
    location: 'loc1'
    target: 5
  }
  {
    name: 'foo3'
    location: 'loc2'
    target: 1
  }
]

param endResult = toObject(dataInput, entry => entry.name, entry => {
  location: entry.location
  target: entry.target
})
```

As you can see I am having variable which will server as our data input for the Bicep functions that I will use. The functions itself are used inside Bicep parameter. To see what the end result will be once the data from variable dataInput is processed I can right click on the file in VSC and select Build Parameters file:

![](/media/wordpress/2025/01/build-parameters-file.png)

*Build Parameters file*

This generates JSON file with the same name as the Bicep parameters file that has the following content:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "endResult": {
      "value": {
        "foo1": {
          "location": "loc1",
          "target": 3
        },
        "foo2": {
          "location": "loc1",
          "target": 5
        },
        "foo3": {
          "location": "loc2",
          "target": 1
        }
      }
    }
  }
}
```

The end result is in JSON but you can easily understand the structure it will have when it is in Bicep as well. You can continue your tests by just changing the contents of the dataInput variable to see if the end result will match your expectations and no errors will be generated. Our first test went well but let’s imagine that target property might not always be provided and we want to test if the changes of our code will work with such input:

```bicep
using none

var dataInput = [
  {
    name: 'foo1'
    location: 'loc1'
    target: 3
  }
  {
    name: 'foo2'
    location: 'loc1'
    target: 5
  }
  {
    name: 'foo3'
    location: 'loc2'
    target: 1
  }
  {
    name: 'foo4'
    location: 'loc3'
  }
]

param endResult = toObject(dataInput, entry => entry.name, entry => {
  location: entry.location
  target: entry.?target ?? 0
})
```

Due to the changes we have put the code will build successfully in ARM template parameters file:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "endResult": {
      "value": {
        "foo1": {
          "location": "loc1",
          "target": 3
        },
        "foo2": {
          "location": "loc1",
          "target": 5
        },
        "foo3": {
          "location": "loc2",
          "target": 1
        },
        "foo4": {
          "location": "loc3",
          "target": 0
        }
      }
    }
  }
}
```

The above were simple examples that might not required you to use Bicep parameters files to figure out the end result but let’s look at something like this:

```bicep
using none

var dataInput = [
  {
    name: 'foo1'
    location: 'loc1'
    target: 3
  }
  {
    name: 'foo2'
    location: 'loc1'
    target: 5
  }
  {
    name: 'foo3'
    location: 'loc2'
    target: 1
  }
  {
    name: 'test2'
    location: 'loc3'
    target: 6
  }
  {
    name: 'foo4'
    location: 'loc3'
  }
]

param endResult = toObject(
  filter(
    items(toObject(filter(dataInput, item => contains(item.name, 'foo')), entry => entry.name, entry => {
      location: entry.location
      target: entry.?target ?? 0
      totalTarget: reduce(
        map(dataInput, item => !contains(item.name, 'foo') ? 0 : item.?target ?? 0),
        0,
        (cur, next) => cur + next
      )
    })),
    entry => entry.value.totalTarget - entry.value.target > 4
  ),
  entry => entry.key,
  entry => entry.value
)
```

As you can see a lot of functions are used here so it is hard to predict the format of the end result and the results itself without compiling the code.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "endResult": {
      "value": {
        "foo1": {
          "location": "loc1",
          "target": 3,
          "totalTarget": 9
        },
        "foo3": {
          "location": "loc2",
          "target": 1,
          "totalTarget": 9
        },
        "foo4": {
          "location": "loc3",
          "target": 0,
          "totalTarget": 9
        }
      }
    }
  }
}
```

This method can also be used to learn the different Azure Bicep functions for processing data. I hope this was useful tip for you.
