---
title: "Using Infrastructure Servers in VMM 2012 R2"
excerpt: "Infrastructure Servers is a new feature in System Center 2012 R2 Virtual Machine Manager. You can read about this feature here but besides what you can read there let’s look at the feature more vis…"
description: "Infrastructure Servers is a new feature in System Center 2012 R2 Virtual Machine Manager. You can read about this feature here but besides what you can read..."
pubDate: 2013-11-04
updatedDate: 2015-09-20
heroImage: "/media/2013/11/image.png"
sourceUrl: "https://cloudadministrator.net/2013/11/04/using-infrastructure-servers-in-vmm-2012-r2/"
tags: 
  - "Infrastructure"
  - "Patching"
  - "SCVMM"
  - "System Center 2012 R2"
  - "System Center Virtual Machine Manager"
  - "Software"
  - "System Center"
  - "VMM"
---
Infrastructure Servers is a new feature in System Center 2012 R2 Virtual Machine Manager. You can read about this feature [here](http://technet.microsoft.com/en-us/library/dn277270.aspx) but besides what you can read there let’s look at the feature more visually.

First thing you need to do is to run as account in VMM.

[![image](/media/2013/11/image.png "image")](/media/2013/11/image.png)

The account needs to be local administrator on the servers that will be added in VMM as Infrastructure Servers.

Next you go to Fabric Pane and right clicking on Infrastructure will give you the option to add server.

[![image](/media/2013/11/image1.png "image")](/media/2013/11/image1.png)

In the example I am adding SCOM Management Server, As you can see you can give some description.

The first time when you try to add a server you may need to restart it first before actually you will be able to add the server.

[![image](/media/2013/11/image2.png "image")](/media/2013/11/image2.png)

After adding it successfully you need to assign baselines to the server that is add it. Than you can scan the server.

[![image](/media/2013/11/image3.png "image")](/media/2013/11/image3.png)

When scan is complete and the server is not compliant you can start remediation. You can choose to automatically restart the server after updates are applied or to restart it manually.

[![image](/media/2013/11/image4.png "image")](/media/2013/11/image4.png)

[![image](/media/2013/11/image5.png "image")](/media/2013/11/image5.png)

[![image](/media/2013/11/image6.png "image")](/media/2013/11/image6.png)

Definitely very useful feature. Even if you do not update your servers trough VMM you can use it to check compliance.

What are the limitations?

-   Only servers with Windows Server 2012 R2 can be added

Desired features for the next version:

-   Add custom roles to servers that are added. That way instead of Infrastructure you could see for example SCOM MS.
-   Option upon remediation to execute scripts before and after restart of the server. That way for example if you patch a server that is in NLB you can first stop it to participate in the NLB cluster before the restart and after the restart add it again.
-   Option to select a dozen of servers and remediate them one by one. When one server is updated and restarted the remediation continues to the next one.
-   Option to recognize clusters and patch them just like Cluster Aware Updating.
-   Ability to add servers with Windows Server 2012 also.
