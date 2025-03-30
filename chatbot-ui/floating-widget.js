// Chat Widget Script (Floating Version)
(function() {
    // Create and inject styles
    const styles = `
        /* --- Floating Widget Namespace --- */
        .n8n-floating-chat-widget { /* Namespaced */
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-floating-chat-widget .floating-chat-container { /* Namespaced */
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-floating-chat-widget .floating-chat-container.floating-position-left { /* Namespaced */
            right: auto;
            left: 20px;
        }

        .n8n-floating-chat-widget .floating-chat-container.floating-open { /* Namespaced */
            display: flex;
            flex-direction: column;
        }

        .n8n-floating-chat-widget .floating-brand-header { /* Namespaced */
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-floating-chat-widget .floating-close-button { /* Namespaced */
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }

        .n8n-floating-chat-widget .floating-close-button:hover { /* Namespaced */
            opacity: 1;
        }

        .n8n-floating-chat-widget .floating-brand-header img { /* Namespaced */
            /* width: 32px; */ /* Removed fixed width */
            height: 37px; /* Keep height constraint */
            max-width: 150px; /* Allow it to be wider, adjust as needed */
            object-fit: contain; /* Ensure the image scales nicely */
        }

        .n8n-floating-chat-widget .floating-brand-header span { /* Namespaced */
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        /* Note: .new-conversation section was removed previously, keeping selector for context if needed */
        .n8n-floating-chat-widget .floating-new-conversation { /* Namespaced */
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
             padding: 20px;
             text-align: center;
             width: 100%;
             max-width: 300px;
        }
        .n8n-floating-chat-widget .floating-welcome-text { /* Namespaced */
             font-size: 24px;
             font-weight: 600;
             color: var(--chat--color-font);
             margin-bottom: 24px;
             line-height: 1.3;
        }
        .n8n-floating-chat-widget .floating-new-chat-btn { /* Namespaced */
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 8px;
             width: 100%;
             padding: 16px 24px;
             background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
             color: white;
             border: none;
             border-radius: 8px;
             cursor: pointer;
             font-size: 16px;
             transition: transform 0.3s;
             font-weight: 500;
             font-family: inherit;
             margin-bottom: 12px;
        }
        .n8n-floating-chat-widget .floating-new-chat-btn:hover { /* Namespaced */
             transform: scale(1.02);
        }
        .n8n-floating-chat-widget .floating-message-icon { /* Namespaced */
             width: 20px;
             height: 20px;
        }
        .n8n-floating-chat-widget .floating-response-text { /* Namespaced */
             font-size: 14px;
             color: var(--chat--color-font);
             opacity: 0.7;
             margin: 0;
        }


        .n8n-floating-chat-widget .floating-chat-interface { /* Namespaced */
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .n8n-floating-chat-widget .floating-chat-messages { /* Namespaced */
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }

        .n8n-floating-chat-widget .floating-chat-message { /* Namespaced */
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-floating-chat-widget .floating-chat-message.floating-user { /* Namespaced */
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-floating-chat-widget .floating-chat-message.floating-bot { /* Namespaced */
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-floating-chat-widget .floating-chat-input { /* Namespaced */
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .n8n-floating-chat-widget .floating-chat-input textarea { /* Namespaced */
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

        .n8n-floating-chat-widget .floating-chat-input textarea::placeholder { /* Namespaced */
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-floating-chat-widget .floating-chat-input button { /* Namespaced */
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

        .n8n-floating-chat-widget .floating-chat-input button:hover { /* Namespaced */
            transform: scale(1.05);
        }

        .n8n-floating-chat-widget .floating-chat-toggle { /* Namespaced */
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-floating-chat-widget .floating-chat-toggle.floating-position-left { /* Namespaced */
            right: auto;
            left: 20px;
        }

        .n8n-floating-chat-widget .floating-chat-toggle:hover { /* Namespaced */
            transform: scale(1.05);
        }

        .n8n-floating-chat-widget .floating-chat-toggle svg { /* Namespaced */
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .n8n-floating-chat-widget .floating-chat-footer { /* Namespaced */
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-floating-chat-widget .floating-chat-footer a { /* Namespaced */
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-floating-chat-widget .floating-chat-footer a:hover { /* Namespaced */
            opacity: 1;
        }

        .n8n-floating-chat-widget .floating-initial-prompt { /* Namespaced */
            padding: 40px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
        }

        .n8n-floating-chat-widget .floating-lang-start-btn { /* Namespaced */
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

        .n8n-floating-chat-widget .floating-lang-start-btn:hover { /* Namespaced */
            transform: scale(1.05);
        }

        /* Visibility rules based on active state */
        .n8n-floating-chat-widget .floating-chat-interface:not(.floating-active) .floating-chat-input { /* Namespaced */
            display: none;
        }
        .n8n-floating-chat-widget .floating-chat-interface:not(.floating-active) .floating-chat-messages { /* Namespaced */
            display: none;
        }
        .n8n-floating-chat-widget .floating-chat-interface:not(.floating-active) .floating-initial-prompt { /* Namespaced */
            display: flex;
        }
        .n8n-floating-chat-widget .floating-chat-interface.floating-active .floating-initial-prompt { /* Namespaced */
            display: none;
        }
        .n8n-floating-chat-widget .floating-chat-interface.floating-active .floating-chat-input { /* Namespaced */
            display: flex;
        }
        .n8n-floating-chat-widget .floating-chat-interface.floating-active .floating-chat-messages { /* Namespaced */
            display: flex;
            flex-grow: 1;
            min-height: auto;
            overflow-y: auto;
        }
        /* --- End Floating Widget Namespace --- */
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
        branding: { logo: '', name: '', welcomeText: '', responseTimeText: '', poweredBy: { text: 'Powered by AISAC', link: 'https://aisalesagent.cloud' } },
        style: { primaryColor: '', secondaryColor: '', position: 'right', backgroundColor: '#ffffff', fontColor: '#333333' }
    };

    // Merge user config with defaults - Use FloatingChatWidgetConfig
    const userConfig = window.FloatingChatWidgetConfig || {}; // Changed name
    const config = {
        webhook: { ...defaultConfig.webhook, ...userConfig.webhook },
        branding: { ...defaultConfig.branding, ...userConfig.branding },
        style: { ...defaultConfig.style, ...userConfig.style }
    };

    // Prevent multiple initializations - Use N8NFloatingChatWidgetInitialized
    if (window.N8NFloatingChatWidgetInitialized) return; // Changed name
    window.N8NFloatingChatWidgetInitialized = true; // Changed name

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-floating-chat-widget'; // Namespaced

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    // Namespaced classes
    chatContainer.className = `floating-chat-container${config.style.position === 'left' ? ' floating-position-left' : ''}`;

    // Modified chatInterfaceHTML to include initial prompt buttons and use namespaced classes
    const chatInterfaceHTML = `
        <div class="floating-chat-interface"> <!-- Namespaced -->
            <div class="floating-brand-header"> <!-- Namespaced -->
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="floating-close-button">×</button> <!-- Namespaced -->
            </div>
            <div class="floating-initial-prompt"> <!-- Namespaced -->
                 <button class="floating-lang-start-btn" data-lang="en">Start Chat</button> <!-- Namespaced -->
                 <button class="floating-lang-start-btn" data-lang="es">Iniciar Chat</button> <!-- Namespaced -->
            </div>
            <div class="floating-chat-messages"></div> <!-- Namespaced -->
            <div class="floating-chat-input"> <!-- Namespaced -->
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="floating-chat-footer"> <!-- Namespaced -->
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    // Set innerHTML directly to the chat interface
    chatContainer.innerHTML = chatInterfaceHTML;

    const toggleButton = document.createElement('button');
    // Namespaced classes
    toggleButton.className = `floating-chat-toggle${config.style.position === 'left' ? ' floating-position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // Select elements using namespaced classes
    const chatInterface = chatContainer.querySelector('.floating-chat-interface');
    const initialPromptContainer = chatContainer.querySelector('.floating-initial-prompt');
    const langStartButtons = chatContainer.querySelectorAll('.floating-lang-start-btn');
    const messagesContainer = chatContainer.querySelector('.floating-chat-messages');
    const textarea = chatContainer.querySelector('.floating-chat-input textarea'); // More specific selector
    const sendButton = chatContainer.querySelector('.floating-chat-input button[type="submit"]'); // More specific selector

    function generateUUID() {
        return crypto.randomUUID();
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage", sessionId: currentSessionId, route: config.webhook.route, chatInput: message, metadata: { userId: "" }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'floating-chat-message floating-user'; // Namespaced
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData)
            });
            const data = await response.json();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'floating-chat-message floating-bot'; // Namespaced
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
            chatInterface.classList.add('floating-active'); // Namespaced active class
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

    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('floating-open'); // Namespaced open class
    });

    // Add close button handlers using namespaced class
    const closeButtons = chatContainer.querySelectorAll('.floating-close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('floating-open'); // Namespaced open class
        });
    });
})();
