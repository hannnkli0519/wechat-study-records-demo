# 学习打卡小程序 (Study Check-in App)

一款基于原生微信小程序和云开发（Cloud Development）构建的学习打卡应用。旨在帮助用户记录学习历程、管理学习目标并查看打卡统计。

## 🌟 核心功能

- **首页 (Check-in)**: 
  - 动态展示连续打卡天数及击败用户比例。
  - 具有“呼吸灯”动画效果的打卡按钮。
  - 支持学习心得记录、表情输入及图片上传。
  - 每日随机励志语录展示。
- **记录页 (Records)**: 
  - 自动生成的月度打卡日历，已打卡日期以绿色圆点标记。
  - 实时统计月度打卡率、签到天数及补签卡数量。
  - 详细的打卡历史时间轴列表。
- **个人中心 (Profile)**: 
  - 展示总打卡天数、历史最高连续及本月排名。
  - 目标管理：设置每日学习目标时长。
  - 提醒设置：开关式打卡提醒通知。
- **用户信息编辑**: 
  - 自定义昵称及头像修改，支持即时预览并同步全局。

## 🛠️ 技术栈

- **前端**: 微信小程序原生框架 (WXML, WXSS, JavaScript)
- **后端**: 微信小程序云开发 (Cloud Development)
  - **云函数 (Cloud Functions)**: `login`, `punch_manager`, `user_manager`
  - **云数据库 (Cloud Database)**: `study_users`, `punch_records`

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone git@github.com:hannnkli0519/wechat-study-records-demo.git
```

### 2. 初始化云开发
- 在微信开发者工具中打开项目。
- 点击工具栏左上角的“云开发”按钮，开通云服务。
- 在 `app.js` 中确认 `wx.cloud.init` 的环境配置。

### 3. 配置数据库
在云开发控制台的“数据库”中新建以下两个集合：
- `study_users`: 存储用户信息。
- `punch_records`: 存储打卡记录。

### 4. 部署云函数
右键点击 `cloudfunctions` 目录下的各文件夹，选择 **“上传并部署：云端安装依赖”**：
- `login`
- `punch_manager`
- `user_manager`

## 📂 项目结构
```text
├── cloudfunctions/        # 云函数目录
├── images/                # 静态图片资源
├── pages/                 # 小程序页面
│   ├── index/             # 首页（打卡）
│   ├── records/           # 记录页
│   ├── profile/           # 个人中心
│   └── profile_edit/      # 用户资料编辑
├── utils/                 # 工具类函数
├── app.js                 # 小程序逻辑
├── app.json               # 小程序公共配置
├── app.wxss               # 小程序公共样式表
└── project.config.json    # 项目配置文件
```

## 📝 许可证
MIT License
