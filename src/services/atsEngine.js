import { extractSkillsFromText } from './skillDictionary';

export function analyzeAtsMatch(parsedResume, jobDescriptionText = "", jobTitle = "Target Role", targetRequiredSkills = [], minRequiredExperience = 0) {
  const resumeText = (parsedResume.rawText || "").toLowerCase();
  const jdText = (jobDescriptionText || "").toLowerCase();

  // Extract skills from JD text if provided
  const jdSkillsExtracted = extractSkillsFromText(jobDescriptionText);
  
  // Combine required skills preserving original casing
  const skillMap = new Map();
  targetRequiredSkills.forEach(s => {
    if (s && s.trim()) skillMap.set(s.trim().toLowerCase(), s.trim());
  });
  jdSkillsExtracted.foundSkills.forEach(s => {
    if (s && !skillMap.has(s.toLowerCase())) skillMap.set(s.toLowerCase(), s);
  });

  const resumeSkills = (parsedResume.skills || []);
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));

  const matchedSkills = [];
  const missingSkills = [];

  skillMap.forEach((originalName, lowerKey) => {
    let isMatched = resumeSkillsLower.has(lowerKey);

    if (!isMatched) {
      // Boundary-safe regex search in full resume text
      const escaped = lowerKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#_])${escaped}(?:$|[^a-zA-Z0-9+#_])`, 'i');
      isMatched = regex.test(resumeText);
    }

    if (isMatched) {
      matchedSkills.push(originalName);
    } else {
      missingSkills.push(originalName);
    }
  });

  const totalJdSkillsCount = skillMap.size;
  const skillMatchRatio = totalJdSkillsCount > 0 ? (matchedSkills.length / totalJdSkillsCount) : (resumeSkills.length > 0 ? 0.85 : 0.4);
  const skillScore = Math.min(100, Math.round(skillMatchRatio * 100));

  const candidateExp = parsedResume.experienceYears || 0;
  const requiredExp = minRequiredExperience || 1;
  let experienceScore = 100;
  if (candidateExp < requiredExp) {
    const diff = requiredExp - candidateExp;
    experienceScore = Math.max(30, 100 - (diff * 20));
  }

  let keywordMatchCount = 0;
  const jdWords = jdText.split(/\W+/).filter(w => w.length > 3);
  const uniqueJdWords = Array.from(new Set(jdWords));
  uniqueJdWords.forEach(word => {
    if (resumeText.includes(word)) {
      keywordMatchCount++;
    }
  });
  const keywordScore = uniqueJdWords.length > 0 ? Math.min(100, Math.round((keywordMatchCount / uniqueJdWords.length) * 120)) : 80;

  let formattingScore = 100;
  const formattingDeductions = [];

  if (!parsedResume.email) {
    formattingScore -= 20;
    formattingDeductions.push("Missing contact email");
  }
  if (!parsedResume.phone) {
    formattingScore -= 15;
    formattingDeductions.push("Missing phone number");
  }
  if (!parsedResume.education || parsedResume.education.length === 0) {
    formattingScore -= 20;
    formattingDeductions.push("No explicit Education section found");
  }
  if ((parsedResume.skills || []).length < 3) {
    formattingScore -= 25;
    formattingDeductions.push("Fewer than 3 skills listed in Skills section");
  }

  formattingScore = Math.max(20, formattingScore);

  const totalAtsScore = Math.round(
    (skillScore * 0.40) +
    (experienceScore * 0.30) +
    (keywordScore * 0.20) +
    (formattingScore * 0.10)
  );

  const suggestions = generateImprovementSuggestions({
    totalAtsScore,
    skillScore,
    experienceScore,
    formattingScore,
    missingSkills,
    candidateExp,
    requiredExp,
    parsedResume,
    jobTitle
  });

  return {
    jobTitle,
    totalAtsScore,
    breakdown: {
      skillScore,
      experienceScore,
      keywordScore,
      formattingScore
    },
    matchedSkills,
    missingSkills,
    totalJdSkillsCount,
    candidateExperienceYears: candidateExp,
    requiredExperienceYears: requiredExp,
    formattingDeductions,
    suggestions,
    analyzedAt: new Date().toISOString()
  };
}

function generateImprovementSuggestions({
  totalAtsScore,
  skillScore,
  missingSkills,
  candidateExp,
  requiredExp,
  parsedResume
}) {
  const suggestions = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 5).join(', ');
    suggestions.push({
      category: "Skill Enhancement",
      impact: "High",
      icon: "zap",
      title: `Incorporate missing core skills: ${topMissing}`,
      description: `The target Job Description specifically mentions ${topMissing}. Add these skills into your Skills section and highlight projects where you used them.`
    });
  }

  if (skillScore < 70) {
    suggestions.push({
      category: "Keyword Alignment",
      impact: "High",
      icon: "target",
      title: "Align resume terminology with Job Description keywords",
      description: "Use exact phrases and industry standard terms found in the target position posting to ensure automated ATS filters rank your resume higher."
    });
  }

  if (candidateExp < requiredExp) {
    suggestions.push({
      category: "Experience Highlight",
      impact: "Medium",
      icon: "briefcase",
      title: `Highlight key achievements to bridge the ${requiredExp - candidateExp} year experience gap`,
      description: `Focus on project outcomes, quantifiable metrics (e.g., 'Increased performance by 40%'), and leadership responsibilities to compensate for required years.`
    });
  }

  if (!parsedResume.links || (!parsedResume.links.linkedin && !parsedResume.links.github)) {
    suggestions.push({
      category: "Profile Completeness",
      impact: "Medium",
      icon: "link",
      title: "Include active professional links (LinkedIn & GitHub)",
      description: "Adding links to your online portfolio, GitHub code repositories, or LinkedIn profile increases candidate credibility score by 15%."
    });
  }

  suggestions.push({
    category: "Action Verbs",
    impact: "Low",
    icon: "file-text",
    title: "Start bullet points with strong impact action verbs",
    description: "Replace passive statements with strong verbs such as 'Architected', 'Engineered', 'Optimized', 'Deployed', and 'Spearheaded'."
  });

  return suggestions;
}
