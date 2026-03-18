---
layout: home

hero:
  name: "我的博客"
  text: "记录技术与生活"
  actions:
    - theme: brand
      text: 开始阅读
      link: /about


---

<script setup>
import { withBase } from 'vitepress'
import { data as latestPost } from './latest-post.data.js'
</script>

## 最新文章

<div v-if="latestPost">
  <a :href="withBase(latestPost.url)">{{ latestPost.title }}</a>
  <div>{{ latestPost.url }}</div>
  <div v-if="latestPost.description">{{ latestPost.description }}</div>
</div>
