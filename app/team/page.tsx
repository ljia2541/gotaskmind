"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserPlus, Trash2, X, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// 导入类型
import { TeamMember, ProjectMember, roleLabels, projectRoleLabels, memberStatusLabels } from '@/types/team';
import { Project } from '@/types/project';
import { useAuth } from '@/app/hooks/use-auth';

export default function TeamManagementPage() {
  const { user, isAuthenticated } = useAuth();
  
  // 状态管理
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  // 表单状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member' as TeamMember['role']
  });
  
  // 初始化团队成员和项目数据
  useEffect(() => {
    loadData();
  }, []);
  
  // 从本地存储加载数据
  const loadData = () => {
    // 加载团队成员
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers));
    } else {
      // 初始化模拟团队成员数据
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          email: user?.email || 'admin@example.com',
          name: user?.name || '管理员',
          picture: user?.picture,
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'member1@example.com',
          name: '张三',
          role: 'member',
          status: 'active',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          email: 'member2@example.com',
          name: '李四',
          role: 'member',
          status: 'active',
          joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTeamMembers(mockMembers);
      localStorage.setItem('teamMembers', JSON.stringify(mockMembers));
    }
    
    // 加载项目
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    
    // 加载项目成员关系
    const savedProjectMembers = localStorage.getItem('projectMembers');
    if (savedProjectMembers) {
      setProjectMembers(JSON.parse(savedProjectMembers));
    } else {
      // 初始化模拟项目成员关系
      const mockProjectMembers: ProjectMember[] = [
        {
          projectId: '1',
          memberId: '1',
          role: 'admin',
          assignedTasksCount: 5,
          completedTasksCount: 3
        },
        {
          projectId: '1',
          memberId: '2',
          role: 'editor',
          assignedTasksCount: 3,
          completedTasksCount: 2
        },
        {
          projectId: '2',
          memberId: '1',
          role: 'admin',
          assignedTasksCount: 2,
          completedTasksCount: 1
        },
        {
          projectId: '2',
          memberId: '3',
          role: 'viewer'
        }
      ];
      setProjectMembers(mockProjectMembers);
      localStorage.setItem('projectMembers', JSON.stringify(mockProjectMembers));
    }
  };
  
  // 保存数据到本地存储
  const saveData = () => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    localStorage.setItem('projectMembers', JSON.stringify(projectMembers));
  };
  
  // 添加新成员
  const handleAddMember = () => {
    if (!newMember.email) return;
    
    // 检查邮箱是否已存在
    if (teamMembers.some(member => member.email === newMember.email)) {
      alert('该邮箱已存在');
      return;
    }
    
    const member: TeamMember = {
      id: Date.now().toString(),
      email: newMember.email,
      name: newMember.email.split('@')[0], // 临时使用邮箱前缀作为名字
      role: newMember.role,
      status: 'invited',
      joinedAt: new Date().toISOString()
    };
    
    setTeamMembers([...teamMembers, member]);
    setIsAddMemberDialogOpen(false);
    setNewMember({ email: '', role: 'member' });
    saveData();
  };
  
  // 移除成员
  const handleRemoveMember = (memberId: string) => {
    // 在测试模式下，不允许移除第一个管理员账户
    // 在正常模式下，不允许移除自己作为管理员
    if ((isTestMode && memberId === '1') || 
        (!isTestMode && memberId === teamMembers.find(m => m.role === 'admin' && m.email === user?.email)?.id)) {
      alert('无法移除管理员账户');
      return;
    }
    
    // 移除团队成员
    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    setTeamMembers(updatedMembers);
    
    // 同时移除项目成员关系
    const updatedProjectMembers = projectMembers.filter(pm => pm.memberId !== memberId);
    setProjectMembers(updatedProjectMembers);
    
    saveData();
  };
  
  // 更新成员角色
  const handleUpdateRole = (memberId: string, role: TeamMember['role']) => {
    // 在测试模式下，不允许更改第一个管理员账户的角色
    // 在正常模式下，不允许更改自己的角色
    if ((isTestMode && memberId === '1') || 
        (!isTestMode && memberId === teamMembers.find(m => m.role === 'admin' && m.email === user?.email)?.id)) {
      alert('无法更改管理员账户的角色');
      return;
    }
    
    const updatedMembers = teamMembers.map(member => 
      member.id === memberId ? { ...member, role } : member
    );
    setTeamMembers(updatedMembers);
    saveData();
  };
  
  // 获取项目成员
  const getProjectMembers = (projectId: string) => {
    return projectMembers
      .filter(pm => pm.projectId === projectId)
      .map(pm => {
        const member = teamMembers.find(m => m.id === pm.memberId);
        return member ? { ...pm, member } : null;
      })
      .filter(Boolean) as Array<ProjectMember & { member: TeamMember }>;
  };
  
  // 获取未加入项目的成员
  const getNonProjectMembers = (projectId: string) => {
    const projectMemberIds = projectMembers
      .filter(pm => pm.projectId === projectId)
      .map(pm => pm.memberId);
    
    return teamMembers.filter(member => !projectMemberIds.includes(member.id));
  };
  
  // 添加项目成员
  const handleAddProjectMember = (projectId: string, memberId: string, role: ProjectMember['role']) => {
    const projectMember: ProjectMember = {
      projectId,
      memberId,
      role
    };
    
    setProjectMembers([...projectMembers, projectMember]);
    saveData();
  };
  
  // 移除项目成员
  const handleRemoveProjectMember = (projectId: string, memberId: string) => {
    const updatedProjectMembers = projectMembers.filter(
      pm => !(pm.projectId === projectId && pm.memberId === memberId)
    );
    setProjectMembers(updatedProjectMembers);
    saveData();
  };
  
  // 过滤团队成员
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 未登录用户也可以访问团队页面，但会使用模拟数据和有限功能
  const isTestMode = !isAuthenticated;
  
  // 检查当前用户是否为管理员
  // 未登录用户在测试模式下默认为管理员权限
  const isCurrentUserAdmin = isTestMode || teamMembers.some(
    member => member.email === user?.email && member.role === 'admin'
  );
  
  // 为未登录用户提供模拟数据访问权限
  if (isTestMode) {
    // 显示测试模式提示
    console.log('测试模式：未登录用户访问团队管理功能');
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">团队管理</h1>
      
      <Tabs defaultValue="members" className="space-y-6">
        {/* 团队成员标签 */}
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="members">团队成员</TabsTrigger>
          <TabsTrigger value="projects">项目管理</TabsTrigger>
        </TabsList>
        
        {/* 团队成员内容 */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索团队成员"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isCurrentUserAdmin && (
              <Button
                onClick={() => setIsAddMemberDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                添加成员
              </Button>
            )}
          </div>
          
          <div className="grid gap-4">
            {filteredMembers.map((member) => {
              const roleConfig = roleLabels[member.role || 'member'];
              const statusConfig = memberStatusLabels[member.status || 'active'];
              
              return (
                <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        {member.picture ? (
                          <img src={member.picture} alt={member.name} />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
                      <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      
                      {isCurrentUserAdmin && member.id !== '1' && (
                        <div className="flex gap-2">
                          <Select
                            value={member.role || 'member'}
                            onValueChange={(value: TeamMember['role']) => handleUpdateRole(member.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="角色" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">管理员</SelectItem>
                              <SelectItem value="member">成员</SelectItem>
                              <SelectItem value="viewer">查看者</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* 项目管理内容 */}
        <TabsContent value="projects">
          <div className="grid gap-6">
            {projects.map((project) => {
              const projectMembers = getProjectMembers(project.id);
              const nonProjectMembers = getNonProjectMembers(project.id);
              const statusConfig = {
                planning: { label: '规划中', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
                active: { label: '进行中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
                completed: { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
                'on-hold': { label: '暂停', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' }
              }[project.status];
              
              return (
                <Card key={project.id} className="overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || '#3b82f6' }}></div>
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">项目成员</h4>
                      {projectMembers.length === 0 ? (
                        <div className="text-muted-foreground py-2">暂无项目成员</div>
                      ) : (
                        <div className="grid gap-2">
                          {projectMembers.map((pm) => {
                            const roleConfig = projectRoleLabels[pm.role];
                            return (
                              <div key={pm.memberId} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {pm.member.picture ? (
                                      <img src={pm.member.picture} alt={pm.member.name} />
                                    ) : (
                                      <div className="flex items-center justify-center h-full w-full">
                                        {pm.member.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium">{pm.member.name}</div>
                                    <div className="text-xs text-muted-foreground">{pm.member.email}</div>
                                  </div>
                                  <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {pm.assignedTasksCount !== undefined && (
                                    <span className="text-sm">任务: {pm.completedTasksCount || 0}/{pm.assignedTasksCount}</span>
                                  )}
                                  
                                  {isCurrentUserAdmin && (
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => handleRemoveProjectMember(project.id, pm.memberId)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {isCurrentUserAdmin && nonProjectMembers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">添加成员到项目</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {nonProjectMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 border border-border rounded-md">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {member.picture ? (
                                    <img src={member.picture} alt={member.name} />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full">
                                      {member.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </Avatar>
                                <div className="text-sm">{member.name}</div>
                              </div>
                              
                              <Select
                                onValueChange={(role: ProjectMember['role']) => {
                                  handleAddProjectMember(project.id, member.id, role);
                                }}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="分配角色" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">项目管理员</SelectItem>
                                  <SelectItem value="editor">编辑者</SelectItem>
                                  <SelectItem value="viewer">查看者</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            
            {projects.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                暂无项目，请先在任务管理页面创建项目
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* 添加成员对话框 */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加团队成员</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="输入成员邮箱"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={newMember.role}
                onValueChange={(value: TeamMember['role']) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="member">成员</SelectItem>
                  <SelectItem value="viewer">查看者</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAddMemberDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddMember}>添加成员</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}