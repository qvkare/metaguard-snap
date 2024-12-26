import { createSecurityPanel, createErrorPanel } from '../../../snap/ui/components';
import { SecurityReport } from '../../../types';
import { NodeType } from '@metamask/snaps-sdk';

describe('UI Components', () => {
  describe('createSecurityPanel', () => {
    it('should create panel with basic report info', () => {
      const mockReport: SecurityReport = {
        risk: 'medium',
        warnings: ['Test warning'],
        recommendations: ['Test recommendation'],
        securityChecks: [
          {
            name: 'Test Check',
            passed: true,
            details: 'Test details',
            severity: 'LOW',
          }
        ],
        contractInfo: {
          verified: true,
          name: 'Test Contract',
        },
        phishingResults: {
          isPhishing: false,
          confidence: 1.0,
        },
        riskAssessment: {
          riskLevel: 'medium',
          riskScore: 0.5,
          details: ['Test detail'],
        },
        timestamp: Date.now(),
      };

      const panel = createSecurityPanel(mockReport);

      expect(panel.type).toBe('panel');
      expect(panel.children).toBeDefined();
      expect(panel.children[0]).toEqual({
        type: NodeType.Heading,
        value: 'Security Analysis Report'
      });
      expect(panel.children[1]).toEqual({
        type: NodeType.Text,
        value: 'Risk Level: MEDIUM'
      });
    });

    it('should handle empty arrays in report', () => {
      const mockReport: SecurityReport = {
        risk: 'low',
        warnings: [],
        recommendations: [],
        securityChecks: [],
        contractInfo: {
          verified: true,
        },
        phishingResults: {
          isPhishing: false,
          confidence: 1.0,
        },
        riskAssessment: {
          riskLevel: 'low',
          riskScore: 0.2,
          details: [],
        },
        timestamp: Date.now(),
      };

      const panel = createSecurityPanel(mockReport);

      expect(panel.children).toHaveLength(2); // Just heading and risk level
    });
  });

  describe('createErrorPanel', () => {
    it('should create panel with error message', () => {
      const error = new Error('Test error');
      const panel = createErrorPanel(error);

      expect(panel.type).toBe('panel');
      expect(panel.children).toHaveLength(2);
      expect(panel.children[0]).toEqual({
        type: NodeType.Heading,
        value: 'Error analyzing transaction'
      });
      expect(panel.children[1]).toEqual({
        type: NodeType.Text,
        value: 'Test error'
      });
    });

    it('should handle unknown error', () => {
      const panel = createErrorPanel('Unknown error occurred');

      expect(panel.children[1]).toEqual({
        type: NodeType.Text,
        value: 'Unknown error'
      });
    });
  });
}); 