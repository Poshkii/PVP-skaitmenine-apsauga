import { useNavigate } from "react-router";
import {BgMessage, BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";

export function useBackgroundMessaging() {
    const navigate = useNavigate();

    const sendToBackground = useCallback((message: BgMessage) => {
        return browser.runtime.sendMessage(message);
    }, []);

    useEffect(() => {
        // Send a popup opened sync message
        sendToBackground({ id: BgMessageId.PopupOpened });

        const onMessage = (message: UiMessage) => {
            switch (message.id) {
                case UiMessageId.NavigateTo: {
                    navigate(message.data);
                    break;
                }
                // Add other message handlers as needed
            }
        };

        browser.runtime.onMessage.addListener(onMessage);

        return () => {
            browser.runtime.onMessage.removeListener(onMessage);
        };
    }, [navigate, sendToBackground]);

    return { sendToBackground };
}