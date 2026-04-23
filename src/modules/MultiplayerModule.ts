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

    // Add local tracks
    this.localStream.getTracks().forEach(track => {
      this.peer?.addTrack(track, this.localStream!);
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
