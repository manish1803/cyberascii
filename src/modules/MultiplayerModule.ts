import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export type ConnectionStatus = 'DISCONNECTED' | 'SIGNALING' | 'CONNECTED' | 'ERROR';

export class MultiplayerModule {
  private socket: Socket | null = null;
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private serverUrl: string = 'http://localhost:3001';

  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  public onError: ((error: string) => void) | null = null;
  public onChatMessage: ((data: { senderId: string, message: string, timestamp: number }) => void) | null = null;

  constructor() {}

  private setupPeerListeners() {
    if (!this.peer) return;

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('signal', {
          targetId: this.getTargetId(),
          signal: { ice: event.candidate },
        });
      }
    };

    this.peer.ontrack = (event) => {
      console.log('[SYS] REMOTE_TRACK_RECEIVED');
      if (event.streams && event.streams[0]) {
        this.onRemoteStream?.(event.streams[0]);
        this.onStatusChange?.('CONNECTED');
      }
    };

    this.peer.onconnectionstatechange = () => {
      console.log('[SYS] CONNECTION_STATE:', this.peer?.connectionState);
      if (this.peer?.connectionState === 'connected') this.onStatusChange?.('CONNECTED');
      if (this.peer?.connectionState === 'failed') this.onStatusChange?.('ERROR');
    };
  }

  private targetId: string | null = null;
  private getTargetId() { return this.targetId; }

  async initialize(localStream: MediaStream, roomId: string, isHost: boolean) {
    if (this.peer) this.peer.close();
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    this.peer = new RTCPeerConnection(config);
    this.setupPeerListeners();

    this.localStream = localStream;
    this.socket = io(this.serverUrl);
    this.onStatusChange?.('SIGNALING');

    this.socket.on('connect', () => {
      console.log('[SYS] CONNECTED_TO_SIGNAL_SERVER');
      this.socket?.emit('join-room', roomId);
    });

    this.socket.on('peer-joined', async (peerId) => {
      console.log('[SYS] PEER_JOINED:', peerId);
      this.targetId = peerId;
      if (isHost) {
        await this.createOffer();
      }
    });

    this.socket.on('signal', async ({ senderId, signal }) => {
      this.targetId = senderId;
      if (signal.ice) {
        await this.peer?.addIceCandidate(new RTCIceCandidate(signal.ice));
      } else if (signal.sdp) {
        await this.peer?.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === 'offer') {
          await this.createAnswer();
        }
      }
    });

    this.socket.on('error', (msg) => {
      this.onError?.(msg);
      this.onStatusChange?.('ERROR');
    });

    this.socket.on('chat-message', (data) => {
      this.onChatMessage?.(data);
    });

    // Add local tracks (Video AND Audio)
    this.localStream.getTracks().forEach(track => {
      console.log('[SYS] ADDING_LOCAL_TRACK:', track.kind);
      this.peer?.addTrack(track, this.localStream!);
    });
  }

  public sendMessage(roomId: string, message: string) {
    if (!this.socket || !roomId) return;
    this.socket.emit('chat-message', { roomId, message });
    
    // Echo locally for UI
    this.onChatMessage?.({
      senderId: 'ME',
      message,
      timestamp: Date.now()
    });
  }

  public setAudioEnabled(enabled: boolean) {
    if (!this.localStream) {
      console.warn('[SYS] MIC_TOGGLE_FAILED: NO_LOCAL_STREAM');
      return;
    }
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('[SYS] MIC_TOGGLE_FAILED: NO_AUDIO_TRACKS_FOUND');
      return;
    }
    audioTracks.forEach(track => {
      track.enabled = enabled;
      console.log(`[SYS] MIC_${enabled ? 'ACTIVE' : 'MUTED'} | TRACK_ID: ${track.id} | STATE: ${track.readyState}`);
    });
  }

  private async createOffer() {
    if (!this.peer) return;
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    this.socket?.emit('signal', {
      targetId: this.targetId,
      signal: { sdp: offer },
    });
  }

  private async createAnswer() {
    if (!this.peer) return;
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    this.socket?.emit('signal', {
      targetId: this.targetId,
      signal: { sdp: answer },
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.peer?.close();
    this.peer = null;
    this.socket = null;
    this.targetId = null;
    this.onStatusChange?.('DISCONNECTED');
  }
}
