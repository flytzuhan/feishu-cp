// 页面加载时恢复配置
document.addEventListener('DOMContentLoaded', async () => {
  const config = await chrome.storage.sync.get(['accessToken', 'folderToken']);
  
  if (config.accessToken) {
    document.getElementById('accessToken').value = config.accessToken;
  }
  
  if (config.folderToken) {
    document.getElementById('folderToken').value = config.folderToken;
  }
});

// 保存配置
document.getElementById('saveConfig').addEventListener('click', async () => {
  const accessToken = document.getElementById('accessToken').value.trim();
  const folderToken = document.getElementById('folderToken').value.trim();
  
  if (!accessToken || !folderToken) {
    showMessage('请填写完整的配置信息', 'error');
    return;
  }
  
  await chrome.storage.sync.set({ accessToken, folderToken });
  showMessage('配置保存成功!', 'success');
});

// 一键复制功能
document.getElementById('copyBtn').addEventListener('click', async () => {
  const btn = document.getElementById('copyBtn');
  const btnText = document.getElementById('btnText');
  
  try {
    // 禁用按钮,显示加载状态
    btn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span>复制中...';
    
    // 获取配置
    const config = await chrome.storage.sync.get(['accessToken', 'folderToken']);
    
    if (!config.accessToken || !config.folderToken) {
      showMessage('请先配置 Access Token 和目标文件夹', 'error');
      return;
    }
    
    // 获取当前标签页的 URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    
    // 验证是否为飞书文档链接
    if (!url.includes('feishu.cn/wiki/') && !url.includes('feishu.cn/docx/') && !url.includes('feishu.cn/sheets/')) {
      showMessage('当前页面不是飞书文档页面', 'error');
      return;
    }
    
    // 从 URL 中提取 file_token
    const fileToken = extractFileToken(url);
    
    if (!fileToken) {
      showMessage('无法从 URL 中提取 file_token', 'error');
      return;
    }
    
    showMessage(`正在复制文档 (${fileToken})...`, 'info');
    
    // 调用飞书 API 复制文档
    const result = await copyFeishuDoc(fileToken, config.folderToken, config.accessToken);
    
    if (result.success) {
      showMessage(`✅ 复制成功! 新文档地址: ${result.url}`, 'success');
    } else {
      showMessage(`❌ 复制失败: ${result.error}`, 'error');
    }
    
  } catch (error) {
    console.error('复制过程出错:', error);
    showMessage(`发生错误: ${error.message}`, 'error');
  } finally {
    // 恢复按钮状态
    btn.disabled = false;
    btnText.textContent = '📋 一键复制当前文档';
  }
});

// 从 URL 中提取 file_token
function extractFileToken(url) {
  try {
    // 匹配各种飞书文档 URL 格式
    // wiki: https://xxx.feishu.cn/wiki/IsBawjqvzi8bRFke5WJc3Tddnob
    // docx: https://xxx.feishu.cn/docx/doxcnXXXXXXXXXXXXXXX
    // sheets: https://xxx.feishu.cn/sheets/shtcnXXXXXXXXXXXXXXX
    
    const patterns = [
      /\/wiki\/([a-zA-Z0-9_-]+)/,
      /\/docx\/([a-zA-Z0-9_-]+)/,
      /\/sheets\/([a-zA-Z0-9_-]+)/,
      /\/base\/([a-zA-Z0-9_-]+)/,
      /\/mindnote\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('提取 file_token 失败:', error);
    return null;
  }
}

// 调用飞书 API 复制文档
async function copyFeishuDoc(fileToken, folderToken, accessToken) {
  try {
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
        name: '' // 空字符串表示使用原文档名称
      })
    });
    
    const data = await response.json();
    
    if (data.code === 0) {
      // 成功
      return {
        success: true,
        url: data.data.url || '复制成功',
        token: data.data.token
      };
    } else {
      // 失败
      return {
        success: false,
        error: data.msg || `API 错误 (code: ${data.code})`
      };
    }
    
  } catch (error) {
    console.error('API 调用失败:', error);
    return {
      success: false,
      error: error.message || '网络请求失败'
    };
  }
}

// 显示消息提示
function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
  
  // 3秒后自动隐藏成功消息
  if (type === 'success') {
    setTimeout(() => {
      messageEl.classList.remove('show');
    }, 5000);
  }
}