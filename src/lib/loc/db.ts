import prisma from "../prisma";
import type { LangMap } from "./sccParser";

export async function getCachedAnalysis(repoUrl: string) {
  return prisma.repoAnalysis.findUnique({ where: { repoUrl } });
}

export async function upsertAnalysis(repoUrl: string, linesOfCode: number, languages: LangMap) {
  return prisma.repoAnalysis.upsert({
    where: { repoUrl },
    update: { linesOfCode, languages },
    create: { repoUrl, linesOfCode, languages },
  });
}
