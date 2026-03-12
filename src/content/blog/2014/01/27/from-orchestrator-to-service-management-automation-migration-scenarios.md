---
title: "From Orchestrator to Service Management Automation: Migration Scenarios"
excerpt: "Service Management Automation (SMA) is the next gen IT Automation tool. SMA has some certain advantage over Orchestrator but also some limitations and vise versa. Nevertheless I am taking in consid…"
description: "Service Management Automation (SMA) is the next gen IT Automation tool. SMA has some certain advantage over Orchestrator but also some limitations and vise v..."
pubDate: 2014-01-27
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2014/01/27/from-orchestrator-to-service-management-automation-migration-scenarios/"
tags: 
  - "Migration"
  - "Runbook"
  - "Runbooks"
  - "SCO"
  - "SCSMA"
  - "SMA"
  - "System Center"
  - "System Center 2012 R2"
  - "System Center Orchestrator"
  - "Microsoft"
  - "Service Management Automation"
  - "Software"
  - "System Center Service Management Automation"
---
Service Management Automation (SMA) is the next gen IT Automation tool. SMA has some certain advantage over Orchestrator but also some limitations and vise versa. Nevertheless I am taking in consideration that you are aware of these advantages and limitations and you’ve decided to move fully or partially from SCO to SMA.

Before choosing any migration scenario it is good idea to create the connections, credentials, variables and schedules that you have in Orchestrator in SMA. Also import any PowerShell modules that you might need. That will be easier to execute any of the migration scenarios below.

These scenarios mostly apply if you have some portal like SharePoint or Service Manager Self-Service in front of Orchestrator and you’ve probably figured out what could be the possible migration scenarios from Orchestrator to SMA but let’s have a look at them:

-   Create runbook in SMA for every runbook you have in Orchestrator in a way that you will be able to call Orchestrator runbooks from SMA runbooks. Any new runbook develop in SMA. Switch your front end portal to call SMA web service instead of Orchestrator web service. Slowly make you Orchestrator runbooks SMA native runbooks.
-   Took one Orchestrator runbook, convert it to SMA runbook. Make the Orchestrator runbook just to call the SMA runbook. Repeat the process for every other Orchestrator runbook you have. Every new runbook develop in SMA. ON your front end portal switch from Orchestrator web service to SMA web service.
-   Develop any new runbooks in SMA. Wait for your Orchestrator runbooks to obsolete or migrate them in a future time. You can call the two web services (SCO or SMA) separately but I would recommend if possible to only use one web service.
-   Stop any new runbook development. Convert your Orchestrator runbooks to SMA runbooks. Test your SMA runbooks. Switch from Orchestrator to SMA on your front end portal. Develop new runbooks in SMA.

Keep in mind that the proposed scenarios are general and depending on your environment and runbooks the advantages and disadvantages of them will be different. What I recommend is to always keep only one web service that will be calling runbooks for front end portal. Also you may not be able to migrate all of your runbooks from Orchestrator to SMA as Orchestrator still makes a lot more sense in certain situations that SMA might not be able to cover well. If you are just starting with SMA I recommend to have a look at [Service Management Automation Whitepaper](http://gallery.technet.microsoft.com/Service-Management-fcd75828) by [Michael Rüefli](http://www.miru.ch/).
