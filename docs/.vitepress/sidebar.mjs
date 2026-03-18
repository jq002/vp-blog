import fs from "node:fs"
import path from "node:path"

function isYearDir(name) {
  return /^\d{4}$/.test(name)
}

function normalizeMonthDir(name) {
  if (!/^\d{1,2}$/.test(name)) return null
  const month = Number(name)
  if (!Number.isFinite(month) || month < 1 || month > 12) return null
  return String(month).padStart(2, "0")
}

function normalizePathToLink(p) {
  return `/${p.split(path.sep).join("/")}`.replace(/\/index$/, "/")
}

function titleFromFilename(filename) {
  const base = filename.replace(/\.md$/i, "")
  const spaced = base.replace(/[-_]+/g, " ").trim()
  if (!spaced) return base
  return spaced.replace(/\b\w/g, (m) => m.toUpperCase())
}

function extractTitleFromMarkdown(absoluteFilePath) {
  const content = fs.readFileSync(absoluteFilePath, "utf8")
  if (content.startsWith("---")) {
    const end = content.indexOf("\n---", 3)
    if (end !== -1) {
      const fm = content.slice(3, end).split("\n")
      const titleLine = fm.find((l) => /^\s*title\s*:\s*/i.test(l))
      if (titleLine) {
        const value = titleLine.replace(/^\s*title\s*:\s*/i, "").trim()
        if (value) return value.replace(/^["']|["']$/g, "")
      }
    }
  }

  const headingMatch = content.match(/^\s*#\s+(.+)\s*$/m)
  if (headingMatch?.[1]) return headingMatch[1].trim()

  return null
}

function listDirNames(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".md"))
    .map((d) => d.name)
}

function buildItemsForDir(docsDir, relativeDir) {
  const absoluteDir = path.join(docsDir, relativeDir)
  const files = listMarkdownFiles(absoluteDir)
    .filter((f) => !f.startsWith("_"))
    .sort((a, b) => a.localeCompare(b, "en"))

  return files.map((file) => {
    const absoluteFile = path.join(absoluteDir, file)
    const title = extractTitleFromMarkdown(absoluteFile) ?? titleFromFilename(file)
    const link = normalizePathToLink(path.join(relativeDir, file.replace(/\.md$/i, "")))
    return { text: title, link }
  })
}

export function createSidebar() {
  const docsDir = path.resolve(process.cwd(), "docs")
  const rootMarkdown = listMarkdownFiles(docsDir)
    .filter((f) => !["index.md"].includes(f.toLowerCase()))
    .filter((f) => !f.startsWith("_"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))
    .map((file) => {
      const absoluteFile = path.join(docsDir, file)
      const title = extractTitleFromMarkdown(absoluteFile) ?? titleFromFilename(file)
      const link = normalizePathToLink(file.replace(/\.md$/i, ""))
      return { text: title, link }
    })

  const yearDirs = listDirNames(docsDir).filter(isYearDir).sort((a, b) => Number(b) - Number(a))
  const latestYear = yearDirs[0]

  const yearGroups = yearDirs.map((year) => {
    const yearPath = path.join(docsDir, year)
    const monthDirs = listDirNames(yearPath)
      .map((m) => ({ raw: m, normalized: normalizeMonthDir(m) }))
      .filter((m) => Boolean(m.normalized))
      .sort((a, b) => Number(b.normalized) - Number(a.normalized))

    const monthGroups = monthDirs.map(({ raw, normalized }) => {
      const items = buildItemsForDir(docsDir, path.join(year, raw))
      return { text: `${normalized}月`, collapsed: true, items }
    })

    return { text: `${year}年`, collapsed: year !== latestYear, items: monthGroups }
  })

  const sidebar = []

  if (rootMarkdown.length) {
    sidebar.push({ text: "页面", collapsed: false, items: rootMarkdown })
  }

  sidebar.push(...yearGroups)

  return sidebar
}

