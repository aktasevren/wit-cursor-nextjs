import type { Metadata } from "next";
import { generateMovieMetadata } from "./metadata";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  return await generateMovieMetadata(id);
}

export default function MovieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

