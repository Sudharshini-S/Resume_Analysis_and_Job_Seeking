import { extractSkillsFromText } from './skillDictionary';
export async function readTextFromFile(file) {
  if (!file) return '';
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      let content = e.target.result || '';
     
      if (typeof content === 'string') {
        content = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
      resolve(content);
    };
    reader.onerror = () => {
      resolve('');
    };

  reader.readAsText(file);
  });
}
export function parseResumeText(rawText = "") {
  if (!rawText || !rawText.trim()) {
    return {
      candidateName: '',
      email: '',
      phone: '',
      links: { linkedin: '', github: '' },
      experienceYears: 0,
      skills: [],
      skillsCategorized: {},
      education: [],
      rawText: ''
    };
  }

  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

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
    if (firstLine.length < 40 && !firstLine.includes('@') && !/resume|curriculum/i.test(firstLine)) {
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

  const expMatch = cleanText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/i);
  const calculatedExpYears = expMatch ? parseInt(expMatch[1], 10) : estimateExperienceYears(cleanText);

  const skillsData = extractSkillsFromText(cleanText);

  return {
    candidateName: name,
    email,
    phone,
    links: {
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : ''
    },
    experienceYears: calculatedExpYears,
    skills: skillsData.foundSkills,
    skillsCategorized: skillsData.categorized || {},
    education: Array.from(educationMatches).slice(0, 4),
    rawText: cleanText,
    parsedAt: new Date().toISOString()
  };
}

function estimateExperienceYears(text) {
  const dateRangeRegex = /(20\d{2}|19\d{2})\s*(?:-|to)\s*(20\d{2}|19\d{2}|present|current)/gi;
  let matches;
  let maxDuration = 1;
  const currentYear = new Date().getFullYear();

  while ((matches = dateRangeRegex.exec(text)) !== null) {
    const startYear = parseInt(matches[1], 10);
    const endYearStr = matches[2].toLowerCase();
    const endYear = (endYearStr === 'present' || endYearStr === 'current') ? currentYear : parseInt(endYearStr, 10);
    const duration = endYear - startYear;
    if (duration > 0 && duration < 40) {
      maxDuration = Math.max(maxDuration, duration);
    }
  }
  return maxDuration;
}
