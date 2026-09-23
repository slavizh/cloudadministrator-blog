---
title: "Bicep Testing Framework PoC with Pester"
excerpt: "A practical proof of concept showing how to use the experimental Bicep testing framework with Pester to validate Azure Monitor log alert resources and automate assertions in CI/CD pipelines."
description: "Learn how to use the experimental Bicep testing framework together with Pester to generate resource snapshots, assert expected properties, and automate Azure Bicep validation in a pipeline."
pubDate: 2026-09-23
updatedDate: 2026-09-23
heroImage: "/media/bicep-testing-framework-poc-pester/bicep-testing-framework-poc-pester-hero.png"
sourceUrl: "https://cloudadministrator.net/bicep-testing-framework-poc-pester/"
tags:
  - "Azure"
  - "Azure Bicep"
  - "Bicep"
  - "Infrastructure as Code"
  - "IaC"
  - "DevOps"
  - "Pester"
  - "PowerShell"
  - "Bicep Testing"
  - "Bicep Snapshots"
  - "Azure Monitor"
  - "Log Alerts"
---
Several months ago, I wrote "[Azure Bicep Snapshots – Test and Validate Your Code and Deployments](https://cloudadministrator.net/2026/02/18/azure-bicep-snapshots-test-and-validate-your-code-and-deployments/)". That post introduced Bicep snapshots as a way to test Bicep template code. It remains relevant, but it was missing one crucial piece: the ability to automate the testing process and make the results visible in a pipeline job.

Last month, [Anthony Martin](https://github.com/anthony-c-martin) from the Azure deployments team released [an experimental testing framework for Node, C#, Go, PowerShell, and Python](https://anthony-c-martin.github.io/bicep-testing/). He also demoed it during the [last Bicep community call](https://youtu.be/3OUb4VBsw1g?t=903). The files for that demo are available on [GitHub](https://github.com/anthony-c-martin/bicep-testing-demo). Needless to say, I was intrigued by this feature, so I wanted to try it and write about it to help raise awareness.

The framework is based on the [Bicep snapshot functionality](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli?tabs=bicep-cli#snapshot), so you can reuse existing snapshots if you already have them. As far as I understand, it also uses the [JSON-RPC interface](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli?tabs=bicep-cli#jsonrpc) to generate a snapshot from a Bicep parameters file. This keeps the process lightweight, because you do not need to call the Bicep CLI every time you want to generate a snapshot. Instead, it creates a session and lets you generate snapshots for multiple Bicep parameters files within that session. The snapshots are kept in memory, so you do not get extra JSON files during testing, and your existing snapshots are not overwritten.

The way I decided to test this was to take the [Log Alerts snapshots example](https://github.com/slavizh/BicepTemplates/tree/main/log-alert-snapshots) from the earlier post, "[Azure Bicep Snapshots – Test and Validate Your Code and Deployments](https://cloudadministrator.net/2026/02/18/azure-bicep-snapshots-test-and-validate-your-code-and-deployments/)". In other words, this is a natural continuation of that example. To keep things simple, I added the [Demo.Common.ps1 helper file Anthony uses in his demo](https://github.com/anthony-c-martin/bicep-testing-demo/blob/main/demo/Demo.Common.ps1). It makes it easier to process the data coming from the generated snapshot.

**Demo.Common.ps1**

```powershell
# Shared demo helpers. Dot-source from a Pester BeforeAll block.
# Generic and reusable as-is across any Bicep template's test suite.

$DemoInfraPath = $PSScriptRoot
$DemoBicepVersion = '0.47.16'
$DemoModuleVersion = '0.1.6'

Import-Module AnthonyCMartin.BicepTesting -RequiredVersion $DemoModuleVersion -Force

function New-DemoSession {
    New-BicepTestSession -BicepVersion $DemoBicepVersion
}

function Get-DemoSnapshot {
    param(
        [Parameter(Mandatory)] $Session,
        [Parameter(Mandatory)] [string] $RelativePath
    )

    # Tenant, subscription, resource group, and location are evaluation context only.
    # They do not need to exist and no Azure credentials are used.
    $Session | Get-BicepSnapshot `
        -Path (Join-Path $DemoInfraPath $RelativePath) `
        -TenantId 'ddbe463a-0554-485d-b589-0b17d60cd38b' `
        -SubscriptionId '00000000-0000-0000-0000-000000000000' `
        -Location 'westeurope' `
        -DeploymentName 'lz-defender-plans'
}

function Get-DemoResourcesByType {
    param(
        [Parameter(Mandatory)] $Snapshot,
        [Parameter(Mandatory)] [string] $Type
    )

    $Snapshot.PredictedResources | Where-Object Type -eq $Type
}

function Get-DemoResourceMap {
    param([Parameter(Mandatory)] $Snapshot)

    $map = @{}
    $Snapshot.PredictedResources | ForEach-Object { $map[$_.Name] = $_ }
    $map
}
```

Next I generated Bicep tests file that covers all parts of the code for the Log Alerts bicep template. The test file uses the bicep parameters file used to generated the snapshots. Note that I have also updated the bicep parameters file to include more parts of the code.

**parameters.Tests.ps1**

```powershell
BeforeAll {
    . (Join-Path $PSScriptRoot 'Demo.Common.ps1')

    $script:session = New-DemoSession

    function Get-TestSnapshot {
        param([Parameter(Mandatory)] [string] $RelativePath)

        Get-DemoSnapshot -Session $script:session -RelativePath $RelativePath
    }

    function Get-TestResource {
        param(
            [Parameter(Mandatory)] $Snapshot,
            [Parameter(Mandatory)] [string] $Name,
            [string] $Type = 'Microsoft.Insights/scheduledQueryRules'
        )

        $resources = $Snapshot.PredictedResources | Where-Object { $_.Name -eq $Name -and $_.Type -eq $Type }
        $resources | Should -HaveCount 1
        $resources | Select-Object -First 1
    }

    function Get-TestResourceProperties {
        param(
            [Parameter(Mandatory)] $Snapshot,
            [Parameter(Mandatory)] [string] $Name,
            [string] $Type = 'Microsoft.Insights/scheduledQueryRules'
        )

        $resource = Get-TestResource -Snapshot $Snapshot -Name $Name -Type $Type
        $resource.Properties.ToString() | ConvertFrom-Json
    }

    # Kind/identity are top-level ARM properties surfaced via AdditionalProperties (JsonElement-backed), not Resource members.
    function Get-TestResourceKind {
        param([Parameter(Mandatory)] $Resource)

        $Resource.AdditionalProperties['kind'].GetString()
    }

    function Get-TestResourceIdentity {
        param([Parameter(Mandatory)] $Resource)

        $Resource.AdditionalProperties['identity'].GetRawText() | ConvertFrom-Json
    }

    function Get-PropertyCount {
        param($InputObject)

        @($InputObject.PSObject.Properties).Count
    }

    $script:snapshot = Get-TestSnapshot -RelativePath '../parameters.bicepparam'
}

AfterAll {
    $script:session | Remove-BicepTestSession
}

Describe 'parameters.bicepparam' {
    It 'predicts one scheduled query rule per log alert and no diagnostics' {
        $snapshot.Diagnostics | Should -BeNullOrEmpty
        $snapshot.PredictedResources.Name | Sort-Object | Should -Be @(
            'logAlert001', 'logAlert002', 'logAlert003', 'logAlert004', 'logAlert005', 'logAlert006'
        )
    }

    It 'produces no outputs' {
        $snapshot.Outputs.Count | Should -Be 0
    }

    Context 'logAlert001 (LogAlertStaticThreshold)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert001'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert001'
        }

        It 'uses the LogAlert kind with no identity' {
            Get-TestResourceKind -Resource $resource | Should -Be 'LogAlert'
            $identity = Get-TestResourceIdentity -Resource $resource
            $identity.type | Should -Be 'None'
            $identity.userAssignedIdentities | Should -BeNullOrEmpty
        }

        It 'sets display name, severity, and default evaluation cadence' {
            $properties.displayName | Should -Be 'Log Alert 001'
            $properties.severity | Should -Be 3
            $properties.evaluationFrequency | Should -Be 'PT15M'
            $properties.windowSize | Should -Be 'PT15M'
            $properties.enabled | Should -BeTrue
            $properties.autoMitigate | Should -BeFalse
        }

        It 'scopes to the referenced Log Analytics workspace' {
            $properties.scopes | Should -Be @(
                '/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/kusto/providers/Microsoft.OperationalInsights/workspaces/workspace001'
            )
        }

        It 'builds a static threshold criterion' {
            $criterion = $properties.criteria.allOf[0]
            $criterion.criterionType | Should -Be 'StaticThresholdCriterion'
            $criterion.query | Should -Be 'Perf'
            $criterion.timeAggregation | Should -Be 'Average'
            $criterion.metricMeasureColumn | Should -Be 'CounterValue'
            $criterion.operator | Should -Be 'GreaterThan'
            $criterion.threshold | Should -Be '0.5'
            $criterion.alertSensitivity | Should -BeNullOrEmpty
            $criterion.resourceIdColumn | Should -BeNullOrEmpty
            $criterion.failingPeriods.minFailingPeriodsToAlert | Should -Be 1
            $criterion.failingPeriods.numberOfEvaluationPeriods | Should -Be 1
        }

        It 'sends no actions' {
            $properties.actions.actionGroups | Should -BeNullOrEmpty
            Get-PropertyCount $properties.actions.actionProperties | Should -Be 0
            Get-PropertyCount $properties.actions.customProperties | Should -Be 0
        }
    }

    Context 'logAlert002 (LogAlertDynamicThreshold)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert002'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert002'
        }

        It 'uses the LogAlert kind with no identity' {
            Get-TestResourceKind -Resource $resource | Should -Be 'LogAlert'
            (Get-TestResourceIdentity -Resource $resource).type | Should -Be 'None'
        }

        It 'sets display name and severity' {
            $properties.displayName | Should -Be 'Log Alert 002'
            $properties.severity | Should -Be 2
        }

        It 'scopes to the referenced resource group' {
            $properties.scopes | Should -Be @(
                '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/identities'
            )
        }

        It 'builds a dynamic threshold criterion with TableRows treated as no measure column' {
            $criterion = $properties.criteria.allOf[0]
            $criterion.criterionType | Should -Be 'DynamicThresholdCriterion'
            $criterion.query | Should -Be 'AzureActivity'
            $criterion.timeAggregation | Should -Be 'Count'
            $criterion.metricMeasureColumn | Should -BeNullOrEmpty
            $criterion.operator | Should -Be 'GreaterThan'
            $criterion.threshold | Should -BeNullOrEmpty
            $criterion.alertSensitivity | Should -Be 'Low'
        }

        It 'defaults the resource id column to _ResourceId for a resource group scope' {
            $properties.criteria.allOf[0].resourceIdColumn | Should -Be '_ResourceId'
        }
    }

    Context 'logAlert003 (SimpleLogSearchAlert)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert003'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert003'
        }

        It 'uses the SimpleLogAlert kind with the user-assigned identity' {
            Get-TestResourceKind -Resource $resource | Should -Be 'SimpleLogAlert'
            $identity = Get-TestResourceIdentity -Resource $resource
            $identity.type | Should -Be 'UserAssigned'
            $identity.userAssignedIdentities.PSObject.Properties.Name | Should -Be @(
                '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/identities/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1'
            )
        }

        It 'sets display name and severity' {
            $properties.displayName | Should -Be 'Log Alert 003'
            $properties.severity | Should -Be 4
        }

        It 'scopes to the referenced Log Analytics workspace' {
            $properties.scopes | Should -Be @(
                '/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/kusto/providers/Microsoft.OperationalInsights/workspaces/workspace001'
            )
        }

        It 'omits evaluation cadence and threshold fields for a simple log search alert' {
            $properties.evaluationFrequency | Should -BeNullOrEmpty
            $properties.windowSize | Should -BeNullOrEmpty

            $criterion = $properties.criteria.allOf[0]
            $criterion.criterionType | Should -BeNullOrEmpty
            $criterion.query | Should -Be 'AzureActivity'
            $criterion.timeAggregation | Should -BeNullOrEmpty
            $criterion.operator | Should -BeNullOrEmpty
            $criterion.threshold | Should -BeNullOrEmpty
            $criterion.failingPeriods | Should -BeNullOrEmpty
            $criterion.dimensions | Should -BeNullOrEmpty
        }

        It 'sets the minimum recurrence count' {
            $properties.criteria.allOf[0].minRecurrenceCount | Should -Be 5
        }
    }

    Context 'logAlert004 (ApplicationInsights scope, SystemAssigned identity, non-default options)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert004'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert004'
        }

        It 'uses the LogAlert kind with a system-assigned identity' {
            Get-TestResourceKind -Resource $resource | Should -Be 'LogAlert'
            $identity = Get-TestResourceIdentity -Resource $resource
            $identity.type | Should -Be 'SystemAssigned'
            $identity.userAssignedIdentities | Should -BeNullOrEmpty
        }

        It 'sets tags, description, enabled, and autoMitigate overrides' {
            $resource.AdditionalProperties['tags'].GetRawText() | ConvertFrom-Json | Select-Object -ExpandProperty environment | Should -Be 'test'
            $properties.description | Should -Be 'Test description'
            $properties.enabled | Should -BeFalse
            $properties.autoMitigate | Should -BeTrue
        }

        It 'scopes to the referenced Application Insights resource' {
            $properties.scopes | Should -Be @(
                '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/monitoring/providers/Microsoft.Insights/components/appinsights001'
            )
        }

        It 'converts non-default minute windows to hour and day ISO8601 durations' {
            $properties.evaluationFrequency | Should -Be 'PT2H'
            $properties.windowSize | Should -Be 'P2D'
            $properties.overrideQueryTimeRange | Should -Be 'PT6H'
            $properties.muteActionsDuration | Should -Be 'PT24H'
        }

        It 'honors an explicit resource id column and failing period overrides' {
            $criterion = $properties.criteria.allOf[0]
            $criterion.resourceIdColumn | Should -Be 'CustomResourceId'
            $criterion.failingPeriods.minFailingPeriodsToAlert | Should -Be 2
            $criterion.failingPeriods.numberOfEvaluationPeriods | Should -Be 3
            $criterion.dimensions | Should -HaveCount 1
            $criterion.dimensions[0].name | Should -Be 'Computer'
            $criterion.dimensions[0].operator | Should -Be 'Include'
            $criterion.dimensions[0].values | Should -Be @('*')
        }

        It 'enables storage configuration checks and skips query validation' {
            $properties.checkWorkspaceAlertsStorageConfigured | Should -BeTrue
            $properties.skipQueryValidation | Should -BeTrue
        }

        It 'maps every action group to its resource id and passes through action/custom properties' {
            $properties.actions.actionGroups | Should -Be @(
                '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/alerts/providers/Microsoft.Insights/actionGroups/ag1'
                '/subscriptions/22222222-2222-2222-2222-222222222222/resourceGroups/alerts/providers/Microsoft.Insights/actionGroups/ag2'
            )
            $properties.actions.actionProperties.foo | Should -Be 'bar'
            $properties.actions.customProperties.baz | Should -Be 'qux'
        }
    }

    Context 'logAlert005 (Subscription scope, ignoreDataBefore)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert005'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert005'
        }

        It 'scopes to the subscription' {
            $properties.scopes | Should -Be @('/subscriptions/33333333-3333-3333-3333-333333333333')
        }

        It 'defaults the resource id column to _ResourceId for a subscription scope' {
            $properties.criteria.allOf[0].resourceIdColumn | Should -Be '_ResourceId'
        }

        It 'passes through the configured ignoreDataBefore value' {
            # ConvertFrom-Json parses ISO-8601 strings into DateTime, so compare as UTC instants.
            ([DateTime] $properties.criteria.allOf[0].ignoreDataBefore).ToUniversalTime() | Should -Be ([DateTime]::Parse('2024-01-01T00:00:00Z').ToUniversalTime())
        }
    }

    Context 'logAlert006 (default subscription scope, identity with explicit subscription)' {
        BeforeAll {
            $script:properties = Get-TestResourceProperties -Snapshot $snapshot -Name 'logAlert006'
            $script:resource = Get-TestResource -Snapshot $snapshot -Name 'logAlert006'
        }

        It 'scopes to the workspace using the current subscription by default' {
            $properties.scopes | Should -Be @(
                '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/kusto/providers/Microsoft.OperationalInsights/workspaces/workspace001'
            )
        }

        It 'uses the identity subscription id when explicitly provided' {
            $identity = Get-TestResourceIdentity -Resource $resource
            $identity.userAssignedIdentities.PSObject.Properties.Name | Should -Be @(
                '/subscriptions/44444444-4444-4444-4444-444444444444/resourceGroups/identities/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1'
            )
        }

        It 'allows a zero minimum recurrence count' {
            $properties.criteria.allOf[0].minRecurrenceCount | Should -Be 0
        }
    }
}
```

As you can see it is standard Pester format used. The hardest part of this is to figure out which input corresponds to which property in the snapshot and what is the expected value. There are some helper PowerShell functions that I am using to get the exact properties on the resource generated. Note that you can use GitHub Copilot or other AI tool to automatically generate those tests. And the last PowerShell file I have is the one that runs the Pester tests:

**run-pester.ps1**

```powershell
#Requires -Version 7.6

<#
.SYNOPSIS
    Runs the Pester tests for the log-alert-snapshots Bicep templates.
#>
[CmdletBinding()]
param(
    [ValidateSet('None', 'Normal', 'Detailed', 'Diagnostic')]
    [string] $Output = 'Detailed'
)

$ErrorActionPreference = 'Stop'

# Windows Defender Controlled Folder Access blocks module writes under Documents\PowerShell\Modules,
# so resources are saved to a local, unprotected cache instead of the default CurrentUser scope.
$moduleCachePath = Join-Path $PSScriptRoot '.psmodules'
New-Item -ItemType Directory -Path $moduleCachePath -Force | Out-Null
if (($env:PSModulePath -split [System.IO.Path]::PathSeparator) -notcontains $moduleCachePath) {
    $env:PSModulePath = $moduleCachePath + [System.IO.Path]::PathSeparator + $env:PSModulePath
}

function Get-HighestInstalledVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name
    )

    $versions = Get-Module -ListAvailable -Name $Name |
        Select-Object -ExpandProperty Version -ErrorAction SilentlyContinue |
        Sort-Object -Descending

    if ($null -eq $versions -or $versions.Count -eq 0) {
        return $null
    }

    return [version] $versions[0]
}

$pesterVersion = Get-HighestInstalledVersion -Name 'Pester'

if ($null -ne $env:PESTER_MINIMUMVERSION -and $null -ne $env:PESTER_MAXIMUMVERSION) {
    $minVersion = [version] $env:PESTER_MINIMUMVERSION
    $maxVersion = [version] $env:PESTER_MAXIMUMVERSION

    if ($null -eq $pesterVersion -or $pesterVersion -lt $minVersion -or $pesterVersion -ge $maxVersion) {
        Save-PSResource `
            -Name 'Pester' `
            -Path $moduleCachePath `
            -Repository PSGallery `
            -TrustRepository `
            -Quiet `
            -Version "[$env:PESTER_MINIMUMVERSION,$env:PESTER_MAXIMUMVERSION)"
    }

    Import-Module `
        -Name 'Pester' `
        -MinimumVersion $env:PESTER_MINIMUMVERSION `
        -MaximumVersion $env:PESTER_MAXIMUMVERSION `
        -Force
}
elseif ($null -ne $env:PESTER_REQUIREDVERSION) {
    $requiredVersion = [version] $env:PESTER_REQUIREDVERSION

    if ($null -eq $pesterVersion -or $pesterVersion -ne $requiredVersion) {
        Save-PSResource `
            -Name 'Pester' `
            -Path $moduleCachePath `
            -Repository PSGallery `
            -TrustRepository `
            -Quiet `
            -Version $env:PESTER_REQUIREDVERSION
    }

    Import-Module `
        -Name 'Pester' `
        -RequiredVersion $env:PESTER_REQUIREDVERSION `
        -Force
}
else {
    if ($null -eq $pesterVersion -or $pesterVersion.Major -lt 5) {
        Save-PSResource `
            -Name 'Pester' `
            -Path $moduleCachePath `
            -Repository PSGallery `
            -TrustRepository `
            -Quiet
    }

    Import-Module -Name 'Pester' -MinimumVersion 5.0 -Force
}

if (-not (Get-Module -ListAvailable -Name 'AnthonyCMartin.BicepTesting')) {
    Save-PSResource `
        -Name 'AnthonyCMartin.BicepTesting' `
        -Path $moduleCachePath `
        -Repository PSGallery `
        -TrustRepository `
        -Quiet
}

$testsDirectory = Join-Path $PSScriptRoot 'tests'
$paths = @(
    Get-ChildItem `
        -LiteralPath $testsDirectory `
        -Filter '*.Tests.ps1' `
        -File |
        Select-Object -ExpandProperty FullName
)

if ($paths.Count -eq 0) {
    throw "No Pester test files were found under '$testsDirectory'."
}

$configuration = New-PesterConfiguration
$configuration.Run.Path = $paths
$configuration.Run.PassThru = $true
$configuration.Output.Verbosity = $Output

$configuration.TestResult.Enabled = $true
$configuration.TestResult.OutputFormat = 'NUnitXml'
$configuration.TestResult.OutputPath = Join-Path $PSScriptRoot 'TEST-Pester.xml'

$pesterResult = Invoke-Pester -Configuration $configuration
$pesterResult

if ($pesterResult.Result -ne 'Passed') {
    throw "Pester run failed. Result: $($pesterResult.Result); failed tests: $($pesterResult.FailedCount)."
}
```

When you run it locally, you will get results like these:

![Pester test results for Bicep locally](/media/bicep-testing-framework-poc-pester/pester-results-bicep.png)

You can also create a GitHub Action to execute the tests. In my case, the execution is manual:

**pester-tests.yml**

```yml
name: Pester tests

on:
  workflow_dispatch:

permissions:
  contents: read
  checks: write
  pull-requests: write

jobs:
  test:
    name: Run automated tests
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        # Add a new entry here for every Bicep template folder that ships a run-pester.ps1.
        directory:
          - log-alert-snapshots
    env:
      PESTER_MINIMUMVERSION: 6.0.1
      PESTER_MAXIMUMVERSION: 6.99.99
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Pester tests
        shell: pwsh
        working-directory: ${{ matrix.directory }}
        run: ./run-pester.ps1

      - name: Publish test results
        uses: EnricoMi/publish-unit-test-result-action@v2
        if: always()
        with:
          check_name: 'Pester results (${{ matrix.directory }})'
          files: '${{ matrix.directory }}/TEST-*.xml'
          fail_on: 'nothing'
```

Once the workflow runs, the test results are visible in the pipeline:

![Pester test results for Bicep on GitHub Actions](/media/bicep-testing-framework-poc-pester/pester-results-bicep-github-actions.png)

With Pester tests in place, any code change that alters the expected result will cause the tests to fail and clearly signal that the change breaks existing functionality.

One thing I have not explored is testing with actual deployments, because they introduce a lot of complexity. Suppose a resource has 10 different deployment scenarios; you would need to deploy 10 instances of that resource to test it fully. Depending on the resource, that could become quite expensive. On top of that, these tests could take much longer than local tests, and in many cases you would need to set up any referenced resources in advance.

One thing that is still missing is code coverage. Pester does not support code coverage for Bicep templates. If this is possible in the future, it will likely require additional functionality beyond Pester and the testing tools used for other languages.

I hope this was helpful. I encourage you to try the testing framework, provide feedback, and hopefully see it become an official release rather than remaining an experimental proof of concept.