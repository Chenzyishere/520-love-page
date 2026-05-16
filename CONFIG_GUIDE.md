# 520 互动告白页配置说明

这个模板支持两种配置方式：

- 开发期默认配置：`src/love.config.js`
- 交付后运行时配置：`public/love.config.json`

复用为商品时，推荐优先改 `public/love.config.json`。项目构建后，这个文件会出现在 `dist/love.config.json`，客户版本可以直接改它，不一定需要重新打包。

## 常用配置

### 基础信息

```js
site: {
  title: '520 | 给特别的你',
  dateText: '05.20',
  receiverName: '特别的你',
}
```

- `title`：浏览器标签页标题
- `dateText`：首页胶囊日期
- `receiverName`：收件人昵称，预留给后续扩展

### 主题预设

```js
themePreset: 'rose'
```

当前只开放三个预设主题：

- `rose`：粉橘心动
- `moon`：月光蓝白
- `noir`：黑金电影

配置面板不提供自定义颜色，导出 JSON 和分享链接也只携带 `themePreset`。

### 首页文案

```js
hero: {
  eyebrow: '给特别的你',
  headline: '今天，把喜欢藏进一个小宇宙。',
  description: '轻轻点开它，里面有我想和你慢慢走下去的每一个理由。',
  lockedButtonText: '长按心动，开启惊喜',
  unlockedButtonText: '去收集回忆',
}
```

### 回忆卡片

```js
memories: [
  {
    date: '第一眼',
    title: '有些心动，来得很轻',
    text: '这里写一段专属回忆。',
  },
]
```

可以增加或减少回忆数量，页面会自动生成对应按钮。

### 心动碎片

```js
words: ['想你', '心动', '陪你', '喜欢', '520', '偏爱']
```

建议保持 4 到 6 个词，手机屏幕上的互动效果最好。

### 最后一封信

```js
letter: {
  title: '520快乐',
  paragraphs: [
    '第一段正文。',
    '第二段正文。',
  ],
  signature: '最后一句重点告白。',
}
```

## 交付建议

1. 每个客户复制一份项目。
2. 修改 `public/love.config.json`。
3. 执行 `npm run build`。
4. 将 `dist` 目录部署到静态网站平台。
5. 如果部署后还要临时改文案或主题，直接改服务器上的 `dist/love.config.json`。

## GitHub Pages

项目已包含 GitHub Pages 自动部署工作流：

```text
.github/workflows/deploy-pages.yml
```

使用方式：

1. 推送到 GitHub。
2. 进入仓库 `Settings > Pages`。
3. 将 `Source` 设置为 `GitHub Actions`。
4. 推送到 `main` 分支后自动部署。

`vite.config.js` 已设置 `base: './'`，适配 GitHub Pages 的仓库子路径。

## 页面内配置面板

页面左上角有配置按钮。点击后会打开侧边栏配置面板，可以实时修改：

- 基础信息
- 首页文案
- 主题预设
- 心动碎片
- 回忆卡片
- 最后一封信

面板里的“导出 JSON”会下载当前配置，可作为新的 `love.config.json` 使用。

面板现在还支持：

- 自动保存：每次修改都会保存到当前浏览器的 `localStorage`，刷新页面不会丢。
- 生成分享链接：点击“生成分享链接”后，只有相对默认模板改过的配置会编码到 URL 参数里，并使用 `lz-string` 压缩；别人打开链接会进入只读展示模式，不显示配置入口。
- 重置：清空本机保存的配置，并回到默认模板。

配置加载优先级：

1. 分享链接里的配置
2. 当前浏览器本地保存的配置
3. `love.config.json`
4. `src/love.config.js` 默认配置

## 全屏步骤流程

主页面现在是一步一屏的交互流程：

1. 开场解锁
2. 回忆浏览
3. 收集心动碎片
4. 最后一封信

每个步骤都是全屏展示，用户点击当前步骤的完成按钮后才进入下一步。
