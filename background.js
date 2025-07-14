
// 创建上下文菜单项
chrome.runtime.onInstalled.addListener(() => {
  // 百度搜索
  chrome.contextMenus.create({
    id: "search-baidu",
    title: "百度",
    contexts: ["selection"]
  });

  // Google搜索
  chrome.contextMenus.create({
    id: "search-google",
    title: "Google",
    contexts: ["selection"]
  });

  // 有道词典
  chrome.contextMenus.create({
    id: "search-youdao",
    title: "有道词典翻译",
    contexts: ["selection"]
  });
});

// 处理上下文菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;

  if (!selectedText) return;

  let searchUrl = "";

  switch (info.menuItemId) {
    case "search-baidu":
      searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(selectedText)}`;
      break;
    case "search-google":
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`;
      break;
    case "search-youdao":
      searchUrl = `https://dict.youdao.com/result?word=${encodeURIComponent(selectedText)}&lang=en`;
      break;
  }

  if (searchUrl) {
    chrome.tabs.create({ url: searchUrl });
  }
});
