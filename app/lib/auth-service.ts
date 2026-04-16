'use server'

import { OAuth2Client } from 'google-auth-library';

// 从环境变量获取配置
function getAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
    'https://www.gotaskmind.com/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google认证配置未完成，请设置环境变量');
  }

  return { clientId, clientSecret, redirectUri };
}

// 创建OAuth客户端实例
function createOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getAuthConfig();
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri
  });
}

/**
 * 生成Google登录URL
 * @returns Google认证URL
 */
export async function generateAuthUrl(): Promise<string> {
  const client = createOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // 确保获取刷新令牌
  });
}

/**
 * 获取用户信息
 * @param client OAuth2Client实例
 * @returns 用户基本信息
 */
async function getUserInfo(client: OAuth2Client): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  try {
    const userinfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    const userInfo = userinfoResponse.data;
    
    return {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw new Error('获取用户信息失败');
  }
}

/**
 * 验证授权码并获取访问令牌
 * @param code Google返回的授权码
 * @returns 令牌信息和用户信息
 */
export async function verifyAuthCode(code: string): Promise<{
  tokens: any;
  userInfo: {
    email: string;
    name: string;
    picture?: string;
  };
}> {
  try {
    const client = createOAuthClient();
    // 验证授权码并获取令牌
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 获取用户信息
    const userInfo = await getUserInfo(client);

    return {
      tokens,
      userInfo
    };
  } catch (error) {
    console.error('Google认证失败:', error);
    throw new Error('认证过程中发生错误');
  }
}

/**
 * 验证ID令牌
 * @param idToken ID令牌
 * @returns 令牌验证结果
 */
export async function verifyIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  try {
    const client = createOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: client.options.clientId
    });

    const payload = ticket.getPayload();
    
    return {
      email: payload?.email || '',
      name: payload?.name || '',
      picture: payload?.picture
    };
  } catch (error) {
    console.error('验证ID令牌失败:', error);
    throw new Error('无效的ID令牌');
  }
}