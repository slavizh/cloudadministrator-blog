---
title: "Mitigate speculative execution side-channel vulnerabilities"
excerpt: "Seems the new year bring us some bad surprises in terms of security. There has been some rumors and now turned out to be truth that certain processors are vulnerable to certain attacks. Yes process…"
description: "Seems the new year bring us some bad surprises in terms of security. There has been some rumors and now turned out to be truth that certain processors are vu..."
pubDate: 2018-01-04
updatedDate: 2018-01-06
heroImage: "/media/wordpress/2018/01/wlemoticon-smile.png"
sourceUrl: "https://cloudadministrator.net/2018/01/04/mitigate-speculative-execution-side-channel-vulnerabilities/"
tags: 
  - "Adv180002"
  - "AMD"
  - "ARM"
  - "ASC"
  - "Azure"
  - "Azure Automation"
  - "Azure Security Center"
  - "CVE 2017 5715"
  - "CVE 2017 5753"
  - "CVE 2017 5754"
  - "Intel"
  - "Linux"
  - "Log Analytics"
  - "Microsoft Operations Management Suite"
  - "MSOMS"
  - "OMS"
  - "Operations Management Suite"
  - "Security"
  - "Security Compliance"
  - "Update Management"
  - "Automation"
  - "Automation & Control"
  - "Hybrid Security"
  - "Insight & Analytics"
  - "Microsoft"
  - "Operational Insights"
  - "Security & Compliance"
  - "Windows"
---
Seems the new year bring us some bad surprises in terms of security. There has been some rumors and now turned out to be truth that certain processors are vulnerable to certain attacks. Yes processors. That means that affects a wide variety of Operating Systems. As Microsoft puts it:

_Microsoft is aware of a new publicly disclosed class of vulnerabilities referred to as “speculative execution side-channel attacks” that affect many modern processors and operating systems including Intel, AMD, and ARM. Note: this issue will affect other systems such as Android, Chrome, iOS, MacOS, so we advise customers to seek out guidance from those vendors._

Source: [ADV180002 | Guidance to mitigate speculative execution side-channel vulnerabilities](https://portal.msrc.microsoft.com/en-US/security-guidance/advisory/ADV180002)

I cannot explain into details about how these vulnerabilities work but if you want to read Google has it on [Reading privileged memory with a side-channel](https://googleprojectzero.blogspot.bg/2018/01/reading-privileged-memory-with-side.html?m=1) .

With this post I want to lay out some advises on how to protect from these vulnerabilities or future ones with Azure:

1.  The first think you have to do is to patch your servers no matter if they are Linux or Windows. Azure has solution that will help you patch your servers. Update Management solution is part of Azure Automation service under the OMS umbrella. It patches both Linux and Windows and it will tell you which systems are not patched yet. The best of this solution that is free for Azure and non-Azure VMs and you only pay for the data stored in Log Analytics which is neglectable for the features you get. You can find more information here: [https://docs.microsoft.com/en-us/azure/operations-management-suite/oms-solution-update-management](https://docs.microsoft.com/en-us/azure/operations-management-suite/oms-solution-update-management "https://docs.microsoft.com/en-us/azure/operations-management-suite/oms-solution-update-management")
2.  Detect malicious behaviors on your servers with Azure Security Center. ASC brings the big guns in terms of security detection, protection and response. It has rich behavioral analytics that will detect malicious behaviors happening on your machines. Currently those behavioral analytics work only on Windows machines but we can expect that Linux machines will be covered in the future as well. After all Microsoft loves Linux. You can read more for those detections here: [https://docs.microsoft.com/en-us/azure/security-center/security-center-detection-capabilities](https://docs.microsoft.com/en-us/azure/security-center/security-center-detection-capabilities "https://docs.microsoft.com/en-us/azure/security-center/security-center-detection-capabilities")

3.  Prevention. ASC also has another feature Adaptive Application Controls that will help you protect your environment from vulnerabilities like these. As these vulnerabilities relay on executing software on your servers what better for protection than allowing only approved software to run on your servers. This is what Adaptive Application Controls does. It learns what software is being ran on your servers and creates policies to allow only that software to run, any other will be blocked from execution. Pretty smart. Currently it works only for Windows but we know Microsoft love Linux ![Smile](/media/wordpress/2018/01/wlemoticon-smile.png) . You can read more about this feature here: [https://docs.microsoft.com/en-us/azure/security-center/security-center-adaptive-application](https://docs.microsoft.com/en-us/azure/security-center/security-center-adaptive-application "https://docs.microsoft.com/en-us/azure/security-center/security-center-adaptive-application")

Hope that those advises will help you protect your environment not only from these vulnerabilities but from others as well.

Note: The vulnerabilities can affect VMs as well. Source: [Windows Server guidance to protect against speculative execution side-channel vulnerabilities](https://support.microsoft.com/en-us/help/4072698/windows-server-guidance-to-protect-against-the-speculative-execution).
