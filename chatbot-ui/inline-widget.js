// Chat Widget Script (Inline Version)
(function() {
    // Create and inject styles
    const styles = `
        /* --- Inline Widget Namespace --- */
        .n8n-inline-chat-widget { /* Namespaced */
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-inline-chat-widget .inline-chat-container { /* Namespaced */
            display: flex;
            flex-direction: column;
            min-width: 25vw; /* Minimum width 25% of viewport width */
            height: 70vh; /* Height 70% of viewport height */
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            margin: auto; /* Center the widget within its container (if possible) */
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }
        /* Removed position/open rules */

        /* Note: Brand header was removed previously */

        /* Note: .new-conversation section was removed previously */

        .n8n-inline-chat-widget .inline-chat-interface { /* Namespaced */
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .n8n-inline-chat-widget .inline-chat-messages { /* Namespaced */
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }

        .n8n-inline-chat-widget .inline-chat-message { /* Namespaced */
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-inline-chat-widget .inline-chat-message.inline-user { /* Namespaced */
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-inline-chat-widget .inline-chat-message.inline-bot { /* Namespaced */
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-inline-chat-widget .inline-chat-input { /* Namespaced */
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .n8n-inline-chat-widget .inline-chat-input textarea { /* Namespaced */
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .n8n-inline-chat-widget .inline-chat-input textarea::placeholder { /* Namespaced */
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-inline-chat-widget .inline-chat-input button { /* Namespaced */
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }

        .n8n-inline-chat-widget .inline-chat-input button:hover { /* Namespaced */
            transform: scale(1.05);
        }

        /* Removed toggle button CSS */

        .n8n-inline-chat-widget .inline-chat-footer { /* Namespaced */
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-inline-chat-widget .inline-chat-footer a { /* Namespaced */
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-inline-chat-widget .inline-chat-footer a:hover { /* Namespaced */
            opacity: 1;
        }

        .n8n-inline-chat-widget .inline-initial-prompt { /* Namespaced */
            padding: 40px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
        }

        .n8n-inline-chat-widget .inline-lang-start-btn { /* Namespaced */
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            margin: 8px 0;
            transition: transform 0.2s;
            min-width: 150px;
        }

        .n8n-inline-chat-widget .inline-lang-start-btn:hover { /* Namespaced */
            transform: scale(1.05);
        }

        /* Visibility rules based on active state */
        .n8n-inline-chat-widget .inline-chat-interface:not(.inline-active) .inline-chat-input { /* Namespaced */
            display: none;
        }
        .n8n-inline-chat-widget .inline-chat-interface:not(.inline-active) .inline-chat-messages { /* Namespaced */
            display: none;
        }
        .n8n-inline-chat-widget .inline-chat-interface:not(.inline-active) .inline-initial-prompt { /* Namespaced */
            display: flex;
        }
        .n8n-inline-chat-widget .inline-chat-interface.inline-active .inline-initial-prompt { /* Namespaced */
            display: none;
        }
        .n8n-inline-chat-widget .inline-chat-interface.inline-active .inline-chat-input { /* Namespaced */
            display: flex;
        }
        .n8n-inline-chat-widget .inline-chat-interface.inline-active .inline-chat-messages { /* Namespaced */
            display: flex;
            flex-grow: 1;
            min-height: auto;
            overflow-y: auto;
        }
        /* --- End Inline Widget Namespace --- */
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: { logo: '', name: '', welcomeText: '', responseTimeText: '', poweredBy: { text: 'Powered by AI Sales Agent Cloud', link: 'https://aisalesagent.cloud' } },
        style: { primaryColor: '', secondaryColor: '', backgroundColor: '#ffffff', fontColor: '#333333' },
        targetElementSelector: null // Inline specific
    };

    // Merge user config with defaults - Use InlineChatWidgetConfig
    const userConfig = window.InlineChatWidgetConfig || {}; // Changed name
    const config = {
        webhook: { ...defaultConfig.webhook, ...userConfig.webhook },
        branding: { ...defaultConfig.branding, ...userConfig.branding },
        style: { ...defaultConfig.style, ...userConfig.style },
        targetElementSelector: userConfig.targetElementSelector || defaultConfig.targetElementSelector // Inline specific
    };

    // Prevent multiple initializations - Use N8NInlineChatWidgetInitialized
    if (window.N8NInlineChatWidgetInitialized) return; // Changed name
    window.N8NInlineChatWidgetInitialized = true; // Changed name

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-inline-chat-widget'; // Namespaced

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = 'inline-chat-container'; // Namespaced (removed position class logic)

    // Modified chatInterfaceHTML to include initial prompt buttons and use namespaced classes
    const chatInterfaceHTML = `
        <div class="inline-chat-interface"> <!-- Namespaced -->
            <!-- Removed brand header for inline version -->
            <div class="inline-initial-prompt"> <!-- Namespaced -->
                 <button class="inline-lang-start-btn" data-lang="en">Start Chat</button> <!-- Namespaced -->
                 <button class="inline-lang-start-btn" data-lang="es">Iniciar Chat</button> <!-- Namespaced -->
            </div>
            <div class="inline-chat-messages"></div> <!-- Namespaced -->
            <div class="inline-chat-input"> <!-- Namespaced -->
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="inline-chat-footer"> <!-- Namespaced -->
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    // Set innerHTML directly to the chat interface
    chatContainer.innerHTML = chatInterfaceHTML;

    // Removed toggleButton creation

    widgetContainer.appendChild(chatContainer);
    // Removed appending toggleButton

    // Append to target element or fallback to body
    const targetElement = config.targetElementSelector ? document.querySelector(config.targetElementSelector) : null;
    if (targetElement) {
        targetElement.appendChild(widgetContainer);
    } else {
        console.warn(`Chat widget target element "${config.targetElementSelector}" not found. Appending to body.`);
        document.body.appendChild(widgetContainer);
    }

    // Select elements using namespaced classes
    const chatInterface = chatContainer.querySelector('.inline-chat-interface');
    const initialPromptContainer = chatContainer.querySelector('.inline-initial-prompt');
    const langStartButtons = chatContainer.querySelectorAll('.inline-lang-start-btn');
    const messagesContainer = chatContainer.querySelector('.inline-chat-messages');
    const textarea = chatContainer.querySelector('.inline-chat-input textarea'); // More specific
    const sendButton = chatContainer.querySelector('.inline-chat-input button[type="submit"]'); // More specific

    function generateUUID() {
        return crypto.randomUUID();
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage", sessionId: currentSessionId, route: config.webhook.route, chatInput: message, metadata: { userId: "" }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'inline-chat-message inline-user'; // Namespaced
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData)
            });
            const data = await response.json();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'inline-chat-message inline-bot'; // Namespaced
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Add listeners for the new language buttons
    langStartButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!currentSessionId) { currentSessionId = generateUUID(); }
            if (initialPromptContainer) { initialPromptContainer.style.display = 'none'; }
            chatInterface.classList.add('inline-active'); // Namespaced active class
            const lang = button.dataset.lang;
            const initialMessage = lang === 'es' ? 'Hola' : 'Hi';
            sendMessage(initialMessage);
        });
    });

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) { sendMessage(message); textarea.value = ''; }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) { sendMessage(message); textarea.value = ''; }
        }
    });

    // Removed toggleButton listener
    // Removed close button handlers

})();