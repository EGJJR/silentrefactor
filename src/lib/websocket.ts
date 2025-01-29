interface ScanProgressEvent {
  type: 'SCAN_PROGRESS';
  repositoryId: string;
  progress: number;
  status: 'scanning' | 'complete' | 'error';
  message?: string;
}

interface PRUpdateEvent {
  type: 'PR_UPDATE';
  repositoryId: string;
  prNumber: number;
  status: 'open' | 'merged' | 'closed';
  url: string;
}

type WebSocketEvent = ScanProgressEvent | PRUpdateEvent;

export class RealtimeService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  connect() {
    if (!process.env.NEXT_PUBLIC_WS_URL) {
      console.error('WebSocket URL not configured');
      return;
    }

    try {
      this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketEvent;
        switch (data.type) {
          case 'SCAN_PROGRESS':
            this.handleScanProgress(data);
            break;
          case 'PR_UPDATE':
            this.handlePRUpdate(data);
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout);
      this.reconnectTimeout *= 2; // Exponential backoff
    }
  }

  private handleScanProgress(data: ScanProgressEvent) {
    // Reference to monitor route handling scan status
    window.dispatchEvent(new CustomEvent('scanProgress', { detail: data }));
  }

  private handlePRUpdate(data: PRUpdateEvent) {
    // Reference to refactor route handling PR updates
    window.dispatchEvent(new CustomEvent('prUpdate', { detail: data }));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
