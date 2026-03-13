---
title: "Error (2912) When You Try to Update VMM Agent on Hosts"
excerpt: "Recently I’ve stumbled on the following error when trying to update VMM agent on hosts:"
description: "Recently I’ve stumbled on the following error when trying to update VMM agent on hosts:"
pubDate: 2015-08-04
updatedDate: 2018-06-11
heroImage: "/media/2015/08/image14.png"
sourceUrl: "https://cloudadministrator.net/2015/08/04/error-2912-when-you-try-to-update-vmm-agent-on-hosts/"
tags: 
  - "3317976"
  - "Agent"
  - "DHCP"
  - "Error"
  - "Extension"
  - "Host"
  - "Hyper V"
  - "SCVMM"
  - "System Center 2012 R2"
  - "System Center Virtual Machine Manager"
  - "Update Rollup"
  - "WinRM"
  - "Hyper-V"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "Windows"
  - "Windows Servers 2012 R2"
  - "WMI"
---
Recently I’ve stumbled on the following error when trying to update VMM agent on hosts:

```text
Error (2912)
An internal error has occurred trying to contact the hv01.contoso.com server: NO_PARAM: NO_PARAM.
```

```text
WinRM: URL: [http://hv01.contoso.com:5985], Verb: [INVOKE], Method: [GetError], Resource: http://schemas.microsoft.com/wbem/wsman/1/wmi/root/microsoft/bits/BitsClientJob?JobId={9D5C4B47-E79E-4090-BC3B-552578D0EC8C}]

Unknown error (0x80072f0d)

Recommended Action
Check that WS-Management service is installed and running on server hv01.contoso.com. For more information use the command "winrm helpmsg hresult". If hv01.contoso.com is a host/library/update server or a PXE server role then ensure that VMM agent is installed and running. Refer to <a href="http://support.microsoft.com/kb/2742275">http://support.microsoft.com/kb/2742275</a> for more details.
```

[![image](/media/2015/08/image14.png "image")](/media/2015/08/image14.png)

At some point I’ve found workaround for this issue. Here it is:

1.  Install DHCP extension manually on every host. Usually the location is located in C:\\Program Files\\Microsoft System Center 2012 R2\\Virtual Machine Manager\\SwExtn on the VMM server. Depends on where your VMM is installed.
2.  Initiate Update Agent task from VMM console on every host. This time the task should finish successful.

I was too lazy to find proper resolution but the workaround should be sufficient enough if you occur this issue. Hope this was helpful.
