import { io, type Socket } from 'socket.io-client';

const apiBaseURL = process.env.EXPO_PUBLIC_API_URL;

if (!apiBaseURL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set');
}

// The backend's global 'api' prefix only applies to REST routes - Socket.IO
// gateways are mounted on the raw HTTP server under their own namespace.
const socketBaseURL = apiBaseURL.replace(/\/api\/?$/, '');

export function createChatSocket(accessToken: string): Socket {
  return io(`${socketBaseURL}/chat`, {
    auth: { token: accessToken },
    transports: ['websocket'],
  });
}

export function createNotificationsSocket(accessToken: string): Socket {
  return io(`${socketBaseURL}/notifications`, {
    auth: { token: accessToken },
    transports: ['websocket'],
  });
}
