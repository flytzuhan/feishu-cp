// Content Script - 在飞书文档页面中运行

// 获取文档标题
function getDocumentTitle() {
  // 尝试多种方式获取文档标题
  const titleSelectors = [
    '.doc-title',
    '.wiki-title',
    '[data-testid="doc-title"]',
    'h1',
    '.suite-title'
  ];
  
  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  
  return document.title;
}

// 获取文档内容
function getDocumentContent() {
  // 尝试获取文档的主要内容区域
  const contentSelectors = [
    '.doc-content',
    '.wiki-content', 
    '[role="textbox"]',
    '.lark-editor',
    '.suite-editor'
  ];
  
  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
  }
  
  return null;
}

// 执行复制操作
async function copyDocumentToWiki(targetWikiId, targetFolderId) {
  try {
    // 获取文档内容
    const contentEl = getDocumentContent();
    if (!contentEl) {
      throw new Error('无法获取文档内容');
    }
    
    const title = getDocumentTitle();
    
    // 方法1: 尝试使用飞书的复制API（如果有的话）
    // 这需要通过飞书的开放平台API来实现
    
    // 方法2: 模拟用户操作
    // 选中全部内容
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(contentEl);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // 执行复制
    document.execCommand('copy');
    
    // 清除选择
    selection.removeAllRanges();
    
    // 打开目标知识库（在新标签页）
    const wikiUrl = `https://feishu.cn/wiki/${targetWikiId}`;
    const newTab = window.open(wikiUrl, '_blank');
    
    // 存储复制的信息，供新页面使用
    chrome.storage.local.set({
      pendingPaste: {
        title: title,
        timestamp: Date.now(),
        targetFolderId: targetFolderId
      }
    });
    
    return {
      success: true,
      message: '内容已复制，正在打开目标知识库...'
    };
    
  } catch (error) {
    console.error('复制失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 智能粘贴助手（在目标页面自动粘贴）
async function checkAndAutoPaste() {
  const data = await chrome.storage.local.get(['pendingPaste']);
  
  if (data.pendingPaste && Date.now() - data.pendingPaste.timestamp < 60000) {
    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 查找新建文档按钮
    const createButtons = [
      '[data-testid="create-doc"]',
      '.create-button',
      'button:contains("新建")'
    ];
    
    for (const selector of createButtons) {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.click();
        
        // 等待新文档创建
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 设置标题
        const titleInput = document.querySelector('[data-testid="doc-title"], .doc-title, h1[contenteditable="true"]');
        if (titleInput) {
          titleInput.textContent = data.pendingPaste.title;
        }
        
        // 粘贴内容
        const contentArea = getDocumentContent();
        if (contentArea) {
          contentArea.focus();
          document.execCommand('paste');
        }
        
        // 清除临时数据
        chrome.storage.local.remove(['pendingPaste']);
        break;
      }
    }
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDocTitle') {
    const title = getDocumentTitle();
    sendResponse({ title: title });
  } else if (request.action === 'copyDocument') {
    copyDocumentToWiki(request.targetWikiId, request.targetFolderId)
      .then(result => sendResponse(result));
    return true; // 异步响应
  }
});

// 页面加载时检查是否需要自动粘贴
if (document.readyState === 'complete') {
  checkAndAutoPaste();
} else {
  window.addEventListener('load', checkAndAutoPaste);
}