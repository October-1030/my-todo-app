# 📋 智能待办清单

一个支持云端同步的现代化待办清单应用，提供桌面悬浮版和在线版本。

## ✨ 功能特点

### 📱 完整功能
- **普通任务管理** - 添加、完成、删除任务
- **账单提醒** - 支持金额记录和重复账单
- **智能过滤** - 7种过滤模式（全部、今日、进行中、账单、逾期、未来、完成）
- **实时统计** - 显示进行中、逾期、账单、完成任务数量
- **数据管理** - 导出/导入JSON格式数据

### 🔄 云端同步
- **实时同步** - 使用JSONBin.io云端存储
- **跨设备访问** - 手机、电脑数据实时同步
- **本地备份** - localStorage双重保障
- **冲突处理** - 智能合并不同设备的数据

### 🎨 多版本支持
- **桌面悬浮版** - Electron应用，透明悬浮显示
- **在线完整版** - 适合手机和电脑浏览器
- **CodePen版本** - 在线编辑和分享

## 📁 文件结构

```
my-todo-app/
├── index.html              # 完整版HTML文件（推荐）
├── desktop-todo.html       # 桌面悬浮版
├── main.js                 # Electron主程序
├── package.json            # 项目配置
├── codepen.js              # CodePen的JS部分
└── README.md               # 项目说明
```

## 🚀 使用方法

### 方式1：GitHub Pages（推荐）
1. 启用GitHub Pages
2. 访问：`https://your-username.github.io/my-todo-app/`
3. 添加到手机主屏幕

### 方式2：Electron桌面版
```bash
# 安装依赖
npm install electron --save-dev

# 启动应用
npm start
```

### 方式3：CodePen在线版
- 访问你的CodePen链接
- 手机Safari添加到主屏幕

## ⚙️ 云端同步配置

应用使用JSONBin.io进行云端同步：

1. 注册JSONBin账号：https://jsonbin.io
2. 创建新的Bin
3. 获取Bin ID和API Key
4. 更新代码中的配置：

```javascript
const CLOUD_CONFIG = {
    binId: 'your-bin-id',
    apiKey: 'your-api-key',
    url: 'https://api.jsonbin.io/v3/b/'
};
```

## 📱 跨设备同步

### 手机 + 电脑同步
- **手机**：使用CodePen或GitHub Pages版本
- **电脑**：使用Electron桌面版
- **同步**：通过JSONBin云端实时同步

### 数据流向
```
手机版 ←→ 云端存储 ←→ 桌面版
     ↓              ↓
  本地存储      本地存储
```

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, Vanilla JavaScript
- **桌面**：Electron
- **云存储**：JSONBin.io API
- **本地存储**：localStorage
- **样式**：CSS Grid, Flexbox, 响应式设计

## 📋 任务类型

### 普通任务
- 任务名称
- 截止日期
- 提醒设置
- 完成状态

### 账单提醒
- 账单名称
- 金额
- 到期日期
- 重复设置（月度/年度）
- 提前提醒天数

## 🎨 界面特点

- **现代设计** - 渐变背景，毛玻璃效果
- **响应式布局** - 适配手机和电脑
- **动画效果** - 流畅的交互体验
- **深色适配** - 护眼的暗色主题
- **手势友好** - 移动设备优化

## 🔒 数据安全

- **本地优先** - 数据首先保存在本地
- **云端备份** - 自动同步到云端
- **多重保障** - localStorage + 云端双重存储
- **隐私保护** - 数据仅存储在你的JSONBin账户

## 📦 部署方式

### GitHub Pages
1. Push代码到GitHub仓库
2. Settings → Pages → 选择分支
3. 获得在线访问链接

### 本地部署
1. 直接双击HTML文件
2. 或使用本地服务器

### Electron打包
```bash
npm install electron-builder --save-dev
npm run build
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题请提交Issue或联系开发者。

🎉 **享受高效的任务管理体验！**
