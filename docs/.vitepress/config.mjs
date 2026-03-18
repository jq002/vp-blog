import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的博客",
  description: "基于 VitePress 和 GitHub Pages 搭建的博客",
  base: '/vp-blog/', // 假设 GitHub 仓库名为 vp-blog
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: [
      {
        text: '文章列表',
        items: [
          { text: '关于我', link: '/about' },
          { text: '第一篇博客', link: '/first-post' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/vp-blog' }
    ]
  }
})
