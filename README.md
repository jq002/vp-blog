# vp-blog

基于 VitePress + GitHub Pages 的博客项目。

## 环境要求

- Node.js >= 22

## 文章目录规范（按年月）

推荐把文章按 `年/月` 归档，侧边栏会自动按目录生成：

```
docs/
  2026/
    03/
      the-infinite-and-the-finite.md
    02/
      the-escapist.md
```

文章标题会优先读取：
- Frontmatter 的 `title`
- 或 Markdown 的第一个 `# 标题`
- 否则退化为文件名（把 `-`、`_` 转为空格）

## 本地开发

```bash
npm install
npm run docs:dev
```

## 构建与预览

```bash
npm run docs:build
npm run docs:preview
```
