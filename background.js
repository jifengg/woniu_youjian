


// 引入工具函数
importScripts('js/utils.js');

// 注：loadMenuConfig和processUrl函数现在从utils.js中引入

// processUrl函数现在从utils.js中引入

// 创建上下文菜单项
chrome.runtime.onInstalled.addListener(async () => {
  // 移除所有现有的上下文菜单项
  chrome.contextMenus.removeAll();

  // 加载配置
  const config = await loadMenuConfig();

  // 创建选中文本菜单项
  if (config.text_contexts && config.text_contexts.length > 0) {
    config.text_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["selection"]
        });
      }
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
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["page"]
        });
      }
    });
  } else {
    console.warn('配置文件中没有找到有效的页面菜单项');
  }

  // 创建链接右键菜单项
  if (config.link_contexts && config.link_contexts.length > 0) {
    // 创建链接右键菜单分隔符
    chrome.contextMenus.create({
      id: "link-separator",
      type: "separator",
      contexts: ["link"]
    });

    // 创建链接右键菜单组
    config.link_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["link"]
        });
      }
    });
  } else {
    console.warn('配置文件中没有找到有效的链接菜单项');
  }

  // 创建图片右键菜单项
  if (config.image_contexts && config.image_contexts.length > 0) {
    // 创建图片右键菜单分隔符
    chrome.contextMenus.create({
      id: "image-separator",
      type: "separator",
      contexts: ["image"]
    });

    // 创建图片右键菜单组
    config.image_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["image"]
        });
      }
    });
  } else {
    console.warn('配置文件中没有找到有效的图片菜单项');
  }
});

// 处理上下文菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 加载配置（从缓存中）
  const config = await loadMenuConfig();

  // 查找被点击的菜单项（在全部菜单项中查找）
  const menuItem = config.all_items.find(item => item.id === info.menuItemId);

  if (!menuItem || !menuItem.url) {
    return; // 未找到菜单项或菜单项没有URL，不执行任何操作
  }

  // 根据菜单项类型执行不同的操作
  let actionUrl = '';

  switch (menuItem.type) {
    case 'text':
      // 文本选择菜单，需要有选中的文本
      if (!info.selectionText) return;
      actionUrl = processUrl(menuItem.url, info.selectionText);
      break;

    case 'page':
      // 页面菜单，使用当前页面URL
      if (!tab.url) return;
      actionUrl = processUrl(menuItem.url, tab.url);
      break;

    case 'link':
      // 链接菜单，使用右键点击的链接URL
      if (!info.linkUrl) return;
      actionUrl = processUrl(menuItem.url, info.linkUrl);
      break;

    case 'image':
      // 图片菜单，使用右键点击的图片URL
      if (!info.srcUrl) return;
      actionUrl = processUrl(menuItem.url, info.srcUrl);
      break;

    default:
      return; // 未知类型，不执行任何操作
  }

  // 执行操作，打开新标签页
  if (actionUrl) {
    chrome.tabs.create({ url: actionUrl });
  }
});


// 处理来自选项页面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 检查消息类型
  if (message.action === 'saveConfig') {
    // 保存配置到全局变量
    menuConfig = message.config;

    // 将配置保存到storage
    chrome.storage.sync.set({ config: menuConfig }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存配置失败:', chrome.runtime.lastError);
        sendResponse({ success: false, message: chrome.runtime.lastError.message });
      } else {
        console.log('配置保存成功');
        sendResponse({ success: true });
      }
    });

    return true; // 表示会异步发送响应
  }

  // 处理重新加载配置请求
  if (message.action === 'reloadConfig') {
    // 清除缓存的配置，强制重新加载
    clearMenuConfigCache();

    // 重建上下文菜单
    rebuildContextMenus();

    sendResponse({ success: true });
    return true;
  }
});

// 重建所有上下文菜单
async function rebuildContextMenus() {
  // 移除所有现有的上下文菜单项
  await chrome.contextMenus.removeAll();

  // 加载配置
  const config = await loadMenuConfig();

  // 创建选中文本菜单项
  if (config.text_contexts && config.text_contexts.length > 0) {
    config.text_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["selection"]
        });
      }
    });
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
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["page"]
        });
      }
    });
  }

  // 创建链接右键菜单项
  if (config.link_contexts && config.link_contexts.length > 0) {
    // 创建链接右键菜单分隔符
    chrome.contextMenus.create({
      id: "link-separator",
      type: "separator",
      contexts: ["link"]
    });

    // 创建链接右键菜单组
    config.link_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["link"]
        });
      }
    });
  }

  // 创建图片右键菜单项
  if (config.image_contexts && config.image_contexts.length > 0) {
    // 创建图片右键菜单分隔符
    chrome.contextMenus.create({
      id: "image-separator",
      type: "separator",
      contexts: ["image"]
    });

    // 创建图片右键菜单组
    config.image_contexts.forEach(item => {
      // 只有当enable为true或未定义时创建菜单项
      if (item.enable !== false) {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: ["image"]
        });
      }
    });
  }

  console.log('已重建所有上下文菜单');
}