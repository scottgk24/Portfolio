export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  type: string;
  href?: string;
  links: ProjectLink[];
  logo: {
    src: string;
    alt: string;
    /** When true, logo already fills a square app-icon canvas. */
    fill?: boolean;
  };
  screenshot: {
    src: string;
    alt: string;
  };
  accent: string;
  surface: string;
};

export const projects: Project[] = [
  {
    id: "pawpoints",
    name: "PawPoints",
    tagline: "Family chore tracker with a shared summer goal",
    description:
      "A mobile-first household app where kids check off daily chores and parents approve days toward a shared goal — earning a real dog. Built with PIN auth, progress celebrations, and a parent portal.",
    stack: ["TypeScript", "Next.js", "PostgreSQL", "Prisma"],
    type: "Web app",
    href: "https://paw-points-zeta.vercel.app",
    links: [
      { label: "Live site", href: "https://paw-points-zeta.vercel.app" },
    ],
    logo: {
      src: "/projects/pawpoints.png",
      alt: "PawPoints logo",
    },
    screenshot: {
      src: "/projects/screens/pawpoints.png",
      alt: "PawPoints home screen with summer dog mission progress",
    },
    accent: "#f59e0b",
    surface: "#0f172a",
  },
  {
    id: "sage",
    name: "SAGE",
    tagline: "Private household and business budgeting",
    description:
      "Invite-only money app with Personal and Business ledgers, Plaid-connected Chase and Robinhood accounts, shared family access, and budgets that stay private by design.",
    stack: ["TypeScript", "Next.js", "Clerk", "Plaid"],
    type: "Web app",
    href: "https://budget-nu-lyart.vercel.app",
    links: [
      { label: "Live site", href: "https://budget-nu-lyart.vercel.app" },
      { label: "Try demo", href: "https://budget-nu-lyart.vercel.app/api/demo" },
    ],
    logo: {
      src: "/projects/sage.png",
      alt: "SAGE owl logo",
    },
    screenshot: {
      src: "/projects/screens/sage.png",
      alt: "SAGE landing page with household and business money headline",
    },
    accent: "#c4a35a",
    surface: "#1a2e1f",
  },
  {
    id: "porchlight",
    name: "Porchlight Studios",
    tagline: "Photography site for a McKinney studio",
    description:
      "Client-facing marketing site for newborn, family, senior, and portrait sessions — portfolio galleries, booking contact, SEO, and prep guides for families before a shoot.",
    stack: ["TypeScript", "Next.js", "Tailwind", "Vercel"],
    type: "Marketing site",
    href: "https://www.porchlightstudios.co",
    links: [
      { label: "Live site", href: "https://www.porchlightstudios.co" },
    ],
    logo: {
      src: "/projects/icons/porchlight.png",
      alt: "Porchlight Studios logo",
      fill: true,
    },
    screenshot: {
      src: "/projects/screens/porchlight.png",
      alt: "Porchlight Studios homepage",
    },
    accent: "#b8956c",
    surface: "#2a221c",
  },
  {
    id: "autocropper",
    name: "AutoCropper",
    tagline: "Subject-aware batch cropping for Mac",
    description:
      "Native macOS desktop app that batch-crops portrait folders to print ratios using Apple Vision for faces and people. Includes best-of selection for school and family sessions — originals stay untouched.",
    stack: ["Swift", "SwiftUI", "Vision", "macOS"],
    type: "Desktop app",
    links: [],
    logo: {
      src: "/projects/autocropper.svg",
      alt: "AutoCropper app icon",
    },
    screenshot: {
      src: "/projects/screens/autocropper.png",
      alt: "AutoCropper Mac app reviewing selected portraits",
    },
    accent: "#5b8fa8",
    surface: "#1a1f24",
  },
];
