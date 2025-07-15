/**
 * 通用工具函数集
 */

// 保存菜单配置的全局变量（为了在不同调用之间缓存配置）
let menuConfig = null;

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

/**
 * 从配置文件加载菜单设置，并为每个菜单项添加类型标识
 * @return {Object} 加载的菜单配置
 */
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
 * 清除配置缓存，强制下次调用loadMenuConfig时重新加载
 */
function clearMenuConfigCache() {
  menuConfig = null;
}

