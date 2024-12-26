import { NodeType } from '@metamask/snaps-sdk';
import { SecurityReport } from '../../types';
import type { CustomPanel } from '../../types';

export function createSecurityPanel(report: SecurityReport): CustomPanel {
  return {
    type: 'panel',
    children: [
      { type: NodeType.Heading, value: 'Security Analysis Report' },
      {
        type: NodeType.Text,
        value: `Risk Level: ${report.risk.toUpperCase()}`
      },
      ...(report.warnings.length > 0 ? [
        { type: NodeType.Heading, value: 'Warnings:' },
        ...report.warnings.map(warning => ({
          type: NodeType.Text,
          value: warning
        }))
      ] : []),
      ...(report.recommendations.length > 0 ? [
        { type: NodeType.Heading, value: 'Recommendations:' },
        ...report.recommendations.map(rec => ({
          type: NodeType.Text,
          value: rec
        }))
      ] : []),
      ...(report.securityChecks.length > 0 ? [
        { type: NodeType.Heading, value: 'Security Checks:' },
        ...report.securityChecks.map(check => ({
          type: NodeType.Text,
          value: `${check.name}: ${check.passed ? 'Passed' : 'Failed'} (${check.severity})${check.details ? `\n${check.details}` : ''}`
        }))
      ] : [])
    ]
  };
}

export function createErrorPanel(error: unknown): CustomPanel {
  return {
    type: 'panel',
    children: [
      { type: NodeType.Heading, value: 'Error analyzing transaction' },
      {
        type: NodeType.Text,
        value: error instanceof Error ? error.message : 'Unknown error'
      }
    ]
  };
} 