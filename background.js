


// 保存菜单配置的全局变量
let menuConfig = null;

// 从配置文件加载菜单设置，并为每个菜单项添加类型标识
async function loadMenuConfig() {
  // 如果配置已经加载过，直接返回缓存的配置
  if (menuConfig !== null) {
    return menuConfig;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    const config = await response.json();

    // 为每个菜单项添加type标识
    if (config.text_contexts && config.text_contexts.length > 0) {
      config.text_contexts.forEach(item => {
        item.type = 'text';
      });
    }

    if (config.page_contexts && config.page_contexts.length > 0) {
      config.page_contexts.forEach(item => {
        item.type = 'page';
      });
    }

    if (config.link_contexts && config.link_contexts.length > 0) {
      config.link_contexts.forEach(item => {
        item.type = 'link';
      });
    }

    if (config.image_contexts && config.image_contexts.length > 0) {
      config.image_contexts.forEach(item => {
        item.type = 'image';
      });
    }

    // 创建所有菜单项的汇总集合，方便后续查找
    config.all_items = [
      ...(config.text_contexts || []),
      ...(config.page_contexts || []),
      ...(config.link_contexts || []),
      ...(config.image_contexts || [])
    ];

    menuConfig = config;
    return menuConfig;
  } catch (error) {
    console.error('加载配置文件失败:', error);
    menuConfig = { 
      text_contexts: [], 
      page_contexts: [], 
      link_contexts: [],
      image_contexts: [],
      all_items: [] 
    };
    return menuConfig;
  }
}

/**
 * 处理URL中的占位符替换
 * @param {string} urlTemplate - 包含占位符的URL模板
 * @param {string} text - 要替换的文本
 * @return {string} 替换后的URL
 */
function processUrl(urlTemplate, text) {
  if (!urlTemplate || !text) {
    return '';
  }

  // 替换 %s 为编码后的文本
  let processedUrl = urlTemplate.replace(/%s/g, encodeURIComponent(text));

  // 替换 %os 为原始文本（不编码）
  processedUrl = processedUrl.replace(/%os/g, text);

  return processedUrl;
}

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


