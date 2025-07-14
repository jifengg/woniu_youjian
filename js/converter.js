/**
 * 将旧格式的配置文件转换为新格式的配置文件
 * @param {Object} oldData - 旧格式的配置数据
 * @returns {Object} - 新格式的配置数据
 */
function convertOldToNew(oldData) {
  // 准备新配置
  const newConfig = {
    text_contexts: [],
    page_contexts: [],
    link_contexts: [],
    image_contexts: []
  };

  // 解析 all 数据，转为可查询的字典
  let allItems = [];
  if (oldData.all) {
    try {
      allItems = JSON.parse(oldData.all);
    } catch (e) {
      console.error("无法解析 all 字段，可能格式有误", e);
    }
  }

  // 创建 all 数据的查询字典
  const allDict = {};
  allItems.forEach(item => {
    if (item.c && item.u && item.n) {
      allDict[item.c] = {
        title: item.n,
        url: item.u
      };
    }
  });

  // 解析 txtCustom 数据
  let txtCustom = [];
  if (oldData.txtCustom) {
    try {
      txtCustom = JSON.parse(oldData.txtCustom);
    } catch (e) {
      console.error("无法解析 txtCustom 字段，可能格式有误", e);
    }
  }

  // 创建 txtCustom 查询字典
  const txtCustomDict = {};
  txtCustom.forEach(item => {
    if (item.length >= 2) {
      txtCustomDict[item[0]] = item[1];
    }
  });

  // 处理 txtSelect (text_contexts)
  if (oldData.txtSelect) {
    try {
      const txtSelect = JSON.parse(oldData.txtSelect);
      txtSelect.forEach((item, idx) => {
        // 忽略组合类型
        if (item.includes("（组合）") || item.includes("(组合)")) {
          return;
        }

        // 查找对应的 URL
        let url = null;
        let title = item;

        // 首先从 txtCustom 中查找
        if (txtCustomDict[item]) {
          url = txtCustomDict[item];
        }
        // 其次从 all 中查找
        else {
          for (const [key, info] of Object.entries(allDict)) {
            if (key === item || info.title === item) {
              url = info.url;
              title = info.title;
              break;
            }
          }
        }

        if (url) {
          newConfig.text_contexts.push({
            id: `id-${idx + 1}`,
            title: title,
            url: url
          });
        }
      });
    } catch (e) {
      console.error("处理 txtSelect 时出错:", e);
    }
  }

  // 处理 menSelect (page_contexts)
  if (oldData.menSelect && oldData.menCustom) {
    try {
      const menSelect = JSON.parse(oldData.menSelect);
      const menCustom = JSON.parse(oldData.menCustom);

      // 创建 menCustom 查询字典
      const menCustomDict = {};
      menCustom.forEach(item => {
        if (item.length >= 2) {
          menCustomDict[item[0]] = item[1];
        }
      });

      menSelect.forEach((item, idx) => {
        if (menCustomDict[item]) {
          newConfig.page_contexts.push({
            id: `page-${idx + 1}`,
            title: item,
            url: menCustomDict[item]
          });
        }
      });
    } catch (e) {
      console.error("处理 menSelect 时出错:", e);
    }
  }

  // 处理 linSelect (link_contexts)
  if (oldData.linSelect && oldData.linCustom) {
    try {
      const linSelect = JSON.parse(oldData.linSelect);
      const linCustom = JSON.parse(oldData.linCustom);

      // 创建 linCustom 查询字典
      const linCustomDict = {};
      linCustom.forEach(item => {
        if (item.length >= 2) {
          linCustomDict[item[0]] = item[1];
        }
      });

      linSelect.forEach((item, idx) => {
        if (linCustomDict[item]) {
          newConfig.link_contexts.push({
            id: `link-${idx + 1}`,
            title: item,
            url: linCustomDict[item]
          });
        }
      });
    } catch (e) {
      console.error("处理 linSelect 时出错:", e);
    }
  }

  // 处理 picSelect (image_contexts)
  if (oldData.picSelect && oldData.picCustom) {
    try {
      const picSelect = JSON.parse(oldData.picSelect);
      const picCustom = JSON.parse(oldData.picCustom);

      // 创建 picCustom 查询字典
      const picCustomDict = {};
      picCustom.forEach(item => {
        if (item.length >= 2) {
          picCustomDict[item[0]] = item[1];
        }
      });

      picSelect.forEach((item, idx) => {
        let url = null;
        let title = item;

        if (picCustomDict[item]) {
          url = picCustomDict[item];
        } else {
          for (const [key, info] of Object.entries(allDict)) {
            if (key === item || info.title === item) {
              url = info.url;
              title = info.title;
              break;
            }
          }
        }

        if (url) {
          newConfig.image_contexts.push({
            id: `image-${idx + 1}`,
            title: title,
            url: url
          });
        }
      });
    } catch (e) {
      console.error("处理 picSelect 时出错:", e);
    }
  }

  return newConfig;
}

/**
 * 将旧配置文件转换为新配置文件并保存
 * @param {string} oldJsonPath - 旧配置文件路径
 * @param {string} newJsonPath - 新配置文件路径
 * @returns {Promise<{success: boolean, message: string}>} - 转换结果
 */
async function convertJsonFile(oldJsonPath, newJsonPath) {
  try {
    // 读取旧配置文件
    const fs = require('fs');
    const oldData = JSON.parse(fs.readFileSync(oldJsonPath, 'utf8'));

    // 转换配置
    const newConfig = convertOldToNew(oldData);

    // 写入新配置文件
    fs.writeFileSync(
      newJsonPath,
      JSON.stringify(newConfig, null, 2),
      'utf8'
    );

    return { success: true, message: "转换成功!" };
  } catch (e) {
    return { success: false, message: `转换失败: ${e.message}` };
  }
}

/**
 * 将JSON字符串转换为新格式的配置
 * @param {string} oldJsonString - 旧格式的配置JSON字符串
 * @returns {Object} - 新格式的配置数据
 */
function convertJsonString(oldJsonString) {
  try {
    const oldData = JSON.parse(oldJsonString);
    return {
      success: true,
      config: convertOldToNew(oldData),
      message: "转换成功!"
    };
  } catch (e) {
    return {
      success: false,
      config: null,
      message: `转换失败: ${e.message}`
    };
  }
}

// 如果直接运行此脚本
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertOldToNew,
    convertJsonFile,
    convertJsonString
  };
}
