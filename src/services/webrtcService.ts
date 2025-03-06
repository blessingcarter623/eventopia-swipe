
// A simple WebRTC peer connection service for video streaming
export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onStreamHandler: ((stream: MediaStream) => void) | null = null;
  private onDisconnectHandler: (() => void) | null = null;

  constructor() {
    // Configure ICE servers (STUN/TURN)
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(configuration);
    this.setupPeerConnectionListeners();
  }

  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send this candidate to the remote peer via signaling server
        this.onIceCandidate(event.candidate);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'disconnected' || 
          this.peerConnection?.connectionState === 'failed') {
        this.onDisconnectHandler?.();
      }
    };

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onStreamHandler?.(this.remoteStream);
    };
  }

  // Called when we generate a new ICE candidate
  private onIceCandidate(candidate: RTCIceCandidate) {
    // In a real application, send this candidate to the remote peer via signaling server
    console.log('Generated ICE candidate:', candidate);
  }

  // Start capturing local media
  async startLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add tracks to the peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  // Set handler for incoming streams
  onStream(handler: (stream: MediaStream) => void) {
    this.onStreamHandler = handler;
  }

  // Set handler for disconnection
  onDisconnect(handler: () => void) {
    this.onDisconnectHandler = handler;
  }

  // Create an offer to initiate connection
  async createOffer() {
    if (!this.peerConnection) return null;
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  // Handle an incoming answer from remote peer
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // Handle remote ICE candidate
  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Stop all streams and close connection
  stopStreaming() {
    // Stop local stream tracks
    this.localStream?.getTracks().forEach(track => {
      track.stop();
    });
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.localStream = null;
    this.remoteStream = null;
  }

  // Get available media devices
  static async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      return { videoDevices, audioDevices };
    } catch (error) {
      console.error('Error getting devices:', error);
      return { videoDevices: [], audioDevices: [] };
    }
  }
}
