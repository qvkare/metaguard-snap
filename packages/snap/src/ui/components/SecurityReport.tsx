import { Panel, Text, heading, divider } from '@metamask/snaps-ui';
import { SecurityReport } from '../../security/analyzers/securityAnalyzer';
import theme from '../styles/theme';

interface SecurityReportProps {
  report: SecurityReport;
}

const getSeverityColor = (severity: string): string => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return theme.colors.critical;
    case 'HIGH':
      return theme.colors.high;
    case 'MEDIUM':
      return theme.colors.medium;
    case 'LOW':
      return theme.colors.low;
    default:
      return theme.colors.text;
  }
};

const SecurityReportComponent = ({ report }: SecurityReportProps) => {
  const { riskAssessment, securityChecks, recommendations } = report;

  return (
    <Panel>
      {/* Header */}
      <Panel style={{ 
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md
      }}>
        <heading>MetaGuard Security Analysis</heading>
      </Panel>

      {/* Risk Assessment */}
      <Panel style={{ 
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.shadows.sm
      }}>
        <Text
          variant="heading"
          style={{
            ...theme.typography.heading,
            color: getSeverityColor(riskAssessment.riskLevel)
          }}
        >
          Risk Level: {riskAssessment.riskLevel}
        </Text>
        {riskAssessment.riskFactors.map((factor, index) => (
          <Text
            key={index}
            variant="body"
            style={{
              ...theme.typography.body,
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.sm
            }}
          >
            • {factor}
          </Text>
        ))}
      </Panel>

      {/* Security Checks */}
      <Panel style={{ 
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.shadows.sm
      }}>
        <Text variant="heading" style={theme.typography.heading}>
          Security Checks
        </Text>
        {securityChecks.map((check, index) => (
          <Panel
            key={index}
            style={{
              marginTop: theme.spacing.sm,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.surface
            }}
          >
            <Text
              variant="body"
              style={{
                ...theme.typography.body,
                color: getSeverityColor(check.severity)
              }}
            >
              {check.name}: {check.passed ? '✅' : '❌'}
            </Text>
            <Text
              variant="caption"
              style={{
                ...theme.typography.caption,
                color: theme.colors.textSecondary
              }}
            >
              {check.details}
            </Text>
          </Panel>
        ))}
      </Panel>

      {/* Recommendations */}
      <Panel style={{ 
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.shadows.sm
      }}>
        <Text variant="heading" style={theme.typography.heading}>
          Recommendations
        </Text>
        {recommendations.map((recommendation, index) => (
          <Text
            key={index}
            variant="body"
            style={{
              ...theme.typography.body,
              marginTop: theme.spacing.sm
            }}
          >
            {recommendation}
          </Text>
        ))}
      </Panel>

      {/* Contract Info */}
      {report.contractInfo && (
        <Panel style={{ 
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          boxShadow: theme.shadows.sm
        }}>
          <Text variant="heading" style={theme.typography.heading}>
            Contract Information
          </Text>
          <Text variant="body" style={theme.typography.body}>
            Name: {report.contractInfo.contractName}
          </Text>
          <Text variant="body" style={theme.typography.body}>
            License: {report.contractInfo.licenseType}
          </Text>
          <Text variant="body" style={theme.typography.body}>
            Compiler: {report.contractInfo.compilerVersion}
          </Text>
        </Panel>
      )}

      {/* Phishing Results */}
      {report.phishingResults && report.phishingResults.length > 0 && (
        <Panel style={{ 
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          boxShadow: theme.shadows.sm
        }}>
          <Text variant="heading" style={theme.typography.heading}>
            Phishing Detection Results
          </Text>
          {report.phishingResults.map((result, index) => (
            <Panel
              key={index}
              style={{
                marginTop: theme.spacing.sm,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.surface
              }}
            >
              <Text
                variant="body"
                style={{
                  ...theme.typography.body,
                  color: result.isPhishing ? theme.colors.error : theme.colors.success
                }}
              >
                {result.source}: {result.isPhishing ? 'Dangerous' : 'Safe'}
              </Text>
              {result.details && (
                <Text
                  variant="caption"
                  style={{
                    ...theme.typography.caption,
                    color: theme.colors.textSecondary
                  }}
                >
                  {result.details}
                </Text>
              )}
            </Panel>
          ))}
        </Panel>
      )}

      {/* Timestamp */}
      <Text
        variant="caption"
        style={{
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md
        }}
      >
        Analysis Time: {new Date(report.timestamp).toLocaleString()}
      </Text>
    </Panel>
  );
};

export default SecurityReportComponent; 