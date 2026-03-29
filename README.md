# Budgeting - 智能记账 PWA

一款专为个人财务管理设计的渐进式Web应用（PWA），支持收支记录、分类预算、还款管理和储蓄目标。

## 功能特性

### 核心功能
- 收支记录 - 快速记录日常收入和支出
- 分类管理 - 支持支出/收入分类，可自定义图标和预算
- 还款管理 - 管理周期性还款（房贷、车贷、花呗等）
- 储蓄目标 - 设定储蓄目标并跟踪进度
- 数据可视化 - 支出分析图表和趋势统计

### PWA 特性
- 可安装到主屏幕（iOS/Android/桌面）
- 离线使用支持
- 响应式设计，适配各种设备
- iOS启动画面和图标
- 隐私模式（隐藏金额）

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Recharts（图表）
- date-fns（日期处理）

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 部署到 Netlify

#### 方法一：一键部署脚本

双击运行 `deploy.bat`，按照提示操作。

#### 方法二：手动部署

1. 构建项目
   ```bash
   npm run build
   ```

2. 部署 `dist` 文件夹到 [Netlify](https://www.netlify.com/)

#### 方法三：Git 自动部署

1. 推送到 GitHub/GitLab
2. 在 Netlify 中连接仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`dist`

## 安装到设备

### iOS (iPhone/iPad)
1. 在 Safari 中打开应用网址
2. 点击分享按钮 → "添加到主屏幕"
3. 点击"添加"

### Android
1. 在 Chrome 中打开应用网址
2. 点击菜单 → "添加到主屏幕"
3. 点击"安装"

### 桌面浏览器
1. 在 Chrome/Edge 中打开应用网址
2. 点击地址栏"安装"图标
3. 或在菜单中选择"安装"

## 项目结构

```
Myapp/
├── public/                 # 静态资源（直接复制到dist）
│   ├── icons/             # PWA图标（多种尺寸）
│   ├── splash/            # iOS启动画面
│   ├── manifest.json      # PWA配置
│   └── sw.js              # Service Worker
├── src/                   # 源代码
│   ├── main.tsx           # 入口文件
│   ├── App.tsx            # 主组件
│   ├── Dashboard.tsx      # 概览页面
│   ├── Categories.tsx     # 分类管理
│   ├── History.tsx        # 账单统计
│   ├── Repayments.tsx     # 还款管理
│   ├── Goals.tsx          # 储蓄目标
│   ├── AddTransactionModal.tsx
│   ├── store.ts           # 状态管理
│   └── Icons.tsx          # 图标组件
├── index.html             # HTML模板
├── vite.config.ts         # Vite配置
├── netlify.toml           # Netlify配置
├── manifest.json          # PWA清单
├── sw.js                  # Service Worker
└── package.json           # 项目依赖
```

## PWA 配置

### 图标尺寸
- 72x72, 96x96, 128x128, 144x144
- 152x152, 167x167, 180x180 (iOS)
- 192x192, 384x384, 512x512

### 主题颜色
- 主题色：#000000（黑色）
- 背景色：#ffffff（白色）

### Service Worker
提供离线缓存功能：
- 缓存静态资源（JS/CSS/图标）
- 网络优先策略，失败时从缓存读取
- 自动清理旧版本缓存

## 浏览器支持

- Chrome 80+
- Safari 13+ (iOS 13+)
- Firefox 75+
- Edge 80+

## 注意事项

1. **数据存储**：所有数据保存在浏览器 LocalStorage 中
2. **首次加载**：需要联网加载资源
3. **缓存更新**：新版本需要刷新两次才能生效
4. **存储限制**：iOS Safari 约 50MB

## 自定义

### 修改应用信息
编辑 `manifest.json`：
```json
{
  "name": "你的应用名称",
  "short_name": "短名称",
  "description": "应用描述"
}
```

### 修改主题颜色
编辑 `manifest.json` 和 `index.html` 中的 `theme-color`。

### 更新图标
替换 `public/icons/` 目录下的 PNG 文件。

## 常见问题

### Q: 无法安装到主屏幕？
A: 确保使用 HTTPS，检查 manifest.json 路径是否正确。

### Q: 图标不显示？
A: 检查图标路径和文件名，清除浏览器缓存。

### Q: 离线后无法访问？
A: 首次访问必须联网，之后才能离线使用。

### Q: 如何更新应用？
A: 重新部署后，用户刷新页面即可获取更新。

## 开发计划

- [x] 收支记录
- [x] 分类管理
- [x] 预算设置
- [x] 还款管理
- [x] 储蓄目标
- [x] 数据可视化
- [x] PWA支持
- [ ] 数据导入导出
- [ ] 多货币支持
- [ ] 云同步

## 许可证

MIT License

---

**Happy Budgeting!** 💰
