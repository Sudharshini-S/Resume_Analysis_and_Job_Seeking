import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle, Award, FileText } from 'lucide-react';
export default function AtsScoreGauge({ atsReport, onOpenPdfReport }) {
  if (!atsReport) return null;
  const score = atsReport.totalAtsScore || 0;
  const getScoreColor = (val) => {
    if (val >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', stroke: '#10b981', border: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (val >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', stroke: '#f59e0b', border: 'border-amber-200', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'text-rose-600', bg: 'bg-rose-500', stroke: '#f43f5e', border: 'border-rose-200', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };
  const scoreTheme = getScoreColor(score);
  const chartData = [{ name: 'ATS Score', value: score, fill: scoreTheme.stroke }];
  return (
    <div className="space-y-6">
      <div className="panel-box relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="75%" outerRadius="100%" data={chartData} startAngle={180} endAngle={0}>
                  <RadialBar minAngle={15} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-6">
                <span className={`text-4xl font-extrabold tracking-tight ${scoreTheme.text}`}>{score}%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Calculated ATS Score</span>
              </div>
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${scoreTheme.badge}`}>
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  {score >= 80 ? 'Tier-1 High Match' : score >= 60 ? 'Moderate Readiness' : 'Needs Optimization'}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">ATS Resume Evaluation</h3>
              <p className="text-xs text-gray-500 max-w-md">
                Your ATS compatibility score is calculated based on technical skills, industry alignment, and keyword density.
              </p>
            </div>
          </div>
          {onOpenPdfReport && (
            <div className="shrink-0">
              <button
                onClick={onOpenPdfReport}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Export ATS Certificate</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="panel-card border-emerald-200 bg-emerald-50/40">
          <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Skills & Keywords ({atsReport.matchedSkills?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(atsReport.matchedSkills || []).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-white text-emerald-700 border border-emerald-200 font-medium shadow-2xs">
                {skill}
              </span>
            ))}
            {(atsReport.matchedSkills || []).length === 0 && (
              <span className="text-xs text-gray-500 italic">No explicit skills matched</span>
            )}
          </div>
        </div>
        <div className="panel-card border-rose-200 bg-rose-50/40">
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Missing Critical Skills ({atsReport.missingSkills?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(atsReport.missingSkills || []).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-white text-rose-700 border border-rose-200 font-medium shadow-2xs">
                {skill}
              </span>
            ))}
            {(atsReport.missingSkills || []).length === 0 && (
              <span className="text-xs text-gray-500 italic">No critical missing skill gaps</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
