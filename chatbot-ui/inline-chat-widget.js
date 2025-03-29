// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* --- Inline Version Modifications --- */
        .n8n-chat-widget .chat-container {
            /* Removed fixed positioning, z-index, display:none */
            /* position: fixed; */
            /* bottom: 20px; */
            /* right: 20px; */
            /* z-index: 1000; */
            /* display: none; */
            display: flex; /* Should be visible by default */
            flex-direction: column; /* Keep flex direction */
            /* width: 100%; */ /* Width is viewport-relative */
            min-width: 25vw; /* Minimum width 25% of viewport width */
            max-width: 50vw; /* Set max-width to 50% of viewport width */
            /* min-height: 500px; */ /* Removed min-height in pixels */
            height: 70vh; /* Height 70% of viewport height */
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            margin: auto; /* Center the widget within its container (if possible) */
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
            /* margin: 0 auto; */ /* Removed duplicate margin rule */
        }

        /* Removed .position-left and .open rules */
        /* .n8n-chat-widget .chat-container.position-left { ... } */
        /* .n8n-chat-widget .chat-container.open { ... } */
        /* --- End Inline Modifications --- */

        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-chat-widget .close-button {
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

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            /* width: 32px; */ /* Removed fixed width */
            height: 37px; /* Keep height constraint */
            max-width: 150px; /* Allow it to be wider, adjust as needed */
            object-fit: contain; /* Ensure the image scales nicely */
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }

        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }

        .n8n-chat-widget .new-chat-btn {
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

        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }

        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }

        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }

        .n8n-chat-widget .chat-interface {
            /* display: none; */ /* Removed: Should display when container is open */
            display: flex; /* Make it display by default */
            flex-direction: column;
            height: 100%;
        }

        /* .active class now only controls internal visibility, not the interface itself */
        /* .n8n-chat-widget .chat-interface.active { */
            /* display: flex; */ /* Redundant now */
        /* } */

        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .n8n-chat-widget .chat-input textarea {
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

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
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

        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }

        /* --- Inline Version Modifications --- */
        /* Removed .chat-toggle related CSS */
        /* .n8n-chat-widget .chat-toggle { ... } */
        /* .n8n-chat-widget .chat-toggle.position-left { ... } */
        /* .n8n-chat-widget .chat-toggle:hover { ... } */
        /* .n8n-chat-widget .chat-toggle svg { ... } */
        /* --- End Inline Modifications --- */

        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }

        /* New styles for initial prompt */
        .n8n-chat-widget .initial-prompt {
            padding: 40px 20px;
            text-align: center;
            display: flex; /* Use flexbox */
            flex-direction: column; /* Stack buttons vertically */
            align-items: center; /* Center buttons horizontally */
            justify-content: center; /* Center vertically */
            flex-grow: 1; /* Allow it to take up space */
        }

        .n8n-chat-widget .lang-start-btn {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            margin: 8px 0; /* Add some space between buttons */
            transition: transform 0.2s;
            min-width: 150px; /* Give buttons a minimum width */
        }

        .n8n-chat-widget .lang-start-btn:hover {
            transform: scale(1.05);
        }

        /* Initially hide chat input */
        .n8n-chat-widget .chat-interface:not(.active) .chat-input {
            display: none;
        }
        /* Initially hide messages container completely */
        .n8n-chat-widget .chat-interface:not(.active) .chat-messages {
            display: none;
        }
        /* Show initial prompt when chat is not active */
        .n8n-chat-widget .chat-interface:not(.active) .initial-prompt {
            display: flex; /* Ensure it's shown */
        }
        /* Hide initial prompt when chat becomes active */
        .n8n-chat-widget .chat-interface.active .initial-prompt {
            display: none;
        }
        /* Ensure chat input is shown when active */
        .n8n-chat-widget .chat-interface.active .chat-input {
            display: flex;
        }
        /* Ensure messages container grows and is displayed when active */
        .n8n-chat-widget .chat-interface.active .chat-messages {
            display: flex; /* Ensure it's displayed */
            flex-grow: 1;
            min-height: auto; /* Reset min-height */
            overflow-y: auto; /* Restore scroll */
        }

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
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by AI Sales Agent Cloud',
                link: 'https://aisalesagent.cloud'
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        },
        // --- Inline Version Modifications ---
        targetElementSelector: null // Add config for target element selector
        // --- End Inline Modifications ---
    };

    // Merge user config with defaults
    const userConfig = window.ChatWidgetConfig || {};
    const config = {
        webhook: { ...defaultConfig.webhook, ...userConfig.webhook },
        branding: { ...defaultConfig.branding, ...userConfig.branding },
        style: { ...defaultConfig.style, ...userConfig.style },
        // --- Inline Version Modifications ---
        targetElementSelector: userConfig.targetElementSelector || defaultConfig.targetElementSelector
        // --- End Inline Modifications ---
    };

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // Removed newConversationHTML

    // Modified chatInterfaceHTML to include initial prompt buttons
    const chatInterfaceHTML = `
        <div class="chat-interface">
            <!-- Removed brand header for inline version -->
            <div class="initial-prompt">
                 <button class="lang-start-btn" data-lang="en">Start Chat</button>
                 <button class="lang-start-btn" data-lang="es">Iniciar Chat</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    // Set innerHTML directly to the chat interface
    chatContainer.innerHTML = chatInterfaceHTML;

    /* --- Inline Version Modifications --- */
    // Removed toggleButton creation
    /*
    const toggleButton = document.createElement('button');
    ...
    toggleButton.innerHTML = `...`;
    */
    /* --- End Inline Modifications --- */

    widgetContainer.appendChild(chatContainer);
    // Removed appending toggleButton
    // widgetContainer.appendChild(toggleButton);
    
    /* --- Inline Version Modifications --- */
    // Append to target element or fallback to body
    const targetElement = config.targetElementSelector ? document.querySelector(config.targetElementSelector) : null;
    if (targetElement) {
        targetElement.appendChild(widgetContainer);
    } else {
        console.warn(`Chat widget target element "${config.targetElementSelector}" not found. Appending to body.`);
        document.body.appendChild(widgetContainer);
    }
    /* --- End Inline Modifications --- */

    // Removed newChatBtn reference
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const initialPromptContainer = chatContainer.querySelector('.initial-prompt'); // Get reference to the new container
    const langStartButtons = chatContainer.querySelectorAll('.lang-start-btn'); // Get all language buttons
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    function generateUUID() {
        return crypto.randomUUID();
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: ""
            }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Remove listener for old button
    // newChatBtn.addEventListener('click', startNewConversation);

    // Add listeners for the new language buttons
    langStartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Ensure session ID exists
            if (!currentSessionId) {
                currentSessionId = generateUUID();
            }

            // 2. Hide the initial prompt buttons
            if (initialPromptContainer) {
                initialPromptContainer.style.display = 'none';
            }

            // 3. Activate the chat interface (shows input, messages area via CSS)
            chatInterface.classList.add('active');

            // 4. Determine the message based on the button's language
            const lang = button.dataset.lang;
            const initialMessage = lang === 'es' ? 'Hola' : 'Hi';

            // 5. Send the initial message
            sendMessage(initialMessage);
        });
    });

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });

    /* --- Inline Version Modifications --- */
    // Removed toggleButton listener
    /*
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });
    */

    // Removed close button handlers (close button itself could also be removed from HTML if desired)
    /*
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });
    */
    /* --- End Inline Modifications --- */
})();