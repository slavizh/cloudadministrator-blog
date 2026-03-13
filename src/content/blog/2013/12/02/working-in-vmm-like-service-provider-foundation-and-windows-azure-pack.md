---
title: "Working in VMM like Service Provider Foundation and Windows Azure Pack"
excerpt: "As we know Service Provider Foundation is the API of VMM. SPF is a web service that can execute tasks against VMM server and WAP just connects to SPF to communicate with VMM so we have the followin…"
description: "As we know Service Provider Foundation is the API of VMM. SPF is a web service that can execute tasks against VMM server and WAP just connects to SPF to comm..."
pubDate: 2013-12-02
updatedDate: 2015-09-20
heroImage: "/media/2013/12/image11.png"
sourceUrl: "https://cloudadministrator.net/2013/12/02/working-in-vmm-like-service-provider-foundation-and-windows-azure-pack/"
tags: 
  - "Owner"
  - "PowerShell"
  - "SCSPF"
  - "SCVMM"
  - "Service Provider Foundation"
  - "SPF"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Service Provider Foundation"
  - "System Center Virtual Machine Manager"
  - "Tenant"
  - "User Role"
  - "VM"
  - "WAP"
  - "Microsoft"
  - "Software"
  - "Virtualization"
  - "Windows Azure Pack"
  - "Windows Azure Pack"
---
As we know Service Provider Foundation is the API of VMM. SPF is a web service that can execute tasks against VMM server and WAP just connects to SPF to communicate with VMM so we have the following communication path VMM<->SPF<->WAP. SPF and WAP both have service accounts they use but when a Tenant initiate action trough a WAP portal that action is forwarded to SPF and SPF execute the action in the name of the Tenant by impersonating the account. I will not go into details but this is basically done trough the creation of Tenant Administrator Roles and adding claim-based identities from WAP as members in the role. In result when VM is created trough WAP Portal by using a Tenant Account the Owner and the User Role of that VM in VMM will be the claim-based identity and the Tenant Administrator role that are associated with this Tenant Account.

By having this mind let’s imagine that we have a VM for which we want to change the Owner and the Tenant Role. May be this VM was associated with one Tenant in WAP and we want to move it to another one in WAP or we’ve just created a VM manually in VMM and we want to associate that VM with Tennant in WAP.

**Where is the issue?**

The issue is if we use the VMM cmdlet like this one to change the owner:

[![image](/media/2013/12/image11.png "image")](/media/2013/12/image11.png)

_Get-SCVirtualMachine –Name VM1 | Set-SCVirtualMachine –Owner_ _stan.zhelyazkov@outlook.com_

We will get similar error:

[![image](/media/2013/12/image12.png "image")](/media/2013/12/image12.png)

_Set-SCVirtualMachine: The specified owner is not a valid Active Directory Domain Services account._

This is because there is no user stan.zhelyazkov@outlook.com in the AD where VMM is joined and the cmdlet checks that before adding it as owner of the machine. The GUI will also not allow you to assign other than AD user.

This seems right but when VMs are created trough WAP their owners are identities that are in WAP and not in AD and such owners are assigned to VMs from WAP without issues.

**So how WAP and SPF do it?**

Actually SPF does it and WAP just tells SPF to do it. When SPF talks to VMM, SPF usually uses Properties like _\-ForOnBehalfof -OnBehalfOfUser_ and _–OnBehalfOfUserRole._ With these properties SPF is able to execute actions on behalf users and roles.

So let’s take the example with the owner above and see hot to change it with the power of PowerShell and these properties.

First we need to start VMM PowerShell and connect to the VMM server like this:

[![image](/media/2013/12/image13.png "image")](/media/2013/12/image13.png)

_Get-SCVMMServer –ComputerName vmmserver.contoso.com – ForOnBehalfOf_

Than as when you want to change the Owner you will probably also want to change the User Role of that VM you need to get the new User Role and put in variable like this:

[![image](/media/2013/12/image14.png "image")](/media/2013/12/image14.png)

_$role = Get-SCUserRole –Name Tenant256_

After that trough regular SCVMM cmdlet you can assign new User Role to the VM in question:

[![image](/media/2013/12/image15.png "image")](/media/2013/12/image15.png)

_Get-SCVirtualMachine –Name VM1 | Set-SCVirtualMachine –UserRole $role_

Now that you have the new User Role assigned you will want to assign Owner to that VM on behalf of that User Role:

[![image](/media/2013/12/image16.png "image")](/media/2013/12/image16.png)

_Get-SCVirtualMachine –Name VM1 | Set-SCVirtualMachine –Owner stan.zhelyazkov@outlook.com –OnBehalfOfUserRole $role –OnBehalfOfUser $role_

And VIOLAA the new owner is assigned successfully:

[![image](/media/2013/12/image17.png "image")](/media/2013/12/image17.png)

If you using WAP and you are moving virtual machine from one Tenant to another Tenant you may also want to check this [link](http://msdn.microsoft.com/en-us/library/dn306085.aspx).

This was a little deep dive into the world of VMM, SPF and WAP and I hope will make you understand these products better.
