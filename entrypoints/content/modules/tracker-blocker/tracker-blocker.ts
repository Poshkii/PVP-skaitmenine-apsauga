import {Module, ModuleId} from "@/entrypoints/content/types/module.ts";

export class TrackerBlocker extends Module {
    readonly id: ModuleId = ModuleId.TrackerBlocker;

    load(): void {
        this.applyProtections();
    }

    unload(): void {
    }

    // Method to check if advanced protection is enabled
    private async checkAdvancedProtection(): Promise<boolean> {
        const data = await chrome.storage.local.get('settings');
        return data.settings?.advancedProtection ?? false;
    }

    // Method to apply anti-fingerprinting protections
    private async applyProtections(): Promise<void> {
        const advancedProtectionEnabled = await this.checkAdvancedProtection();

        if (!advancedProtectionEnabled) return;

        try {
            // Canvas fingerprinting protection
            if (HTMLCanvasElement.prototype.toDataURL) {
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function(type?: string, quality?: number) {
                    if (type === 'image/png' && this.width === 16 && this.height === 16) {
                        const ctx = this.getContext('2d');
                        if (ctx !== null) {
                            const imageData = ctx.getImageData(0, 0, this.width, this.height);
                            const data = imageData.data;
                            const i = Math.floor(Math.random() * data.length / 4) * 4;
                            data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() < 0.5 ? 1 : -1)));
                            ctx.putImageData(imageData, 0, 0);
                        }
                    }
                    return originalToDataURL.call(this, type, quality);
                };
            }

            // Audio fingerprinting protection
            if (window.AudioContext) {
                const OriginalAudioContext = window.AudioContext;

                // Override AudioContext constructor
                window.AudioContext = function(this: AudioContext, ...args: any[]): AudioContext {
                    const context = new OriginalAudioContext(...args);

                    // Save the original decodeAudioData method
                    const originalDecodeAudioData = context.decodeAudioData;

                    // Override decodeAudioData to return a Promise and modify AudioBuffer's getChannelData
                    context.decodeAudioData = function(this: AudioContext, audioData: ArrayBuffer): Promise<AudioBuffer> {
                        return new Promise((resolve, reject) => {
                            originalDecodeAudioData.call(this, audioData, (audioBuffer: AudioBuffer) => {
                                // Override getChannelData of AudioBuffer
                                const originalGetChannelData = audioBuffer.getChannelData;

                                audioBuffer.getChannelData = function(this: AudioBuffer, channel: number): Float32Array {
                                    const channelData = originalGetChannelData.call(this, channel);

                                    // Add minimal noise that won't affect audio quality
                                    const noise = 0.0000001;

                                    // Only modify a small subset of samples to minimize impact
                                    if (channelData.length > 0 && Math.random() < 0.1) {
                                        const index = Math.floor(Math.random() * channelData.length);
                                        channelData[index] += (Math.random() * 2 - 1) * noise;
                                    }

                                    return channelData;
                                };

                                // Resolve the promise with the modified audio buffer
                                resolve(audioBuffer);
                            }, reject); // Reject the promise if an error occurs
                        });
                    };

                    return context;
                } as any; // Type the function as 'any' to bypass the constructor signature error
            }

            // Font fingerprinting protection
            if (document.fonts && document.fonts.check) {
                const originalCheck = document.fonts.check;

                // Override the check method
                document.fonts.check = function(this: FontFaceSet, font: string, text?: string): boolean {
                    const uncommonFonts = [
                        'Copperplate Gothic', 'Wingdings', 'Webdings', 'Comic Sans MS',
                        'Papyrus', 'Herculanum', 'Apple Chancery'
                    ];

                    for (const uncommonFont of uncommonFonts) {
                        if (font.includes(uncommonFont) && Math.random() < 0.1) {
                            return Math.random() < 0.5;
                        }
                    }

                    // Use the original method with the correct types
                    return originalCheck.apply(this, [font, text]);
                };
            }

            // Navigator and screen property fingerprinting
            try {
                if (Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency')) {
                    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
                        get: function () {
                            const commonValues = [2, 4, 8];
                            return commonValues[Math.floor(Math.random() * commonValues.length)];
                        }
                    });
                }

                if (Object.getOwnPropertyDescriptor(Navigator.prototype, 'deviceMemory')) {
                    Object.defineProperty(Navigator.prototype, 'deviceMemory', {
                        get: function () {
                            const commonValues = [4, 8];
                            return commonValues[Math.floor(Math.random() * commonValues.length)];
                        }
                    });
                }
            } catch (e) {
                console.error("Error applying navigator protections:", e);
            }

            console.log("Applied anti-fingerprinting protections");
        } catch (error) {
            console.error("Error in privacy protections:", error);
        }
    }

}