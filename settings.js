// 显示状态消息
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// 加载已保存的设置
async function loadSettings() {
  const settings = await chrome.storage.sync.get(['targetWikiId', 'targetFolderId']);
  
  if (settings.targetWikiId) {
    document.getElementById('wikiId').value = settings.targetWikiId;
  }
  
  if (settings.targetFolderId) {
    document.getElementById('folderId').value = settings.targetFolderId;
  }
}

// 保存设置
async function saveSettings(e) {
  e.preventDefault();
  
  const wikiId = document.getElementById('wikiId').value.trim();
  const folderId = document.getElementById('folderId').value.trim();
  
  if (!wikiId) {
    showStatus('请输入知识库ID', 'error');
    return;
  }
  
  // 验证知识库ID格式
  if (!wikiId.startsWith('wik')) {
    showStatus('知识库ID格式不正确，应该以"wik"开头', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      targetWikiId: wikiId,
      targetFolderId: folderId
    });
    
    showStatus('✅ 设置保存成功！', 'success');
    
    // 2秒后关闭页面
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    console.error('保存失败:', error);
    showStatus('❌ 保存失败: ' + error.message, 'error');
  }
}

// 取消设置
function cancelSettings() {
  window.close();
}

// 初始化
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('cancelBtn').addEventListener('click', cancelSettings);