import React, { useState, useMemo } from 'react';
import { X, Award, Download, Loader2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
function getVerificationId(seed = '') {
  let hash = 0;
  const str = seed || 'TalentTrackCertificate';
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
  }
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l1 = letters[Math.abs(hash) % 26];
  const l2 = letters[Math.abs(Math.floor(hash / 26)) % 26];
  const num = 1000 + (Math.abs(hash) % 9000);
  return `${l1}${l2}${num}`;
}

export default function ReportPdfView({ isOpen, onClose, atsReport, resume }) {
  const [downloading, setDownloading] = useState(false);

  const verificationId = useMemo(() => {
    return getVerificationId(resume?.candidateName || resume?.email || 'TalentTrackUser');
  }, [resume?.candidateName, resume?.email]);

  if (!isOpen || !atsReport) return null;

  const handleDownloadPdf = async () => {
    const reportElem = document.getElementById('ats-certificate-document');
    if (!reportElem) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(reportElem, {
        scale: 2.5,
        backgroundColor: '#ffffff',
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
      pdf.save(`TalentTrack_ATS_Certificate_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const candidateDisplayName = resume?.candidateName || 'Candidate';
  const score = atsReport.totalAtsScore || 0;
  const extractedSkills = resume?.skills || atsReport.matchedSkills || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-200">
        {/* Modal Controls Bar (Print option removed) */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">TalentTrack ATS Certificate</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-white" />}
              <span>Download Certificate (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Document Container - Pristine White Theme */}
        <div className="p-8 sm:p-12 bg-white" id="ats-certificate-document">
          <div className="border-[3px] border-[#0f172a] rounded-lg p-6 sm:p-10 relative bg-white">
            {/* Inner Border Accent */}
            <div className="border border-gray-300 p-6 sm:p-8 rounded-md bg-white">
              {/* Header Branding */}
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-1">
                  <Award className="w-4 h-4" />
                  Official Verification
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-wider uppercase">
                  TalentTrack
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">
                  Smart Resume & Recruitment Platform
                </p>
                <div className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-800 text-[11px] font-bold rounded uppercase tracking-wider">
                  Certificate of ATS Resume Evaluation
                </div>
              </div>

              {/* Verification ID & Date Strip */}
              <div className="flex flex-col sm:flex-row justify-between items-center py-4 text-xs text-gray-600 border-b border-gray-100 gap-2">
                <div>
                  <span className="font-semibold text-gray-500">Verification ID: </span>
                  <span className="font-mono font-bold text-gray-900 text-sm tracking-wider bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {verificationId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Issued On: </span>
                  <span className="font-semibold text-gray-900">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Candidate Certification Statement */}
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  This document certifies that the resume credentials of
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {candidateDisplayName}
                </h2>
                <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed pt-1">
                  have been analyzed and certified through the TalentTrack automated ATS evaluation system.
                </p>
              </div>

              {/* ATS Score Card */}
              <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-6 text-center my-4 max-w-md mx-auto shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  Calculated ATS Compatibility Score
                </span>
                <div className="text-5xl font-black text-emerald-600 tracking-tight my-2">
                  {score}%
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{score >= 80 ? 'Verified Tier-1 ATS Fit' : score >= 60 ? 'Verified Moderate Readiness' : 'Needs Optimization'}</span>
                </div>
              </div>

              {/* Extracted Skills Section */}
              <div className="pt-6 pb-4">
                <div className="text-center mb-3">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Extracted Skills ({extractedSkills.length})
                  </h3>
                  <div className="w-12 h-0.5 bg-blue-600 mx-auto mt-1" />
                </div>

                {extractedSkills.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1.5 max-h-48 overflow-hidden pt-1">
                    {extractedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white text-gray-800 text-xs font-medium rounded border border-gray-300 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic text-center">No explicit skills recorded.</p>
                )}
              </div>

              {/* Certificate Authentication Footer */}
              <div className="pt-8 mt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-3">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-gray-700">TalentTrack Verified ATS Document</span>
                </div>
                <div className="font-mono text-gray-500 text-[10px]">
                  Verification Code: {verificationId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
