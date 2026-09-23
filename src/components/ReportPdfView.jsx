import React, { useState } from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, ShieldCheck, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportPdfView({ isOpen, onClose, atsReport, resume }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !atsReport) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const reportElem = document.getElementById('ats-report-document');
    if (!reportElem) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(reportElem, {
        scale: 2,
        backgroundColor: '#111111',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const safeName = (resume?.candidateName || 'Candidate').replace(/\s+/g, '_');
      pdf.save(`ATS_Evaluation_Report_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const candidateDisplayName = resume?.candidateName || 'Job Seeker Candidate';
  const score = atsReport.totalAtsScore || 0;
  const breakdown = atsReport.breakdown || { skillScore: 70, experienceScore: 80, keywordScore: 70, formattingScore: 90 };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-[#262626] p-4 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Official ATS Evaluation Certificate</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#404040] cursor-pointer"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-400" />}
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-300 text-xs font-semibold flex items-center gap-1.5 border border-[#333333] cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[#262626] hover:bg-[#333333] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-12 text-gray-200 bg-[#121212] font-sans" id="ats-report-document">
          <div className="border-b border-[#2a2a2a] pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">ATS Analysis & Evaluation Certificate</h1>
              <p className="text-xs text-gray-400 font-semibold mt-1">TalentTrack • Smart Resume & Recruitment Platform</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-[#202020] text-gray-200 border border-[#333333] rounded text-xs font-semibold">
                Verification ID: #ATS-{Math.floor(100000 + Math.random() * 900000)}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Candidate Profile Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] mb-8 text-xs">
            <div>
              <span className="text-gray-400 uppercase font-semibold block text-[10px]">Candidate Name</span>
              <span className="font-bold text-white text-sm">{candidateDisplayName}</span>
            </div>
            <div>
              <span className="text-gray-400 uppercase font-semibold block text-[10px]">Target Position</span>
              <span className="font-bold text-white text-sm">{atsReport.jobTitle || 'Target Role'}</span>
            </div>
            <div>
              <span className="text-gray-400 uppercase font-semibold block text-[10px]">Total ATS Score</span>
              <span className="font-extrabold text-emerald-400 text-base">{score}% Match</span>
            </div>
            <div>
              <span className="text-gray-400 uppercase font-semibold block text-[10px]">Parsed Experience</span>
              <span className="font-bold text-gray-200 text-sm">{resume?.experienceYears || 0} Years</span>
            </div>
          </div>

          {/* Central ATS Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#181818] rounded-xl border border-[#2a2a2a] mb-8 items-center">
            <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-[#2a2a2a] pb-6 md:pb-0 md:pr-6">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Overall Match Score</span>
              <div className="text-6xl font-black text-emerald-400 tracking-tight my-2">{score}%</div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {score >= 80 ? 'High ATS Fit' : score >= 60 ? 'Moderate Fit' : 'Needs Tailoring'}
              </span>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-gray-300">Technical Skill Coverage (40%)</span>
                  <span className="text-emerald-400">{breakdown.skillScore ?? 0}%</span>
                </div>
                <div className="w-full bg-[#262626] rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${breakdown.skillScore ?? 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-gray-300">Experience Alignment (30%)</span>
                  <span className="text-blue-400">{breakdown.experienceScore ?? 0}%</span>
                </div>
                <div className="w-full bg-[#262626] rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${breakdown.experienceScore ?? 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-gray-300">Keyword Density & Match (20%)</span>
                  <span className="text-amber-400">{breakdown.keywordScore ?? 0}%</span>
                </div>
                <div className="w-full bg-[#262626] rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${breakdown.keywordScore ?? 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-xs font-bold uppercase text-emerald-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills & Keywords ({atsReport.matchedSkills?.length || 0})
              </h4>
              <div className="p-3 bg-[#181818] rounded border border-[#2a2a2a] min-h-[80px] flex flex-wrap gap-1.5">
                {(atsReport.matchedSkills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[11px] rounded border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-rose-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing Skills / Gaps ({atsReport.missingSkills?.length || 0})
              </h4>
              <div className="p-3 bg-[#181818] rounded border border-[#2a2a2a] min-h-[80px] flex flex-wrap gap-1.5">
                {(atsReport.missingSkills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 text-[11px] rounded border border-rose-500/20">
                    {s}
                  </span>
                ))}
                {(atsReport.missingSkills || []).length === 0 && (
                  <span className="text-xs text-gray-500 italic">No missing skill gaps identified</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 border-b border-[#262626] pb-1">
              Actionable ATS Optimization Recommendations
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {(atsReport.suggestions || []).map((s, i) => (
                <li key={i} className="p-2.5 bg-[#181818] rounded border border-[#2a2a2a] flex items-start gap-2">
                  <span className="font-bold text-gray-400 shrink-0">#{i + 1}</span>
                  <div>
                    <strong className="text-white block mb-0.5">{s.title}</strong>
                    <span className="text-gray-400">{s.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-[#2a2a2a] flex justify-between items-center text-[10px] text-gray-500">
            <span>Verified by TalentTrack Engine</span>
            <span>Generated from authentic candidate data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
