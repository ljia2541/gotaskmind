/**
 * 清除测试用户cookie的脚本
 * 用于移除之前设置的测试用户会话信息
 */

// 清除用户会话cookie
function clearUserSession() {
  // 设置cookie过期时间为过去的时间
  document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  console.log('测试用户cookie已清除');
}

// 在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 立即执行清除操作
  clearUserSession();
  
  // 显示确认消息
  alert('测试用户信息已清除，请刷新页面以查看效果。');
}

// 在Node.js环境中运行
if (typeof window === 'undefined') {
  console.log('请注意：这个脚本需要在浏览器环境中运行才能清除cookie。');
  console.log('请在浏览器控制台中执行:');
  console.log('document.cookie = \'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;\'');
}