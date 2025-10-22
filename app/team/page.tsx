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
import { Search, UserPlus, Trash2, X, AlertCircle, Users, UserX, UserCheck, Shield, User, Eye, Settings } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { toast } from 'sonner';

// 导入类型
import { TeamMember, ProjectMember, roleLabels, projectRoleLabels, memberStatusLabels } from '@/types/team';
import { Project } from '@/types/project';
import { useAuth } from '@/app/hooks/use-auth';
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';

export default function TeamManagementPage() {
  const { user, isAuthenticated } = useAuth();
  
  // 状态管理
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  // 表单状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isBulkOperation, setIsBulkOperation] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member' as TeamMember['role']
  });

  // 角色修改状态
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    memberId: string;
    newRole: TeamMember['role'];
    memberName: string;
  } | null>(null);
  
  // 初始化团队成员和项目数据
  useEffect(() => {
    loadData();
  }, []);

  // 监听数据变化并保存到localStorage
  useEffect(() => {
    if (teamMembers.length > 0) {
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    }
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('projectMembers', JSON.stringify(projectMembers));
  }, [projectMembers]);

  // 监听localStorage变化，保持数据同步
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects' || e.key === 'teamMembers') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 从本地存储加载数据
  const loadData = () => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      console.log('服务端环境，跳过数据加载');
      setTeamMembers([]);
      setProjects([]);
      setProjectMembers([]);
      return;
    }

    // 加载团队成员
    const savedMembers = localStorage.getItem('teamMembers');

    if (savedMembers && savedMembers.trim() !== '') {
      try {
        const parsedMembers = JSON.parse(savedMembers);
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          console.log('从localStorage加载团队成员成功:', parsedMembers.length, '个成员');
          setTeamMembers(parsedMembers);
        } else {
          console.log('localStorage中的团队成员数据为空，使用默认成员');
          initializeDefaultMembers();
        }
      } catch (error) {
        console.error('解析团队成员数据失败:', error);
        initializeDefaultMembers();
      }
    } else {
      console.log('localStorage中没有团队成员数据，使用默认成员');
      initializeDefaultMembers();
    }

    // 加载项目
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects && savedProjects.trim() !== '') {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) {
          setProjects(parsedProjects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        setProjects([]);
      }
    } else {
      setProjects([]);
    }

    // 加载项目成员关系
    const savedProjectMembers = localStorage.getItem('projectMembers');
    if (savedProjectMembers && savedProjectMembers.trim() !== '') {
      try {
        const parsedProjectMembers = JSON.parse(savedProjectMembers);
        if (Array.isArray(parsedProjectMembers)) {
          setProjectMembers(parsedProjectMembers);
        } else {
          setProjectMembers([]);
        }
      } catch (error) {
        setProjectMembers([]);
      }
    } else {
      setProjectMembers([]);
    }
  };

  // 初始化默认团队成员
  const initializeDefaultMembers = () => {
    const defaultMembers: TeamMember[] = [
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
    setTeamMembers(defaultMembers);
    return defaultMembers;
  };
  
  
  // 添加新成员
  const handleAddMember = () => {
    if (!newMember.email) {
      toast.error('请输入邮箱地址');
      return;
    }

    if (!newMember.name) {
      toast.error('请输入姓名');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    // 检查邮箱是否已存在
    if (teamMembers.some(member => member.email === newMember.email)) {
      toast.error('该邮箱已存在');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      email: newMember.email,
      name: newMember.name,
      role: newMember.role,
      status: 'invited',
      joinedAt: new Date().toISOString()
    };

    setTeamMembers(prev => [...prev, member]);
    setIsAddMemberDialogOpen(false);
    setNewMember({ name: '', email: '', role: 'member' });

    toast.success(`成员 ${newMember.name} 已成功添加并发出邀请`);
  };
  
  // 移除成员
  const handleRemoveMember = (memberId: string) => {
    // 找到要移除的成员
    const memberToRemove = teamMembers.find(m => m.id === memberId);
    if (!memberToRemove) return;

    // 不允许移除自己
    if (memberToRemove.email === user?.email) {
      toast.error('无法移除自己的账户');
      return;
    }

    // 移除团队成员
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));

    // 同时移除项目成员关系
    const removedProjectCount = projectMembers.filter(pm => pm.memberId === memberId).length;
    setProjectMembers(prev => prev.filter(pm => pm.memberId !== memberId));

    toast.success(`成员 ${memberToRemove.name} 已移除，同时从 ${removedProjectCount} 个项目中移除`);
  };

  // 批量删除成员
  const handleBulkRemoveMembers = () => {
    if (selectedMembers.length === 0) {
      toast.error('请先选择要删除的成员');
      return;
    }

    const membersToRemove = teamMembers.filter(m => selectedMembers.includes(m.id));
    const cannotRemoveCount = membersToRemove.filter(m => m.email === user?.email).length;

    if (cannotRemoveCount > 0) {
      toast.error('无法删除自己的账户');
      return;
    }

    const confirmMessage = `确定要删除选中的 ${selectedMembers.length} 个成员吗？这将同时移除他们在所有项目中的身份。`;

    // 这里我们可以使用一个状态来管理确认对话框
    if (confirm(confirmMessage)) {
      const names = membersToRemove.map(m => m.name).join(', ');

      setTeamMembers(prev => prev.filter(member => !selectedMembers.includes(member.id)));

      const totalProjectRemovals = selectedMembers.reduce((count, memberId) => {
        return count + projectMembers.filter(pm => pm.memberId === memberId).length;
      }, 0);

      setProjectMembers(prev => prev.filter(pm => !selectedMembers.includes(pm.memberId)));
      setSelectedMembers([]);
      setIsBulkOperation(false);

      toast.success(`已删除 ${selectedMembers.length} 个成员: ${names}，同时从 ${totalProjectRemovals} 个项目中移除`);
    }
  };
  
  // 更新成员角色
  const handleUpdateRole = (memberId: string, newRole: TeamMember['role']) => {
    const memberToUpdate = teamMembers.find(m => m.id === memberId);
    if (!memberToUpdate) return;

    // 不允许更改自己的角色
    if (memberToUpdate.email === user?.email) {
      toast.error('无法更改自己的角色');
      return;
    }

    // 如果角色没有变化，直接返回
    if (memberToUpdate.role === newRole) {
      return;
    }

    // 设置待确认的角色更改
    setPendingRoleChange({
      memberId,
      newRole,
      memberName: memberToUpdate.name
    });
  };

  // 确认角色更改
  const confirmRoleChange = () => {
    if (!pendingRoleChange) return;

    const { memberId, newRole, memberName } = pendingRoleChange;

    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );

    toast.success(`已将 ${memberName} 的角色更新为 ${roleLabels[newRole].label}`);
    setPendingRoleChange(null);
  };

  // 取消角色更改
  const cancelRoleChange = () => {
    setPendingRoleChange(null);
  };

  // 角色配置图标
  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'member':
        return <User className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // 更新成员状态
  const handleUpdateStatus = (memberId: string, status: TeamMember['status']) => {
    const memberToUpdate = teamMembers.find(m => m.id === memberId);
    if (!memberToUpdate) return;

    // 不允许更改自己的状态
    if (memberToUpdate.email === user?.email) {
      toast.error('无法更改自己的状态');
      return;
    }

    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, status } : member
      )
    );

    toast.success(`已将 ${memberToUpdate.name} 的状态更新为 ${memberStatusLabels[status].label}`);
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
    // 检查是否已经是项目成员
    if (projectMembers.some(pm => pm.projectId === projectId && pm.memberId === memberId)) {
      toast.error('该成员已经是项目成员');
      return;
    }

    const member = teamMembers.find(m => m.id === memberId);
    const project = projects.find(p => p.id === projectId);

    if (!member || !project) return;

    const projectMember: ProjectMember = {
      projectId,
      memberId,
      role
    };

    setProjectMembers(prev => [...prev, projectMember]);

    toast.success(`已将 ${member.name} 添加到项目 ${project.title}，角色：${projectRoleLabels[role].label}`);
  };

  // 移除项目成员
  const handleRemoveProjectMember = (projectId: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    const project = projects.find(p => p.id === projectId);

    if (!member || !project) return;

    setProjectMembers(prev =>
      prev.filter(pm => !(pm.projectId === projectId && pm.memberId === memberId))
    );

    toast.success(`已将 ${member.name} 从项目 ${project.title} 中移除`);
  };
  
  // 过滤团队成员
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 检查当前用户是否为管理员
  // 如果没有认证或者团队中没有当前用户，默认给管理员权限（用于演示）
  // 优化判断逻辑，确保在所有浏览器中都能正确工作
  const isCurrentUserAdmin = () => {
    if (!isAuthenticated) return true;
    if (!user || !user.email) return true;
    return teamMembers.some(
      member => member.email === user.email && member.role === 'admin'
    );
  };
  
  // 缓存结果，避免重复计算
  const currentUserIsAdmin = isCurrentUserAdmin();

    
  // 获取用户语言偏好或使用默认语言（确保服务器端和客户端渲染一致性）
  const defaultLanguage = 'zh'; // 默认使用中文
  const userLanguage = typeof window !== 'undefined' ? (LanguageService.getUserLanguage() || defaultLanguage) : defaultLanguage;
  // 获取对应的翻译文本
  const translations = analyticsTranslations[userLanguage] || analyticsTranslations[defaultLanguage];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 桌面导航 - 放在右侧 */}
      <div className="flex justify-end items-center gap-6 mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {translations.navigation.home}
        </Link>
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {translations.navigation.tasks}
        </Link>
        <Link href="/team" className="text-sm text-foreground font-medium">
          {translations.navigation.team}
        </Link>
        <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {translations.navigation.analytics}
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">{translations.navigation.team}</h1>
      
      <Tabs defaultValue="members" className="space-y-6">
        {/* 团队成员标签 */}
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="members">团队成员</TabsTrigger>
          <TabsTrigger value="projects">项目管理</TabsTrigger>
        </TabsList>
        
        {/* 团队成员内容 */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-col gap-4">
            {/* 搜索和操作栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索团队成员"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isCurrentUserAdmin && (
                  <>
                    {filteredMembers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsBulkOperation(!isBulkOperation);
                          setSelectedMembers([]);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        {isBulkOperation ? '取消批量操作' : '批量操作'}
                      </Button>
                    )}
                    {isBulkOperation && selectedMembers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          已选择 {selectedMembers.length} 个成员
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <UserX className="h-4 w-4" />
                              批量删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认批量删除成员</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除选中的 <span className="font-semibold">{selectedMembers.length}</span> 个成员吗？
                                这将同时移除这些成员在所有项目中的身份。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleBulkRemoveMembers}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <Button
                      onClick={() => setIsAddMemberDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      添加成员
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid gap-4">
            {filteredMembers.map((member) => {
              // 安全获取角色和状态配置，确保即使值不在预期范围内也能正常工作
              const memberRole = member.role || 'member';
              const memberStatus = member.status || 'active';
              const roleConfig = roleLabels[memberRole] || { label: '未知角色', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' };
              const statusConfig = memberStatusLabels[memberStatus] || { label: '未知状态', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' };
              const isSelected = selectedMembers.includes(member.id);

              return (
                <Card
                  key={member.id}
                  className={`p-4 hover:shadow-md transition-all ${
                    isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {isCurrentUserAdmin && isBulkOperation && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers(prev => [...prev, member.id]);
                            } else {
                              setSelectedMembers(prev => prev.filter(id => id !== member.id));
                            }
                          }}
                          className="h-5 w-5"
                        />
                      )}
                      <Avatar className="h-12 w-12">
                        {member.picture ? (
                          <img src={member.picture} alt={member.name} />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {member.name}
                          {member.email === user?.email && (
                            <Badge variant="outline" className="text-xs">
                              您
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`flex items-center gap-1 ${roleConfig.color}`}>
                          {getRoleIcon(memberRole)}
                          {roleConfig.label}
                        </Badge>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>

                      {currentUserIsAdmin && member.email !== user?.email && (
                        <div className="flex items-center gap-2 ml-0 lg:ml-auto">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <Select
                            value={member.role || 'member'}
                            onValueChange={(value) => handleUpdateRole(member.id, value as TeamMember['role'])}
                          >
                            <SelectTrigger className="w-[140px] h-9 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200">
                              <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  <div>
                                    <div className="font-medium">管理员</div>
                                    <div className="text-xs text-muted-foreground">完全控制权限</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="member">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <div className="font-medium">成员</div>
                                    <div className="text-xs text-muted-foreground">可创建和编辑</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="font-medium">查看者</div>
                                    <div className="text-xs text-muted-foreground">只读权限</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {currentUserIsAdmin && member.email !== user?.email && (
                        <div className="flex items-center gap-2 mt-3 lg:mt-0">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-muted-foreground">状态:</span>
                            <Select
                              value={member.status || 'active'}
                              onValueChange={(value) => handleUpdateStatus(member.id, value as TeamMember['status'])}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue placeholder="状态" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">活跃</SelectItem>
                                <SelectItem value="invited">已邀请</SelectItem>
                                <SelectItem value="inactive">非活跃</SelectItem>
                                <SelectItem value="suspended">已暂停</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认移除成员</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要移除成员 <span className="font-semibold">{member.name}</span> 吗？
                                  这将同时移除该成员在所有项目中的成员身份。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  确认移除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                                  
                                  {currentUserIsAdmin && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="icon"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>确认移除项目成员</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            确定要从项目 <span className="font-semibold">{project.title}</span> 中移除成员 <span className="font-semibold">{pm.member.name}</span> 吗？
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>取消</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleRemoveProjectMember(project.id, pm.memberId)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            确认移除
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {currentUserIsAdmin && nonProjectMembers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          添加成员到项目
                        </h4>
                        <div className="border border-border rounded-lg p-3 bg-muted/30">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {nonProjectMembers.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-md hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {member.picture ? (
                                      <img src={member.picture} alt={member.name} />
                                    ) : (
                                      <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-medium">
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{member.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                                  </div>
                                </div>

                                <Select
                                  onValueChange={(role: ProjectMember['role']) => {
                                    handleAddProjectMember(project.id, member.id, role);
                                  }}
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
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
                          {nonProjectMembers.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                              所有团队成员已加入此项目
                            </div>
                          )}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              添加团队成员
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name" className="text-sm font-medium">姓名 *</Label>
              <Input
                id="name"
                type="text"
                placeholder="输入成员姓名"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email" className="text-sm font-medium">邮箱地址 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="输入成员邮箱"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="role" className="text-sm font-medium">初始角色</Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value as TeamMember['role'] })}
              >
                <SelectTrigger id="role" className="h-10">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      管理员 - 完全控制
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      成员 - 可以创建和编辑
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      查看者 - 只读权限
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <UserPlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-2">邀请说明：</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>新成员将收到邀请邮件，点击链接即可加入</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>初始状态为"已邀请"，接受后变为"活跃"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>您可以在任何时间调整成员的角色和权限</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddMemberDialogOpen(false);
                setNewMember({ name: '', email: '', role: 'member' });
              }}
            >
              取消
            </Button>
            <Button onClick={handleAddMember} className="min-w-[100px]">
              <UserPlus className="h-4 w-4 mr-2" />
              添加成员
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 角色修改确认对话框 */}
      <AlertDialog open={!!pendingRoleChange} onOpenChange={(open) => !open && cancelRoleChange()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              确认修改成员角色
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要将成员 <span className="font-semibold text-foreground">{pendingRoleChange?.memberName}</span> 的角色修改为
              <span className="font-semibold text-foreground mx-1">
                {pendingRoleChange && roleLabels[pendingRoleChange.newRole].label}
              </span> 吗？
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">权限说明：</div>
                <div className="text-xs">
                  {pendingRoleChange?.newRole === 'admin' && '管理员拥有完全控制权限，可以管理所有成员和项目。'}
                  {pendingRoleChange?.newRole === 'member' && '成员可以创建和编辑任务，参与项目协作。'}
                  {pendingRoleChange?.newRole === 'viewer' && '查看者拥有只读权限，可以查看但无法修改内容。'}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel variant="secondary" onClick={cancelRoleChange}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="bg-primary text-primary-foreground hover:bg-primary/90">
              确认修改
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
  );
}