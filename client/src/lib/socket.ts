'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinProject = (projectId: string) => {
  const s = getSocket();
  s.emit('join-project', projectId);
};

export const leaveProject = (projectId: string) => {
  const s = getSocket();
  s.emit('leave-project', projectId);
};

// Event types
export interface TaskEvent {
  id: string;
  title: string;
  status: string;
  projectId: string;
}

export interface ProjectEvent {
  id: string;
  name: string;
  status: string;
}

// Subscribe to events
export const onTaskCreated = (callback: (task: TaskEvent) => void) => {
  const s = getSocket();
  s.on('task-created', callback);
  return () => s.off('task-created', callback);
};

export const onTaskUpdated = (callback: (task: TaskEvent) => void) => {
  const s = getSocket();
  s.on('task-updated', callback);
  return () => s.off('task-updated', callback);
};

export const onTaskDeleted = (callback: (data: { id: string }) => void) => {
  const s = getSocket();
  s.on('task-deleted', callback);
  return () => s.off('task-deleted', callback);
};

export const onProjectUpdated = (callback: (project: ProjectEvent) => void) => {
  const s = getSocket();
  s.on('project-updated', callback);
  return () => s.off('project-updated', callback);
};
