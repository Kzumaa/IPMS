import { useEffect, useRef } from 'react';

// Declare the Coze SDK types
declare global {
    interface Window {
        CozeWebSDK?: {
            WebChatClient: new (config: CozeWebChatConfig) => void;
        };
    }
}

interface CozeWebChatConfig {
    config: {
        bot_id: string;
    };
    componentProps?: {
        title?: string;
    };
    auth: {
        type: 'provider';
        onRefreshToken: () => Promise<{ token: string; expiresIn: number } | null>;
    };
}

interface CozeChatProps {
    botId: string;
    title?: string;
}

/**
 * CozeChat Component
 * 
 * Integrates the Coze Web SDK chat widget into the application.
 * Automatically loads the SDK script and initializes the chat client
 * with dynamic token fetching from the backend.
 * 
 * @param botId - The Coze bot ID to connect to
 * @param title - Optional title for the chat window
 */
export function CozeChat({ botId, title = 'AI Assistant' }: CozeChatProps) {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Load the Coze SDK script dynamically
        const loadScript = (): Promise<void> => {
            return new Promise((resolve, reject) => {
                // Check if script already exists
                if (document.querySelector('script[src*="coze.com"]')) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/0.1.0-beta.4/libs/oversea/index.js';
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Coze SDK'));
                document.head.appendChild(script);
            });
        };

        // Initialize the chat client
        const initChat = async () => {
            try {
                await loadScript();

                // Wait a bit for SDK to be fully available
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!window.CozeWebSDK) {
                    console.error('Coze SDK not available');
                    return;
                }

                new window.CozeWebSDK.WebChatClient({
                    config: {
                        bot_id: botId,
                    },
                    componentProps: {
                        title: title,
                    },
                    auth: {
                        type: 'provider',
                        onRefreshToken: async () => {
                            try {
                                const response = await fetch('/api/coze-token');

                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }

                                const data = await response.json();

                                if (!data.access_token) {
                                    console.error('Coze SDK: No access_token received from server');
                                    return null;
                                }

                                return {
                                    token: data.access_token,
                                    expiresIn: data.expires_in,
                                };
                            } catch (error) {
                                console.error('Coze SDK Auth Error:', error);
                                return null;
                            }
                        },
                    },
                });
            } catch (error) {
                console.error('Failed to initialize Coze chat:', error);
            }
        };

        initChat();
    }, [botId, title]);

    // The SDK creates its own UI elements, no need to render anything
    return null;
}

export default CozeChat;
