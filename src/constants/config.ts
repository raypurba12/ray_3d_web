import { site } from "./site";

type TSection = {
  p: string;
  h2: string;
  content?: string;
};

type TConfig = {
  html: {
    title: string;
    fullName: string;
    email: string;
  };
  hero: {
    name: string;
    badge: string;
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
  };
  contact: {
    form: {
      name: {
        span: string;
        placeholder: string;
      };
      email: {
        span: string;
        placeholder: string;
      };
      message: {
        span: string;
        placeholder: string;
      };
    };
  } & TSection;
  footer: {
    tagline: string;
    note: string;
  };
  sections: {
    about: Required<TSection>;
    experience: TSection;
    tech: TSection;
    gallery: Required<TSection>;
    feedbacks: TSection;
    works: Required<TSection>;
  };
};

export const config: TConfig = {
  html: {
    title: site.title,
    fullName: site.name,
    email: site.contactEmail,
  },
  hero: {
    name: "Ray Purba",
    badge: "Available for new projects & creative roles",
    eyebrow: "Creative Developer & WebGL Architect",
    title: "Transforming ideas into",
    titleAccent: "spatial digital experiences.",
    intro:
      "Crafting high-impact 3D web experiences, resilient frontend architectures, and fluid interactions.",
  },
  footer: {
    tagline: "Portfolio Architecture",
    note: "Designed & engineered with React, Three.js, and TypeScript.",
  },
  contact: {
    p: "// INITIATE TRANSMISSION",
    h2: "Get In Touch.",
    form: {
      name: {
        span: "Your Name",
        placeholder: "e.g. Alex Morgan",
      },
      email: {
        span: "Your Email",
        placeholder: "e.g. alex@company.com",
      },
      message: {
        span: "Your Vision",
        placeholder: "Tell me about your project or inquiry...",
      },
    },
  },
  sections: {
    about: {
      p: "// CORE DISCIPLINES",
      h2: "Overview & Craft.",
      content: `I bridge the gap between creative visual computing and robust frontend engineering. With deep focus on React, Three.js/WebGL, and TypeScript, I engineer high-performance web products that feel alive, intuitive, and tactile.`,
    },
    experience: {
      p: "// CAREER LOGS",
      h2: "Experience.",
    },
    tech: {
      p: "// TECHNICAL ARSENAL",
      h2: "Tech Stack.",
    },
    gallery: {
      p: "// VISUAL ARCHIVE",
      h2: "Gallery.",
      content: `Selected frames from 3D experiments, client builds, and visual studies.`,
    },
    feedbacks: {
      p: "// TESTIMONIALS",
      h2: "Collaborations.",
    },
    works: {
      p: "// CURATED SHOWCASE",
      h2: "Selected Works.",
      content: `A selection of digital products, 3D interactive interfaces, and architectural platforms crafted with precision engineering and high visual fidelity.`,
    },
  },
};
