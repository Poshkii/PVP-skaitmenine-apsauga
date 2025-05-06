import { useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';
import { useTranslation } from "react-i18next";

type PasswordOptions =
  | { type: 'passphrase'; words?: number }
  | { type: 'complex'; length?: number };

function generateStrongPassword(options: PasswordOptions = { type: 'passphrase' }): string {
    const wordList = [
        "apple", "mountain", "zebra", "sunshine", "forest", "laptop", "ocean", "yellow", "rocket", "battery",
        "cloud", "river", "guitar", "pencil", "dream", "window", "purple", "storm", "panda", "fire"
    ];

    if (options.type === 'passphrase') {
        const wordCount = options.words ?? 4;
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            words.push(word);
        }
        return words.join('-');
    }

    const length = options.length ?? 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function PasswordGenerator() {
    const { t } = useTranslation('passwords');
    const [type, setType] = useState<'passphrase' | 'complex'>('passphrase');
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const newPassword = generateStrongPassword(
            type === 'passphrase' ? { type: 'passphrase', words: 4 } : { type: 'complex', length: 16 }
        );
        setPassword(newPassword);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '0.5rem' }}>{t('passwordType')}:</label>
                <select value={type} onChange={(e) => setType(e.target.value as 'passphrase' | 'complex')}>
                    <option value="passphrase">{t('passphrase')}</option>
                    <option value="complex">{t('complex')}</option>
                </select>
                <button onClick={generate} style={{ marginLeft: '1rem' }}>
                    {t('generatePassword')}
                </button>
            </div>

            {password && (
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                }}>
                    <span>{password}</span>
                    <button onClick={copyToClipboard} title={t('copy')}>
                        <Clipboard size={16} />
                    </button>
                    <button onClick={generate} title={t('regenerate')}>
                        <RefreshCw size={16} />
                    </button>
                    {copied && <span style={{ color: 'green' }}>{t('copied')}</span>}
                </div>
            )}
        </div>
    );
}

export default PasswordGenerator;
