import { extractSkillsFromText, getSkillInfo, CATEGORIES, SKILLS_DB } from './skillDictionary.js';
import mammoth from 'mammoth';
import pako from 'pako';

/**
 * Extracts plain text from a PDF ArrayBuffer by decompressing FlateDecode streams with pako.
 */
function extractTextFromPdfArrayBuffer(arrayBuffer) {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const binaryString = new TextDecoder('latin1').decode(bytes);
    const lines = [];

    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(binaryString)) !== null) {
      const rawStream = match[1];
      const streamBytes = new Uint8Array(rawStream.length);
      for (let i = 0; i < rawStream.length; i++) {
        streamBytes[i] = rawStream.charCodeAt(i);
      }

      let decompressed = '';
      try {
        const inflated = pako.inflate(streamBytes);
        decompressed = new TextDecoder('utf-8', { fatal: false }).decode(inflated);
      } catch (e) {
        decompressed = rawStream;
      }

      if (decompressed.includes('BT') || decompressed.includes('Tj') || decompressed.includes('TJ')) {
        const formatted = decompressed
          .replace(/(?:T\*|(?:\d+(?:\.\d+)?\s+-\d+(?:\.\d+)?\s+T[dD])|ET)/g, '\n');

        const splitLines = formatted.split(/\r?\n/);
        for (const l of splitLines) {
          let lineText = '';
          const strRegex = /\(((?:[^()\\]|\\.)*)\)/g;
          let m;
          while ((m = strRegex.exec(l)) !== null) {
            let unescaped = m[1]
              .replace(/\\([0-7]{1,3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
              .replace(/\\([nrtbf\\])/g, (match, ch) => {
                if (ch === 'n') return '\n';
                if (ch === 'r') return '\r';
                if (ch === 't') return '\t';
                return ch;
              })
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')');
            lineText += unescaped;
          }
          if (lineText.trim()) {
            lines.push(lineText.trim());
          }
        }
      }
    }

    if (lines.length > 0) {
      return lines.join('\n');
    }

    // Fallback: search for uncompressed string operators
    const literalTj = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
    let lm;
    while ((lm = literalTj.exec(binaryString)) !== null) {
      const clean = lm[1].replace(/\\([0-9]{3}|.)/g, '$1').trim();
      if (clean && clean.length > 1 && !clean.startsWith('/')) {
        lines.push(clean);
      }
    }

    return lines.join('\n');
  } catch (err) {
    console.warn('PDF stream extraction notice:', err);
    return '';
  }
}

/**
 * Reads text from an uploaded file (.pdf, .docx, .doc, .txt).
 * Tries the backend parse API first, then falls back to client-side mammoth (.docx) or pako PDF decompressor.
 */
export async function readTextFromFile(file) {
  if (!file) return '';
  const ext = (file.name || '').split('.').pop().toLowerCase();

  // 1. Try sending to backend parser endpoint on port 5000 if available
  try {
    const formData = new FormData();
    formData.append('resume', file);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('http://localhost:5000/api/parse', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.trim()) {
        return data.text;
      }
    }
  } catch (err) {
    // Backend server not running or aborted; fallback to client extraction
  }

  // 2. Client-side extraction for .pdf
  if (ext === 'pdf') {
    // 2a. In-browser PDF.js (extracts text from all PDF generators: LaTeX, Overleaf, Word, Canva)
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        const pageTexts = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent({ normalizeWhitespace: false });
          let lastY = null;
          let pageText = '';

          for (const item of textContent.items) {
            const currentY = item.transform ? item.transform[5] : null;
            if (lastY === null || (currentY !== null && Math.abs(lastY - currentY) < 3)) {
              pageText += (pageText.length > 0 && !pageText.endsWith(' ') ? ' ' : '') + item.str;
            } else {
              pageText += '\n' + item.str;
            }
            lastY = currentY;
          }
          if (pageText.trim()) {
            pageTexts.push(pageText.trim());
          }
        }

        const fullPdfText = pageTexts.join('\n\n');
        if (fullPdfText && fullPdfText.trim().length > 10) {
          return fullPdfText;
        }
      } catch (err) {
        console.warn('pdfjsLib browser parse notice:', err);
      }
    }

    // 2b. Fallback to pako stream extraction
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfText = extractTextFromPdfArrayBuffer(arrayBuffer);
      if (pdfText && pdfText.trim().length > 10) {
        return pdfText;
      }
    } catch (err) {
      console.warn('Client PDF parse notice:', err);
    }
  }

  // 3. Client-side extraction for .docx using mammoth
  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim()) {
        return result.value;
      }
    } catch (err) {
      console.warn('Client mammoth docx parse notice:', err);
    }
  }

  // 4. Client-side extraction for .txt
  if (ext === 'txt') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  }

  // 5. General fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target.result || '';
      if (typeof content === 'string') {
        content = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
      resolve(content);
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

/**
 * Parses resume text into structured candidate info and extracted skills.
 */
export function parseResumeText(rawText = "") {
  if (!rawText || !rawText.trim()) {
    return {
      candidateName: '',
      email: '',
      phone: '',
      links: { linkedin: '', github: '' },
      experienceYears: null,
      skills: [],
      skillsCategorized: {},
      education: [],
      rawText: ''
    };
  }

  let cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Strip unparsed PDF binary deflate blocks and object references (e.g. "12 0 R")
  if (cleanText.includes('%PDF-')) {
    cleanText = cleanText
      .replace(/stream[\s\S]*?endstream/g, ' ')
      .replace(/<<[\s\S]*?>>/g, ' ')
      .replace(/\b\d+\s+\d+\s+R\b/g, ' ')
      .replace(/%PDF-[^\n]+/g, ' ');
  }

  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  let name = "Candidate";
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 40 && !firstLine.includes('@') && !/resume|curriculum|skills/i.test(firstLine)) {
      name = firstLine;
    }
  }

  const educationPatterns = [
    /(?:bachelor|master|phd|b\.s|m\.s|b\.tech|m\.tech|b\.a|m\.a|associate|degree|diploma)[\s\w,.-]+/gi,
    /(?:university|college|institute|school)[\s\w,.-]+/gi
  ];
  const educationMatches = new Set();
  for (const pattern of educationPatterns) {
    const matches = cleanText.match(pattern) || [];
    matches.forEach(m => {
      if (m.trim().length > 5 && m.trim().length < 100) {
        educationMatches.add(m.trim());
      }
    });
  }

  // Experience calculation: only return a number if explicitly mentioned, otherwise null
  const expMatch = cleanText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/i);
  let calculatedExpYears = null;
  if (expMatch) {
    calculatedExpYears = parseInt(expMatch[1], 10);
  } else {
    calculatedExpYears = estimateExperienceYears(cleanText);
  }

  const skillsData = extractSkillsFromText(cleanText);
  const projects = extractProjects(cleanText);

  // Merge explicitly mentioned project technologies into skills without duplicates
  for (const proj of projects) {
    for (const tech of proj.technologies) {
      if (!skillsData.foundSkills.some(s => s.toLowerCase() === tech.toLowerCase())) {
        skillsData.foundSkills.push(tech);
      }
      const info = getSkillInfo(tech);
      const cat = info?.category || CATEGORIES.PROGRAMMING;
      if (!skillsData.categorized[cat]) {
        skillsData.categorized[cat] = [];
      }
      if (!skillsData.categorized[cat].some(s => s.toLowerCase() === tech.toLowerCase())) {
        skillsData.categorized[cat].push(tech);
      }
    }
  }

  return {
    candidateName: name,
    email,
    phone,
    links: {
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : ''
    },
    experienceYears: calculatedExpYears, // null if not mentioned
    skills: skillsData.foundSkills,
    skillsCategorized: skillsData.categorized || {},
    projects,
    education: Array.from(educationMatches).slice(0, 4),
    rawText: cleanText,
    parsedAt: new Date().toISOString()
  };
}

/**
 * Scans resume text for Projects section and extracts project titles and technologies used.
 */
export function extractProjects(text = "") {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projects = [];
  let inProjectsSection = false;
  let currentProject = null;

  const sectionHeaderRegex = /^(?:education|skills|technical skills|experience|work experience|employment|certifications?|certificates?|achievements?|declaration)\b/i;
  const projectHeaderRegex = /^(?:projects|academic projects|personal projects|key projects)\b/i;
  const techUsedRegex = /(?:technolog(?:y|ies)\s*used|tech\s*stack|tools\s*used|built\s*with)\s*:\s*(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleanLine = rawLine.replace(/^[*•·\-\s]+/, '').trim();
    if (!cleanLine) continue;

    // Detect entry into Projects section
    if (projectHeaderRegex.test(cleanLine)) {
      inProjectsSection = true;
      continue;
    }

    // Detect exit from Projects section
    if (inProjectsSection && sectionHeaderRegex.test(cleanLine)) {
      inProjectsSection = false;
      if (currentProject) {
        projects.push(currentProject);
        currentProject = null;
      }
      continue;
    }

    // Check for "Technologies Used:" line anywhere
    const techMatch = cleanLine.match(techUsedRegex);
    if (techMatch) {
      const rawTechs = techMatch[1];
      const parsedTechs = parseTechnologiesList(rawTechs);

      if (currentProject) {
        currentProject.technologies = Array.from(new Set([...currentProject.technologies, ...parsedTechs]));
      } else {
        const prevTitle = findPrecedingProjectTitle(lines, i);
        currentProject = {
          title: prevTitle || 'Project',
          technologies: parsedTechs
        };
        projects.push(currentProject);
        currentProject = null;
      }
      continue;
    }

    // Inside projects section: detect potential project title
    if (inProjectsSection) {
      const isBullet = /^[*•·\-]/.test(rawLine);
      const isShort = cleanLine.length > 3 && cleanLine.length < 80;
      const isDescPattern = /^(?:online|real-time|automated|developed|designed|implemented|created|built|enabled|integrated|focused|calculates|displays|generates|generated|a|an|the|this|in this)\b/i.test(cleanLine) ||
                            /\b(?:is\s+(?:a|an)|used\s+to|application\s+to|allows\s+users)\b/i.test(cleanLine);
      const isNotSectionHeader = !sectionHeaderRegex.test(cleanLine) && !techUsedRegex.test(cleanLine);

      // Clean title that may end with colon (e.g. "GUI Calculator using Java swing :")
      const titleCandidate = cleanLine.replace(/^[*•·\-\s]+/, '').replace(/[:\s]+$/, '').trim();

      if (isShort && !isDescPattern && isNotSectionHeader && (!isBullet || !currentProject || currentProject.hasDesc)) {
        if (currentProject) {
          delete currentProject.hasDesc;
          projects.push(currentProject);
        }
        currentProject = {
          title: titleCandidate,
          technologies: [],
          hasDesc: false
        };
      } else if (currentProject && (isBullet || isDescPattern)) {
        currentProject.hasDesc = true;
      }

      // Check title and descriptions for explicitly mentioned technologies
      if (currentProject) {
        if (/using|developed|built|implemented|technolog/i.test(cleanLine)) {
          for (const entry of SKILLS_DB) {
            if (entry.isSingleLetter) continue;
            if (entry.pattern && entry.pattern.test(cleanLine)) {
              if (!currentProject.technologies.includes(entry.name)) {
                currentProject.technologies.push(entry.name);
              }
            }
          }
        }
      }
    }
  }

  if (currentProject && !projects.some(p => p.title === currentProject.title)) {
    delete currentProject.hasDesc;
    projects.push(currentProject);
  }

  return projects;
}

function parseTechnologiesList(techsString) {
  if (!techsString) return [];
  const tokens = techsString
    .split(/[,;|•·\u2022\u25CF\u25CB\u2023\u25AA\u25AB\t/()]+|\band\b/i)
    .map(t => t.trim())
    .filter(Boolean);

  const recognized = [];
  for (const token of tokens) {
    const info = getSkillInfo(token);
    if (info) {
      if (!recognized.includes(info.name)) {
        recognized.push(info.name);
      }
    }
  }
  return recognized;
}

function findPrecedingProjectTitle(lines, techIndex) {
  for (let j = techIndex - 1; j >= Math.max(0, techIndex - 4); j--) {
    const line = lines[j].replace(/^[*•·\-\s]+/, '').trim();
    if (!line) continue;
    if (line.includes(':')) continue;
    if (line.length > 3 && line.length < 80) {
      return line;
    }
  }
  return '';
}

/**
 * Estimates experience from date ranges (e.g. 2020 - 2023).
 * Returns null if no valid date ranges exist, rather than an arbitrary default.
 */
function estimateExperienceYears(text) {
  const dateRangeRegex = /(20\d{2}|19\d{2})\s*(?:-|to)\s*(20\d{2}|19\d{2}|present|current)/gi;
  let matches;
  let maxDuration = 0;
  let found = false;
  const currentYear = new Date().getFullYear();

  while ((matches = dateRangeRegex.exec(text)) !== null) {
    const startYear = parseInt(matches[1], 10);
    const endYearStr = matches[2].toLowerCase();
    const endYear = (endYearStr === 'present' || endYearStr === 'current') ? currentYear : parseInt(endYearStr, 10);
    const duration = endYear - startYear;
    if (duration > 0 && duration < 40) {
      maxDuration = Math.max(maxDuration, duration);
      found = true;
    }
  }

  return found && maxDuration > 0 ? maxDuration : null;
}
