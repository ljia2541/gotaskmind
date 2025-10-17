// 测试AI API功能是否正常工作
const axios = require('axios');

async function testAIService() {
  console.log('开始测试AI服务...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/ai', {
      projectDescription: '创建一个简单的Todo应用，包含添加、删除和标记完成功能'
    });
    
    console.log('API调用成功!');
    console.log('生成的任务数量:', response.data.tasks.length);
    console.log('\n任务示例:');
    response.data.tasks.slice(0, 2).forEach((task, index) => {
      console.log(`\n任务 ${index + 1}:`);
      console.log(`标题: ${task.title}`);
      console.log(`描述: ${task.description}`);
      console.log(`分类: ${task.category}`);
      console.log(`优先级: ${task.priority}`);
    });
    
    console.log('\nAI服务验证成功!');
  } catch (error) {
    console.error('API调用失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
    }
    console.error('\nAI服务验证失败，请检查API密钥和服务配置。');
  }
}

testAIService();