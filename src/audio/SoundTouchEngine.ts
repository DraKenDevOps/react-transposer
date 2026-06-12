import { SoundTouch } from "soundtouchjs";

export class SoundTouchEngine {
    private processor: InstanceType<typeof SoundTouch> | null = null;

    init(sampleRate: number): void {
        this.processor = new SoundTouch(sampleRate);
    }

    set transpose(semitones: number) {
        if (this.processor) {
            this.processor.pitchSemitones = semitones;
        }
    }

    destroy(): void {
        this.processor = null;
    }
}
