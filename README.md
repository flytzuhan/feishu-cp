# 飞书文档一键复制插件

## 功能介绍

这是一个 Chrome 浏览器插件,可以快速将飞书文档复制到你指定的知识库文件夹中,无需手动复制粘贴。

## 安装步骤

### 1. 准备插件文件

创建一个文件夹(例如 `feishu-copy-extension`),并在其中创建以下文件:

```
feishu-copy-extension/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. 准备图标文件

在 `icons` 文件夹中放置三个尺寸的图标(16x16、48x48、128x128 像素)。你可以:
- 使用在线工具生成简单图标
- 或者暂时使用任意 PNG 图片,后续再替换

### 3. 加载插件到 Chrome

1. 打开 Chrome 浏览器,访问 `chrome://extensions/`
2. 打开右上角的「开发者模式」开关
3. 点击「加载已解压的扩展程序」
4. 选择你创建的 `feishu-copy-extension` 文件夹
5. 插件安装完成!

## 使用说明

### 第一步: 获取 Access Token

1. 前往[飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用或使用现有应用
3. 在「凭证与基础信息」中获取 `app_id` 和 `app_secret`
4. 调用接口获取 `tenant_access_token`:

```bash
curl -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' \
-H 'Content-Type: application/json' \
-d '{
  "app_id": "你的app_id",
  "app_secret": "你的app_secret"
}'
```

5. 确保应用拥有以下权限:
   - `drive:drive:readonly` (查看云空间文件)
   - `drive:drive` (管理云空间文件)

### 第二步: 获取目标文件夹 Token

1. 在飞书知识库中打开你想要复制到的文件夹
2. 从浏览器地址栏复制 URL 中的文件夹 token
   - 例如: `https://xxx.feishu.cn/drive/folder/fldcnXXXXXXXXXXXXXX`
   - folder_token 就是 `fldcnXXXXXXXXXXXXXX`

### 第三步: 配置插件

1. 打开任意飞书文档页面
2. 点击浏览器工具栏中的插件图标
3. 在弹出窗口中填写:
   - Access Token: 你获取的 tenant_access_token
   - 目标文件夹 Token: 你的目标文件夹 token
4. 点击「保存配置」

### 第四步: 一键复制文档

1. 浏览到任意你想复制的飞书文档页面
2. 点击插件图标
3. 点击「一键复制当前文档」按钮
4. 等待几秒,复制完成后会显示成功消息和新文档链接

## 支持的文档类型

- ✅ Wiki 知识库文档
- ✅ 文档 (Docs)
- ✅ 表格 (Sheets)
- ✅ 思维笔记 (Mindnote)
- ✅ 多维表格 (Base)

## 常见问题

### Q: 提示 "API 错误" 怎么办?

**A:** 检查以下几点:
- Access Token 是否过期(默认2小时有效期)
- 应用权限是否配置正确
- 目标文件夹 token 是否正确
- 网络连接是否正常

### Q: 无法从 URL 提取 file_token?

**A:** 确保你在飞书文档页面,URL 应该包含 `/wiki/`、`/docx/`、`/sheets/` 等路径

### Q: 复制后的文档在哪里?

**A:** 文档会出现在你配置的目标文件夹中,插件会显示新文档的链接地址

### Q: Access Token 总是过期怎么办?

**A:** 考虑以下方案:
- 使用自动刷新 token 的机制
- 定期更新 token(建议设置提醒)
- 使用 user_access_token(需要用户授权)

## API 文档参考

- [飞书开放平台 - 复制文档](https://open.feishu.cn/document/ukTMukTMukTM/uYTM2YjL2EjN24iNxYjN)
- [获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM)

## 技术栈

- Chrome Extension Manifest V3
- Vanilla JavaScript (无依赖)
- Chrome Storage API
- Feishu Open API

## 注意事项

⚠️ **重要**: 
- Access Token 请妥善保管,不要泄露
- 此插件仅用于个人学习和提高工作效率
- 请遵守飞书服务条款和公司内部规定
- 复制他人文档时请注意版权和隐私

## 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🎯 支持一键复制飞书文档
- 💾 配置信息本地保存
- 🎨 简洁美观的用户界面

## License

MIT License

---

如有问题或建议,欢迎反馈!