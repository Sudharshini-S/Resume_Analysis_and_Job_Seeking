// Exact Technical Skill Dictionary and Extraction Engine
// Guarantees exact, discrete extraction (e.g. C, C++, C#, Java, JavaScript, HTML, CSS, SQL)
// Category labels such as "Frontend:", "Languages:", "Backend:" are ignored and never extracted as skills.

export const CATEGORY_HEADERS = new Set([
  'frontend', 'front-end', 'front end',
  'backend', 'back-end', 'back end',
  'fullstack', 'full-stack', 'full stack',
  'languages', 'programming languages', 'core languages', 'language',
  'technical skills', 'skills', 'key skills', 'core competencies',
  'competencies', 'proficiencies', 'expertise', 'areas of expertise',
  'web technologies', 'technologies', 'tech stack', 'technology stack',
  'databases', 'database', 'dbms', 'storage',
  'cloud', 'devops', 'cloud & devops', 'cloud / devops', 'infrastructure',
  'tools', 'tools & technologies', 'frameworks', 'libraries',
  'frameworks & libraries', 'frameworks and libraries',
  'operating systems', 'os', 'platforms', 'methodologies',
  'software', 'soft skills', 'others', 'miscellaneous', 'summary',
  'experience', 'education', 'certifications', 'projects'
]);

export const SKILLS_DB = [
  // Programming Languages - Distinct and Boundary Protected
  { name: "C", pattern: /(?:^|[^a-zA-Z0-9+#/.-])C(?![a-zA-Z0-9+#/.-])/i, category: "Languages" },
  { name: "C++", pattern: /(?:^|[^a-zA-Z0-9_])(?:c\+\+|cpp|c\s*plus\s*plus)(?![a-zA-Z0-9+#_])/i, category: "Languages" },
  { name: "C#", pattern: /(?:^|[^a-zA-Z0-9_])(?:c#|csharp|c\s*sharp)(?![a-zA-Z0-9+#_])/i, category: "Languages" },
  { name: "Java", pattern: /\bjava\b/i, category: "Languages" },
  { name: "JavaScript", pattern: /\b(?:javascript|ecmascript|es6|es2015)\b/i, category: "Languages" },
  { name: "TypeScript", pattern: /\b(?:typescript)\b/i, category: "Languages" },
  { name: "Python", pattern: /\b(?:python|python3|py)\b/i, category: "Languages" },
  { name: "Ruby", pattern: /\bruby\b/i, category: "Languages" },
  { name: "PHP", pattern: /\bphp\b/i, category: "Languages" },
  { name: "Swift", pattern: /\bswift\b/i, category: "Languages" },
  { name: "Kotlin", pattern: /\bkotlin\b/i, category: "Languages" },
  { name: "Go", pattern: /\b(?:golang|go)\b/i, category: "Languages" },
  { name: "Rust", pattern: /\brust\b/i, category: "Languages" },
  { name: "Scala", pattern: /\bscala\b/i, category: "Languages" },
  { name: "R", pattern: /(?:^|[^a-zA-Z0-9_])(?:r\s*programming|r\s*language|rstudio)(?![a-zA-Z0-9_])/i, category: "Languages" },
  { name: "Dart", pattern: /\bdart\b/i, category: "Languages" },
  { name: "Perl", pattern: /\bperl\b/i, category: "Languages" },
  { name: "MATLAB", pattern: /\bmatlab\b/i, category: "Languages" },
  { name: "Objective-C", pattern: /\bobjective-?c\b/i, category: "Languages" },
  { name: "Assembly", pattern: /\b(?:assembly|asm)\b/i, category: "Languages" },
  { name: "Visual Basic", pattern: /\b(?:vb\.net|visual\s*basic|vba)\b/i, category: "Languages" },
  { name: "Lua", pattern: /\blua\b/i, category: "Languages" },
  { name: "Haskell", pattern: /\bhaskell\b/i, category: "Languages" },
  { name: "Elixir", pattern: /\belixir\b/i, category: "Languages" },
  { name: "Clojure", pattern: /\bclojure\b/i, category: "Languages" },
  { name: "Groovy", pattern: /\bgroovy\b/i, category: "Languages" },
  { name: "Bash", pattern: /\b(?:bash|shell\s*scripting|zsh)\b/i, category: "Languages" },

  // Web & Frontend Technologies - Individual and Specific
  { name: "HTML", pattern: /\b(?:html|html5)\b/i, category: "Frontend" },
  { name: "CSS", pattern: /\b(?:css|css3)\b/i, category: "Frontend" },
  { name: "React", pattern: /\b(?:react|react\.js|reactjs)\b/i, category: "Frontend" },
  { name: "Next.js", pattern: /\b(?:next\.js|nextjs|next)\b/i, category: "Frontend" },
  { name: "Angular", pattern: /\b(?:angular|angularjs|angular\.js)\b/i, category: "Frontend" },
  { name: "Vue.js", pattern: /\b(?:vue|vue\.js|vuejs)\b/i, category: "Frontend" },
  { name: "Nuxt.js", pattern: /\b(?:nuxt|nuxt\.js|nuxtjs)\b/i, category: "Frontend" },
  { name: "Svelte", pattern: /\b(?:svelte|sveltekit)\b/i, category: "Frontend" },
  { name: "jQuery", pattern: /\bjquery\b/i, category: "Frontend" },
  { name: "Tailwind CSS", pattern: /\b(?:tailwind|tailwindcss|tailwind\s*css)\b/i, category: "Frontend" },
  { name: "Bootstrap", pattern: /\bbootstrap\b/i, category: "Frontend" },
  { name: "Sass", pattern: /\b(?:sass|scss)\b/i, category: "Frontend" },
  { name: "LESS", pattern: /\bless\b/i, category: "Frontend" },
  { name: "Redux", pattern: /\bredux\b/i, category: "Frontend" },
  { name: "Zustand", pattern: /\bzustand\b/i, category: "Frontend" },
  { name: "Vite", pattern: /\bvite(?:js)?\b/i, category: "Frontend" },
  { name: "Webpack", pattern: /\bwebpack\b/i, category: "Frontend" },

  // Backend Frameworks & Systems
  { name: "Node.js", pattern: /\b(?:node|node\.js|nodejs)\b/i, category: "Backend" },
  { name: "Express", pattern: /\b(?:express|express\.js|expressjs)\b/i, category: "Backend" },
  { name: "Django", pattern: /\bdjango\b/i, category: "Backend" },
  { name: "Flask", pattern: /\bflask\b/i, category: "Backend" },
  { name: "FastAPI", pattern: /\bfastapi\b/i, category: "Backend" },
  { name: "Spring Boot", pattern: /\b(?:spring\s*boot|springboot|spring\s*framework)\b/i, category: "Backend" },
  { name: ".NET", pattern: /(?:^|[^a-zA-Z0-9_])(?:\.net|dotnet|asp\.net)(?![a-zA-Z0-9_])/i, category: "Backend" },
  { name: "Laravel", pattern: /\blaravel\b/i, category: "Backend" },
  { name: "Ruby on Rails", pattern: /\b(?:rails|ruby\s*on\s*rails)\b/i, category: "Backend" },
  { name: "NestJS", pattern: /\b(?:nestjs|nest\.js)\b/i, category: "Backend" },
  { name: "GraphQL", pattern: /\bgraphql\b/i, category: "Backend" },
  { name: "REST API", pattern: /\b(?:rest\s*api|restful\s*apis?|restful)\b/i, category: "Backend" },
  { name: "gRPC", pattern: /\bgrpc\b/i, category: "Backend" },
  { name: "Microservices", pattern: /\bmicroservices?\b/i, category: "Backend" },

  // Mobile
  { name: "React Native", pattern: /\b(?:react\s*native|reactnative)\b/i, category: "Mobile" },
  { name: "Flutter", pattern: /\bflutter\b/i, category: "Mobile" },
  { name: "Android", pattern: /\bandroid\b/i, category: "Mobile" },
  { name: "iOS", pattern: /\b(?:ios|ios\s*development)\b/i, category: "Mobile" },

  // Databases - Discrete and Separate
  { name: "SQL", pattern: /\bsql\b/i, category: "Database" },
  { name: "MySQL", pattern: /\bmysql\b/i, category: "Database" },
  { name: "PostgreSQL", pattern: /\b(?:postgresql|postgres)\b/i, category: "Database" },
  { name: "MongoDB", pattern: /\b(?:mongodb|mongo)\b/i, category: "Database" },
  { name: "Redis", pattern: /\bredis\b/i, category: "Database" },
  { name: "SQLite", pattern: /\bsqlite\b/i, category: "Database" },
  { name: "Oracle", pattern: /\boracle\s*(?:db|database)?\b/i, category: "Database" },
  { name: "Firebase", pattern: /\bfirebase\b/i, category: "Database" },
  { name: "Firestore", pattern: /\bfirestore\b/i, category: "Database" },
  { name: "Supabase", pattern: /\bsupabase\b/i, category: "Database" },
  { name: "DynamoDB", pattern: /\bdynamodb\b/i, category: "Database" },
  { name: "Cassandra", pattern: /\bcassandra\b/i, category: "Database" },
  { name: "Elasticsearch", pattern: /\belasticsearch\b/i, category: "Database" },
  { name: "Prisma", pattern: /\bprisma\b/i, category: "Database" },

  // Cloud & DevOps
  { name: "AWS", pattern: /\b(?:aws|amazon\s*web\s*services)\b/i, category: "Cloud" },
  { name: "Azure", pattern: /\b(?:azure|microsoft\s*azure)\b/i, category: "Cloud" },
  { name: "GCP", pattern: /\b(?:gcp|google\s*cloud(?:\s*platform)?)\b/i, category: "Cloud" },
  { name: "Docker", pattern: /\bdocker\b/i, category: "DevOps" },
  { name: "Kubernetes", pattern: /\b(?:kubernetes|k8s)\b/i, category: "DevOps" },
  { name: "Terraform", pattern: /\bterraform\b/i, category: "DevOps" },
  { name: "Ansible", pattern: /\bansible\b/i, category: "DevOps" },
  { name: "Jenkins", pattern: /\bjenkins\b/i, category: "DevOps" },
  { name: "CI/CD", pattern: /\b(?:ci\/cd|ci\s*cd|cicd|continuous\s*integration)\b/i, category: "DevOps" },
  { name: "GitHub Actions", pattern: /\bgithub\s*actions\b/i, category: "DevOps" },
  { name: "GitLab CI", pattern: /\bgitlab\s*ci\b/i, category: "DevOps" },
  { name: "Linux", pattern: /\b(?:linux|ubuntu|centos|debian)\b/i, category: "DevOps" },
  { name: "Nginx", pattern: /\bnginx\b/i, category: "DevOps" },
  { name: "Apache", pattern: /\bapache\b/i, category: "DevOps" },

  // Tools & Version Control
  { name: "Git", pattern: /\bgit\b/i, category: "Tools" },
  { name: "GitHub", pattern: /\bgithub\b/i, category: "Tools" },
  { name: "GitLab", pattern: /\bgitlab\b/i, category: "Tools" },
  { name: "Bitbucket", pattern: /\bbitbucket\b/i, category: "Tools" },
  { name: "Postman", pattern: /\bpostman\b/i, category: "Tools" },
  { name: "Jira", pattern: /\bjira\b/i, category: "Tools" },
  { name: "Figma", pattern: /\bfigma\b/i, category: "Tools" },

  // AI, Data Science & Machine Learning
  { name: "Machine Learning", pattern: /\b(?:machine\s*learning|ml)\b/i, category: "Data Science" },
  { name: "Deep Learning", pattern: /\bdeep\s*learning\b/i, category: "Data Science" },
  { name: "Data Science", pattern: /\bdata\s*science\b/i, category: "Data Science" },
  { name: "Pandas", pattern: /\bpandas\b/i, category: "Data Science" },
  { name: "NumPy", pattern: /\bnumpy\b/i, category: "Data Science" },
  { name: "TensorFlow", pattern: /\btensorflow\b/i, category: "Data Science" },
  { name: "PyTorch", pattern: /\bpytorch\b/i, category: "Data Science" },
  { name: "Scikit-learn", pattern: /\b(?:scikit-learn|sklearn)\b/i, category: "Data Science" },
  { name: "NLP", pattern: /\b(?:nlp|natural\s*language\s*processing)\b/i, category: "Data Science" },
  { name: "Computer Vision", pattern: /\bcomputer\s*vision\b/i, category: "Data Science" },
  { name: "Tableau", pattern: /\btableau\b/i, category: "Data Science" },
  { name: "Power BI", pattern: /\bpower\s*bi\b/i, category: "Data Science" },
  { name: "Spark", pattern: /\b(?:apache\s*spark|spark)\b/i, category: "Data Science" },
  { name: "Hadoop", pattern: /\bhadoop\b/i, category: "Data Science" },

  // CS Fundamentals & Methodologies
  { name: "Data Structures", pattern: /\bdata\s*structures\b/i, category: "CS Fundamentals" },
  { name: "Algorithms", pattern: /\balgorithms?\b/i, category: "CS Fundamentals" },
  { name: "System Design", pattern: /\bsystem\s*design\b/i, category: "CS Fundamentals" },
  { name: "OOP", pattern: /\b(?:oop|object\s*oriented\s*programming)\b/i, category: "CS Fundamentals" },
  { name: "Agile", pattern: /\bagile\b/i, category: "Methodology" },
  { name: "Scrum", pattern: /\bscrum\b/i, category: "Methodology" },
  { name: "Unit Testing", pattern: /\bunit\s*testing\b/i, category: "Testing" },
  { name: "Jest", pattern: /\bjest\b/i, category: "Testing" },
  { name: "Cypress", pattern: /\bcypress\b/i, category: "Testing" }
];

/**
 * Normalizes and extracts technical skills with exact fidelity.
 * - Separates C, C++, C#, Java, JavaScript, TypeScript, HTML, CSS, SQL, etc.
 * - Prevents substring false positives (e.g. C will never trigger on CSS or C++).
 * - Ignores category labels (e.g. "Frontend:", "Backend:", "Languages:") so they are never extracted as skills.
 * - Eliminates duplicates while preserving exact canonical name.
 */
export function extractSkillsFromText(text = "") {
  if (!text || typeof text !== 'string') {
    return { foundSkills: [], categorized: {} };
  }

  const rawLines = text.split(/\r?\n/);
  const foundSkillsSet = new Set();
  const categorized = {};

  const addSkill = (skillName, category) => {
    if (!skillName) return;
    foundSkillsSet.add(skillName);
    if (category) {
      if (!categorized[category]) categorized[category] = [];
      if (!categorized[category].includes(skillName)) {
        categorized[category].push(skillName);
      }
    }
  };

  // Process line by line to respect section structures
  for (let line of rawLines) {
    let cleanLine = line.trim();
    if (!cleanLine) continue;

    // Check if the entire line or the prefix is a category header (e.g. "Frontend:", "Languages:", "Technical Skills:")
    const colonIdx = cleanLine.indexOf(':');
    let contentToScan = cleanLine;

    if (colonIdx !== -1) {
      const prefix = cleanLine.substring(0, colonIdx).trim().toLowerCase();
      // If the prefix before the colon is a known category header, strip it
      if (CATEGORY_HEADERS.has(prefix) || prefix.endsWith('skills') || prefix.endsWith('technologies')) {
        contentToScan = cleanLine.substring(colonIdx + 1).trim();
      }
    } else {
      // Line without colon: check if the line itself is just a category header (e.g. "Frontend", "Languages")
      const lower = cleanLine.toLowerCase().replace(/[-_]/g, ' ');
      if (CATEGORY_HEADERS.has(lower)) {
        // Skip header line completely
        continue;
      }
    }

    if (!contentToScan) continue;

    // Split line content by common item delimiters: commas, bullets, pipes, semicolons
    const tokens = contentToScan
      .split(/[,;|•·\u2022\u25CF\u25CB\u2023\u25AA\u25AB\/\\]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      // Skip if the token is a category header keyword
      if (CATEGORY_HEADERS.has(lowerToken)) continue;

      // Check exact token match or pattern match against SKILLS_DB
      for (const entry of SKILLS_DB) {
        if (entry.name.toLowerCase() === lowerToken) {
          addSkill(entry.name, entry.category);
          break;
        } else if (entry.pattern && entry.pattern.test(token)) {
          addSkill(entry.name, entry.category);
          break;
        }
      }
    }

    // Also scan the whole line content for multi-word skills or entries embedded in sentences
    for (const entry of SKILLS_DB) {
      if (entry.pattern && entry.pattern.test(contentToScan)) {
        addSkill(entry.name, entry.category);
      }
    }
  }

  // Also do a full-text scan for all skills in database using boundary-safe regex patterns
  for (const entry of SKILLS_DB) {
    if (entry.pattern && entry.pattern.test(text)) {
      addSkill(entry.name, entry.category);
    }
  }

  return {
    foundSkills: Array.from(foundSkillsSet),
    categorized
  };
}
