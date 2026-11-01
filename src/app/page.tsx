import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";
import type { Metadata } from "next";
import { NuthSite } from "@/components/nuth/NuthSite";
import "./nuth.css";

const description =
  "Nuthdanai Wangpratham — quant, writer and researcher in Bangkok, working on AI for investment, behavioral finance and quant education.";

export const metadata: Metadata = {
  title: { absolute: "Nuthdanai Wangpratham — Quant & AI for Investment" },
  description,
  alternates: { canonical: "https://www.quant-corner.com/NuthdanaiWangpratham" },
  openGraph: {
    type: "profile",
    title: "Nuthdanai Wangpratham — Quant & AI for Investment",
    description,
  },
};

export default function NuthdanaiWangprathamPage() {
  return <NuthSite />;
}
