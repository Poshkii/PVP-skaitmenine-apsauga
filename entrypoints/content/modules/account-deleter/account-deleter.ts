import {Module, ModuleId} from "@/entrypoints/content/types/module.ts";
import extIcon from "@/assets/icon.png";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";

export class AccountDeleter extends Module {
    readonly id = ModuleId.AccountDeleter;
    private hoverButton: HTMLElement | null = null;

    load(): void {
        // send message to background to get deletion url
        this.sendToRuntime({
                id: BgMessageId.DeletionUrl,
                data: {domain: window.location.hostname.replace("www.", "")}
            },
            (res) => {
                if (res && res.deletionUrl) {
                    this.addButtonToPage(res.deletionUrl);
                }
            });
    }

    private addButtonToPage(deletionUrl: string) {
        this.hoverButton = this.createButton();

        this.hoverButton.addEventListener('click', () => {
            window.open(deletionUrl, '_blank');
        });

        document.body.appendChild(this.hoverButton);
    }

    private createButton() {
        // create the round hover button
        const button = document.createElement('div');

        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #0ea5e9, #2dd4bf)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease'
        });

        // add icon
        const icon = document.createElement('img');
        icon.src = extIcon;
        icon.width = 32;
        icon.height = 32;
        icon.style.objectFit = 'contain';

        button.appendChild(icon);

        // hover effects
        button.addEventListener('mouseenter', () => {
            if (button) {
                button.style.transform = 'scale(1.1)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (button) {
                button.style.transform = 'scale(1)';
            }
        });

        return button;
    }

    unload(): void {
        if (this.hoverButton && document.body.contains(this.hoverButton)) {
            document.body.removeChild(this.hoverButton);
            this.hoverButton = null;
        }
    }
}