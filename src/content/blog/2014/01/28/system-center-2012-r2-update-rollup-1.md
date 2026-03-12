---
title: "System Center 2012 R2 Update Rollup 1"
excerpt: "The first update rollup for System Center 2012 R2 is here."
description: "The first update rollup for System Center 2012 R2 is here."
pubDate: 2014-01-28
updatedDate: 2015-09-20
heroImage: "/media/wordpress/2019/09/cropped-azure-3.png"
sourceUrl: "https://cloudadministrator.net/2014/01/28/system-center-2012-r2-update-rollup-1/"
tags: 
  - "SCDPM"
  - "SCOM"
  - "SCSPF"
  - "SCVMM"
  - "SPF"
  - "System Center 2012 R2"
  - "System Center Data Protection Manager"
  - "System Center Operations Manager"
  - "System Center Service Provider Foundation"
  - "System Center Virtual Machine Manager"
  - "Update Rollup 1"
  - "Download"
  - "Management Packs"
  - "Microsoft"
  - "Software"
  - "System Center"
  - "Update"
  - "UR1"
---
The first update rollup for System Center 2012 R2 is here.

[Description of Update Rollup 1 for System Center 2012 R2](http://support.microsoft.com/kb/2904734/en-us)

**SCOM and SCVMM Updates require running some scripts against the databases. Be sure to read carefully the instructions and run those scripts**. There is [instruction video for installing UR1 to VMM 2012 R2](https://www.youtube.com/watch?v=E6FZiTAdEGg).

[Update Rollup 1 for System Center 2012 R2 Virtual Machine Manager](http://support.microsoft.com/kb/2904712)

-   System Center 2012 R2 Virtual Machine Manager cannot deploy a new or imported VMWare template.
-   A virtual machine with that uses VHDX cannot be refreshed correctly in System Center 2012 R2 Virtual Machine Manager, and you receive the following error message:Refresh job failed with error 2912: The requested operation cannot be performed on the virtual disk as it is currently used in shared mode (0xC05CFF0A)
-   Database operations sometimes fail with “FailedToAcquireLockException.”
-   A new virtual machine template from a template that specifies an operating system profile doesn’t use credentials from the operating system profile.
-   Virtual machines in VMWare that connect by the using Cisco N1000V dvSwitch are unavailable for management from Virtual Machine Manager.
-   System Center Virtual Machine Manager service crashes if you disable one of the teamed network adapters.
-   The **Get-Scstoragearray -host** command should return storage arrays that are visible to a host that is using zoning.
-   During the discovery of a network-attached storage (NAS) provider, the credentials that are used do not include a domain name.
-   Some localized strings are not displayed correctly in the UI.
-   A query to find the certificate should match both the subject name and the friendly name because **FindBySubjectName** is a wildcard search.
-   Template deployment fails, and you receive the following error message:Error (2904)
    VMM could not find the specified path on the <Server name\> server.
    The system cannot find the path specified (0x80070003)
-   Virtual Hard Disk (VHD) cannot be mounted on a host because VHD conflicts with other disks because of a stale entry that was left in the dictionary of Virtual Machine Manager memory.
-   Differencing disk based deployment may fail because the parent disk is being refreshed as noncached.

[System Center 2012 R2 Operations Manager Update Rollup 1](http://support.microsoft.com/kb/2904678/en-us)

###### Operations Manager

**Issue 1**
An error occurs when you run the **p\_DataPurging** stored procedure. This error occurs when the query processor runs out of internal resources and cannot produce a query plan.
**Issue 2**
Data warehouse **BULK INSERT** commands use an unchangeable, default 30-second time-out value that may cause query time-outs.
**Issue 3**
Many 26319 errors are generated when you use the Operator role. This issue causes performance problems.
**Issue 4**
The diagram component does not publish location information in the component state.
**Issue 5**
Renaming a group works correctly on the console. However, the old name of the group appears when you try to override a monitor or scope a view based on group.
**Issue 6**
SCOM synchronization is not supported in the localized versions of Team Foundation Server.
**Issue 7**
An SDK process deadlock causes the Exchange correlation engine to fail.
**Issue 8**
The “Microsoft System Center Advisor monitoring server” reserved group is visible in a computer or group search.
**Issue 9**
Multiple Advisor Connector are discovered for the same physical computer when the computer hosts a cluster.
**Issue 10**
A Dashboard exception occurs if the criteria that are used for a query include an invalid character or keyword.

###### [Operations Manager – UNIX and Linux Monitoring (Management Pack Update)](http://www.microsoft.com/en-us/download/details.aspx?id=29696)

**Issue 1
**
On a Solaris-based computer, an error message that resembles the following is logged in the Operations Manager log. This issue occurs if a Solaris-based computer that has many monitored resources runs out of file descriptors and does not monitor the resources. Monitored resources may include file systems, physical disks, and network adapters.
**Note** The Operations Manager log is located at /var/opt/microsoft/scx/log/scx.log.

errno = 24 (Too many open files)

This issue occurs because the default user limit on Solaris is too low to allocate a sufficient number of file descriptors. After the rollup update is installed, the updated agent overrides the default user limit by using a user limit for the agent process of 1,024.
**Issue 2**
If Linux Container (cgroup) entries in the /etc/mtab path on a monitored Linux-based computer begin with the “cgroup” string, a warning that resembles the following is logged in the agent log.
**Note** When this issue occurs, some physical disks may not be discovered as expected.

Warning \[scx.core.common.pal.system.disk.diskdepend:418:29352:139684846989056\] Did not find key ‘cgroup’ in proc\_disk\_stats map, device name was ‘cgroup’.

**Issue 3**
Physical disk configurations that cannot be monitored, or failures in physical disk monitoring, cause failures in system monitoring on UNIX and Linux computers. When this issue occurs, logical disk instances are not discovered by Operations Manager for a monitored UNIX-based or Linux-based computer.
**Issue 4
**A monitored Solaris zone that is configured to use dynamic CPU allocation with dynamic resource pools may log errors in the agent logs as CPUs are removed from the zone and do not identify the CPUs currently in the system. In rare cases, the agent on a Solaris zone with dynamic CPU allocation may hang during routine monitoring.
**Note** This issue applies to any monitored Solaris zones that are configured to use dynamic resource pools and a “dedicated-cpu” configuration that involves a range of CPUs.
**Issue 5**
An error that resembles the following is generated on Solaris 9-based computers when the /opt/microsoft/scx/bin/tools/setup.sh script does not set the library pathcorrectly. When this issue occurs, the omicli tool cannot run.

ld.so.1: omicli: fatal: libssl.so.0.9.7: open failed: No such file or directory

**Issue 6**
If the agent does not retrieve process arguments from the getargs subroutine on an AIX-based computer, the monitored daemons may be reported incorrectly as offline. An error message that resembles the following is logged in the agent log:

Calling getargs() returned an error

**Issue 7**
The agent on AIX-based computers considers all file cache to be available memory and does not treat minperm cache as used memory. After this update rollup is installed, available memory on AIX-based computer is calculated as: free memory + (cache – minperm).
**Issue 8**
The Universal Linux agent is not installed on Linux computers that have OpenSSL versions greater than 1.0.0 if the library file libssl.so.1.0.0 does not exist. An error message that resembles the following is logged:

/opt/microsoft/scx/bin/tools/.scxsslconfig: error while loading shared libraries: libssl.so.1.0.0: cannot open shared object file: No such file or directory

[System Center 2012 R2 Data Protection Manager Update Rollup 1](http://support.microsoft.com/kb/2904687/en-us)

**Issue 1**
A 0x80070057 error occurs when a session is closed prematurely. This error is caused by a failure during a consistency check.
**Issue 2**
Lots of concurrent threads or calls to Microsoft SQL Server from the Data Protection Manager (DPM) console cause slow SQL Server performance. When this issue occurs, the DPM console runs out of connections to SQL Server and may hang or crash.
**Issue 3**
The DPM console crashes, and an error that resembles the following is logged:

Paths that begin with \\?\\GlobalRoot are internal to the kernel and should not be opened by managed applications.

**SPF update is expected in mid February.**
