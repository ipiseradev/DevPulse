import { Router, Request, Response } from 'express';
import { 
  getGitHubStats, 
  syncGitHubStats, 
  connectGitHub, 
  disconnectGitHub,
  getGitHubProfile 
} from '../controllers/github.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import prisma from '../config/database';

const router = Router();

interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
}

interface GitHubUser {
  login: string;
  email: string;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
}

// Callback de GitHub OAuth (NO requiere autenticación JWT)
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    console.log('GitHub callback received:', { code: code ? 'yes' : 'no', state });
    
    if (!code) {
      return res.redirect('http://localhost:3000/dashboard/github?error=no_code');
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();
    console.log('Token response:', tokenData.error ? 'ERROR' : 'OK');

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return res.redirect('http://localhost:3000/dashboard/github?error=oauth_failed');
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevPulse',
      },
    });

    const githubUser: GitHubUser = await userResponse.json();
    console.log('GitHub user:', githubUser.login, githubUser.email);

    let user = null;
    
    if (state) {
      user = await prisma.user.findUnique({
        where: { id: state as string }
      });
      console.log('Found user by state/userId:', user?.email);
    }
    
    if (!user) {
      const userEmails = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevPulse',
        },
      });
      const emails: GitHubEmail[] = await userEmails.json();
      const primaryEmail = Array.isArray(emails) 
        ? emails.find((e) => e.primary)?.email 
        : githubUser.email;
      
      console.log('Searching by email:', primaryEmail);
      
      if (primaryEmail) {
        user = await prisma.user.findUnique({
          where: { email: primaryEmail }
        });
      }
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubToken: accessToken,
          githubUsername: githubUser.login,
          avatar: githubUser.avatar_url,
        },
      });
      console.log('GitHub token saved for user:', user.email);

      res.redirect('http://localhost:3000/dashboard/github?connected=true');
    } else {
      console.log('User not found in database');
      res.redirect('http://localhost:3000/dashboard/github?error=user_not_found');
    }
  } catch (error) {
    console.error('Error en callback de GitHub:', error);
    res.redirect('http://localhost:3000/dashboard/github?error=server_error');
  }
});

// Todas las rutas siguientes requieren autenticación
router.use(authMiddleware);

// GitHub
router.get('/stats', getGitHubStats);
router.get('/profile', getGitHubProfile);
router.post('/sync', syncGitHubStats);
router.post('/connect', connectGitHub);
router.post('/disconnect', disconnectGitHub);

export default router;
