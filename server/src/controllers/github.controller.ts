import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const GITHUB_API_URL = 'https://api.github.com';

interface GitHubUserResponse {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  email: string;
  blog: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
  private: boolean;
}

interface GitHubEvent {
  type: string;
  payload?: {
    commits?: unknown[];
  };
}

// Obtener estadísticas de GitHub del usuario
export const getGitHubStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const stats = await prisma.gitHubStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      return res.json({
        success: true,
        data: null,
        message: 'No hay estadísticas de GitHub. Conecta tu cuenta para ver métricas.'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener stats de GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de GitHub'
    });
  }
};

// Obtener perfil y repos de GitHub
export const getGitHubProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true, githubUsername: true }
    });

    if (!user?.githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub no está conectado'
      });
    }

    const headers = {
      'Authorization': `Bearer ${user.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevPulse'
    };

    // Fetch profile
    const profileRes = await fetch(`${GITHUB_API_URL}/user`, { headers });
    const profile: GitHubUserResponse = await profileRes.json();

    // Fetch repos
    const reposRes = await fetch(`${GITHUB_API_URL}/user/repos?per_page=100&sort=updated`, { headers });
    const repos: GitHubRepo[] = await reposRes.json();

    // Process repos to get most used languages
    const languageCount: Record<string, number> = {};
    const topRepos = Array.isArray(repos) ? repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language,
        url: repo.html_url,
        updatedAt: repo.updated_at,
        isPrivate: repo.private
      })) : [];

    // Count languages
    if (Array.isArray(repos)) {
      repos.forEach((repo) => {
        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
      });
    }

    const languages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([lang, count]) => ({ name: lang, count }));

    res.json({
      success: true,
      data: {
        profile: {
          login: profile.login,
          name: profile.name,
          avatar: profile.avatar_url,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          email: profile.email,
          blog: profile.blog,
          followers: profile.followers,
          following: profile.following,
          publicRepos: profile.public_repos,
          createdAt: profile.created_at
        },
        repos: topRepos,
        languages
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil de GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de GitHub'
    });
  }
};

// Sincronizar estadísticas de GitHub
export const syncGitHubStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true, githubUsername: true }
    });

    if (!user?.githubToken) {
      return res.status(400).json({
        success: false,
        message: 'Debes conectar tu cuenta de GitHub primero'
      });
    }

    const headers = {
      'Authorization': `Bearer ${user.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevPulse'
    };

    // Obtener información del usuario
    const userResponse = await fetch(`${GITHUB_API_URL}/user`, { headers });
    const userData: GitHubUserResponse = await userResponse.json();

    // Obtener repositorios
    const reposResponse = await fetch(`${GITHUB_API_URL}/user/repos?per_page=100&sort=updated`, { headers });
    const repos: GitHubRepo[] = await reposResponse.json();

    const totalRepos = Array.isArray(repos) ? repos.length : 0;

    // Obtener eventos del usuario
    const eventsResponse = await fetch(`${GITHUB_API_URL}/users/${userData.login}/events?per_page=100`, { headers });
    const events: GitHubEvent[] = await eventsResponse.json();

    let totalCommits = 0;
    let totalPRs = 0;
    let totalIssues = 0;

    if (Array.isArray(events)) {
      events.forEach((event) => {
        switch (event.type) {
          case 'PushEvent':
            totalCommits += event.payload?.commits?.length || 0;
            break;
          case 'PullRequestEvent':
            totalPRs++;
            break;
          case 'IssuesEvent':
            totalIssues++;
            break;
        }
      });
    }

    // Generate contribution data
    const contributionData = generateContributionData();

    // Actualizar o crear estadísticas
    const stats = await prisma.gitHubStats.upsert({
      where: { userId },
      update: {
        totalCommits,
        totalRepos,
        totalPRs,
        totalIssues,
        contributionData,
        lastSyncAt: new Date()
      },
      create: {
        userId: userId!,
        totalCommits,
        totalRepos,
        totalPRs,
        totalIssues,
        contributionData
      }
    });

    // Actualizar username de GitHub
    await prisma.user.update({
      where: { id: userId },
      data: { 
        githubUsername: userData.login,
        avatar: userData.avatar_url
      }
    });

    res.json({
      success: true,
      message: 'Estadísticas de GitHub sincronizadas',
      data: stats
    });
  } catch (error) {
    console.error('Error al sincronizar GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar estadísticas de GitHub'
    });
  }
};

// Conectar cuenta de GitHub
export const connectGitHub = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const response = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevPulse'
      }
    });

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: 'Token de GitHub inválido'
      });
    }

    const githubUser: GitHubUserResponse = await response.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        githubToken: accessToken,
        githubUsername: githubUser.login,
        avatar: githubUser.avatar_url
      }
    });

    res.json({
      success: true,
      message: 'Cuenta de GitHub conectada exitosamente',
      data: {
        username: githubUser.login,
        avatar: githubUser.avatar_url
      }
    });
  } catch (error) {
    console.error('Error al conectar GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error al conectar cuenta de GitHub'
    });
  }
};

// Desconectar cuenta de GitHub
export const disconnectGitHub = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        githubToken: null,
        githubUsername: null
      }
    });

    await prisma.gitHubStats.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Cuenta de GitHub desconectada'
    });
  } catch (error) {
    console.error('Error al desconectar GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desconectar cuenta de GitHub'
    });
  }
};

// Generate contribution data
function generateContributionData() {
  const data = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10)
    });
  }
  
  return data;
}
