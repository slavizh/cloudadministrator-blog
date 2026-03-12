---
title: "Installing System Center Service Management Automation Worker Role Fails with MSI Error 1603"
excerpt: "I was deploying SMA recently and bumped in into the following error while installing the Worker Role:"
description: "I was deploying SMA recently and bumped in into the following error while installing the Worker Role:"
pubDate: 2014-01-27
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2014/01/image16.png"
sourceUrl: "https://cloudadministrator.net/2014/01/27/installing-system-center-service-management-automation-worker-role-fails-with-msi-error-1603/"
tags: 
  - "Error"
  - "Install"
  - "PowerShell"
  - "SCSMA"
  - "SMA"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Service Management Automation"
  - "Troubleshoot"
  - "Microsoft"
  - "Service Management Automation"
  - "Software"
  - "System Center Orchestrator"
  - "Windows"
  - "Worker Role"
---
I was deploying SMA recently and bumped in into the following error while installing the Worker Role:

_MSI (s) (C4:6C) \[XX:XX:XX:XX\]: Windows Installer installed the product. Product Name: System Center 2012 R2 Service Management Automation Runbook Worker. Product Version: 7.2.1563.0. Product Language: 1033. Manufacturer: Microsoft Corporation. Installation success or error status: 1603._

Prior installing the worker role I’ve installed the Web Service role without issue so I knew the server was ok.

I’ve opened the setup log generated from the installation wizard and saw the error above. This error doesn’t much so I’ve scrolled until I’ve found the real reason for the installation failure:

_CAQuietExec64:  Enable-WSManCredSSP : This command cannot be executed because the setting
CAQuietExec64:  cannot be enabled.
CAQuietExec64:  At line:1 char:1
CAQuietExec64:  + Enable-WSManCredSSP -Role client -DelegateComputer \*.contoso.com
CAQuietExec64:  -Force
CAQuietExec64:  + ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CAQuietExec64:  ~~~
CAQuietExec64:      + CategoryInfo          : InvalidOperation: (System.String:String) \[En
CAQuietExec64:     able-WSManCredSSP\], InvalidOperationException
CAQuietExec64:      + FullyQualifiedErrorId : WsManError,Microsoft.WSMan.Management.EnableWSMa
CAQuietExec64:     nCredSSPCommand
CAQuietExec64:
CAQuietExec64:  Error 0x80070001: Command line returned an error.
CAQuietExec64:  Error 0x80070001: CAQuietExec64 Failed
CustomAction EnableCredSSP returned actual error code 1603 (note this may not be 100% accurate if translation happened inside sandbox)_

This error reminded me to a similar error I had before while install Service Provider Foundation (SPF). Basically there is an issue if you have some custom PowerShell group policy applied like this one to the server:

[![image](/media/wordpress/2014/01/image16.png "image")](/media/wordpress/2014/01/image16.png)

So I’ve disabled the group policy for the server that I wanted to install the SMA worker role, update the group policy on the server and the installation completed successfully this time.
