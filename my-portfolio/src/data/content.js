import keurigPortal from "../assets/img/keurig-bi-portal.webp";
import erChatbot from "../assets/img/er-chatbot.webp";
import pawfectHome from "../assets/img/pawfecthome.webp";
import varsitySync from "../assets/img/varsitysync.webp";

export const links = {
  email: "owzhengwei.work@gmail.com",
  linkedin: "https://www.linkedin.com/in/owzhengwei/",
  github: "https://github.com/zzhengweii",
};

export const navItems = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "activities", label: "Activities" },
  { id: "contact", label: "Contact" },
];

export const facts = [
  { term: "Studying", detail: "B.Sc. (Hons) Business Analytics, NUS" },
  {
    term: "Specialising in",
    detail: "Machine Learning and Financial Analytics",
  },
  { term: "GPA", detail: "4.33 / 5.00" },
  { term: "Languages", detail: "English, Chinese" },
];

export const toolkit = [
  {
    group: "Modelling",
    items: [
      "Python",
      "scikit-learn",
      "XGBoost",
      "LightGBM",
      "PyTorch",
      "SHAP",
      "Optuna",
      "Hugging Face",
    ],
  },
  {
    group: "Data and deployment",
    items: ["SQL", "R", "Snowflake", "FastAPI", "Docker", "AWS"],
  },
  {
    group: "Reporting",
    items: ["Power BI", "Tableau", "React"],
  },
];

export const experience = [
  {
    company: "Monee (MariBank)",
    role: "Data Scientist Intern, Risk Modelling",
    period: "Sep 2026 - Present",
    current: true,
    points: [
      "Support independent validation of credit risk, behavioural, anti-fraud and AML models.",
      "Replicate models in Python, then benchmark, back-test and stress test them to judge robustness.",
      "Review emerging AI models, including facial verification and deepfake detection.",
    ],
    tags: ["Credit risk", "Anti-fraud", "AML", "Model validation"],
    figures: [],
  },
  {
    company: "Power Instruments",
    role: "Data Scientist Intern",
    period: "Jan 2026 - Jul 2026",
    points: [
      "Built a Python anomaly-detection system that flags abnormal sensor behaviour across a fleet in near real time, deployed on AWS EC2.",
      "Modelled fuel use on 1.09M+ telemetry rows, benchmarking XGBoost, LightGBM, Random Forest and Ridge with SHAP and Optuna.",
      "Turned down the most accurate model after plausibility and monotonicity tests showed it broke physical constraints.",
    ],
    figures: [
      { value: "300+", label: "vessels monitored" },
      { value: "~8 hrs", label: "saved every week" },
    ],
  },
  {
    company: "Keurig Dr Pepper",
    role: "Data Analyst Intern",
    period: "May 2025 - Dec 2025",
    points: [
      "Moved 20+ sourcing spreadsheets into a React and FastAPI app for tooling cost comparisons.",
      "Automated reporting with Power BI and Python pipelines, lifting operational efficiency by 15%.",
      "Built Copilot Studio agents that cut manual analysis effort by 10%.",
    ],
    figures: [
      { value: "$100K+", label: "in sourcing savings" },
      { value: "10+ hrs", label: "of reporting saved weekly" },
    ],
  },
  {
    company: "East Asia Institute of Management",
    role: "Data Analyst Intern",
    period: "Dec 2024 - Jan 2025",
    points: [
      "Built React dashboards and SQL analyses of operational data for the marketing and sales teams.",
    ],
    figures: [{ value: "25%", label: "efficiency gain" }],
  },
];

export const featuredProject = {
  title: "Vessel eco-speed optimisation",
  org: "Power Instruments",
  year: "2026",
  summary:
    "Recommends the most fuel-efficient speed for a vessel's next voyage, plus an eco-band of settings within 1% of the minimum fuel burn.",
  pipeline: [
    { value: "1.09M+", label: "telemetry rows" },
    { value: "~197K", label: "clean records after 11 cleaning stages" },
    { value: "33", label: "physics-based features" },
    { value: "4", label: "model families benchmarked" },
    { value: "44.26 L/hr", label: "MAE with LightGBM, R² 0.747" },
  ],
  stack: [
    "Python",
    "LightGBM",
    "SHAP",
    "Optuna",
    "FastAPI",
    "Docker",
    "AWS EC2",
  ],
};

export const projects = [
  {
    id: "fraud",
    title: "Fraud detection dashboard",
    year: "2026",
    blurb:
      "One FastAPI service scores PaySim, BAF and IEEE-CIS transactions through dataset adapters, and GPT-4o explains each decision.",
    stack: ["FastAPI", "Python", "GPT-4o"],
    links: [
      {
        kind: "Code",
        href: "https://github.com/zhepaper/is4228-project---fraud-detection",
      },
    ],
    preview: {
      kind: "schematic",
      alt: "Diagram: PaySim, BAF and IEEE-CIS transactions feed one FastAPI scoring service that passes, reviews or blocks each one, with GPT-4o explaining the decision.",
    },
  },
  {
    id: "healthcare",
    title: "Healthcare insurance fraud detection",
    year: "2025",
    blurb:
      "Ensemble model over 550K+ claims with 138 engineered features and Optuna tuning, reaching 94.61% ROC-AUC.",
    stack: ["scikit-learn", "Optuna", "Pandas"],
    links: [
      {
        kind: "Code",
        href: "https://github.com/zzhengweii/insurance-fraud-machine-learning-model/tree/main",
      },
    ],
    preview: {
      kind: "schematic",
      alt: "Diagram: 550K+ claims and 138 features feed six models tuned with Optuna. Extra Trees reaches 94.61% ROC-AUC.",
    },
  },
  {
    id: "keurig",
    title: "Keurig business intelligence portal",
    year: "2025",
    blurb:
      "Full-stack BI app that tracks forecast against actual production across contract manufacturers, factories and models.",
    stack: ["React", "FastAPI", "Pandas"],
    links: [],
    preview: {
      kind: "image",
      src: keurigPortal,
      alt: "Production dashboard from the Keurig BI portal, with figures blurred",
    },
  },
  {
    id: "zweckers",
    title: "ER visualisation and chatbot",
    year: "2025",
    blurb:
      "Turns datasets of up to 10,000 records into entity-relationship diagrams, with a Groq-powered chatbot. Built for SMU Datathon 2025.",
    stack: ["React", "FastAPI", "Firebase"],
    links: [{ kind: "Code", href: "https://github.com/zzhengweii/zweckers" }],
    preview: {
      kind: "image",
      src: erChatbot,
      alt: "Entity selection screen of the ER visualisation app",
    },
  },
  {
    id: "pawfect",
    title: "PawfectHome",
    year: "2025",
    blurb:
      "Pet adoption platform with listings, real-time chat and community features, built by a team of five.",
    stack: ["Vue 3", "Firebase"],
    links: [
      { kind: "Code", href: "https://github.com/zzhengweii/PawfectHome" },
      { kind: "Live", href: "https://pawfecthome-a7b3d.web.app/" },
    ],
    preview: {
      kind: "image",
      src: pawfectHome,
      alt: "PawfectHome landing page with a puppy illustration",
    },
  },
  {
    id: "varsitysync",
    title: "VarsitySync",
    year: "2024",
    blurb:
      "Training and academics planner for NUS student-athletes. Orbital 2024, Apollo 11 level.",
    stack: ["React Native", "Firebase"],
    links: [
      { kind: "Code", href: "https://github.com/thezerohour/VarsitySync" },
    ],
    preview: {
      kind: "image",
      src: varsitySync,
      alt: "VarsitySync mobile app screens",
    },
  },
];

// Dragon boat podiums, in CV order. Distance in metres.
export const races = [
  {
    year: "2023",
    event: "Singapore Water Regatta Festival",
    race: "DB22 200m Premier Men",
    medal: "bronze",
    distance: 200,
  },
  {
    year: "2023",
    event: "Singapore Water Regatta Festival",
    race: "DB22 200m Tertiary Men",
    medal: "silver",
    distance: 200,
  },
  {
    year: "2024",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 500m Tertiary Mixed",
    medal: "gold",
    distance: 500,
  },
  {
    year: "2024",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 1000m Prime Minister's Cup",
    medal: "silver",
    distance: 1000,
  },
  {
    year: "2024",
    event: "Singapore Water Regatta Festival",
    race: "DB22 200m Tertiary Men",
    medal: "silver",
    distance: 200,
  },
  {
    year: "2025",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 500m Tertiary Men",
    medal: "bronze",
    distance: 500,
  },
  {
    year: "2025",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 1000m Prime Minister's Cup",
    medal: "silver",
    distance: 1000,
  },
  {
    year: "2025",
    event: "Singapore Water Regatta Festival",
    race: "DB22 200m Tertiary Men",
    medal: "silver",
    distance: 200,
  },
  {
    year: null,
    event: "Dragon Boat Sprint @ The Kallang",
    race: "DB12 100m Kallang Sprint Open",
    medal: "gold",
    distance: 100,
  },
  {
    year: "2026",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 500m Tertiary Men",
    medal: "silver",
    distance: 500,
  },
  {
    year: "2026",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 500m Premier Men",
    medal: "bronze",
    distance: 500,
  },
  {
    year: "2026",
    event: "Singapore Dragon Boat Festival",
    race: "DB22 1000m Prime Minister's Cup",
    medal: "silver",
    distance: 1000,
  },
];
