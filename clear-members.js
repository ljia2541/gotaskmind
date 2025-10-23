// 清除团队成员数据的脚本
if (typeof window !== 'undefined') {
  console.log('清除localStorage中的团队成员数据...');
  localStorage.removeItem('teamMembers');
  localStorage.removeItem('projectMembers');
  console.log('数据已清除，请刷新页面查看效果');
} else {
  console.log('需要在浏览器环境中运行此脚本');
}