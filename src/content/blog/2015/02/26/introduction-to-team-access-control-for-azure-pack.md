---
title: "Introduction to Team Access Control for Azure Pack"
excerpt: "Team Access Control is a new third-party Resource Provider for Azure Pack. Along with UR5 for Azure Pack this resource provider is now available trough the Web Platform Installer. This blogs aims a…"
description: "Team Access Control is a new third-party Resource Provider for Azure Pack. Along with UR5 for Azure Pack this resource provider is now available trough the W..."
pubDate: 2015-02-25
updatedDate: 2018-06-11
heroImage: "/media/2015/02/image9.png"
sourceUrl: "https://cloudadministrator.net/2015/02/26/introduction-to-team-access-control-for-azure-pack/"
tags: 
  - "Azure Pack"
  - "RBAC"
  - "Resource Provider"
  - "Role Based Access Control"
  - "RP"
  - "SCVMM"
  - "System Center 2012 R2"
  - "System Center Virtual Machine Manager"
  - "TAC"
  - "Team Access Control"
  - "Terawe"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "Windows Azure Pack"
  - "Windows Azure Pack"
---
[Team Access Control](http://www.terawe.com/tac4wapack) is a new third-party Resource Provider for Azure Pack. Along with UR5 for Azure Pack this resource provider is now available trough the [Web Platform Installer](http://www.microsoft.com/web/downloads/platform.aspx).

This blogs aims at giving you initial look at the installation and configuration of this Resource Provider and what it offers. The Resource Provider is a paid solution and this blog post does not aim at marketing and selling it.

So let’s get started. As I’ve said it is available at Web Platform installer and after you install Web PI you can easily get the setup with simple commands. Web PI has command line tool with which we can get all solutions available for install/download:

webpicmd.exe /list /listOption:all

[![image](/media/2015/02/image9.png "image")](/media/2015/02/image9.png)

Searching trough the list we find the RP and we can download the setup with simple command:

webpicmd.exe /offline /Products:TAC\_WAP\_Extensions /Path:D:\\WAP

[![image](/media/2015/02/image10.png "image")](/media/2015/02/image10.png)

When the command finishes we have the setup itself:

[![image](/media/2015/02/image11.png "image")](/media/2015/02/image11.png)

We can copy that setup to our WAP server and install it. In my example I have one WAP server with all web sites/roles install on it so I will install all web sites / roles of TAC RP on the WAP server. The RP itself support installing the different web sites on different servers so you can have more distributed and production deployment. There is a guide with instructions which I will reference later.

So let’s start the setup on our WAP server:

[![image](/media/2015/02/image12.png "image")](/media/2015/02/image12.png)

[![image](/media/2015/02/image13.png "image")](/media/2015/02/image13.png)

I select all roles for install:

[![image](/media/2015/02/image14.png "image")](/media/2015/02/image14.png)

[![image](/media/2015/02/image15.png "image")](/media/2015/02/image15.png)

[![image](/media/2015/02/image16.png "image")](/media/2015/02/image16.png)

[![image](/media/2015/02/image17.png "image")](/media/2015/02/image17.png)

[![image](/media/2015/02/image18.png "image")](/media/2015/02/image18.png)

When the installation finishes we can logon to the Azure Pack Admin Portal and check the RP:

[![image](/media/2015/02/image19.png "image")](/media/2015/02/image19.png)

There on the first page you will find instructions how to configure it like very other RP.

First step will open a link to a PDF guide. There you will find information on how to do the configuration in different scenarios. I will do the configuration myself and will let you know for any caveats you may stumble upon.

The configuration is simple and basically consists of one command that you will need to execute. The command will change the configuration of the web service for TAC RP and connect the web service to your SQL server that you use for WAP databases. TAC RP has a database on its own that you will need to host. As the DB is not resource intensive you can safely located along with WAP databases. To execute that configuration command you will need to generate random passwords and encryption key. To ease this TAC RP has a command that you can execute and that command will generate such keys for you that you can later store on safe location.

You need to start PowerShell in admin mode on the WAP server where TAC RP is installed and navigate to the TAC RP installation folder. Than you can execute the following command:

.\\TACConfig.exe –action:genkeys

[![image](/media/2015/02/image20.png "image")](/media/2015/02/image20.png)

The keys are generated along with the actual parameters that are needed for the configuration command. Keep in mind that the encryption key ends right before PS C:\\Program Files\\Terawe\\TAC4WAPack\\bin>

Now that we have those passwords we can execute the configuration command. Keep in mind that when you are copying such commands directly some symbols like – may not be copied correctly so it is good always to check them in Notepad.

.\\TACConfig.exe -action:install -path:C:\\inetpub\\TAC4WAPack\\Web.Config -apiusername:TACApiClient -tenantpublicapiurl:[https://WAPServer.contoso.com:30006/](https://wapserver.contoso.com:30006/) -sqlserver:WAPSQL.contoso.com -dbuserpwd:RpOJ9IwAUJhnk1QA/0CnlvDahIaG7UF8eOZ9rJDhPpw= -ap
iuserpwd:BM4z/WebcsJ5YSmHdlkxgavGx3T3h9xjrI9AeGiSWUE= -encryptkey:Hho+lGf8YviXS0+saxlOsEsqT+OUGX2lgda+liB88do=

[![image](/media/2015/02/image21.png "image")](/media/2015/02/image21.png)

So your –action says install. Parameter –Path is the location of the web config file for TAC RP. Parameter –apiusername can be any user you want to be created. Parameter –tenantpublicapiurl is the Tenant Public IP URL. Parameter –sqlserver is the SQL server where you want to put the DB for TAC RP. The last three parameters you can copy directly from the command that generated them.

After you run the command you should see successful message.

You can now again open Azure Pack Admin portal. In TAC RP you now can register the TAC API.

[![image](/media/2015/02/image22.png "image")](/media/2015/02/image22.png)

For REST API Endpoint you point where TAC RP was installed. In our case the WAP server. User Name and password are  the same ones you’ve used in the configuration command.

You will see successful message when registration is successful:

[![image](/media/2015/02/image23.png "image")](/media/2015/02/image23.png)

After that you can start using Team Access Control Resource Provider. Let’s see simple example on how you can use it.

The goal of TAC RP is to have two groups of users. First group is Managers who have full subscription rights for VM Clouds Resource provider. Second group is members who can have less or equal access to Virtual Machines and VM Clouds Resources. And Managers can delegate access and resources to members for VM Clouds Resource Provider. Simply put Team Access Control achieves Role Based access for VM Clouds Resource Provider.

Let’s first start by creating a hosting plan for Managers group.

[![image](/media/2015/02/image24.png "image")](/media/2015/02/image24.png)

This hosting plan needs to have resources from VM Clouds and Team Manager.

[![image](/media/2015/02/image25.png "image")](/media/2015/02/image25.png)

[![image](/media/2015/02/image26.png "image")](/media/2015/02/image26.png)

Once plan is created let’s go and configure VM Clouds for that plan. There is nothing special in configuring VM clouds for it. Just use the configurations you usually do.

[![image](/media/2015/02/image27.png "image")](/media/2015/02/image27.png)

Next you need to configure Team Manager for that plan. Let’s say we will have maximum 10 teams for this plan and save it:

[![image](/media/2015/02/image28.png "image")](/media/2015/02/image28.png)

Now let’s create another plan for Members:

[![image](/media/2015/02/image29.png "image")](/media/2015/02/image29.png)

This hosting plan will be attached only to Team Member service:

[![image](/media/2015/02/image30.png "image")](/media/2015/02/image30.png)

[![image](/media/2015/02/image31.png "image")](/media/2015/02/image31.png)

This plan does not need any configuration.

Next we can make both plans public:

[![image](/media/2015/02/image32.png "image")](/media/2015/02/image32.png)

Now we need to create a user and subscription and assign it to the Managers plan:

[![image](/media/2015/02/image33.png "image")](/media/2015/02/image33.png)

Let’s also create user and subscription and assign it to Members plan:

[![image](/media/2015/02/image34.png "image")](/media/2015/02/image34.png)

If you go to VMM you will see that User role is created only for manager user as that user/subscription is only assigned to VM Clouds:

[![image](/media/2015/02/image35.png "image")](/media/2015/02/image35.png)

Now let’s login to Azure Pack Tenant portal with manager user:

[![image](/media/2015/02/image36.png "image")](/media/2015/02/image36.png)

Once we are logged on first thing we need to do it open
“https:// WAPserver.contoso.com:Port/publishsettings”
. When you open it browser will ask you to save a file. Save it.

[![image](/media/2015/02/image37.png "image")](/media/2015/02/image37.png)

When you download that file you go again to Tenant portal –> Team Manager –> Management Certificates –> Upload

[![image](/media/2015/02/image38.png "image")](/media/2015/02/image38.png)

You need to upload that same file.

This configuration is important as it will enable members to be able to do actions.

Our next step as manager is to create a team.

[![image](/media/2015/02/image39.png "image")](/media/2015/02/image39.png)

[![image](/media/2015/02/image40.png "image")](/media/2015/02/image40.png)

Once we have team we can assign quota to that team in  the form of cores and memory:

[![image](/media/2015/02/image41.png "image")](/media/2015/02/image41.png)

After creating this team we can dive deep into that team by clicking on it. There we have option to add members to that team.

[![image](/media/2015/02/image42.png "image")](/media/2015/02/image42.png)

Once we add that member to that team we can also specify quota for that specific member:

[![image](/media/2015/02/image43.png "image")](/media/2015/02/image43.png)

[![image](/media/2015/02/image44.png "image")](/media/2015/02/image44.png)

The cool part is that on the Subscription of the Manager you can see how many members and teams you have:

[![image](/media/2015/02/image45.png "image")](/media/2015/02/image45.png)

Now let’s login as member and see what we have available:

[![image](/media/2015/02/image46.png "image")](/media/2015/02/image46.png)

As you can see we have only one Resource provider and that is Team Member:

[![image](/media/2015/02/image47.png "image")](/media/2015/02/image47.png)

Under there we can see our assigned quota:

[![image](/media/2015/02/image48.png "image")](/media/2015/02/image48.png)

On Virtual Machines you will see the virtual machines you have access to.

[![image](/media/2015/02/image49.png "image")](/media/2015/02/image49.png)

Of course to have that you will need to create VMs:

[![image](/media/2015/02/image50.png "image")](/media/2015/02/image50.png)

[![image](/media/2015/02/image51.png "image")](/media/2015/02/image51.png)

In VMM the VM is created on behalf of the Manager subscription:

[![image](/media/2015/02/image52.png "image")](/media/2015/02/image52.png)

Team Managers can also see it:

[![image](/media/2015/02/image53.png "image")](/media/2015/02/image53.png)

You can be more granular on permissions for VMs by creating a role:

[![image](/media/2015/02/image54.png "image")](/media/2015/02/image54.png)

Than you can add members to that role:

[![image](/media/2015/02/image55.png "image")](/media/2015/02/image55.png)

And assign permissions to that role for a VM:

[![image](/media/2015/02/image56.png "image")](/media/2015/02/image56.png)

So you can have only certain set of VM permissions for those members:

[![image](/media/2015/02/image57.png "image")](/media/2015/02/image57.png)

There is good to know of some limitation for members:

-   Members cannot deploy Gallery Items
-   Members cannot connect to Remote Console

Hope this introduction was useful for you.
