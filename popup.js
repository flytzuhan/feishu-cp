// 获取当前标签页信息
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// 显示状态消息
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

// 显示加载状态
function showLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span>复制中...';
  } else {
    button.disabled = false;
    button.innerHTML = '🚀 一键复制到我的知识库';
  }
}

// 初始化页面
async function initPopup() {
  const tab = await getCurrentTab();
  const docTitleEl = document.getElementById('docTitle');
  
  // 检查是否在飞书文档页面
  if (!tab.url.includes('feishu.cn') && !tab.url.includes('larksuite.com')) {
    docTitleEl.textContent = '请在飞书文档页面使用此插件';
    document.getElementById('copyBtn').disabled = true;
    return;
  }
  
  // 获取文档标题
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'getDocTitle' });
    docTitleEl.textContent = result.title || '未知文档';
  } catch (e) {
    docTitleEl.textContent = tab.title || '未知文档';
  }
}

// 复制文档
async function copyDocument() {
  const copyBtn = document.getElementById('copyBtn');
  showLoading(copyBtn, true);
  showStatus('正在获取文档内容...', 'info');
  
  try {
    const tab = await getCurrentTab();
    
    // 检查是否设置了目标知识库
    const settings = await chrome.storage.sync.get(['targetWikiId', 'targetFolderId']);
    if (!settings.targetWikiId) {
      showStatus('请先设置目标知识库！', 'error');
      showLoading(copyBtn, false);
      return;
    }
    
    // 发送消息到content script执行复制
    const result = await chrome.tabs.sendMessage(tab.id, {
      action: 'copyDocument',
      targetWikiId: settings.targetWikiId,
      targetFolderId: settings.targetFolderId
    });
    
    if (result.success) {
      showStatus('✅ 文档复制成功！', 'success');
    } else {
      showStatus(`❌ 复制失败：${result.error}`, 'error');
    }
  } catch (error) {
    console.error('复制出错:', error);
    showStatus(`❌ 复制失败：${error.message}`, 'error');
  } finally {
    showLoading(copyBtn, false);
  }
}

// 打开设置页面
function openSettings() {
  chrome.tabs.create({ url: 'settings.html' });
}

// 事件监听
document.addEventListener('DOMContentLoaded', initPopup);
document.getElementById('copyBtn').addEventListener('click', copyDocument);
document.getElementById('settingsBtn').addEventListener('click', openSettings);