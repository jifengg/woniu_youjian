
// 在弹出窗口中展示当前扩展信息
document.addEventListener('DOMContentLoaded', () => {
  // 可以在这里添加一些交互功能，例如统计使用次数等
  console.log('快捷搜索工具弹出窗口已加载');

  // 获取版本号并显示
  const manifest = chrome.runtime.getManifest();
  const versionSpan = document.createElement('span');
  versionSpan.textContent = `版本: ${manifest.version}`;
  versionSpan.style.fontSize = '12px';
  versionSpan.style.color = '#888';
  versionSpan.style.position = 'absolute';
  versionSpan.style.bottom = '8px';
  versionSpan.style.right = '8px';
  document.body.appendChild(versionSpan);
});
