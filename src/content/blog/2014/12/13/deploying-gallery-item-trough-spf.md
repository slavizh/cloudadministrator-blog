---
title: "Deploying Gallery Item trough SPF"
excerpt: "This blog post aims at exploring Service Provider Foundation. Charles Joy already covered how to deploy Gallery item trough WAP API and VMM PowerShell in series of blog posts. Although the SPF API …"
description: "This blog post aims at exploring Service Provider Foundation. Charles Joy already covered how to deploy Gallery item trough WAP API and VMM PowerShell in ser..."
pubDate: 2014-12-13
updatedDate: 2018-06-11
heroImage: "/media/2014/12/image35.png"
sourceUrl: "https://cloudadministrator.net/2014/12/13/deploying-gallery-item-trough-spf/"
tags: 
  - "Azure Pack"
  - "Gallery Item"
  - "PowerShell"
  - "SCSPF"
  - "SCVMM"
  - "SPF"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Service Provider Foundation"
  - "System Center Virtual Machine Manager"
  - "WAP"
  - "Wapack"
  - "Web"
  - "Microsoft"
  - "Service Provider Foundation"
  - "Software"
  - "System Center Orchestrator"
  - "Virtualization"
  - "Windows"
  - "Windows Azure Pack"
  - "Windows Azure Pack"
---
This blog post aims at exploring Service Provider Foundation. Charles Joy already covered how to deploy Gallery item trough WAP API and VMM PowerShell [in series of blog posts](http://blogs.technet.com/b/privatecloud/archive/2014/02/28/automation-the-new-world-of-tenant-provisioning-with-windows-azure-pack-part-1-introduction-and-table-of-contents.aspx). Although the SPF API for Gallery Items is similar I will show you how it is done there and what are the differences.

Let’s first from the beginning by creating a Tenant in SPF and VMM similarly the Windows Azure Pack does it:

```powershell
#Create Tenant SPF
$TenantPortalAddress="spfserver.contoso.com"
$cred=Get-Credential
$Guid2=[System.Guid]::NewGuid()
$URI="https://{0}:8090/SC2012R2/Admin/Microsoft.Management.Odata.svc/Tenants" -f $TenantPortalAddress
$TenantRole = @{
        "Name" = "Tenant3333"
        "SubscriptionID" ="$Guid2"
        }
$TenantRoleJSON = ConvertTo-Json $TenantRole

Invoke-WebRequest -Uri $URI -Credential $cred -Method Post -Body $TenantRoleJSON -ContentType 'application/json'
```

First we need the FQDN of the SPF server ($TenantPortalAddress). We will use it to create the URLs to which will make web requests.

Than we get credentials ($cred) that have rights against the SPF Admin API.

Third we generate GUID  ($Guid2). This guid we will use for subscription ID.

We create hash table ($TenantRole ) that will represent our body in the web request. That hash table contains information to create the Tenant in SPF.

Than we convert that hash table to json format.

With Method Post we make Web request to SPF API.

The web request will return status code 201 that he object is created:

[![image](/media/2014/12/image35.png "image")](/media/2014/12/image35.png)

Now that we have the Tenant in SPF the next step is to create the same tenant in VMM. Basically creating User Role in VMM with the same name and ID as the SPF tenant links them. That easily happens trough SPF by assigning they created SPF Tenant to Stamp:

```powershell
$URI3="https://{0}:8090/SC2012R2/Admin/Microsoft.Management.Odata.svc/Tenants(guid’$Guid2′)/`$links/Stamps" -f $TenantPortalAddress
$stampURL="https://{0}:8090/SC2012R2/Admin/Microsoft.Management.Odata.svc/Stamps(guid’2dcbb497-2b41-4dad-a883-09212c21e9e5′)" -f $TenantPortalAddress

$TenantRoleAssignStamp = @{
        "url" = "$stampURL"
        }
$TenantRoleAssignStampJSON = ConvertTo-Json $TenantRoleAssignStamp

Invoke-WebRequest -Uri $URI3 -Credential $cred -Method Post -Body $TenantRoleAssignStampJSON -ContentType "application/json"
```

Again e need URL ($URL3) that represents the newly created SPF tenant.

The URL of our stamp ($stampURL).

Again we need to create hash table ($TenantRoleAssignStamp ). This time with only one property url.

We convert the hash table again to json.

And we invoke again the SPF Admin API.

[![image](/media/2014/12/image36.png "image")](/media/2014/12/image36.png)

This will return status content 204 (no Content) and you will see the user role created in VMM:

[![image](/media/2014/12/image37.png "image")](/media/2014/12/image37.png)

Now to that User Role you can assign cloud, library and other resources trough the GUI as I do not currently web requests how to do that.

I also I do not have web request to SPF how to add gallery item to specific Tenant/User role but you can use WAP to create your tenant and assign Gallery Items. Other way is to import your Gallery item in VMM and SPF. Than assign that gallery item to the VMM user  Role with powershell:

```powershell
$Guid2=[System.Guid]::NewGuid()
$re=Get-CloudResourceExtension -Name "DomainControllerWindows2012"
$userRole=Get-SCUserRole -Name Tenant3333

Grant-SCResource -Resource $re -JobGroup $Guid2
Set-SCUserRole -UserRole $userRole -JobGroup $Guid2
```

and you will need to add the gallery item for the SPF tenant also.

You can do that by adding record in SPF database. Specifically in TenantGalleryItems table. You need to add the Gallery item name, the version, the published and the Tenant ID. Tenant ID is the same guid that was generated during creation.

[![image](/media/2014/12/image38.png "image")](/media/2014/12/image38.png)

Ok now that we have these things done is time for the actual deployment of Gallery Item trough SPF. Most of the code below is taken from Charles Joy’s articles plus additional changes needed that to happen trough SPF.

```powershell
#region SetVariables

$cred=Get-Credential
$TenantID="4AE142C6-315B-476A-8B7F-A88C31C8F16D"
$GalleryItemName=”DomainControllerWindows2012″

$GIVersion = "1.0.0.0"
$TenantPortalAddress="spfserver.contoso.com"
$UserPrincipalName="stas333@outlook.com"
$DNSDomainName="cloudadmin.local"
$NETBIOSName="cloudadmin"

# Set Common Gallery Item Parameters
$UserID = $UserPrincipalName
$VMRoleNetwork = "Tenant3333 Network"
$CloudServiceName = "CloudService-4-{0}" -f $TenantID
$VMRoleTZ = "Pacific Standard Time"
$OSDisk = "WindowsServer2012-R1"
$OSDiskVersion = "1.0.0.0"
$Password = P@$$w0rd

if ($GalleryItemName -eq "DomainControllerWindows2012")
{
    $VMRoleName = "ActiveDirectory"
    $VMRoleNamePattern = "DC##"
    $VMRoleSize = "ExtraSmall"
}

#endregion SetVariables
```

as we can see we need to define some variables that we will use.

```powershell
#region GetResDef

# Get Gallery Item Reference

$Header=@{
"x-ms-principal-id"="$UserPrincipalName"
}
```

We defined header for our requests to include the user UPN that will execute these requests. That UPN is transferred in VMM and it is owner of the most jobs.

```powershell
$GIReferenceUri="https://{0}:8090/SC2012R2/VMM/{1}/GalleryService.svc/GalleryItems?api-version=2013-03" -f $TenantPortalAddress,$TenantID
$GIReferenceData=[xml](Invoke-WebRequest -Uri $GIReferenceUri -Method Get -Headers $Header -Credential $cred | Select-Object -ExpandProperty Content)

$GalleryItemREF=$GIReferenceData.feed.entry.content.properties.resourcedefinitionUrl | ? {$_ -match $GalleryItemName}
$GalleryItemREF =$GalleryItemREF.Trim("Gallery")
```

As the URL for Gallery items in SPF is different from the one in WAP I need to trim some part of it and more specifically the word “Gallery” in the beginning . Seems the urls for Gallery items in SPF are made for WAP.

```powershell
# Get Gallery Item Resource Definition
$GIResDEFUri = "https://{0}:8090/SC2012R2/VMM/{1}/GalleryService.svc{2}?api-version=2013-03" -f $TenantPortalAddress,$TenantID,$GalleryItemREF
$GIResourceDEFJSON = Invoke-WebRequest -Uri $GIResDEFUri -Headers $Header -Credential $cred | Select-Object -ExpandProperty Content

#Convert ResDef JSON to Dictionary
[System.Reflection.Assembly]::LoadWithPartialName("System.Web.Extensions”) | Out-Null
$JSSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ResDef = $JSSerializer.DeserializeObject($GIResourceDEFJSON)

#endregion GetResDef

#region SetResDefConfig
# Create Gallery Item Parameter Hashtable (for Common Data)
$GIParamList = @{
    VMRoleVMSize = $VMRoleSize
    VMRoleOSVirtualHardDiskImage = "{0}:{1}” -f $OSDisk,$OSDiskVersion
    VMRoleAdminCredential = "administrator:{0}” -f $Password
    VMRoleTimeZone = $VMRoleTZ
    VMRoleComputerNamePattern = $VMRoleNamePattern
    VMRoleNetworkRef = $VMRoleNetwork
    }
# Add to Gallery Item Parameter Hashtable (for GI Specific Data)
if ($GalleryItemName -eq "DomainControllerWindows2012”)
{
    $GIParamList += @{DomainControllerWindows2012DomainDNSName = $DNSDomainName}
    $GIParamList += @{DomainControllerWindows2012DomainNETBIOSName = $NETBIOSName}
    $GIParamList += @{DomainControllerWindows2012SafeModeAdminPassword = $Password}
}

# Convert Gallery Item Parameter Hashtable To JSON
$ResDefConfigJSON = ConvertTo-Json $GIParamList

#Add ResDefConfig JSON to Dictionary
$ResDefConfig = New-Object ‘System.Collections.Generic.Dictionary[String,Object]’
$ResDefConfig.Add("Version”,$GIVersion)
$ResDefConfig.Add("ParameterValues”,$ResDefConfigJSON)

#endregion SetResDefConfig

#region GenerateGIPayloadJSON
# Set Gallery Item Payload Variables
$GISubstate = $null
$GILabel = $VMRoleName
$GIName = $VMRoleName
$GIProvisioningState = $null
$GIInstanceView = $null

# Set Gallery Item Payload Info
$GIPayload = @{
    "InstanceView” = $GIInstanceView
    "Substate” = $GISubstate
    "Name” = $GIName
    "Label” = $GILabel
    "ProvisioningState” = $GIProvisioningState
    "ResourceConfiguration” = $ResDefConfig
    "ResourceDefinition” = $ResDef
    }

# Convert Gallery Item Payload Info To JSON
$GIPayloadJSON = ConvertTo-Json $GIPayload -Depth 7

#endregion GenerateGIPayloadJSON

# Get Cloud Services
$CloudServicesUri = "https://{0}:8090/SC2012R2/VMM/{1}/Microsoft.Management.Odata.svc/CloudServices?api-version=2013-03" -f $TenantPortalAddress,$TenantID
$CloudServicesData = [xml](Invoke-WebRequest -Uri $CloudServicesUri -Method Get -Headers $Header -Credential $cred | Select-Object -ExpandProperty Content)
$CloudService = $CloudServicesData.feed.entry.content.properties.Name | ? {$_ -match $CloudServiceName}
if (!$CloudService) {
    # Set Cloud Service Configuration
    $CloudServiceConfig = @{
        "Name” = $CloudServiceName
        "Label” = $CloudServiceName
        }

    # Convert Cloud Service Configuration To JSON
    $CloudServiceConfigJSON = ConvertTo-Json $CloudServiceConfig

    $CloudServicesData = [xml](Invoke-WebRequest -Uri $CloudServicesUri -Method Post -Headers $Header -Credential $cred -Body $CloudServiceConfigJSON -ContentType "application/json”)
    $CloudService = $CloudServicesData.entry.content.properties.Name | ? {$_ -match $CloudServiceName}
}

#endregion GetOrSetCloudService
```

This part creates cloud service in VMM if it is not present. Basically cloud service is needed VM role to be deployed in it. Many VM roles can be deployed in one cloud service. Every Tenant has its own cloud service. WAP creates cloud service for every VM role deployed.

```powershell
#region DeployGIVMRole

# Set Gallery Item VM Role Deploy URI
$GIDeployUri ="https://{0}:8090/SC2012R2/VMM/{1}/Microsoft.Management.Odata.svc/CloudServices/{2}/Resources/MicrosoftCompute/VMRoles?api-version=2013-03" -f $TenantPortalAddress,$TenantID,$CloudService

# Deploy Gallery Item VM Role
$VMRoleDeployed = Invoke-WebRequest -Uri $GIDeployUri -Credential $cred -Method Post -Headers $Header -Body $GIPayloadJSON -ContentType "application/json”
$VMRoleDeployed

#endregion DeployGIVMRole
```

This last part is the actual Deployment web request that is send against SPF. The request will return status code 201 (created). This will actually start a job in VMM and in order to see if the actual deployment is successful you will need to query that job and see what will be the end status of it. Here is a sample request that is returned from the invoke:

```text
#StatusCode        : 201
#StatusDescription : Created
#Content           : <entry
#                    xml:base=https://spfserver.contoso.com:8090/SC2012R2/VMM/4AE142C6-315B-476A-8B7F-A88C31C8F16D/Microsoft.Management.Odata.svc/
#                    xmlns=”http://ww...
#RawContent        : HTTP/1.1 201 Created
#                    x-ms-request-id: d7600d5c-55a7-4a29-851a-e879eb073394
#                    X-Content-Type-Options: nosniff
#                    request-id: 18e1d0a5-0768-0001-d3bb-e6186807d001
#                    DataServiceVersion: 3.0;
#                    Persistent-Aut…
#Forms             : {}
#Headers           : {[x-ms-request-id, d7600d5c-55a7-4a29-851a-e879eb073394], [X-Content-Type-Options, nosniff], [request-id, 18e1d0a5-0768-0001-d3bb-e6186807d001],
#                    [DataServiceVersion, 3.0;]…}
#Images            : {}
#InputFields       : {}
#Links             : {}
#ParsedHtml        : mshtml.HTMLDocumentClass
#RawContentLength  : 11989
```

From this request you can find the ID if the job that is deploying the gallery item:

```powershell
$VMMJobID=$VMRoleDeployed.Headers.'x-ms-request-id'
```

With simple command to get the job with VMM PowerShell we can see the status:

```powershell
Get-SCJob -ID $VMMJobID

#
#
#Name                 : Add VM Role resource
#Description          : Add VM Role resource
#Progress             : 99 %
#Status               : Running
#CmdletName           : AddCloudResource
#ErrorInfo            : Success (0)
#StartTime            : 11/28/2014 17:28:12
#EndTime              :
#Owner                : stas333@outlook.com
#ErrorInfo            : Success (0)
#AdditionalMessages   : {}
#ResultName           : ActiveDirectory
#ResultObjectTypeName : Cloud VMRole Resource
#IsStoppable          : True
#IsRestartable        : False
```

As you can see the jobs is running and progress is 99%. and later

[![image](/media/2014/12/image39.png "image")](/media/2014/12/image39.png)

[![image](/media/2014/12/image40.png "image")](/media/2014/12/image40.png)

So that is folks. If you need more explanation about the PowerShell code check the blogs by Charles as most of it comes from there and he explains very good what he is doing.
