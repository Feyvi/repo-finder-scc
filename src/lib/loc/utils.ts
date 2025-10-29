export function sanitizeSegment(s: string) {
  if (!/^[\w.-]+$/.test(s)) throw new Error("Invalid repo/owner");
  return s;
}

export function toDockerMountPath(p: string) {
  if (process.platform === "win32") {
    const drive = p[0].toLowerCase();
    let rest = p.slice(2).replaceAll("\\", "/");
    return `/${drive}${rest}`;
  }
  return p;
}
