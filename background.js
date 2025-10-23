// Background Service Worker

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('飞书文档复制助手已安装');
    // 打开设置页面
    chrome.tabs.create({ url: 'settings.html' });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSettings') {
    chrome.tabs.create({ url: 'settings.html' });
  }
  return true;
});