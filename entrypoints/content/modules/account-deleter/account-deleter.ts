import {Module, ModuleId} from "@/entrypoints/content/types/module.ts";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {ArrowRight, createElement, Trash, X} from "lucide";
import {DeletionDetails} from "@/entrypoints/background/deletion-provider.ts";

export class AccountDeleter extends Module {
    readonly id = ModuleId.AccountDeleter;
    private hoverButton: HTMLElement | null = null;
    private popup: HTMLElement | null = null;

    load(): void {
        // send message to background to get deletion url
        this.sendToRuntime({
                id: BgMessageId.DeletionUrl,
                data: {domain: window.location.hostname.replace("www.", "")}
            },
            (res) => {
                if (res as DeletionDetails) {
                    this.addButtonToPage(res);
                }
            });
    }

    private addButtonToPage(details: DeletionDetails) {
        this.hoverButton = this.createButton();
        this.popup = this.createPopup(details);

        this.hoverButton.addEventListener('click', () => {
            this.showPopup();
        });

        document.body.appendChild(this.hoverButton);
        document.body.appendChild(this.popup);
    }

    private showPopup() {
        // hide button
        if (this.hoverButton) {
            this.hoverButton.style.display = 'none';
        }

        // show popup
        if (this.popup) {
            this.popup.style.display = 'flex';
        }
    }

    private closePopup() {
        // hide popup
        if (this.popup) {
            this.popup.style.display = 'none';
        }

        // show button
        if (this.hoverButton) {
            this.hoverButton.style.display = 'flex';
        }
    }

    private createPopup(details: DeletionDetails) {
        const popup = document.createElement('div');

        Object.assign(popup.style, {
            all: 'initial',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            zIndex: '10000',
            width: '300px',
            maxWidth: '90vw',
            display: 'none',
            flexDirection: 'column',
            gap: '10px',
            color: 'white'
        });

        // header with close button
        const header = document.createElement('div');
        Object.assign(header.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
        });

        const title = document.createElement('h3');
        title.textContent = 'Account Deletion';
        Object.assign(title.style, {
            margin: '0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white'
        });

        const closeButton = createElement(X);
        closeButton.setAttribute('width', '18');
        closeButton.setAttribute('height', '18');
        Object.assign(closeButton.style, {
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        closeButton.addEventListener('click', () => this.closePopup())

        header.appendChild(title);
        header.appendChild(closeButton);

        // content
        const content = document.createElement('div');

        // notes
        if (details.notes) {
            const notes = document.createElement('p');
            notes.textContent = details.notes;
            Object.assign(notes.style, {
                margin: '0 0 12px 0',
                fontSize: '14px',
                lineHeight: '1.4'
            });
            content.appendChild(notes);
        }

        // email info
        if (details.email) {
            const emailInfo = document.createElement('div');
            emailInfo.style.margin = '0 0 12px 0';
            emailInfo.style.fontSize = '14px';

            const emailLabel = document.createElement('span');
            emailLabel.textContent = 'Contact: ';

            const emailLink = document.createElement('a');
            emailLink.href = `mailto:${details.email}`;
            emailLink.textContent = details.email;
            emailLink.style.color = '#0ea5e9';
            emailLink.style.textDecoration = 'none';

            emailInfo.appendChild(emailLabel);
            emailInfo.appendChild(emailLink);
            content.appendChild(emailInfo);
        }

        const deletionButton = document.createElement('div');
        deletionButton.textContent = 'Go to Deletion Page';
        Object.assign(deletionButton.style, {
            background: 'linear-gradient(135deg, #0ea5e9, #2dd4bf)',
            color: 'white',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        });

        deletionButton.addEventListener('click', () => {
            if (details) {
                window.open(details.url, '_blank');
            }
        });

        const arrowIcon = createElement(ArrowRight);
        arrowIcon.setAttribute('width', '24');
        arrowIcon.setAttribute('height', '24');
        arrowIcon.setAttribute('color', 'white');
        deletionButton.appendChild(arrowIcon);

        popup.appendChild(header);
        popup.appendChild(content);
        popup.appendChild(deletionButton);

        return popup;
    }

    private createButton() {
        // create the round hover button
        const button = document.createElement('div');

        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
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
        const icon = createElement(Trash);
        icon.style.color = 'white';
        icon.setAttribute('width', '32');
        icon.setAttribute('height', '32');

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

        if (this.popup && document.body.contains(this.popup)) {
            document.body.removeChild(this.popup);
            this.popup = null;
        }
    }
}