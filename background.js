// 插件安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('飞书文档复制插件已安装');
    // 可以打开欢迎页面或设置页面
  } else if (details.reason === 'update') {
    console.log('飞书文档复制插件已更新到版本:', chrome.runtime.getManifest().version);
  }
});

// 监听来自 popup 或 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyDocument') {
    // 处理复制文档请求
    handleCopyDocument(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // 返回 true 表示异步响应
    return true;
  }
});

// 处理文档复制逻辑
async function handleCopyDocument(data) {
  const { fileToken, folderToken, accessToken } = data;
  
  const apiUrl = `https://open.feishu.cn/open-apis/drive/v1/files/${fileToken}/copy`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      type: 'doc',
      folder_token: folderToken,
      name: ''
    })
  });
  
  const result = await response.json();
  
  if (result.code !== 0) {
    throw new Error(result.msg || `API 返回错误码: ${result.code}`);
  }
  
  return result.data;
}