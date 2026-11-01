// Facts come from the owner profile (LLM-Wiki `90 System/about-me.md`, updated 2026-09-09).
// Keep claims here source-faithful; do not add metrics that the profile does not state.

export const links = {
  email: "mailto:nutdnuy@gmail.com",
  medium: "https://nutdnuy.medium.com",
  muckRack: "https://muckrack.com/nuthdanai-wangpratham",
  learn: "https://www.quant-corner.com",
};

export const navigation = [
  { label: "About", href: "#about" },
  { label: "Writing", href: "#writing" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const manifestoRows = [
  { em: "evidence", strong: "over hype" },
  { em: "quant", strong: "for everyone" },
  { em: "ai", strong: "for investment" },
];

/** Words marked `em` render in the italic accent. */
export const statement: { word: string; em?: boolean }[] = [
  { word: "I" },
  { word: "turn" },
  { word: "markets" },
  { word: "into" },
  { word: "questions,", em: true },
  { word: "questions" },
  { word: "into" },
  { word: "experiments,", em: true },
  { word: "and" },
  { word: "experiments" },
  { word: "into" },
  { word: "evidence", em: true },
  { word: "anyone" },
  { word: "can" },
  { word: "check." },
];

export const expertise = [
  "Quantitative Finance",
  "Machine Learning in Finance",
  "Factor Investing",
  "Behavioral Finance",
  "Strategic Asset Allocation",
  "Responsible AI",
];

export const stats = [
  { value: 1.2, decimals: 1, suffix: "K+", label: "Followers on Medium" },
  { value: 2, decimals: 0, suffix: "", label: "Research papers on AI and Thai equities" },
  { value: 5, decimals: 0, suffix: "", label: "Quant projects and communities" },
];

export const essays: { title: string; lang: "en" | "th" }[] = [
  { title: "Quant Investment ต้องรู้อะไรบ้าง", lang: "th" },
  { title: "Why Quants Need to Embrace Behavioral Finance", lang: "en" },
  { title: "Machine Learning in Quantitative Finance", lang: "en" },
  { title: "Time Series Analysis for a Quant Portfolio", lang: "en" },
  { title: "Factor Investing with Machine Learning", lang: "en" },
  { title: "Strategic Asset Allocation with Riskfolio-Lib", lang: "en" },
  { title: "เส้นทางสู่งาน Quant ด้วยการเขียน Medium", lang: "th" },
];

export const research = [
  {
    venue: "SSRN",
    year: "2024",
    title:
      "Comparative Analysis of Financial Sentiment Analysis Models for the Thai Stock Market: Traditional NLP vs. GPT vs. Gemini",
    note: "With Dhouchdhanin Leechewyuwasorn",
  },
  {
    venue: "ResearchGate",
    year: "",
    title: "Leveraging GPT for ESG Integration in Investment Management for Thai Stock",
    note: "AI × ESG × Thai equities",
  },
];

export const projects = [
  {
    name: "QuantCorner",
    role: "Founder · Editorial",
    description: "Quant lessons, explainers and hands-on labs for Thai learners.",
    href: links.learn,
    mark: true,
  },
  {
    name: "Quantsera",
    role: "Community · Platform",
    description: "A quant community and research platform in Thailand.",
  },
  {
    name: "QuantCU",
    role: "Member · Contributor",
    description: "The Quant Club at Chulalongkorn University.",
  },
  {
    name: "QUANT I LOVE U",
    role: "Publication · Medium",
    description: "Long-form writing on quant investing and AI.",
    href: links.medium,
  },
  {
    name: "SprintAI",
    role: "In development",
    description: "An AI project currently being built.",
  },
];
