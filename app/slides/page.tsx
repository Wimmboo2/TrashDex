import type { Metadata } from "next";
import { Deck } from "@/components/slides/Deck";
import "./slides.css";

export const metadata: Metadata = {
  title: "TrashDex — Pitch",
  description: "TrashDex pitch deck.",
  robots: { index: false, follow: false },
};

export default function SlidesPage() {
  return <Deck />;
}