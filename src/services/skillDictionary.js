// Skill Dictionary and Context-Aware Extraction Engine for TalentTrack

export const CATEGORIES = {
  PROGRAMMING: 'Programming Languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASES: 'Database',
  VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools & Technologies',
  AI_ML: 'AI/ML',
  CLOUD: 'Cloud Computing',
  SOFT_SKILLS: 'Soft Skills',
  SPOKEN: 'Spoken Languages'
};

export const CATEGORY_HEADERS = new Set([
  'skills', 'technical skills', 'core competencies', 'key skills',
  'programming languages', 'programming language', 'languages', 'language',
  'frontend', 'front-end', 'front end', 'web technologies', 'frontend and web technologies',
  'full stack development', 'full stack', 'fullstack',
  'backend', 'back-end', 'back end', 'backend technologies',
  'database', 'databases', 'dbms', 'rdbms',
  'version control', 'version control system', 'tools', 'tools & technologies',
  'tools and technologies', 'tools and version control', 'tools & version control',
  'ai/ml', 'ai / ml', 'artificial intelligence', 'machine learning', 'data science',
  'cloud computing', 'cloud',
  'hardware',
  'soft skills', 'soft skill', 'interpersonal skills',
  'spoken languages', 'languages known', 'languages spoken',
  'certificates', 'certifications', 'projects', 'academic projects'
]);

export const SKILLS_DB = [
  // --- Programming Languages ---
  {
    name: "C",
    category: CATEGORIES.PROGRAMMING,
    isSingleLetter: true,
    aliases: ["c"],
    // Context-aware: only in technical context / skill list
    pattern: /(?:^|[\s,;:(/|•·-])C(?=[\s,;:)/|•·-]|$)/
  },
  {
    name: "C++",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["c++", "cpp", "c plus plus"],
    pattern: /(?:^|[^a-zA-Z0-9_])(?:c\+\+|cpp|c\s*plus\s*plus)(?![a-zA-Z0-9+#_])/i
  },
  {
    name: "C#",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["c#", "csharp", "c sharp"],
    pattern: /(?:^|[^a-zA-Z0-9_])(?:c#|csharp|c\s*sharp)(?![a-zA-Z0-9+#_])/i
  },
  {
    name: "Java",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["java", "core java", "java 8", "java 11", "java 17"],
    pattern: /\bjava\b(?!\s*script|\s*swing)/i // MUST NOT match JavaScript or Java Swing
  },
  {
    name: "Python",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["python", "python3", "py"],
    pattern: /\bpython(?:3)?\b/i
  },
  {
    name: "R",
    category: CATEGORIES.PROGRAMMING,
    isSingleLetter: true,
    aliases: ["r programming", "r language", "rstudio"],
    // Only matches explicit R programming / R language or in explicit programming list
    pattern: /\b(?:r\s*programming|r\s*language|rstudio)\b/i
  },
  {
    name: "Ruby",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["ruby"],
    pattern: /\bruby\b(?!\s*on\s*rails)/i
  },
  {
    name: "PHP",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["php"],
    pattern: /\bphp\b/i
  },
  {
    name: "Swift",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["swift"],
    pattern: /\bswift\b/i
  },
  {
    name: "Kotlin",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["kotlin"],
    pattern: /\bkotlin\b/i
  },
  {
    name: "Go",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["golang", "go language"],
    pattern: /\bgolang\b|\bgo\s*language\b/i
  },
  {
    name: "Rust",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["rust"],
    pattern: /\brust\b/i
  },
  {
    name: "Scala",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["scala"],
    pattern: /\bscala\b/i
  },
  {
    name: "TypeScript",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["typescript", "ts"],
    pattern: /\btypescript\b/i
  },
  {
    name: "Dart",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["dart"],
    pattern: /\bdart\b/i
  },
  {
    name: "Perl",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["perl"],
    pattern: /\bperl\b/i
  },
  {
    name: "Bash",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["bash", "shell scripting", "shell", "zsh"],
    pattern: /\b(?:bash|shell\s*scripting|zsh)\b/i
  },
  {
    name: "Assembly",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["assembly", "asm"],
    pattern: /\b(?:assembly|asm)\b/i
  },
  {
    name: "MATLAB",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["matlab"],
    pattern: /\bmatlab\b/i
  },
  {
    name: "Java Swing",
    category: CATEGORIES.PROGRAMMING,
    aliases: ["java swing", "swing"],
    pattern: /\bjava\s*swing\b/i
  },

  // --- Frontend and Web Technologies ---
  {
    name: "HTML5",
    category: CATEGORIES.FRONTEND,
    aliases: ["html5"],
    pattern: /\bhtml5\b/i
  },
  {
    name: "HTML",
    category: CATEGORIES.FRONTEND,
    aliases: ["html"],
    pattern: /\bhtml\b/i
  },
  {
    name: "CSS3",
    category: CATEGORIES.FRONTEND,
    aliases: ["css3"],
    pattern: /\bcss3\b/i
  },
  {
    name: "CSS",
    category: CATEGORIES.FRONTEND,
    aliases: ["css"],
    pattern: /\bcss\b/i
  },
  {
    name: "MERN Stack",
    category: CATEGORIES.FRONTEND,
    aliases: ["mern stack", "mern", "mern-stack"],
    pattern: /\bmern(?:\s*stack)?\b/i
  },
  {
    name: "JavaScript",
    category: CATEGORIES.FRONTEND,
    aliases: ["javascript", "js", "ecmascript", "es6", "es2015"],
    pattern: /\b(?:javascript|ecmascript|es6)\b/i
  },
  {
    name: "React",
    category: CATEGORIES.FRONTEND,
    aliases: ["react", "react.js", "reactjs"],
    pattern: /\b(?:react|react\.js|reactjs)\b(?!\s*native)/i
  },
  {
    name: "Next.js",
    category: CATEGORIES.FRONTEND,
    aliases: ["next.js", "nextjs", "next"],
    pattern: /\b(?:next\.js|nextjs)\b/i
  },
  {
    name: "Angular",
    category: CATEGORIES.FRONTEND,
    aliases: ["angular", "angularjs", "angular.js"],
    pattern: /\b(?:angular|angularjs|angular\.js)\b/i
  },
  {
    name: "Vue.js",
    category: CATEGORIES.FRONTEND,
    aliases: ["vue", "vue.js", "vuejs"],
    pattern: /\b(?:vue|vue\.js|vuejs)\b/i
  },
  {
    name: "Tailwind CSS",
    category: CATEGORIES.FRONTEND,
    aliases: ["tailwind", "tailwindcss", "tailwind css"],
    pattern: /\b(?:tailwind|tailwindcss|tailwind\s*css)\b/i
  },
  {
    name: "Bootstrap",
    category: CATEGORIES.FRONTEND,
    aliases: ["bootstrap"],
    pattern: /\bbootstrap\b/i
  },
  {
    name: "Sass",
    category: CATEGORIES.FRONTEND,
    aliases: ["sass", "scss"],
    pattern: /\b(?:sass|scss)\b/i
  },
  {
    name: "Redux",
    category: CATEGORIES.FRONTEND,
    aliases: ["redux", "redux toolkit"],
    pattern: /\bredux\b/i
  },
  {
    name: "Svelte",
    category: CATEGORIES.FRONTEND,
    aliases: ["svelte", "sveltekit"],
    pattern: /\b(?:svelte|sveltekit)\b/i
  },
  {
    name: "jQuery",
    category: CATEGORIES.FRONTEND,
    aliases: ["jquery"],
    pattern: /\bjquery\b/i
  },
  {
    name: "Vite",
    category: CATEGORIES.FRONTEND,
    aliases: ["vite", "vitejs"],
    pattern: /\bvite(?:js)?\b/i
  },
  {
    name: "Webpack",
    category: CATEGORIES.FRONTEND,
    aliases: ["webpack"],
    pattern: /\bwebpack\b/i
  },

  // --- Backend Technologies ---
  {
    name: "Node.js",
    category: CATEGORIES.BACKEND,
    aliases: ["node", "node.js", "nodejs"],
    pattern: /\b(?:node|node\.js|nodejs)\b/i
  },
  {
    name: "Express",
    category: CATEGORIES.BACKEND,
    aliases: ["express", "express.js", "expressjs"],
    pattern: /\b(?:express|express\.js|expressjs)\b/i
  },
  {
    name: "Django",
    category: CATEGORIES.BACKEND,
    aliases: ["django"],
    pattern: /\bdjango\b/i
  },
  {
    name: "Flask",
    category: CATEGORIES.BACKEND,
    aliases: ["flask"],
    pattern: /\bflask\b/i
  },
  {
    name: "FastAPI",
    category: CATEGORIES.BACKEND,
    aliases: ["fastapi"],
    pattern: /\bfastapi\b/i
  },
  {
    name: "Spring Boot",
    category: CATEGORIES.BACKEND,
    aliases: ["spring boot", "springboot", "spring framework"],
    pattern: /\b(?:spring\s*boot|springboot|spring\s*framework)\b/i
  },
  {
    name: ".NET",
    category: CATEGORIES.BACKEND,
    aliases: [".net", "dotnet", "asp.net"],
    pattern: /(?:^|[^a-zA-Z0-9_])(?:\.net|dotnet|asp\.net)(?![a-zA-Z0-9_])/i
  },
  {
    name: "Laravel",
    category: CATEGORIES.BACKEND,
    aliases: ["laravel"],
    pattern: /\blaravel\b/i
  },
  {
    name: "Ruby on Rails",
    category: CATEGORIES.BACKEND,
    aliases: ["ruby on rails", "rails"],
    pattern: /\b(?:rails|ruby\s*on\s*rails)\b/i
  },
  {
    name: "NestJS",
    category: CATEGORIES.BACKEND,
    aliases: ["nestjs", "nest.js"],
    pattern: /\b(?:nestjs|nest\.js)\b/i
  },
  {
    name: "GraphQL",
    category: CATEGORIES.BACKEND,
    aliases: ["graphql"],
    pattern: /\bgraphql\b/i
  },
  {
    name: "REST API",
    category: CATEGORIES.BACKEND,
    aliases: ["rest api", "restful api", "restful apis", "rest"],
    pattern: /\b(?:rest\s*api|restful\s*apis?|restful)\b/i
  },
  {
    name: "Microservices",
    category: CATEGORIES.BACKEND,
    aliases: ["microservices", "microservice"],
    pattern: /\bmicroservices?\b/i
  },

  // --- Databases ---
  {
    name: "SQLPlus",
    category: CATEGORIES.DATABASES,
    aliases: ["sqlplus", "sql*plus", "sql plus"],
    pattern: /\b(?:sql\*plus|sqlplus|sql\s*plus)\b/i
  },
  {
    name: "SQL",
    category: CATEGORIES.DATABASES,
    aliases: ["sql"],
    pattern: /\bsql\b(?!\*plus|plus)/i
  },
  {
    name: "PL/SQL",
    category: CATEGORIES.DATABASES,
    aliases: ["pl/sql", "plsql", "pl-sql"],
    pattern: /\b(?:pl\/sql|plsql|pl-sql)\b/i
  },
  {
    name: "MySQL",
    category: CATEGORIES.DATABASES,
    aliases: ["mysql"],
    pattern: /\bmysql\b/i
  },
  {
    name: "PostgreSQL",
    category: CATEGORIES.DATABASES,
    aliases: ["postgresql", "postgres"],
    pattern: /\b(?:postgresql|postgres)\b/i
  },
  {
    name: "MongoDB",
    category: CATEGORIES.DATABASES,
    aliases: ["mongodb", "mongo"],
    pattern: /\b(?:mongodb|mongo)\b/i
  },
  {
    name: "Oracle",
    category: CATEGORIES.DATABASES,
    aliases: ["oracle", "oracle db", "oracle database", "oracle sql"],
    pattern: /\boracle(?:\s*(?:db|database|sql))?\b/i
  },
  {
    name: "SQL Server",
    category: CATEGORIES.DATABASES,
    aliases: ["sql server", "mssql", "t-sql"],
    pattern: /\b(?:sql\s*server|mssql|t-sql)\b/i
  },
  {
    name: "Redis",
    category: CATEGORIES.DATABASES,
    aliases: ["redis"],
    pattern: /\bredis\b/i
  },
  {
    name: "SQLite",
    category: CATEGORIES.DATABASES,
    aliases: ["sqlite"],
    pattern: /\bsqlite\b/i
  },
  {
    name: "Firebase",
    category: CATEGORIES.DATABASES,
    aliases: ["firebase"],
    pattern: /\bfirebase\b/i
  },
  {
    name: "Firestore",
    category: CATEGORIES.DATABASES,
    aliases: ["firestore"],
    pattern: /\bfirestore\b/i
  },
  {
    name: "Supabase",
    category: CATEGORIES.DATABASES,
    aliases: ["supabase"],
    pattern: /\bsupabase\b/i
  },
  {
    name: "DynamoDB",
    category: CATEGORIES.DATABASES,
    aliases: ["dynamodb"],
    pattern: /\bdynamodb\b/i
  },
  {
    name: "Cassandra",
    category: CATEGORIES.DATABASES,
    aliases: ["cassandra"],
    pattern: /\bcassandra\b/i
  },
  {
    name: "Elasticsearch",
    category: CATEGORIES.DATABASES,
    aliases: ["elasticsearch"],
    pattern: /\belasticsearch\b/i
  },
  {
    name: "Prisma",
    category: CATEGORIES.DATABASES,
    aliases: ["prisma"],
    pattern: /\bprisma\b/i
  },

  // --- Version Control ---
  {
    name: "GitHub",
    category: CATEGORIES.VERSION_CONTROL,
    aliases: ["github"],
    pattern: /\bgithub\b/i
  },
  {
    name: "Git",
    category: CATEGORIES.VERSION_CONTROL,
    aliases: ["git"],
    pattern: /\bgit\b(?!\s*hub|\s*lab)/i
  },
  {
    name: "GitLab",
    category: CATEGORIES.VERSION_CONTROL,
    aliases: ["gitlab"],
    pattern: /\bgitlab\b/i
  },
  {
    name: "Bitbucket",
    category: CATEGORIES.VERSION_CONTROL,
    aliases: ["bitbucket"],
    pattern: /\bbitbucket\b/i
  },
  {
    name: "Docker",
    category: CATEGORIES.TOOLS,
    aliases: ["docker"],
    pattern: /\bdocker\b/i
  },
  {
    name: "Kubernetes",
    category: CATEGORIES.TOOLS,
    aliases: ["kubernetes", "k8s"],
    pattern: /\b(?:kubernetes|k8s)\b/i
  },
  {
    name: "Postman",
    category: CATEGORIES.TOOLS,
    aliases: ["postman"],
    pattern: /\bpostman\b/i
  },
  {
    name: "Jira",
    category: CATEGORIES.TOOLS,
    aliases: ["jira"],
    pattern: /\bjira\b/i
  },
  {
    name: "Figma",
    category: CATEGORIES.TOOLS,
    aliases: ["figma"],
    pattern: /\bfigma\b/i
  },
  {
    name: "Jenkins",
    category: CATEGORIES.TOOLS,
    aliases: ["jenkins"],
    pattern: /\bjenkins\b/i
  },
  {
    name: "CI/CD",
    category: CATEGORIES.TOOLS,
    aliases: ["ci/cd", "ci cd", "cicd"],
    pattern: /\b(?:ci\/cd|ci\s*cd|cicd)\b/i
  },
  {
    name: "Linux",
    category: CATEGORIES.TOOLS,
    aliases: ["linux", "ubuntu", "debian", "centos"],
    pattern: /\b(?:linux|ubuntu|debian|centos)\b/i
  },
  {
    name: "AWS",
    category: CATEGORIES.TOOLS,
    aliases: ["aws", "amazon web services"],
    pattern: /\b(?:aws|amazon\s*web\s*services)\b/i
  },
  {
    name: "Azure",
    category: CATEGORIES.TOOLS,
    aliases: ["azure", "microsoft azure"],
    pattern: /\b(?:azure|microsoft\s*azure)\b/i
  },

  // --- AI/ML & Data Science ---
  {
    name: "Computer Vision",
    category: CATEGORIES.AI_ML,
    aliases: ["computer vision", "cv"],
    pattern: /\bcomputer\s*vision\b/i
  },
  {
    name: "Scikit-learn",
    category: CATEGORIES.AI_ML,
    aliases: ["scikit-learn", "scikit learn", "sklearn"],
    pattern: /\b(?:scikit[\s-]learn|sklearn)\b/i
  },
  {
    name: "KNN",
    category: CATEGORIES.AI_ML,
    aliases: ["knn", "k-nearest neighbors", "k nearest neighbors"],
    pattern: /\bknn\b/i
  },
  {
    name: "SVM",
    category: CATEGORIES.AI_ML,
    aliases: ["svm", "support vector machine", "support vector machines"],
    pattern: /\bsvm\b/i
  },
  {
    name: "Data Processing",
    category: CATEGORIES.AI_ML,
    aliases: ["data processing"],
    pattern: /\bdata\s*processing\b/i
  },

  // --- Cloud Computing ---
  {
    name: "Cloud Storage",
    category: CATEGORIES.CLOUD,
    aliases: ["cloud storage", "google cloud storage"],
    pattern: /\bcloud\s*storage\b/i
  },

  // --- Hardware & Tools ---
  {
    name: "Troubleshooting",
    category: CATEGORIES.TOOLS,
    aliases: ["troubleshooting", "hardware troubleshooting"],
    pattern: /\btroubleshooting\b/i
  },

  // --- Soft Skills ---
  {
    name: "Problem Solving",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["problem solving", "problem-solving"],
    pattern: /\bproblem[\s-]solving\b/i
  },
  {
    name: "Teamwork",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["teamwork", "team work", "team player", "collaboration"],
    pattern: /\b(?:teamwork|team\s*work|team\s*player|collaboration)\b/i
  },
  {
    name: "Communication",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["communication", "communication skills"],
    pattern: /\bcommunication(?:\s*skills)?\b/i
  },
  {
    name: "Leadership",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["leadership"],
    pattern: /\bleadership\b/i
  },
  {
    name: "Time Management",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["time management"],
    pattern: /\btime\s*management\b/i
  },
  {
    name: "Critical Thinking",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["critical thinking"],
    pattern: /\bcritical\s*thinking\b/i
  },
  {
    name: "Adaptability",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["adaptability"],
    pattern: /\badaptability\b/i
  },
  {
    name: "Analytical Skills",
    category: CATEGORIES.SOFT_SKILLS,
    aliases: ["analytical skills", "analytical thinking"],
    pattern: /\banalytical(?:\s*(?:skills|thinking))?\b/i
  },

  // --- Spoken Languages ---
  {
    name: "English",
    category: CATEGORIES.SPOKEN,
    aliases: ["english"],
    pattern: /\benglish\b/i
  },
  {
    name: "Tamil",
    category: CATEGORIES.SPOKEN,
    aliases: ["tamil"],
    pattern: /\btamil\b/i
  },
  {
    name: "Hindi",
    category: CATEGORIES.SPOKEN,
    aliases: ["hindi"],
    pattern: /\bhindi\b/i
  },
  {
    name: "Spanish",
    category: CATEGORIES.SPOKEN,
    aliases: ["spanish"],
    pattern: /\bspanish\b/i
  },
  {
    name: "French",
    category: CATEGORIES.SPOKEN,
    aliases: ["french"],
    pattern: /\bfrench\b/i
  },
  {
    name: "German",
    category: CATEGORIES.SPOKEN,
    aliases: ["german"],
    pattern: /\bgerman\b/i
  },
  {
    name: "Telugu",
    category: CATEGORIES.SPOKEN,
    aliases: ["telugu"],
    pattern: /\btelugu\b/i
  },
  {
    name: "Malayalam",
    category: CATEGORIES.SPOKEN,
    aliases: ["malayalam"],
    pattern: /\bmalayalam\b/i
  },
  {
    name: "Kannada",
    category: CATEGORIES.SPOKEN,
    aliases: ["kannada"],
    pattern: /\bkannada\b/i
  },
  {
    name: "Bengali",
    category: CATEGORIES.SPOKEN,
    aliases: ["bengali"],
    pattern: /\bbengali\b/i
  }
];

// Build fast alias lookup map (lowercase alias -> DB Entry)
const ALIAS_LOOKUP = new Map();
for (const entry of SKILLS_DB) {
  ALIAS_LOOKUP.set(entry.name.toLowerCase(), entry);
  for (const alias of (entry.aliases || [])) {
    ALIAS_LOOKUP.set(alias.toLowerCase(), entry);
  }
}

const SPOKEN_LANGUAGES_LOWER = new Set([
  'english', 'tamil', 'hindi', 'spanish', 'french', 'german', 'telugu',
  'malayalam', 'kannada', 'bengali', 'japanese', 'mandarin', 'chinese', 'arabic', 'russian'
]);

/**
 * Returns skill metadata (canonical name & category) from dictionary if recognized.
 */
export function getSkillInfo(nameOrAlias) {
  if (!nameOrAlias || typeof nameOrAlias !== 'string') return null;
  const lower = nameOrAlias.trim().toLowerCase();
  return ALIAS_LOOKUP.get(lower) || null;
}

/**
 * Extracts skills from resume text with exact fidelity, context-aware validation, and precise categorization.
 */
export function extractSkillsFromText(text = "") {
  if (!text || typeof text !== 'string') {
    return { foundSkills: [], categorized: {} };
  }

  const rawLines = text.split(/\r?\n/);
  const foundMap = new Map(); // lowercase canonical -> canonical name
  const categorized = {};

  const addSkill = (rawToken, defaultCategory = null) => {
    if (!rawToken) return;
    const tokenClean = rawToken.trim();
    if (!tokenClean || tokenClean.length < 1 || tokenClean.length > 40) return;

    const lower = tokenClean.toLowerCase();
    if (CATEGORY_HEADERS.has(lower)) return;

    let canonicalName = tokenClean;
    let finalCategory = defaultCategory;

    // 1. Check dictionary by exact name or alias
    if (ALIAS_LOOKUP.has(lower)) {
      const entry = ALIAS_LOOKUP.get(lower);
      canonicalName = entry.name;
      finalCategory = defaultCategory || entry.category;
    } else {
      // If defaultCategory is not provided (e.g. from Technologies Used: or outside explicit headers),
      // do not treat unrecognized arbitrary words as technical skills.
      if (!defaultCategory) {
        return;
      }
      // Clean up common casing for non-dictionary exact items in dedicated skill sections
      if (tokenClean === tokenClean.toLowerCase()) {
        canonicalName = tokenClean.charAt(0).toUpperCase() + tokenClean.slice(1);
      }
    }

    if (!finalCategory) {
      finalCategory = CATEGORIES.PROGRAMMING;
    }

    // Single-letter guards:
    // C must only be extracted under Programming Languages
    if (canonicalName === 'C' && finalCategory !== CATEGORIES.PROGRAMMING) {
      return;
    }
    // R must never be extracted without explicit technical context
    if (canonicalName === 'R' && !ALIAS_LOOKUP.has(lower)) {
      return;
    }

    // Save skill uniquely
    foundMap.set(canonicalName.toLowerCase(), canonicalName);

    if (!categorized[finalCategory]) {
      categorized[finalCategory] = [];
    }
    if (!categorized[finalCategory].includes(canonicalName)) {
      categorized[finalCategory].push(canonicalName);
    }
  };

  let inSkillsSection = false;

  // Split multi-column lines (e.g. "Programming Languages : Java, C...   Frontend : HTML, CSS...")
  const multiHeaderRegex = /(?:^|\s{2,}|\t)(programming\s+languages?|frontend|front-end|full\s*stack(?:\s+development)?|backend|back-end|databases?|version\s+control|tools\s*(?:&|and)\s*technologies|tools|ai\s*\/\s*ml|artificial\s+intelligence|machine\s+learning|data\s+science|cloud(?:\s+computing)?|hardware|soft\s+skills?|spoken\s+languages?|languages?)\s*:/gi;

  const lines = [];
  for (const rawLine of rawLines) {
    const matches = [...rawLine.matchAll(multiHeaderRegex)];
    if (matches.length > 1) {
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + (matches[i][0].startsWith(' ') || matches[i][0].startsWith('\t') ? matches[i][0].search(/\S/) : 0);
        const end = (i + 1 < matches.length) ? matches[i + 1].index : rawLine.length;
        const part = rawLine.substring(start, end).trim();
        if (part) lines.push(part);
      }
    } else {
      lines.push(rawLine);
    }
  }

  // PASS 1: Line-by-line structured header & category extraction
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const lowerLine = cleanLine.toLowerCase();

    // Detect general Skills heading
    if (
      lowerLine === 'skills' ||
      lowerLine === 'skills:' ||
      lowerLine === 'technical skills' ||
      lowerLine === 'technical skills:' ||
      lowerLine === 'key skills' ||
      lowerLine === 'core competencies'
    ) {
      inSkillsSection = true;
      continue;
    }

    // Detect section transitions out of skills
    if (
      lowerLine.startsWith('experience') ||
      lowerLine.startsWith('work experience') ||
      lowerLine.startsWith('employment') ||
      lowerLine.startsWith('education') ||
      lowerLine.startsWith('projects') ||
      lowerLine.startsWith('certifications') ||
      lowerLine.startsWith('certificates')
    ) {
      inSkillsSection = false;
    }

    // Check for colon-separated categories (e.g. "Programming Languages: Java, C, Python, C++")
    const colonIdx = cleanLine.indexOf(':');
    if (colonIdx !== -1) {
      const rawHeader = cleanLine.substring(0, colonIdx);
      const headerPart = rawHeader.replace(/^[*•·\-\s]+/, '').trim().toLowerCase();
      const contentPart = cleanLine.substring(colonIdx + 1).trim();

      let targetCategory = null;

      if (headerPart.includes('programming') || (headerPart.includes('language') && !headerPart.includes('spoken') && !isSpokenLanguageList(contentPart))) {
        targetCategory = CATEGORIES.PROGRAMMING;
      } else if (headerPart.includes('spoken') || (headerPart.includes('language') && isSpokenLanguageList(contentPart))) {
        targetCategory = CATEGORIES.SPOKEN;
      } else if (headerPart.includes('frontend') || headerPart.includes('front-end') || headerPart.includes('web') || headerPart.includes('full stack')) {
        targetCategory = CATEGORIES.FRONTEND;
      } else if (headerPart.includes('backend') || headerPart.includes('back-end')) {
        targetCategory = CATEGORIES.BACKEND;
      } else if (headerPart.includes('database') || headerPart.includes('dbms')) {
        targetCategory = CATEGORIES.DATABASES;
      } else if (headerPart.includes('version control')) {
        targetCategory = CATEGORIES.VERSION_CONTROL;
      } else if (headerPart.includes('ai') || headerPart.includes('ml') || headerPart.includes('machine learning') || headerPart.includes('data science')) {
        targetCategory = CATEGORIES.AI_ML;
      } else if (headerPart.includes('cloud')) {
        targetCategory = CATEGORIES.CLOUD;
      } else if (headerPart.includes('tools') || headerPart.includes('hardware')) {
        targetCategory = CATEGORIES.TOOLS;
      } else if (headerPart.includes('soft skill') || headerPart.includes('interpersonal')) {
        targetCategory = CATEGORIES.SOFT_SKILLS;
      } else if (headerPart.includes('technolog') || inSkillsSection) {
        targetCategory = null; // Let dictionary categorize tokens
      }

      if (contentPart) {
        // Split by comma, semicolon, bullet, pipe, tab, or parentheses
        const tokens = contentPart
          .split(/[,;|•·\u2022\u25CF\u25CB\u2023\u25AA\u25AB\t()]+/)
          .map(t => t.trim())
          .filter(Boolean);

        for (const token of tokens) {
          addSkill(token, targetCategory);
        }
        continue;
      }
    }

    // Inside a skills section without colons (e.g. bullet points)
    if (inSkillsSection) {
      const tokens = cleanLine
        .split(/[,;|•·\u2022\u25CF\u25CB\u2023\u25AA\u25AB\t]+/)
        .map(t => t.trim())
        .filter(Boolean);

      for (const token of tokens) {
        const lowerToken = token.toLowerCase();
        if (ALIAS_LOOKUP.has(lowerToken)) {
          const entry = ALIAS_LOOKUP.get(lowerToken);
          addSkill(entry.name, entry.category);
        }
      }
    }
  }

  // PASS 2: Full-text dictionary regex matching with context-awareness
  // Single-letter skills like C and R are NEVER matched globally across random text.
  for (const entry of SKILLS_DB) {
    if (foundMap.has(entry.name.toLowerCase())) continue;

    // Single-letter skills C and R require explicit technical context
    if (entry.isSingleLetter) {
      if (entry.name === 'C') {
        // Only match C if explicitly mentioned alongside other programming languages (e.g. C/C++, Java, C)
        const cInTechContext = /\b(?:programming|languages?|coding|skills?)\b[\s\S]{0,100}\bC\b/i.test(text) ||
                               /(?:^|[\s,;:(/|•·-])C(?=[\s,;:)/|•·-]\s*(?:C\+\+|Java|Python|C#))/i.test(text);
        if (cInTechContext) {
          addSkill(entry.name, entry.category);
        }
      } else if (entry.name === 'R') {
        // Only match R if explicitly mentioned as "R programming", "R language", "RStudio" or in a data science language list
        const rInTechContext = /\b(?:r\s*programming|r\s*language|rstudio)\b/i.test(text) ||
                               /\b(?:Python|SAS|SPSS|MATLAB)\s*[,&/]\s*R\b/i.test(text);
        if (rInTechContext) {
          addSkill(entry.name, entry.category);
        }
      }
      continue;
    }

    // Multi-letter skills using word-boundary regex
    if (entry.pattern && entry.pattern.test(text)) {
      addSkill(entry.name, entry.category);
    }
  }

  // Filter out empty categories
  const filteredCategorized = {};
  for (const [catName, skillList] of Object.entries(categorized)) {
    if (skillList && skillList.length > 0) {
      filteredCategorized[catName] = skillList;
    }
  }

  return {
    foundSkills: Array.from(foundMap.values()),
    categorized: filteredCategorized
  };
}

function isSpokenLanguageList(text) {
  const lower = text.toLowerCase();
  for (const lang of SPOKEN_LANGUAGES_LOWER) {
    if (lower.includes(lang)) return true;
  }
  return false;
}
