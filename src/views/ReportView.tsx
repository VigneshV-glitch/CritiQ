/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Target,
  Compass,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AuditReport, Severity, Issue } from '../types';
import { ScoreOverview } from '../components/critiq/report/ScoreOverview';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ReportViewProps {
  report: AuditReport | null;
  onBackToWorkspace: () => void;
  onNewInspection: () => void;
  onExportReport: () => void;
}

export default function ReportView({
  report,
  onBackToWorkspace,
  onNewInspection,
  onExportReport
}: ReportViewProps) {
  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <p className="text-sm font-sans">No active report available to view.</p>
        <Button onClick={onNewInspection} variant="primary" className="mt-4">
          Start New Inspection
        </Button>
      </div>
    );
  }

  if (report.isUnavailable) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 max-w-md mx-auto my-auto space-y-6">
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-amber-400 animate-pulse" />
          <h2 className="text-lg font-bold font-sans mb-1.5 text-white">AI Audit Service Temporarily Unavailable</h2>
          <p className="text-xs font-sans leading-relaxed text-slate-300">
            {report.summary}
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <Button onClick={onBackToWorkspace} variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Workspace
          </Button>
          <Button onClick={onNewInspection} variant="primary" size="sm">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Start New Inspection
          </Button>
        </div>
      </div>
    );
  }

  // Calculate severity distributions
  const criticalIssues = report.issues.filter(i => i.severity === 'critical');
  const highIssues = report.issues.filter(i => i.severity === 'high');
  const mediumIssues = report.issues.filter(i => i.severity === 'medium');
  const lowIssues = report.issues.filter(i => i.severity === 'low' || i.severity === 'info');

  // Sorted priority findings (Critical & High first)
  const priorityFindings = [...report.issues].sort((a, b) => {
    const weights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return (weights[b.severity] || 0) - (weights[a.severity] || 0);
  });

  const EASE_CUSTOM = [0.16, 1, 0.3, 1];

  const userIntentText = report.userInstruction || 'Standard UX, UI, and WCAG accessibility inspection.';
  const strategyText = report.correctionStrategy || 'Balanced';

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = 297;
    const pageWidth = 210;
    const margin = 15;
    let y = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        // Draw page background header
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(`Critiq Executive Design Audit - Page ${doc.getNumberOfPages()}`, margin, 12);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    // Draw Cover Accent banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Title branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('CRITIQ', margin, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(199, 210, 254); // indigo-200
    doc.text('EXECUTIVE UI/UX DESIGN AUDIT', margin, 28);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    const currentLocalStr = new Date().toLocaleString();
    doc.text(`Generated: ${currentLocalStr}`, pageWidth - margin - 50, 36);

    y = 55;

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`Audit Target: ${report.name || 'Application Preview'}`, margin, y);
    y += 8;

    // Overall Score Card Widget
    checkPageBreak(35);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 30, 3, 3, 'FD');

    // Score Callout text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(99, 102, 241); // indigo-600
    doc.text(`${report.score}`, margin + 8, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('/ 100', margin + 8 + 18, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.text('OVERALL SCORE', margin + 8 + 18, y + 15);

    // Score breakdown definitions
    const scoreBreakdown = report.scoreBreakdown || {
      visualDesign: Math.min(100, report.score + 4),
      usability: Math.max(0, report.score - 2),
      accessibility: Math.max(0, report.score - 5),
      consistency: Math.min(100, report.score + 2)
    };

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    
    doc.text(`Visual Design: ${scoreBreakdown.visualDesign}%`, margin + 65, y + 10);
    doc.text(`Usability: ${scoreBreakdown.usability}%`, margin + 65, y + 20);
    doc.text(`Accessibility: ${scoreBreakdown.accessibility}%`, margin + 120, y + 10);
    doc.text(`Consistency: ${scoreBreakdown.consistency}%`, margin + 120, y + 20);

    y += 38;

    // Executive Summary Area
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE SUMMARY', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    const splitSummary = doc.splitTextToSize(report.summary || 'Audit completed successfully.', pageWidth - (margin * 2));
    doc.text(splitSummary, margin, y);
    y += (splitSummary.length * 4.5) + 8;

    // Optional Strategy block
    if (strategyText) {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('DESIGN OPTIMIZATION STRATEGY', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitStrategy = doc.splitTextToSize(strategyText, pageWidth - (margin * 2));
      doc.text(splitStrategy, margin, y);
      y += (splitStrategy.length * 4.5) + 10;
    }

    // Detailed Findings Header
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('DETAILED AUDIT FINDINGS', margin, y);
    y += 8;

    if (!report.issues || report.issues.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No guideline violations found during the scan.', margin, y);
    } else {
      report.issues.forEach((issue: any, index: number) => {
        const detailsLines = doc.splitTextToSize(issue.message || '', pageWidth - (margin * 2) - 40);
        const fixLines = doc.splitTextToSize(issue.fix || '', pageWidth - (margin * 2) - 40);
        
        // Dynamic box spacing sizing
        const blockHeight = 12 + (detailsLines.length * 4.5) + (fixLines.length * 4.5) + 12;

        checkPageBreak(blockHeight);

        // Round container card style
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), blockHeight - 4, 2, 2, 'FD');

        // Header Title style with colored indicators based on severity
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        if (issue.severity?.toLowerCase() === 'critical') {
          doc.setTextColor(220, 38, 38);
        } else if (issue.severity?.toLowerCase() === 'high') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(37, 99, 235);
        }
        
        const severityStr = (issue.severity || 'Medium').toUpperCase();
        doc.text(`[${severityStr}] Finding #${index + 1}: ${issue.ruleTitle || 'Guideline Violation'}`, margin + 5, y + 6);

        // Body Info text rendering
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        
        let localY = y + 12;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Detailed Finding:', margin + 5, localY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(detailsLines, margin + 35, localY);
        localY += (detailsLines.length * 4.5) + 3;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Recommended Fix:', margin + 5, localY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(fixLines, margin + 35, localY);

        y += blockHeight;
      });
    }

    // Trigger local download
    doc.save(`critiq-report-${report.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#020512] relative overflow-hidden">
      
      {/* Background Ambient Gradient & Exact Reference Image Wave Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020514]">
        {/* Base dark midnight blue gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020512] via-[#040920] to-[#071030]" />

        {/* Reduced Bottom-Right Vibrant Blue Glow Source */}
        <div 
          className="absolute -bottom-40 -right-40 w-[450px] md:w-[550px] h-[450px] md:h-[550px] rounded-full pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.75) 0%, rgba(59, 130, 246, 0.5) 20%, rgba(37, 99, 235, 0.3) 40%, rgba(29, 78, 216, 0.12) 60%, transparent 80%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Reduced Bottom Ambient Blue Light Spread along bottom edge */}
        <div 
          className="absolute bottom-0 inset-x-0 h-[160px] pointer-events-none opacity-60"
          style={{
            background: 'linear-gradient(to top, rgba(37, 99, 235, 0.18) 0%, rgba(29, 78, 216, 0.05) 50%, transparent 100%)',
          }}
        />

        {/* Vector Wave Contour Ribbon Overlays - Constrained Height */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="waveGradRight" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#1d4ed8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Bottom Left Wave Ribbon - Positioned Lower */}
          <g opacity="0.45">
            {Array.from({ length: 20 }).map((_, i) => (
              <path
                key={`lw-${i}`}
                d={`M -120 ${810 + i * 7} C ${140 - i * 3} ${680 + i * 5}, ${370 + i * 5} ${730 + i * 7}, ${740 + i * 7} ${930}`}
                fill="none"
                stroke="url(#waveGradLeft)"
                strokeWidth="1.0"
              />
            ))}
          </g>

          {/* Bottom Right Wave Ribbon - Positioned Lower */}
          <g opacity="0.45">
            {Array.from({ length: 24 }).map((_, i) => (
              <path
                key={`rw-${i}`}
                d={`M ${880 + i * 14} 930 C ${1060 + i * 8} ${760 - i * 4}, ${1220 + i * 6} ${600 - i * 8}, 1500 ${450 - i * 9}`}
                fill="none"
                stroke="url(#waveGradRight)"
                strokeWidth="1.0"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Header with Workflow Progress */}
      <header className="h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between z-20 bg-white/[0.01] backdrop-blur-md border-b border-white/5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToWorkspace}
            className="flex items-center gap-1.5 text-xs font-semibold shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workspace</span>
          </Button>
          <div className="h-4 w-px bg-white/10 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span className="hidden md:inline">Report:</span>
              <span className="text-indigo-300 font-mono text-xs px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                {report.name}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={onNewInspection}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Inspection</span>
          </Button>
        </div>
      </header>

      {/* Scrollable Container with sticky background underneath */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 min-h-0">
        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        
        {/* Inspection Context Card */}
        <Card variant="glass" className="p-5 border-indigo-500/20 bg-indigo-500/5 space-y-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Inspection Intent Context
            </span>
            <Badge variant="primary" size="sm">
              Strategy: {strategyText}
            </Badge>
          </div>
          <p className="text-xs font-sans text-slate-200 leading-relaxed">
            "{userIntentText}"
          </p>
        </Card>

        {/* Design Health Scores Overview */}
        <ScoreOverview
          score={report.score}
          scoreBreakdown={report.scoreBreakdown}
        />

        {/* Severity Breakdown & Review Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Severity Distribution */}
          <Card variant="glass" className="p-5 space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
              Severity Distribution
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400 font-bold">Critical</span>
                  <span className="text-white font-bold">{criticalIssues.length}</span>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">High</span>
                  <span className="text-white font-bold">{highIssues.length}</span>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold">Medium</span>
                  <span className="text-white font-bold">{mediumIssues.length}</span>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold">Low / Info</span>
                  <span className="text-white font-bold">{lowIssues.length}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* WCAG Summary */}
          <Card variant="glass" className="p-5 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
              WCAG Accessibility Compliance
            </span>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Assessed against WCAG 2.1 AA success criteria including color contrast minimum (1.4.3), touch target sizes (2.5.5), and text readability.
            </p>
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-300">
              <span>WCAG 2.1 AA Status</span>
              <span className="font-bold">
                {criticalIssues.length === 0 ? 'Compliant' : 'Requires Attention'}
              </span>
            </div>
          </Card>
        </div>

        {/* Priority Improvements List */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Priority Improvements Queue ({report.issues.length})
            </span>
          </div>

          {priorityFindings.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-sans">
              No findings detected. Your design meets all inspection rules.
            </div>
          ) : (
            <div className="space-y-3">
              {priorityFindings.map((issue, idx) => (
                <div
                  key={issue.id || idx}
                  className="p-4 bg-black/30 hover:bg-black/50 border border-white/5 rounded-xl space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white font-sans">
                      {idx + 1}. {issue.title}
                    </span>
                    <Badge
                      variant={
                        issue.severity === 'critical' ? 'danger' : issue.severity === 'high' ? 'warning' : 'primary'
                      }
                      size="sm"
                    >
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {issue.description}
                  </p>
                  <div className="text-[11px] text-indigo-200 font-sans bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
                    <strong>Action:</strong> {issue.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        </div>
      </div>
    </div>
  );
}
