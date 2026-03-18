import fs from "node:fs"
import path from "node:path"

function extractFrontmatterBlock(markdown) {
  if (!markdown.startsWith("---")) return null
  const end = markdown.indexOf("\n---", 3)
  if (end === -1) return null
  return markdown.slice(3, end)
}

function extractFrontmatterValue(markdown, key) {
  const block = extractFrontmatterBlock(markdown)
  if (!block) return null
  const line = block
    .split("\n")
    .map((l) => l.trim())
    .find((l) => new RegExp(`^${key}\\s*:`).test(l))
  if (!line) return null
  const value = line.replace(new RegExp(`^${key}\\s*:\\s*`), "").trim()
  if (!value) return null
  return value.replace(/^["']|["']$/g, "")
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown
  const end = markdown.indexOf("\n---", 3)
  if (end === -1) return markdown
  return markdown.slice(end + 4)
}

function extractTitle(markdown, fallback) {
  const fmTitle = extractFrontmatterValue(markdown, "title")
  if (fmTitle) return fmTitle
  const body = stripFrontmatter(markdown)
  const match = body.match(/^\s*#\s+(.+)\s*$/m)
  return (match?.[1] ?? fallback).trim()
}

function extractDescription(markdown) {
  const fmDescription =
    extractFrontmatterValue(markdown, "description") ?? extractFrontmatterValue(markdown, "summary")
  if (fmDescription) return fmDescription
  const body = stripFrontmatter(markdown)
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "\n")

  const lines = body.split("\n").map((l) => l.trim())
  const meaningful = lines.filter((l) => {
    if (!l) return false
    if (l.startsWith("#")) return false
    if (l.startsWith(">")) return false
    if (l.startsWith("---")) return false
    return true
  })

  if (!meaningful.length) return ""

  const first = meaningful[0]
  return first.length > 140 ? `${first.slice(0, 140)}…` : first
}

function urlFromFile(docsDir, absoluteFilePath) {
  const rel = path.relative(docsDir, absoluteFilePath)
  const withoutExt = rel.replace(/\.md$/i, "")
  return `/${withoutExt.split(path.sep).join("/")}`.replace(/\/index$/, "/")
}

function parseYearMonthFromPath(absoluteFilePath) {
  const parts = absoluteFilePath.split(path.sep)
  const yearIndex = parts.findIndex((p) => /^\d{4}$/.test(p))
  if (yearIndex === -1) return null
  const year = Number(parts[yearIndex])
  const month = Number(parts[yearIndex + 1])
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null
  if (month < 1 || month > 12) return null
  return { year, month }
}

export default {
  watch: ["./202*/**/*.md"],
  load(watchedFiles) {
    const docsDir = path.resolve(process.cwd(), "docs")

    const candidates = watchedFiles
      .filter((file) => file.toLowerCase().endsWith(".md"))
      .map((file) => {
        const stat = fs.statSync(file)
        const markdown = fs.readFileSync(file, "utf8")
        const base = path.basename(file).replace(/\.md$/i, "")
        const ym = parseYearMonthFromPath(file)

        return {
          url: urlFromFile(docsDir, file),
          title: extractTitle(markdown, base),
          description: extractDescription(markdown),
          mtimeMs: stat.mtimeMs,
          year: ym?.year ?? 0,
          month: ym?.month ?? 0
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        if (a.month !== b.month) return b.month - a.month
        return b.mtimeMs - a.mtimeMs
      })

    return candidates[0] ?? null
  }
}
