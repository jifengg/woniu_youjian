// 全局变量，用于存储配置
let config = {
  text_contexts: [],
  page_contexts: [],
  link_contexts: [],
  image_contexts: []
};

// 配置类型映射
const configTypes = {
  'text': 'text_contexts',
  'page': 'page_contexts',
  'link': 'link_contexts',
  'image': 'image_contexts'
};

// 初始化配置页面
document.addEventListener('DOMContentLoaded', async () => {
  // 加载配置
  await loadConfig();

  // 渲染菜单列表
  renderAllMenuLists();

  // 设置选项卡切换
  setupTabs();

  // 设置添加菜单按钮事件
  setupAddMenuButtons();

  // 设置保存按钮事件
  document.getElementById('save-button').addEventListener('click', saveConfig);

  // 显示扩展信息
  displayExtensionInfo();

  // 初始化配置管理功能
  setupConfigManagement();
});

// 加载配置
async function loadConfig() {
  try {
    // 使用utils.js中的共享函数加载配置
    config = await loadMenuConfig();
    console.log('配置加载成功:', config);
  } catch (error) {
    console.error('加载配置失败:', error);
    showStatusMessage('加载配置失败: ' + error.message, 'error');
  }
}

// 渲染所有菜单列表
function renderAllMenuLists() {
  for (const [tabId, configType] of Object.entries(configTypes)) {
    renderMenuList(tabId, configType);
  }
}

// 渲染单个类型的菜单列表
function renderMenuList(tabId, configType) {
  const container = document.getElementById(`${tabId}-menu-list`);
  container.innerHTML = ''; // 清空容器

  if (!config[configType] || config[configType].length === 0) {
    container.innerHTML = '<div class="no-items">暂无菜单项</div>';
    return;
  }

  config[configType].forEach((item, index) => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    menuItem.dataset.index = index;

    // 创建启用/禁用复选框
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'custom-checkbox';
    checkbox.checked = item.enable !== false; // 默认为true
    checkbox.addEventListener('change', () => {
      config[configType][index].enable = checkbox.checked;

      // 自动保存配置
      saveConfig().then(() => {
        showStatusMessage(checkbox.checked ? '菜单项已启用并保存' : '菜单项已禁用并保存', 'success');
      }).catch(error => {
        console.error('自动保存失败:', error);
        showStatusMessage('状态更改成功，但保存失败', 'error');
      });
    });

    checkboxWrapper.appendChild(checkbox);
    menuItem.appendChild(checkboxWrapper);

    // 创建名称输入框
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'input-title';
    titleInput.value = item.title || '';
    titleInput.placeholder = '名称';
    titleInput.addEventListener('input', () => {
      config[configType][index].title = titleInput.value;
    });
    menuItem.appendChild(titleInput);

    // 创建URL输入框
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'input-url';
    urlInput.value = item.url || '';
    urlInput.placeholder = 'URL (使用%s作为占位符)';
    urlInput.addEventListener('input', () => {
      config[configType][index].url = urlInput.value;
    });
    menuItem.appendChild(urlInput);

    // 创建操作按钮组
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    // 上移按钮
    const upButton = document.createElement('button');
    upButton.className = 'btn btn-up';
    upButton.innerHTML = '↑';
    upButton.title = '上移';
    upButton.disabled = index === 0;
    upButton.addEventListener('click', () => {
      if (index > 0) {
        // 交换当前项与上一项
        [config[configType][index], config[configType][index - 1]] = 
        [config[configType][index - 1], config[configType][index]];
        renderMenuList(tabId, configType); // 重新渲染列表

        // 自动保存配置
        saveConfig().then(() => {
          showStatusMessage('菜单项上移成功并已保存', 'success');
        }).catch(error => {
          console.error('自动保存失败:', error);
          showStatusMessage('菜单项上移成功，但保存失败', 'error');
        });
      }
    });
    actionButtons.appendChild(upButton);

    // 下移按钮
    const downButton = document.createElement('button');
    downButton.className = 'btn btn-down';
    downButton.innerHTML = '↓';
    downButton.title = '下移';
    downButton.disabled = index === config[configType].length - 1;
    downButton.addEventListener('click', () => {
      if (index < config[configType].length - 1) {
        // 交换当前项与下一项
        [config[configType][index], config[configType][index + 1]] = 
        [config[configType][index + 1], config[configType][index]];
        renderMenuList(tabId, configType); // 重新渲染列表

        // 自动保存配置
        saveConfig().then(() => {
          showStatusMessage('菜单项下移成功并已保存', 'success');
        }).catch(error => {
          console.error('自动保存失败:', error);
          showStatusMessage('菜单项下移成功，但保存失败', 'error');
        });
      }
    });
    actionButtons.appendChild(downButton);

    // 删除按钮
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-delete';
    deleteButton.innerHTML = '×';
    deleteButton.title = '删除';
    deleteButton.addEventListener('click', () => {
      if (confirm('确定要删除这个菜单项吗？')) {
        config[configType].splice(index, 1);
        renderMenuList(tabId, configType); // 重新渲染列表

        // 自动保存配置
        saveConfig().then(() => {
          showStatusMessage('菜单项删除成功并已保存', 'success');
        }).catch(error => {
          console.error('自动保存失败:', error);
          showStatusMessage('菜单项删除成功，但保存失败', 'error');
        });
      }
    });
    actionButtons.appendChild(deleteButton);

    menuItem.appendChild(actionButtons);
    container.appendChild(menuItem);
  });
}

// 设置选项卡切换
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有选项卡的活动状态
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      // 激活当前选项卡
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      // 如果切换到设置选项卡，更新配置预览
      if (tabId === 'settings') {
        // 调用更新配置预览函数
        updateConfigPreview();
      }
    });
  });
}

// 设置添加菜单按钮事件
function setupAddMenuButtons() {
  for (const [tabId, configType] of Object.entries(configTypes)) {
    const addButton = document.getElementById(`${tabId}-add-button`);
    const titleInput = document.getElementById(`${tabId}-new-title`);
    const urlInput = document.getElementById(`${tabId}-new-url`);

    addButton.addEventListener('click', () => {
      const title = titleInput.value.trim();
      const url = urlInput.value.trim();

      if (title && url) {
        // 生成唯一ID
        const id = `${tabId}-${Date.now()}`;

        // 添加新菜单项
        config[configType].push({
          id: id,
          title: title,
          url: url,
          enable: true
        });

        // 清空输入框
        titleInput.value = '';
        urlInput.value = '';

        // 重新渲染菜单列表
        renderMenuList(tabId, configType);

        // 自动保存配置
        saveConfig().then(() => {
          showStatusMessage('菜单项添加成功并已保存', 'success');
        }).catch(error => {
          console.error('自动保存失败:', error);
          showStatusMessage('菜单项添加成功，但保存失败', 'error');
        });
      } else {
        showStatusMessage('名称和URL不能为空', 'error');
      }
    });
  }
}

// 保存配置
async function saveConfig() {
  try {
    // 创建要保存的配置对象（排除不必要的字段）
    const configToSave = {
      text_contexts: config.text_contexts.map(cleanItem),
      page_contexts: config.page_contexts.map(cleanItem),
      link_contexts: config.link_contexts.map(cleanItem),
      image_contexts: config.image_contexts.map(cleanItem)
    };

    // 使用chrome.storage.sync保存配置
    await chrome.storage.sync.set({ config: configToSave });

    // 将配置通过消息发送给background.js，让它处理保存
    chrome.runtime.sendMessage({
      action: 'saveConfig',
      config: configToSave
    }, response => {
      if (response && response.success) {
        showStatusMessage('配置保存成功！', 'success');

        // 通知background.js重新加载配置
        chrome.runtime.sendMessage({ action: 'reloadConfig' });
      } else {
        showStatusMessage('配置保存失败: ' + (response ? response.message : '未知错误'), 'error');
      }
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    showStatusMessage('保存配置失败: ' + error.message, 'error');
  }
}

// 清理菜单项，移除不必要的临时字段
function cleanItem(item) {
  const cleanedItem = { ...item };

  // 保留这些字段
  const fieldsToKeep = ['id', 'title', 'url', 'enable'];

  // 移除不需要的字段
  Object.keys(cleanedItem).forEach(key => {
    if (!fieldsToKeep.includes(key)) {
      delete cleanedItem[key];
    }
  });

  return cleanedItem;
}

// 显示状态消息
function showStatusMessage(message, type = 'success') {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = type === 'success' ? 'status-success' : 'status-error';

  // 3秒后清除消息
  setTimeout(() => {
    statusElement.textContent = '';
  }, 3000);
}

// 显示扩展信息
function displayExtensionInfo() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('extension-name').textContent = manifest.name;
  document.getElementById('extension-version').textContent = manifest.version;
  // 显示作者信息
  document.getElementById('extension-author').textContent = manifest.author || "jifengg";
}

// 显示当前配置
function updateConfigPreview() {
  const configPreview = document.getElementById('config-preview');
  if (!configPreview) return;

  // 创建干净的配置对象（不包含临时数据）
  const configToDisplay = {
    text_contexts: config.text_contexts.map(cleanItem),
    page_contexts: config.page_contexts.map(cleanItem),
    link_contexts: config.link_contexts.map(cleanItem),
    image_contexts: config.image_contexts.map(cleanItem)
  };

  // 格式化JSON并显示
  configPreview.textContent = JSON.stringify(configToDisplay, null, 2);
}

// 配置管理功能
function setupConfigManagement() {
  // 获取元素引用
  const exportConfigButton = document.getElementById('export-config');
  const importConfigButton = document.getElementById('import-config');
  const fileInput = document.getElementById('config-file-input');

  // 导出配置
  exportConfigButton.addEventListener('click', () => {
    try {
      // 创建干净的配置对象
      const configToExport = {
        text_contexts: config.text_contexts.map(cleanItem),
        page_contexts: config.page_contexts.map(cleanItem),
        link_contexts: config.link_contexts.map(cleanItem),
        image_contexts: config.image_contexts.map(cleanItem)
      };

      // 转换为JSON字符串
      const configJson = JSON.stringify(configToExport, null, 2);

      // 创建Blob
      const blob = new Blob([configJson], {type: 'application/json'});

      // 创建下载链接
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'woniuyoujian_config.json';

      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 释放URL对象
      URL.revokeObjectURL(downloadUrl);

      showStatusMessage('配置导出成功！', 'success');
    } catch (error) {
      console.error('配置导出失败:', error);
      showStatusMessage('配置导出失败: ' + error.message, 'error');
    }
  });

  // 导入配置按钮点击事件
  importConfigButton.addEventListener('click', () => {
    fileInput.click();
  });

  // 文件选择事件
  fileInput.addEventListener('change', (event) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // 解析JSON
        const importedConfig = JSON.parse(e.target.result);

        // 基本验证
        if (!importedConfig.text_contexts || !importedConfig.page_contexts || 
            !importedConfig.link_contexts || !importedConfig.image_contexts) {
          throw new Error('导入的配置格式无效，必须包含所有必要的菜单类型');
        }

        // 确认是否导入
        if (confirm('确定要导入此配置吗？这将覆盖您当前的所有菜单配置。')) {
          // 更新配置
          config.text_contexts = importedConfig.text_contexts || [];
          config.page_contexts = importedConfig.page_contexts || [];
          config.link_contexts = importedConfig.link_contexts || [];
          config.image_contexts = importedConfig.image_contexts || [];

          // 重新渲染菜单列表
          renderAllMenuLists();

          // 更新配置预览
          updateConfigPreview();

          // 保存配置
          saveConfig().then(() => {
            showStatusMessage('配置导入成功并已保存！', 'success');
          }).catch(error => {
            console.error('保存导入的配置失败:', error);
            showStatusMessage('配置导入成功，但保存失败: ' + error.message, 'error');
          });
        }
      } catch (error) {
        console.error('配置导入失败:', error);
        showStatusMessage('配置导入失败: ' + error.message, 'error');
      }

      // 清除文件输入，允许选择相同的文件
      fileInput.value = '';
    };

    reader.onerror = () => {
      showStatusMessage('读取文件时发生错误', 'error');
      fileInput.value = '';
    };

    reader.readAsText(file);
  });

  // 初始显示配置
  updateConfigPreview();
}