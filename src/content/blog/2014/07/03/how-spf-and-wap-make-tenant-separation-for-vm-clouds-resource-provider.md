---
title: "How SPF and WAP Make Tenant Separation for VM Clouds Resource Provider"
excerpt: "Lately I’ve been exploring and challenging my self with some DevOps. Got to follow the trend. It is not something deep but you have to start from somewhere. Let’s get started:"
description: "Lately I’ve been exploring and challenging my self with some DevOps. Got to follow the trend. It is not something deep but you have to start from somewhere...."
pubDate: 2014-07-03
updatedDate: 2018-06-18
heroImage: "/media/2014/07/image1.png"
sourceUrl: "https://cloudadministrator.net/2014/07/03/how-spf-and-wap-make-tenant-separation-for-vm-clouds-resource-provider/"
tags: 
  - "OData"
  - "PowerShell"
  - "SCSPF"
  - "SCVMM"
  - "Security"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Service Provider Foundation"
  - "System Center Virtual Machine Manager"
  - "WAP"
  - "Wapack"
  - "Web Service"
  - "Microsoft"
  - "Service Provider Foundation"
  - "Software"
  - "Virtualization"
  - "Windows Azure Pack"
  - "Windows Azure Pack"
---
Lately I’ve been exploring and challenging my self with some DevOps. Got to follow the trend. It is not something deep but you have to start from somewhere. Let’s get started:

We all know that we can query the SPF web service even with Internet Explorer:

```powershell
https://SPFserver.contoso.com:8090/SC2012R2/VMM/Microsoft.Management.Odata.svc/
```

[![image](/media/2014/07/image1.png "image")](/media/2014/07/image1.png)

```powershell
https://SPFServer.contoso.com:8090/SC2012R2/VMM/Microsoft.Management.Odata.svc/VirtualMachines()
```

[![image](/media/2014/07/image2.png "image")](/media/2014/07/image2.png)

But these queries result in returning all instances for specific object type. This neither gives us optimized queries nor provides multi-tenancy. So how than to get objects on behalf of the Tenant and more importantly how to create objects on behalf of the Tenant?

This information is not exposed clearly but can be found trough some docs, samples and a little bit of knowledge in WAP and SPF. To find it I was going trough this [link](http://msdn.microsoft.com/en-us/library/dn750758.aspx) and the [sample portal code](http://blogs.technet.com/b/privatecloud/archive/2014/06/26/sample-portal-code-based-on-windows-azure-pack-service-provider-foundation-and-virtual-machine-manager-version-2.aspx) provided by Microsoft.

When you go trough these two resources you will find example how WAP calls SPF on behalf of Tenant:

```powershell
https://spf-server-name:8090/SC2012/provider-service/subscription-id/Microsoft.Management.Odata.svc/
```

Resource provider service can be VMM or Admin and only need to find subscription ID. Let’s see if we can find with SPF PowerShell cmdlets:

```powershell
import-module spfadmin
Get-SCSpfTenant | Where Name -like stas*
```

[![image](/media/2014/07/image3.png "image")](/media/2014/07/image3.png)

Now we have that subscription ID so let’s try this:

```powershell
https://SPFserver.contoso.com:8090/SC2012R2/vmm/aa764fbe-824d-4ad0-ab5b-a47b5954d4a2/Microsoft.Management.Odata.svc/
```

Unfortunately we get this:

[![image](/media/2014/07/image4.png "image")](/media/2014/07/image4.png)

That does not mean necessary we are in the wrong direction just the credentials we use are not the right one.

Going trough the sample portal code I’ve found the following functions:

```csharp
///
/// Gets VMM Instance for a User role (Tenant, Self-Service User or Administrator)
///

///
///
///
private VMM VmmContextInstance(string userRoleName, Guid userRoleID)
{
if (VmmContextCache == null || !VmmContextCache.ContainsKey(userRoleName))
{
lock (sync)
{
if (VmmContextCache == null)
{
VmmContextCache = new Dictionary();
}

                   if (!VmmContextCache.ContainsKey(userRoleName))
{
VMM context = null;
if (userRoleName != “Administrator”)
{
// Create subscription auth mode context
context = new VMM(new Uri(string.Format(“{0}/{1}/services/systemcenter/VMM/Microsoft.Management.Odata.svc/”, TenantEndpoint, userRoleID.ToString().Replace(“{“, “”).Replace(“}”, “”))));
context.SendingRequest += new EventHandler<SendingRequestEventArgs>(OnSendingRequestTenant);
}
else
{
// Create admin auth mode context
context = new VMM(new Uri(string.Format(“{0}/services/systemcenter/SC2012R2/VMM/Microsoft.Management.Odata.svc/”, AdminEndpoint)));
context.SendingRequest += new EventHandler(OnSendingRequestAdmin);
}

                       // use OverwriteChanges to see updates made by VMM
context.MergeOption = System.Data.Services.Client.MergeOption.OverwriteChanges;
VmmContextCache.Add(userRoleName, context);
return context;
}
}
}
return VmmContextCache[userRoleName];
}

///
/// Method to set the Authorization token in request header for WAP Tenant Authentication
///

///
///
private void OnSendingRequestTenant(object sender, SendingRequestEventArgs e)
{
// Add an Authorization header that contains an OAuth WRAP access token to the request.
if (TenantHeaderValue != null)
{
string headerValue = “Bearer ” + TenantHeaderValue;
e.RequestHeaders.Add(“Authorization”, headerValue);
e.RequestHeaders.Add(“x-ms-principal-id“, string.Format(“[{0}]”, TenantUserName));
}
else
{
e.RequestHeaders.Add(“x-ms-principal-id”, “[test]”);
}
}
```

This x-ms-principal-id property is put in a header when you query URL. I do not know how to do that with IE but I can do it with PowerShell:

```powershell
$cred = Get-Credential
$request=""
$request =Invoke-WebRequest -Uri "https://SPFserver.contoso.com:8090/SC2012R2/vmm/aa764fbe-824d-4ad0-ab5b-a47b5954d4a2/Microsoft.Management.Odata.svc/VMNetworks()" -Method Get -Headers @{"x-ms-principal-id"="stas at outlook.com"} -Credential $cred
$request.content
```

[![image](/media/2014/07/image5.png "image")](/media/2014/07/image5.png)

This will get us the same results we see in IE but this time scoped to the Tenant we are using. Note that you will still have to provide credentials that have access to the SPF VMM Endpoint. The x-ms-principal-id property just needs to be provided and actually you can put any value you want and it will still works. I will explain later how security is provided trough SPF and WAP.

Now that we were able to get results how can be sure that actually what we’ve did is really executed on behalf of the Tenant in VMM? Simple answer is we need to create object and see if this object has the right properties when created. That of course also can be done with PowerShell:

```powershell
$request=""
$body = @{
StampId = "2dcbb497-2b41-4dad-a883-09212c21e9e5"
Name = "Network33"
LogicalNetworkId = "1190fe0d-d5b9-4252-adae-b5b761db81f7"
CAIPAddressPoolType = "IPv4"
}
$BodyJSON = ConvertTo-Json $body

$request =Invoke-WebRequest -Uri "https://SPFserver.contoso.com:8090/SC2012R2/vmm/aa764fbe-824d-4ad0-ab5b-a47b5954d4a2/Microsoft.Management.Odata.svc/VMNetworks()" -Method Post -Body $BodyJSON -ContentType 'application/json;' -Headers @{"x-ms-principal-id"=stas at outlook.com} -Credential $cred
```

After executing the command you will see the following job in VMM:

[![image](/media/2014/07/image6.png "image")](/media/2014/07/image6.png)

You will see that the VM Network was created in the name of the Owner we’ve provided but is the User role that correspond to Tenant’s subscription owner of the VM Network?

[![image](/media/2014/07/image7.png "image")](/media/2014/07/image7.png)

As you can see everything is as it should be. Looking at WAP Tenant portal that network is shown for the Tenant:

[![image](/media/2014/07/image8.png "image")](/media/2014/07/image8.png)

In all commands I’ve modified my e-mail in order to not be exposed.

Now that we’ve learn that how SPF and WAP actually provide security?

SPF is just service provider/framework. SPF does not provide separate authentication for Tenants. SPF just provides the separation and the service and this is the right way as the authentication of your users will happen on your custom portal or in Windows Azure Pack. Trough your custom code or the WAP code you security is provided. For example WAP knows which users have access to which subscription and it does not allow to have access to other subscriptions you do not have access to by making context for that user. When user logs in WAP as Tenant token is generated for that user. This token gives additional security by restricting access only to the session. That token is even forwarded trough every call to SPF and SPF actually verifies if that token is truly valid.

I hope this gave you more insight about how SPF and WAP work together to achieve the goal to provide secure and multi-tenant service.
