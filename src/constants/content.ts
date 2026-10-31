// Single source of placeholder content.
// TODO(ray): replace every placeholder below with real data before deploying.

import {
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  threejs,
} from "../assets";
import type {
  TExperience,
  TNavLink,
  TProject,
  TTechnology,
  TTestimonial,
} from "../types";

// TODO(ray): real contact email.
export const profile = {
  fullName: "Ray Purba",
  email: "raypurba@example.com",
} as const;

export const navigation: TNavLink[] = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "tech", title: "Tech" },
  { id: "work", title: "Work" },
  { id: "gallery", title: "Gallery" },
  { id: "contact", title: "Contact" },
];

export const techStack: TTechnology[] = [
  { name: "HTML 5", icon: html },
  { name: "CSS 3", icon: css },
  { name: "JavaScript", icon: javascript },
  { name: "TypeScript", icon: typescript },
  { name: "React JS", icon: reactjs },
  { name: "Redux Toolkit", icon: redux },
  { name: "Tailwind CSS", icon: tailwind },
  { name: "Node JS", icon: nodejs },
  { name: "MongoDB", icon: mongodb },
  { name: "Three JS", icon: threejs },
  { name: "Git", icon: git },
  { name: "Figma", icon: figma },
  { name: "Docker", icon: docker },
];

// TODO(ray): replace with real roles, companies, dates, and measurable outcomes.
export const experiences: TExperience[] = [
  {
    title: "Senior Creative Developer",
    companyName: "Spatial Studio Lab",
    icon: meta,
    iconBg: "#121216",
    date: "2023 - Present",
    points: [
      "Architected real-time 3D web configurators and WebGL shader experiences delivering 60 FPS across mobile and desktop devices.",
      "Engineered high-performance frontend interfaces with Next.js, TypeScript, and Three.js, cutting page load time by 42%.",
      "Created design systems and micro-interaction libraries adopted across 8 multi-platform client applications.",
      "Mentored junior engineers on WebGL performance budgeting, memory leak prevention, and GPU draw call optimization.",
    ],
  },
  {
    title: "Full Stack Engineer",
    companyName: "Nexus Digital Works",
    icon: shopify,
    iconBg: "#121216",
    date: "2022 - 2023",
    points: [
      "Led the frontend migration of monolithic legacy views to React 18 and TypeScript with strict type boundaries.",
      "Built resilient real-time WebSocket pipelines for enterprise telemetry dashboards serving over 20,000 daily active users.",
      "Streamlined CI/CD build times by 35% through Vite bundling optimizations and code-splitting strategies.",
    ],
  },
  {
    title: "Frontend & UI Engineer",
    companyName: "Vanguard Interactive",
    icon: tesla,
    iconBg: "#121216",
    date: "2021 - 2022",
    points: [
      "Crafted responsive, accessible interactive UI components with Tailwind CSS and Framer Motion for high-profile clients.",
      "Partnered closely with creative directors and 3D artists to translate complex 3D concepts into production WebGL canvases.",
      "Achieved 98+ Lighthouse scores across performance, accessibility, and SEO across client deliveries.",
    ],
  },
];

// TODO(ray): replace with real testimonials and local avatars (not remote placeholders).
export const testimonials: TTestimonial[] = [
  {
    testimonial:
      "Ray's attention to 3D interactive fidelity and frontend performance is extraordinary. He turned our concept into an award-worthy spatial experience.",
    name: "Marcus Vance",
    designation: "Head of Product",
    company: "Verve Spatial",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    testimonial:
      "Rarely do you find an engineer who excels equally at complex WebGL mathematics and clean, scalable React architecture. Ray is a true design engineer.",
    name: "Elena Rostova",
    designation: "Creative Technologist",
    company: "Kinetic Media",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    testimonial:
      "Working with Ray elevated our entire digital presence. Our engagement metrics jumped 65% following the launch of the new interactive platform.",
    name: "David Kim",
    designation: "Co-Founder & CTO",
    company: "Aether Dynamics",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
  },
];

// TODO(ray): replace projects, links, metrics, and thumbnails with real work.
export const projects: TProject[] = [
  {
    name: "Spatial Canvas 3D",
    description:
      "Interactive WebGL spatial product configurator with dynamic PBR shaders, real-time lighting physics, and customized camera orbits.",
    metric: "60 FPS • 85% Lower Payload",
    tags: [
      { name: "threejs", color: "text-acid" },
      { name: "react", color: "text-cyan-400" },
      { name: "typescript", color: "text-blue-400" },
    ],
    image: carrent,
    sourceCodeLink: "https://github.com/",
    liveDemoLink: "https://github.com/",
  },
  {
    name: "Nexus Analytics Architecture",
    description:
      "High-throughput observability dashboard with real-time WebSocket telemetry, interactive charting, and sub-100ms UI interaction latencies.",
    metric: "Sub-100ms Telemetry • 15K DAU",
    tags: [
      { name: "react18", color: "text-cyan-400" },
      { name: "tailwind", color: "text-emerald-400" },
      { name: "nodejs", color: "text-yellow-400" },
    ],
    image: jobit,
    sourceCodeLink: "https://github.com/",
    liveDemoLink: "https://github.com/",
  },
  {
    name: "HyperFlow Creative Engine",
    description:
      "Modern web publishing system with inertia smooth scrolling, responsive bento grid layouts, and keyboard-first command orchestration.",
    metric: "99 Lighthouse • Awwwards Nominee",
    tags: [
      { name: "creative-dev", color: "text-acid" },
      { name: "framer-motion", color: "text-pink-400" },
      { name: "webgl", color: "text-purple-400" },
    ],
    image: tripguide,
    sourceCodeLink: "https://github.com/",
    liveDemoLink: "https://github.com/",
  },
];
