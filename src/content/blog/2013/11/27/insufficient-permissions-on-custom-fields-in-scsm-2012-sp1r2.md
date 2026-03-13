---
title: "Insufficient Permissions on Custom Fields in SCSM 2012 SP1/R2"
excerpt: "I’ve recently stumbled on the following error in SCSM 2012 R2:"
description: "I’ve recently stumbled on the following error in SCSM 2012 R2:"
pubDate: 2013-11-27
updatedDate: 2015-09-20
heroImage: "/media/2013/11/image11.png"
sourceUrl: "https://cloudadministrator.net/2013/11/27/insufficient-permissions-on-custom-fields-in-scsm-2012-sp1r2/"
tags: 
  - "Bug"
  - "Custom Field"
  - "Extending Form"
  - "Hotfix"
  - "Incident Resolvers"
  - "Insufficient Permissions"
  - "SCSM"
  - "SQL"
  - "System Center"
  - "System Center 2012 R2"
  - "Microsoft"
  - "Software"
  - "System Center Service Manager"
  - "System Center Service Manager"
---
I’ve recently stumbled on the following error in SCSM 2012 R2:

[![image](/media/2013/11/image11.png "image")](/media/2013/11/image11.png)

_Microsoft.EnterpriseManagement.Common.UnauthorizedAccessEnterpriseManagementException: The user CONTOSO\\User1 does not have sufficient permission to perform the operation._

_at Microsoft.EnterpriseManagement.Common.Internal.ServiceProxy.HandleFault(String methodName, Message message)_

_at Microsoft.EnterpriseManagement.Common.Internal.ConnectorFrameworkConfigurationServiceProxy.ProcessDiscoveryData(Guid discoverySourceId, IList`1 entityInstances, IDictionary`2 streams, ObjectChangelist\`1 extensions)_

_at Microsoft.EnterpriseManagement.ConnectorFramework.IncrementalDiscoveryData.CommitInternal(EnterpriseManagementGroup managementGroup, Guid discoverySourceId, Boolean useOptimisticConcurrency)_

_at Microsoft.EnterpriseManagement.ConnectorFramework.IncrementalDiscoveryData.Commit(EnterpriseManagementGroup managementGroup)_

_at Microsoft.EnterpriseManagement.UI.SdkDataAccess.DataAdapters.EnterpriseManagementObjectProjectionWriteAdapter.WriteSdkObject(EnterpriseManagementGroup managementGroup, IList`1 sdkObjects, IDictionary`2 parameters)_

_at Microsoft.EnterpriseManagement.UI.SdkDataAccess.DataAdapters.SdkWriteAdapter`1.DoAction(DataQueryBase query, IList`1 dataSources, IDictionary`2 parameters, IList`1 inputs, String outputCollectionName)_

_at Microsoft.EnterpriseManagement.UI.ViewFramework.SingleItemSupportAdapter.DoAction(DataQueryBase query, IList`1 dataSources, IDictionary`2 parameters, IList\`1 inputs, String outputCollectionName)_

_at Microsoft.EnterpriseManagement.UI.DataModel.QueryQueue.StartExecuteQuery(Object sender, ConsoleJobEventArgs e)_

_at Microsoft.EnterpriseManagement.ServiceManager.UI.Console.ConsoleJobExceptionHandler.ExecuteJob(IComponent component, EventHandler\`1 job, Object sender, ConsoleJobEventArgs args)_

A user part of Incident Resolvers group was not able to save particular custom filed in work item in SCSM console.

What I’ve found [here](http://social.technet.microsoft.com/Forums/systemcenter/en-US/84021598-c1da-4918-8e1a-5fd86dc362a4/insufficient-privilege-on-custom-user-picker) and [here](http://support.microsoft.com/kb/2525307) that is some kind of bug since 2010 version of SCSM. There is way to fix it but keep in mind that the steps ARE NOT SUPPORTED BY MICROSOFT. The described steps are not new but I wanted to summarize them.

**The case**

You have some custom fields added on work items (incident, change and etc.) forms in Service Manager. Users that are part of a group with less privileges like Incident Resolvers cannot modify these fields in the form and receive the error above.

**Workaround**

There is a [hotfix](http://support.microsoft.com/kb/2525307) for 2010 version but that will not work for 2012. The hotfix contains SQL script that adds some stored procedures in your Service Manager DB. Luckily you do not even have to download the hotfix to find that SQL script as it is extracted by [Roman Stadlmair](http://social.technet.microsoft.com/profile/roman%20stadlmair/?ws=usercard-mini) and available [here](http://social.technet.microsoft.com/Forums/systemcenter/en-US/401c8083-cd4d-4a74-b300-74f18caaa6a3/kb-2525307-for-2012?forum=systemcenterservicemanager). And here arte he steps you can follow:

1.  Copy the script and execute it against your Service Manager DB.
2.  The script will add two stored procedure that you can use – p\_AddRestrictrictionToOperationInProfile and dbo.p\_RemoveRestrictrictionFromOperationInProfile. [Here](http://support.microsoft.com/kb/2525307) you can find syntax of the stored procedures.

3.  In my case I’ve executed the following query against Service Manager DB:

_exec p\_AddRestrictrictionToOperationInProfile ‘IncidentResolver’, ‘Object\_\_Set’, ‘@TypeName’, NULL, ‘@RelationshipTypeName’, NULL_

where @TypeName is the configuration class that I’ve wanted to add to custom field in incident form and @RelationshipTypeName is the relationship class that I’ve used for the user picker control field.

After executing this command Incident Resolvers were able to add information for this field in incident forms. Problem solved.

**Note: The steps are not supported by Microsoft and always contact Microsoft support if possible. Also first test in development environment before executing them in production.**
