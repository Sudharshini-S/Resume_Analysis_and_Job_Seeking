import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle, Lightbulb, Target, Award, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AtsScoreGauge({ atsReport, onOpenPdfReport }) {
  if (!atsReport) return null;

  const score = atsReport.totalAtsScore || 0;
  const breakdown = atsReport.breakdown || { skillScore: 70, experienceScore: 80, keywordScore: 70, formattingScore: 90 };

  React.useEffect(() => {
    if (score >= 85) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [score]);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="75%" outerRadius="100%" data={chartData} startAngle={180} endAngle={0}>
                  <RadialBar minAngle={15} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-8">
                <span className={`text-4xl font-extrabold tracking-tight ${scoreTheme.text}`}>{score}%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Calculated ATS Score</span>
              </div>
            </div>

            <div className="text-center mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${scoreTheme.badge}`}>
                <Award className="w-3.5 h-3.5 mr-1.5" />
                {score >= 80 ? 'Tier-1 High Match' : score >= 60 ? 'Moderate Readiness' : 'Needs Optimization'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">ATS Weighted Evaluation</h3>
              {onOpenPdfReport && (
                <button
                  onClick={onOpenPdfReport}
                  className="px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Export ATS Certificate
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Skill Alignment (40% Weight)</span>
                  <span className="font-semibold text-gray-900">{breakdown.skillScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${breakdown.skillScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Experience Match (30% Weight)</span>
                  <span className="font-semibold text-gray-900">{breakdown.experienceScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${breakdown.experienceScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Keyword Density (20% Weight)</span>
                  <span className="font-semibold text-gray-900">{breakdown.keywordScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                  <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${breakdown.keywordScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Formatting & Structure (10% Weight)</span>
                  <span className="font-semibold text-gray-900">{breakdown.formattingScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${breakdown.formattingScore}%` }} />
                </div>
              </div>
            </div>
          </div>
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

      {/* Suggestions */}
      {atsReport.suggestions && atsReport.suggestions.length > 0 && (
        <div className="panel-box">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" /> ATS Improvement Recommendations
          </h4>

          <div className="space-y-2.5">
            {atsReport.suggestions.map((sug, idx) => (
              <div key={idx} className="panel-card flex items-start gap-3 bg-gray-50/80">
                <div className="p-1.5 rounded bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h5 className="text-xs font-bold text-gray-900">{sug.title}</h5>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      sug.impact === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {sug.impact} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{sug.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
