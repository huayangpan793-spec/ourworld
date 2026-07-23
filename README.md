# 🌍 花与灵的记忆星球

> 我们走过的每一处地方，都在世界上留下了一点光。

一个私密的双人记忆空间 — 通过可交互的 3D 地球，记录情侣共同去过的城市、发生过的故事、珍贵照片和内心感受。

## 功能

- **3D 交互地球** — 拖动旋转、缩放、自动旋转、点击创建记忆节点
- **记忆节点** — 已访问地点用暖金色光点标记，纪念日有光环，未来地点用空心环
- **照片堆叠** — 最多 9 张照片以自然折叠形式展示，点击展开查看
- **信封与信纸** — 故事正文封装在信封中，点击展开带有仪式感的信纸动画
- **时间轴** — 按年月分组的全部记忆视图
- **未来地点** — 记录想一起去但尚未到达的地方
- **本地持久化** — 所有数据通过 Zustand + localStorage 保存，刷新不丢失
- **响应式设计** — 桌面端右侧详情面板，移动端底部上滑面板
- **装饰效果** — 金色光点、花瓣飘落、鼠标光晕（可设置减少动画）
- **隐私** — 页面添加 `noindex` 防止搜索引擎索引

## 技术栈

- **框架:** Next.js 16 (App Router)
- **语言:** TypeScript
- **样式:** Tailwind CSS v4
- **3D 场景:** Three.js + react-three-fiber + @react-three/drei
- **动画:** Framer Motion
- **状态管理:** Zustand (localStorage 持久化)
- **图标:** Lucide React
- **地理编码:** OpenStreetMap Nominatim API

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
npm start
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── layout.tsx           # 根布局（字体、元数据）
│   ├── client-layout.tsx    # 客户端布局（效果、导航）
│   ├── page.tsx             # 首页
│   ├── globe/page.tsx       # 3D 地球主页面
│   ├── add/page.tsx         # 添加记忆
│   ├── edit/[id]/page.tsx   # 编辑记忆
│   ├── memory/[id]/page.tsx # 记忆详情
│   ├── memories/page.tsx    # 全部记忆（时间轴）
│   └── future/page.tsx      # 未来地点
├── components/
│   ├── globe/               # 3D 地球组件
│   ├── memory/              # 记忆展示组件
│   ├── timeline/            # 时间轴组件
│   ├── ui/                  # 通用 UI 组件
│   └── effects/             # 装饰效果组件
├── lib/
│   ├── types.ts             # 类型定义
│   ├── store.ts             # Zustand 状态管理
│   ├── demo-data.ts         # 演示数据
│   ├── utils.ts             # 工具函数
│   └── geocode.ts           # 地理编码
└── styles/
    └── globals.css          # 全局样式、Tailwind 主题
```

## 数据存储

目前所有数据存储在浏览器的 localStorage 中（通过 Zustand persist 中间件）。

### 迁移到 Supabase (PostgreSQL)

数据访问层已封装在 `src/lib/store.ts` 中。要接入真实数据库：

1. 在 Supabase 创建 `memories` 表，字段与 `Memory` 接口对应
2. 创建 `settings` 表存储应用设置
3. 在 store 中添加 Supabase 客户端调用替代 localStorage 操作
4. 照片可上传到 Supabase Storage 或 Cloudinary

替换 `useMemoryStore` 中的 `addMemory`、`updateMemory`、`deleteMemory` 方法即可。

## 许可证

MIT
