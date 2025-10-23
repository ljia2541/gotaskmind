/**
 * 用户删除功能测试脚本
 * 测试团队成员删除功能，包括单个删除和批量删除
 */

// 模拟localStorage环境
const localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// 模拟用户和数据初始化
function initializeTestData() {
  console.log('初始化测试数据...');
  
  // 创建测试团队成员数据
  const testMembers = [
    {
      id: '1',
      email: 'current_user@example.com',
      name: '当前用户',
      role: 'admin',
      status: 'active'
    },
    {
      id: '2',
      email: 'member1@example.com',
      name: '测试成员1',
      role: 'member',
      status: 'active'
    },
    {
      id: '3',
      email: 'member2@example.com',
      name: '测试成员2', 
      role: 'member',
      status: 'active'
    },
    {
      id: '4',
      email: 'member3@example.com',
      name: '测试成员3',
      role: 'viewer',
      status: 'active'
    }
  ];
  
  // 创建测试项目成员关系
  const testProjectMembers = [
    { projectId: 'project1', memberId: '1', role: 'admin' },
    { projectId: 'project1', memberId: '2', role: 'editor' },
    { projectId: 'project2', memberId: '2', role: 'viewer' },
    { projectId: 'project1', memberId: '3', role: 'viewer' },
    { projectId: 'project2', memberId: '4', role: 'editor' }
  ];
  
  // 保存到模拟的localStorage
  localStorage.setItem('teamMembers', JSON.stringify(testMembers));
  localStorage.setItem('projectMembers', JSON.stringify(testProjectMembers));
  
  console.log('测试数据初始化完成');
  console.log('团队成员:', testMembers.length, '个');
  console.log('项目成员关系:', testProjectMembers.length, '个');
}

// 模拟用户对象
const currentUser = {
  email: 'current_user@example.com',
  name: '当前用户',
  role: 'admin'
};

/**
 * 删除单个团队成员
 * @param {string} memberId - 要删除的成员ID
 * @returns {Object} 操作结果
 */
function deleteTeamMember(memberId) {
  console.log(`\n开始删除成员，ID: ${memberId}`);
  
  // 获取当前团队成员数据
  const teamMembersStr = localStorage.getItem('teamMembers');
  if (!teamMembersStr) {
    return { success: false, message: '没有找到团队成员数据' };
  }
  
  const teamMembers = JSON.parse(teamMembersStr);
  const memberToRemove = teamMembers.find(m => m.id === memberId);
  
  if (!memberToRemove) {
    return { success: false, message: `未找到ID为 ${memberId} 的成员` };
  }
  
  // 检查是否是当前用户
  if (memberToRemove.email === currentUser.email) {
    return { success: false, message: '无法删除自己的账户' };
  }
  
  // 获取项目成员数据
  const projectMembersStr = localStorage.getItem('projectMembers');
  const projectMembers = projectMembersStr ? JSON.parse(projectMembersStr) : [];
  
  // 计算要移除的项目关系数量
  const removedProjectCount = projectMembers.filter(pm => pm.memberId === memberId).length;
  
  // 删除成员
  const updatedTeamMembers = teamMembers.filter(m => m.id !== memberId);
  // 删除相关项目成员关系
  const updatedProjectMembers = projectMembers.filter(pm => pm.memberId !== memberId);
  
  // 更新localStorage
  localStorage.setItem('teamMembers', JSON.stringify(updatedTeamMembers));
  localStorage.setItem('projectMembers', JSON.stringify(updatedProjectMembers));
  
  console.log(`成功删除成员: ${memberToRemove.name}`);
  console.log(`同时移除了 ${removedProjectCount} 个项目成员关系`);
  console.log(`剩余团队成员: ${updatedTeamMembers.length} 个`);
  
  return {
    success: true,
    message: `成员 ${memberToRemove.name} 已移除，同时从 ${removedProjectCount} 个项目中移除`,
    removedMember: memberToRemove,
    removedProjectCount,
    remainingMembers: updatedTeamMembers.length
  };
}

/**
 * 批量删除团队成员
 * @param {string[]} memberIds - 要删除的成员ID数组
 * @returns {Object} 操作结果
 */
function bulkDeleteTeamMembers(memberIds) {
  console.log(`\n开始批量删除成员，数量: ${memberIds.length}`);
  
  if (!memberIds || memberIds.length === 0) {
    return { success: false, message: '请先选择要删除的成员' };
  }
  
  // 获取当前团队成员数据
  const teamMembersStr = localStorage.getItem('teamMembers');
  if (!teamMembersStr) {
    return { success: false, message: '没有找到团队成员数据' };
  }
  
  const teamMembers = JSON.parse(teamMembersStr);
  const projectMembersStr = localStorage.getItem('projectMembers');
  const projectMembers = projectMembersStr ? JSON.parse(projectMembersStr) : [];
  
  // 检查是否包含当前用户
  const membersToRemove = teamMembers.filter(m => memberIds.includes(m.id));
  const cannotRemoveCount = membersToRemove.filter(m => m.email === currentUser.email).length;
  
  if (cannotRemoveCount > 0) {
    return { success: false, message: '无法删除自己的账户' };
  }
  
  // 计算要移除的项目关系数量
  const totalProjectRemovals = memberIds.reduce((count, memberId) => {
    return count + projectMembers.filter(pm => pm.memberId === memberId).length;
  }, 0);
  
  // 删除成员
  const updatedTeamMembers = teamMembers.filter(m => !memberIds.includes(m.id));
  // 删除相关项目成员关系
  const updatedProjectMembers = projectMembers.filter(pm => !memberIds.includes(pm.memberId));
  
  // 更新localStorage
  localStorage.setItem('teamMembers', JSON.stringify(updatedTeamMembers));
  localStorage.setItem('projectMembers', JSON.stringify(updatedProjectMembers));
  
  const removedNames = membersToRemove.map(m => m.name).join(', ');
  
  console.log(`成功删除 ${membersToRemove.length} 个成员: ${removedNames}`);
  console.log(`同时移除了 ${totalProjectRemovals} 个项目成员关系`);
  console.log(`剩余团队成员: ${updatedTeamMembers.length} 个`);
  
  return {
    success: true,
    message: `已删除 ${membersToRemove.length} 个成员: ${removedNames}，同时从 ${totalProjectRemovals} 个项目中移除`,
    removedMembers: membersToRemove,
    removedCount: membersToRemove.length,
    totalProjectRemovals,
    remainingMembers: updatedTeamMembers.length
  };
}

/**
 * 显示当前团队成员列表
 */
function displayTeamMembers() {
  console.log('\n当前团队成员列表:');
  const teamMembersStr = localStorage.getItem('teamMembers');
  if (!teamMembersStr) {
    console.log('无团队成员数据');
    return;
  }
  
  const teamMembers = JSON.parse(teamMembersStr);
  teamMembers.forEach(member => {
    console.log(`- ${member.name} (${member.email}) - 角色: ${member.role}, 状态: ${member.status}`);
  });
  console.log(`总计: ${teamMembers.length} 个成员\n`);
}

/**
 * 运行测试
 */
function runTests() {
  console.log('========== 用户删除功能测试 ==========');
  
  // 初始化测试数据
  initializeTestData();
  
  // 显示初始成员列表
  console.log('\n初始状态:');
  displayTeamMembers();
  
  // 测试1: 尝试删除自己 (应该失败)
  console.log('\n测试1: 尝试删除自己的账户');
  const test1Result = deleteTeamMember('1');
  console.log('测试1结果:', test1Result.success ? '成功' : '失败', '-', test1Result.message);
  
  // 测试2: 删除单个成员
  console.log('\n测试2: 删除单个成员 (ID: 2)');
  const test2Result = deleteTeamMember('2');
  console.log('测试2结果:', test2Result.success ? '成功' : '失败', '-', test2Result.message);
  
  // 显示删除后的成员列表
  console.log('\n删除单个成员后:');
  displayTeamMembers();
  
  // 测试3: 批量删除成员
  console.log('\n测试3: 批量删除成员 (ID: 3, 4)');
  const test3Result = bulkDeleteTeamMembers(['3', '4']);
  console.log('测试3结果:', test3Result.success ? '成功' : '失败', '-', test3Result.message);
  
  // 显示最终成员列表
  console.log('\n批量删除后的最终状态:');
  displayTeamMembers();
  
  console.log('\n========== 测试完成 ==========');
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js环境下直接运行
  runTests();
} else {
  // 浏览器环境下挂载到window对象
  window.runUserDeletionTests = runTests;
  console.log('用户删除测试脚本已加载，请调用 runUserDeletionTests() 运行测试');
}