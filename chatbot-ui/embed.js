    <!-- Widget Configuration -->
    <script>
        window.ChatWidgetConfig = {
            webhook: {
                url: '<your n8n webhook URL>',
                route: 'general'
            },
            branding: {
                logo: '<your company logo URL>',
                name: 'nocodecreative.io', // Your company name
                welcomeText: 'Hi 👋, how can we help?', //Welcome message
                responseTimeText: 'We typically respond right away' //Response time message
            },
            style: {
                primaryColor: '#854fff', //Primary color
                secondaryColor: '#6b3fd4', //Secondary color
                position: 'right', //Position of the widget (left or right)
                backgroundColor: '#ffffff', //Background color of the chat widget
                fontColor: '#333333' //Text color for messages and interface
            }
        };
    </script>
    <script src="https://cdn.jsdelivr.net/gh/WayneSimpson/n8n-chatbot-template@ba944c3/chat-widget.js"></script>
    <!-- Widget Script -->

