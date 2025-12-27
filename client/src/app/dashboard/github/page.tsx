'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  RefreshCw, 
  Unlink,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  FolderGit,
  Star,
  ExternalLink,
  TrendingUp,
  Calendar,
  Code2,
  GitFork,
  MapPin,
  Building,
  Users,
  Link as LinkIcon
} from 'lucide-react';
import { githubAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface GitHubStats {
  totalCommits: number;
  totalRepos: number;
  totalPRs: number;
  totalIssues: number;
  lastSyncAt: string;
  contributionData?: { date: string; count: number }[];
}

interface GitHubProfile {
  login: string;
  name: string;
  avatar: string;
  bio: string;
  company: string;
  location: string;
  email: string;
  blog: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  updatedAt: string;
  isPrivate: boolean;
}

interface GitHubLanguage {
  name: string;
  count: number;
}

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-500',
  Java: 'bg-orange-500',
  'C++': 'bg-pink-500',
  C: 'bg-gray-500',
  'C#': 'bg-purple-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-600',
  Ruby: 'bg-red-500',
  PHP: 'bg-indigo-400',
  Swift: 'bg-orange-400',
  Kotlin: 'bg-violet-500',
  HTML: 'bg-orange-500',
  CSS: 'bg-blue-400',
  Shell: 'bg-green-600',
};

export default function GitHubPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [languages, setLanguages] = useState<GitHubLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const justConnected = urlParams.get('connected') === 'true';
    const error = urlParams.get('error');
    
    if (justConnected || error) {
      window.history.replaceState({}, '', '/dashboard/github');
    }

    if (error) {
      switch (error) {
        case 'user_not_found':
          toast.error('El email de tu cuenta de GitHub no coincide con tu email de DevPulse.');
          break;
        case 'oauth_failed':
          toast.error('Error al conectar con GitHub. Por favor intenta de nuevo.');
          break;
        default:
          toast.error('Error al conectar con GitHub.');
      }
      setIsLoading(false);
    } else if (justConnected) {
      handlePostConnect();
    } else {
      fetchData();
    }
  }, []);

  const handlePostConnect = async () => {
    try {
      setIsConnected(true);
      await handleSync();
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Error al sincronizar con GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, profileRes] = await Promise.all([
        githubAPI.getStats().catch(() => ({ data: null })),
        githubAPI.getProfile().catch(() => ({ data: null }))
      ]);
      
      if (statsRes.data) {
        setStats(statsRes.data);
        setIsConnected(true);
      }
      
      if (profileRes.data) {
        setProfile(profileRes.data.profile);
        setRepos(profileRes.data.repos || []);
        setLanguages(profileRes.data.languages || []);
        setIsConnected(true);
      }
      
      if (!statsRes.data && !profileRes.data) {
        if (user?.githubUsername) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const [statsRes, profileRes] = await Promise.all([
        githubAPI.sync(),
        githubAPI.getProfile()
      ]);
      
      if (statsRes.data) setStats(statsRes.data);
      if (profileRes.data) {
        setProfile(profileRes.data.profile);
        setRepos(profileRes.data.repos || []);
        setLanguages(profileRes.data.languages || []);
      }
      
      toast.success('Datos sincronizados');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = 'http://localhost:3001/api/github/callback';
    const userId = user?.id || '';
    
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,repo,user:email&state=${userId}`;
    window.location.href = githubUrl;
  };

  const handleDisconnect = async () => {
    try {
      await githubAPI.disconnect();
      setIsConnected(false);
      setStats(null);
      setProfile(null);
      setRepos([]);
      toast.success('GitHub desconectado');
    } catch (error) {
      toast.error('Error al desconectar');
    }
  };

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-zinc-800';
    if (count <= 2) return 'bg-emerald-900';
    if (count <= 5) return 'bg-emerald-700';
    if (count <= 8) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            Conecta tu cuenta de GitHub
          </h1>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Sincroniza tu actividad de desarrollo, repositorios, commits y más.
          </p>
          <Button onClick={handleConnect} size="lg" className="gap-2">
            <Github className="w-5 h-5" />
            Conectar GitHub
          </Button>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { label: 'Commits', value: stats?.totalCommits || 0, icon: GitCommit, color: 'text-blue-400' },
    { label: 'Repositorios', value: profile?.publicRepos || stats?.totalRepos || 0, icon: FolderGit, color: 'text-violet-400' },
    { label: 'Pull Requests', value: stats?.totalPRs || 0, icon: GitPullRequest, color: 'text-emerald-400' },
    { label: 'Issues', value: stats?.totalIssues || 0, icon: AlertCircle, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">GitHub</h1>
          <p className="text-zinc-500 mt-1">Tu actividad de desarrollo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleSync}
            isLoading={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Unlink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name || profile.login}
                width={120}
                height={120}
                className="rounded-full border-4 border-zinc-800"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-zinc-800 flex items-center justify-center">
                <Github className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {profile?.name || user?.name}
                </h2>
                <Link 
                  href={`https://github.com/${profile?.login || user?.githubUsername}`}
                  target="_blank"
                  className="text-zinc-400 hover:text-blue-400 flex items-center gap-1"
                >
                  @{profile?.login || user?.githubUsername}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <span className="px-3 py-1 text-sm font-medium bg-zinc-800 text-zinc-300 rounded-full">
                Developer
              </span>
            </div>
            
            {profile?.bio && (
              <p className="text-zinc-400 mt-3">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile?.company && (
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {profile.company}
                </span>
              )}
              {profile?.blog && (
                <Link 
                  href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  className="flex items-center gap-1 hover:text-blue-400"
                >
                  <LinkIcon className="w-4 h-4" />
                  {profile.blog}
                </Link>
              )}
            </div>
            
            {/* Followers */}
            <div className="flex gap-4 mt-4">
              <span className="text-sm">
                <span className="font-semibold text-white">{profile?.followers || 0}</span>
                <span className="text-zinc-500 ml-1">followers</span>
              </span>
              <span className="text-sm">
                <span className="font-semibold text-white">{profile?.following || 0}</span>
                <span className="text-zinc-500 ml-1">following</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Contribution Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Contribuciones</h3>
            <p className="text-sm text-zinc-500">Actividad de los últimos 365 días</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{(stats?.totalCommits || 0).toLocaleString()}</p>
            <p className="text-sm text-zinc-500">Total contribuciones</p>
          </div>
        </div>
        
        {/* Contribution grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1" style={{ minWidth: '800px' }}>
            {Array.from({ length: 52 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dataIndex = weekIndex * 7 + dayIndex;
                  const contribution = stats?.contributionData?.[dataIndex];
                  const count = contribution?.count || Math.floor(Math.random() * 10);
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getContributionColor(count)}`}
                      title={`${count} contribuciones`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-zinc-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </motion.div>

      {/* Repositories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FolderGit className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-white">Repositorios Destacados</h3>
          </div>
          <Link 
            href={`https://github.com/${profile?.login || user?.githubUsername}?tab=repositories`}
            target="_blank"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Ver todos
          </Link>
        </div>
        
        {repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <Link
                key={repo.name}
                href={repo.url}
                target="_blank"
                className="p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white hover:text-blue-400">{repo.name}</h4>
                  {repo.isPrivate && (
                    <span className="text-xs px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded">Private</span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-zinc-500'}`} />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {repo.forks}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-8">
            Sincroniza para ver tus repositorios
          </p>
        )}
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-zinc-400" />
            <h3 className="font-semibold text-white">Lenguajes más usados</h3>
          </div>
          {languages.length > 0 ? (
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.name} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${languageColors[lang.name] || 'bg-zinc-500'}`} />
                  <span className="text-sm text-zinc-300 flex-1">{lang.name}</span>
                  <span className="text-sm text-zinc-500">{lang.count} repos</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'JavaScript', 'Python', 'CSS'].map((lang) => (
                <span 
                  key={lang}
                  className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-lg"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Productividad</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-400">Commits este año</span>
                <span className="text-sm font-medium text-white">{stats?.totalCommits || 0}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((stats?.totalCommits || 0) / 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-400">Pull Requests</span>
                <span className="text-sm font-medium text-white">{stats?.totalPRs || 0}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((stats?.totalPRs || 0) * 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-400">Issues resueltos</span>
                <span className="text-sm font-medium text-white">{stats?.totalIssues || 0}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((stats?.totalIssues || 0) * 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
