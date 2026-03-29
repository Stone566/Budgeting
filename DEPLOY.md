# Budgeting PWA 部署指南

## 项目概述

这是一个基于 React + Vite + TypeScript 构建的 PWA (Progressive Web App) 记账应用。

## PWA 特性

- ✅ 可安装到主屏幕（iOS/Android/桌面）
- ✅ 离线使用（Service Worker缓存）
- ✅ 响应式设计，适配各种屏幕
- ✅ iOS启动画面
- ✅ 多尺寸图标支持

## 部署到 Netlify

### 方法一：通过 Git 部署（推荐）

1. **创建 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub/GitLab**
   ```bash
   git remote add origin https://github.com/yourusername/budgeting-pwa.git
   git push -u origin main
   ```

3. **在 Netlify 部署**
   - 登录 [Netlify](https://www.netlify.com/)
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub/GitLab 仓库
   - 构建设置：
     - Build command: `npm run build`
     - Publish directory: `dist`
   - 点击 "Deploy site"

### 方法二：手动上传

1. **本地构建**
   ```bash
   npm install
   npm run build
   ```

2. **上传到 Netlify**
   - 登录 Netlify
   - 拖放 `dist` 文件夹到部署区域
   - 等待部署完成

## 安装应用到设备

### iOS (iPhone/iPad)

1. 在 Safari 中打开应用网址
2. 点击底部分享按钮（方形带向上箭头）
3. 选择 "添加到主屏幕"
4. 确认名称后点击 "添加"

### Android

1. 在 Chrome 中打开应用网址
2. 点击菜单（三点）或等待底部弹窗
3. 选择 "添加到主屏幕" 或 "安装应用"
4. 确认安装

### 桌面 (Chrome/Edge)

1. 打开应用网址
2. 点击地址栏右侧的 "安装" 图标
3. 或在菜单中选择 "安装 Budgeting"

## 项目结构

```
Myapp/
├── icons/              # PWA图标
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-167x167.png
│   ├── icon-180x180.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── splash/             # iOS启动画面
│   ├── splash-640x1136.png
│   ├── splash-750x1334.png
│   ├── splash-1125x2436.png
│   └── ...
├── src/                # 源代码
├── index.html          # 主HTML
├── manifest.json       # PWA配置
├── sw.js              # Service Worker
├── vite.config.ts     # Vite配置
├── netlify.toml       # Netlify配置
└── package.json       # 依赖

```

## 配置说明

### manifest.json

```json
{
  "name": "Budgeting - 智能记账",
  "short_name": "Budgeting",
  "description": "个人财务管理助手",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### Service Worker

`sw.js` 提供离线缓存功能：
- 缓存静态资源（JS/CSS/图标）
- 网络请求优先，失败时从缓存读取
- 自动清理旧缓存

## 自定义

### 修改应用名称

编辑 `manifest.json` 和 `index.html` 中的名称。

### 修改图标

替换 `icons/` 目录下的 PNG 文件，保持文件名和尺寸。

### 修改主题颜色

编辑 `manifest.json` 和 `index.html` 中的 `theme-color`。

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 检查TypeScript
npm run lint
```

## 浏览器兼容性

- Chrome 80+
- Safari 13+ (iOS 13+)
- Firefox 75+
- Edge 80+

## 注意事项

1. **首次加载**：第一次访问需要联网加载资源
2. **缓存更新**：新版本发布后，用户需要刷新两次才能看到更新
3. **存储限制**：iOS Safari 的存储限制约为 50MB
4. **后台同步**：目前不支持后台数据同步

## 故障排除

### 无法安装

- 确保使用 HTTPS（Netlify 自动提供）
- 检查 manifest.json 路径是否正确
- 在 Chrome DevTools → Application → Manifest 中检查错误

### Service Worker 未注册

- 检查 `sw.js` 路径
- 确保在 HTTPS 环境下运行
- 查看浏览器控制台错误信息

### 图标不显示

- 检查图标路径是否正确
- 确认图标尺寸符合要求
- 清除浏览器缓存重试

## 技术支持

如有问题，请检查：
1. [PWA 兼容性检查](https://web.dev/pwa-checklist/)
2. [Web App Manifest 文档](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
3. [Service Worker 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
