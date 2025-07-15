
// 加载配置文件并动态创建搜索按钮
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 获取搜索按钮容器和输入框
    const searchButtonsContainer = document.getElementById('search-buttons');
    const searchInput = document.getElementById('search-input');

    // 从工具函数加载配置
    const config = await loadMenuConfig();

    // 确保有文本搜索选项
    if (config.text_contexts && config.text_contexts.length > 0) {
      // 为每个搜索引擎创建按钮
      config.text_contexts.forEach(engine => {
        // 只有当enable为true或未定义时创建按钮
        if (engine.enable !== false) {
          // 创建按钮元素
          const button = document.createElement('div');
          button.className = 'search-button';
          button.dataset.url = engine.url;

          // 添加标题
          const span = document.createElement('span');
          span.textContent = engine.title;
          button.appendChild(span);

          // 添加点击事件
          button.addEventListener('click', () => {
            const searchText = searchInput.value.trim();
            if (searchText) {
              // 处理URL中的占位符
              const url = processUrl(engine.url, searchText);
              chrome.tabs.create({ url });
            } else {
              // 输入框为空时给予提示
              searchInput.placeholder = '请输入搜索内容...';
              searchInput.classList.add('error');
              setTimeout(() => {
                searchInput.classList.remove('error');
                searchInput.placeholder = '请输入要搜索的内容...';
              }, 1000);
            }
          });

          // 将按钮添加到容器中
          searchButtonsContainer.appendChild(button);
        }
      });

      // 添加回车键搜索功能（默认使用第一个搜索引擎）
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          const searchText = searchInput.value.trim();
          if (searchText && config.text_contexts.length > 0) {
            // 查找第一个启用的搜索引擎
            const enabledEngines = config.text_contexts.filter(engine => engine.enable !== false);
            if (enabledEngines.length > 0) {
              const defaultEngine = enabledEngines[0];
              const url = processUrl(defaultEngine.url, searchText);
              chrome.tabs.create({ url });
            }
          }
        }
      });
    } else {
      // 没有找到搜索引擎配置
      const errorMsg = document.createElement('div');
      errorMsg.textContent = '配置中没有搜索引擎';
      errorMsg.style.color = 'red';
      searchButtonsContainer.appendChild(errorMsg);
    }

    // 显示版本信息
    const manifest = chrome.runtime.getManifest();
    const versionInfo = document.createElement('div');
    versionInfo.className = 'version-info';

    // 创建版本文本
    const versionText = document.createElement('span');
    versionText.textContent = `${manifest.name} v${manifest.version}`;
    versionInfo.appendChild(versionText);

    // 创建设置图标按钮
    const settingsBtn = document.createElement('button');
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = '打开设置页面';
    settingsBtn.className = 'settings-icon';
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    versionInfo.appendChild(settingsBtn);

    document.body.appendChild(versionInfo);

  } catch (error) {
    console.error('加载配置文件失败:', error);
    const errorMsg = document.createElement('div');
    errorMsg.textContent = '加载配置失败: ' + error.message;
    errorMsg.style.color = 'red';
    document.body.appendChild(errorMsg);
  }
});

// processUrl函数现在从utils.js中引入
