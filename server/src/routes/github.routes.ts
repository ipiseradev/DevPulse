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
  error_description?: string;
}

interface GitHubUser {
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/**
 * GitHub OAuth Callback Handler
 * Esta ruta NO requiere autenticación JWT porque es parte del flujo OAuth
 */
router.get('/callback', async (req: Request, res: Response) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  try {
    const { code, state } = req.query;
    
    console.log('[GitHub OAuth] Callback received:', { 
      hasCode: !!code, 
      hasState: !!state,
      state: state 
    });
    
    // Validar que existe el código de autorización
    if (!code || typeof code !== 'string') {
      console.error('[GitHub OAuth] No authorization code provided');
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=no_code`);
    }

    // Validar credenciales de GitHub OAuth
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      console.error('[GitHub OAuth] Missing GitHub credentials in environment');
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=config_error`);
    }

    // Intercambiar código por access token
    console.log('[GitHub OAuth] Exchanging code for access token...');
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

    if (!tokenResponse.ok) {
      console.error('[GitHub OAuth] Token exchange failed:', tokenResponse.statusText);
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=oauth_failed`);
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('[GitHub OAuth] Token error:', tokenData.error, tokenData.error_description);
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=oauth_failed`);
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('[GitHub OAuth] No access token in response');
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=oauth_failed`);
    }

    console.log('[GitHub OAuth] Access token obtained successfully');

    // Obtener información del usuario de GitHub
    console.log('[GitHub OAuth] Fetching GitHub user info...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevPulse',
      },
    });

    if (!userResponse.ok) {
      console.error('[GitHub OAuth] Failed to fetch user info:', userResponse.statusText);
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=github_api_error`);
    }

    const githubUser: GitHubUser = await userResponse.json();
    console.log('[GitHub OAuth] GitHub user found:', githubUser.login);

    // Intentar encontrar al usuario en la base de datos
    let user = null;
    
    // 1. Intentar por userId (state)
    if (state && typeof state === 'string') {
      try {
        user = await prisma.user.findUnique({
          where: { id: state }
        });
        if (user) {
          console.log('[GitHub OAuth] User found by ID:', user.email);
        }
      } catch (error) {
        console.error('[GitHub OAuth] Error finding user by ID:', error);
      }
    }
    
    // 2. Si no se encontró, intentar por email
    if (!user) {
      console.log('[GitHub OAuth] Fetching user emails from GitHub...');
      
      // Obtener emails del usuario
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevPulse',
        },
      });

      if (emailsResponse.ok) {
        const emails: GitHubEmail[] = await emailsResponse.json();
        
        // Preferir email primario verificado
        const primaryEmail = Array.isArray(emails) 
          ? emails.find((e) => e.primary && e.verified)?.email 
          : null;
        
        const emailToSearch = primaryEmail || githubUser.email;
        
        if (emailToSearch) {
          console.log('[GitHub OAuth] Searching user by email:', emailToSearch);
          try {
            user = await prisma.user.findUnique({
              where: { email: emailToSearch }
            });
            if (user) {
              console.log('[GitHub OAuth] User found by email');
            }
          } catch (error) {
            console.error('[GitHub OAuth] Error finding user by email:', error);
          }
        }
      }
    }

    // Actualizar usuario con información de GitHub
    if (user) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubToken: accessToken,
            githubUsername: githubUser.login,
            avatar: githubUser.avatar_url,
          },
        });
        console.log('[GitHub OAuth] GitHub successfully connected for user:', user.email);
        return res.redirect(`${FRONTEND_URL}/dashboard/github?connected=true`);
      } catch (error) {
        console.error('[GitHub OAuth] Error updating user:', error);
        return res.redirect(`${FRONTEND_URL}/dashboard/github?error=database_error`);
      }
    } else {
      console.log('[GitHub OAuth] User not found in database');
      return res.redirect(`${FRONTEND_URL}/dashboard/github?error=user_not_found`);
    }
    
  } catch (error) {
    console.error('[GitHub OAuth] Unexpected error in callback:', error);
    return res.redirect(`${FRONTEND_URL}/dashboard/github?error=server_error`);
  }
});

/**
 * Health check para verificar configuración de GitHub OAuth
 */
router.get('/config/check', (req: Request, res: Response) => {
  const isConfigured = !!(
    process.env.GITHUB_CLIENT_ID && 
    process.env.GITHUB_CLIENT_SECRET
  );
  
  res.json({
    configured: isConfigured,
    hasClientId: !!process.env.GITHUB_CLIENT_ID,
    hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
  });
});

// Todas las rutas siguientes requieren autenticación
router.use(authMiddleware);

// Rutas protegidas de GitHub
router.get('/stats', getGitHubStats);
router.get('/profile', getGitHubProfile);
router.post('/sync', syncGitHubStats);
router.post('/connect', connectGitHub);
router.post('/disconnect', disconnectGitHub);

export default router;
