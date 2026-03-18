import { defineConfig } from 'vitepress'
import { createSidebar } from "./sidebar.mjs"

export default defineConfig({
  title: "我的博客",
  description: "基于 VitePress 和 GitHub Pages 搭建的博客",
  base: '/vp-blog/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: createSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://jq002.github.io/vp-blog/' }
    ]
  }
})
