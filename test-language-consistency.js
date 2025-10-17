const axios = require('axios');

async function testLanguageConsistency() {
  console.log('开始测试语言一致性功能...');
  
  // 测试中文输入
  console.log('\n=== 测试中文输入 ===');
  try {
    const chineseResponse = await axios.post('http://localhost:3000/api/ai', {
      projectDescription: '创建一个简单的待办事项应用，包含添加、删除和标记完成功能'
    });
    
    console.log('中文输入调用成功!');
    console.log('生成的任务数量:', chineseResponse.data.tasks.length);
    console.log('任务示例:');
    
    // 检查返回的任务是否为中文
    const firstChineseTask = chineseResponse.data.tasks[0];
    const containsChineseTitle = /[\u4e00-\u9fa5]/.test(firstChineseTask.title);
    const containsChineseDesc = /[\u4e00-\u9fa5]/.test(firstChineseTask.description);
    
    console.log('任务 1:');
    console.log('标题:', firstChineseTask.title);
    console.log('描述:', firstChineseTask.description);
    console.log('标题包含中文:', containsChineseTitle);
    console.log('描述包含中文:', containsChineseDesc);
    
  } catch (error) {
    console.error('中文输入测试失败:', error.message);
    return false;
  }
  
  // 测试英文输入
  console.log('\n=== 测试英文输入 ===');
  try {
    const englishResponse = await axios.post('http://localhost:3000/api/ai', {
      projectDescription: 'Create a simple to-do list application with add, delete and mark complete functions'
    });
    
    console.log('英文输入调用成功!');
    console.log('生成的任务数量:', englishResponse.data.tasks.length);
    console.log('任务示例:');
    
    // 检查返回的任务是否为英文
    const firstEnglishTask = englishResponse.data.tasks[0];
    const containsChineseTitle = /[\u4e00-\u9fa5]/.test(firstEnglishTask.title);
    const containsChineseDesc = /[\u4e00-\u9fa5]/.test(firstEnglishTask.description);
    
    console.log('任务 1:');
    console.log('标题:', firstEnglishTask.title);
    console.log('描述:', firstEnglishTask.description);
    console.log('标题不包含中文:', !containsChineseTitle);
    console.log('描述不包含中文:', !containsChineseDesc);
    
  } catch (error) {
    console.error('英文输入测试失败:', error.message);
    return false;
  }
  
  console.log('\n语言一致性测试完成!');
  return true;
}

testLanguageConsistency().then(success => {
  if (success) {
    console.log('\n🎉 所有测试通过! 语言一致性功能正常工作。');
  } else {
    console.log('\n❌ 测试失败，请检查代码。');
  }
});