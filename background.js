
// 保存菜单配置的全局变量
let menuConfig = null;

// 从配置文件加载菜单设置
async function loadMenuConfig() {
  // 如果配置已经加载过，直接返回缓存的配置
  if (menuConfig !== null) {
    return menuConfig;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    menuConfig = await response.json();
    return menuConfig;
  } catch (error) {
    console.error('加载配置文件失败:', error);
    menuConfig = { contexts: [], page_contexts: [] };
    return menuConfig;
  }
}

// 创建上下文菜单项
chrome.runtime.onInstalled.addListener(async () => {
  // 移除所有现有的上下文菜单项
  chrome.contextMenus.removeAll();

  // 加载配置
  const config = await loadMenuConfig();

  // 创建选中文本菜单项
  if (config.contexts && config.contexts.length > 0) {
    config.contexts.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["selection"]
      });
    });
  } else {
    console.warn('配置文件中没有找到有效的文本选择菜单项');
  }

  // 创建页面右键菜单项
  if (config.page_contexts && config.page_contexts.length > 0) {
    // 创建页面右键菜单分隔符
    chrome.contextMenus.create({
      id: "page-separator",
      type: "separator",
      contexts: ["page"]
    });

    // 创建页面右键菜单组
    config.page_contexts.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["page"]
      });
    });
  } else {
    console.warn('配置文件中没有找到有效的页面菜单项');
  }
});

// 处理上下文菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 加载配置（从缓存中）
  const config = await loadMenuConfig();

  // 处理选中文本的菜单项点击
  if (info.selectionText && info.menuItemId.indexOf("id-") === 0) {
    const selectedText = info.selectionText;

    // 查找被点击的菜单项
    const menuItem = config.contexts.find(item => item.id === info.menuItemId);

    if (menuItem && menuItem.url) {
      // 替换URL中的占位符 %s 为选中的文本
      const searchUrl = menuItem.url.replace(/%s/g, encodeURIComponent(selectedText));
      chrome.tabs.create({ url: searchUrl });
    }
  }

  // 处理页面右键菜单项点击
  else if (info.menuItemId.indexOf("page-") === 0) {
    // 查找被点击的页面菜单项
    const pageMenuItem = config.page_contexts.find(item => item.id === info.menuItemId);

    if (pageMenuItem && pageMenuItem.url && tab.url) {
      // 替换URL中的占位符 %s 为当前页面URL
      const actionUrl = pageMenuItem.url.replace(/%s/g, encodeURIComponent(tab.url));
      chrome.tabs.create({ url: actionUrl });
    }
  }
});

