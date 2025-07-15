/**
 * 通用工具函数集
 */

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

// 导出工具函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processUrl
  };
}
