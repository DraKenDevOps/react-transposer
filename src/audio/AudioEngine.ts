export class AudioEngine {
    private ctx: AudioContext | null = null;

    init(): void {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
    }

    destroy(): void {
        this.ctx?.close();
        this.ctx = null;
    }
}
