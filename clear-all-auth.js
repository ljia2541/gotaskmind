/**
 * 全面清除所有认证状态的脚本
 * 用于完全移除测试用户信息，包括cookie和localStorage
 */

// 清除用户会话cookie
function clearUserSession() {
  // 设置cookie过期时间为过去的时间
  document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  console.log('测试用户cookie已清除');
}

// 清除localStorage中的认证状态
function clearAuthState() {
  try {
    localStorage.removeItem('auth_state');
    console.log('localStorage认证状态已清除');
  } catch (error) {
    console.error('清除localStorage失败:', error);
  }
}

// 在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 立即执行清除操作
  clearUserSession();
  clearAuthState();
  
  // 显示确认消息
  alert('所有测试用户认证状态已清除，请刷新页面以查看效果。');
  
  // 主动刷新页面
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// 在Node.js环境中运行
if (typeof window === 'undefined') {
  console.log('请注意：这个脚本需要在浏览器环境中运行才能完全清除认证状态。');
  console.log('请在浏览器控制台中执行以下命令:');
  console.log('document.cookie = \'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;\'');
  console.log('localStorage.removeItem(\'auth_state\')');
  console.log('window.location.reload()');
}