
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
    menuConfig = { contexts: [] };
    return menuConfig;
  }
}

// 创建上下文菜单项
chrome.runtime.onInstalled.addListener(async () => {
  // 移除所有现有的上下文菜单项
  chrome.contextMenus.removeAll();

  // 加载配置
  const config = await loadMenuConfig();

  // 创建菜单项
  if (config.contexts && config.contexts.length > 0) {
    config.contexts.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["selection"]
      });
    });
  } else {
    console.warn('配置文件中没有找到有效的菜单项');
  }
});

// 处理上下文菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;

  if (!selectedText) return;

  // 获取配置（从缓存中）
  const config = await loadMenuConfig();

  // 查找被点击的菜单项
  const menuItem = config.contexts.find(item => item.id === info.menuItemId);

  if (menuItem && menuItem.url) {
    // 替换URL中的占位符 %s 为选中的文本
    const searchUrl = menuItem.url.replace(/%s/g, encodeURIComponent(selectedText));
    chrome.tabs.create({ url: searchUrl });
  }
});
