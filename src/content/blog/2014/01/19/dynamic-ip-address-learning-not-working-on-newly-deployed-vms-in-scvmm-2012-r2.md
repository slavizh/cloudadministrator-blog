---
title: "Dynamic IP Address Learning Not Working on Newly Deployed VMs in SCVMM 2012 R2"
excerpt: "With Windows Server 2012 R2 and System Center 2012 R2 we have the option to assign IP address inside a VM that is using Network Virtualization. This opens other scenarios like guest clustering so y…"
description: "With Windows Server 2012 R2 and System Center 2012 R2 we have the option to assign IP address inside a VM that is using Network Virtualization. This opens ot..."
pubDate: 2014-01-19
updatedDate: 2015-09-20
heroImage: "/media/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2014/01/19/dynamic-ip-address-learning-not-working-on-newly-deployed-vms-in-scvmm-2012-r2/"
tags: 
  - "Dynamic IP Address Learning"
  - "Hyper V"
  - "IP"
  - "Network Virtualization"
  - "NVGRE"
  - "Port Classification"
  - "SCVMM"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Virtual Machine Manager"
  - "Hyper-V"
  - "Microsoft"
  - "Software"
  - "Virtualization"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "Virtualization"
---
With Windows Server 2012 R2 and System Center 2012 R2 we have the option to assign IP address inside a VM that is using Network Virtualization. This opens other scenarios like guest clustering so you see why this feature is important. Imagine you are in the following situation:

-   A VM is deployed trough SCVMM 2012 R2;
-   That VM is using Network Virtualization;
-   After deployment of the VM you assign another IP addresses inside the VM;
-   That new IP address is not learned by SCVMM 2012 R2;

My co-worker found that if you do not specify Port Classification on the vNIC Dynamic IP address Learning will not work for that machine. When you do not assign Port Classification VMM will assign the default one and even if the default one. But even if the default one has the check for Dynamic IP address learning that feature will still not work.

Workarounds for existing affected virtual machines is to re-assign the proper Port Classification and for new one is to deploy them with proper Port Classification.

My principle is when you deploy VMs is to use all available settings that exists. Even if you will use default values make sure you point them specifically trough the GUI or PowerShell. Every settings is important.
