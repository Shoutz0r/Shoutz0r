import { createApp, provide } from 'vue'
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import { BootstrapIconsPlugin  } from 'bootstrap-icons-vue';
import Echo from 'laravel-echo';
import router from "./router/app";
import App from "@js/views/App.vue";
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { createLighthouseSubscriptionLink } from "@thekonz/apollo-lighthouse-subscription-link";
import {getMainDefinition} from "@apollo/client/utilities";

window.Pusher = require('pusher-js');

let echoClient = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    wsHost: process.env.MIX_PUSHER_HOST,
    wsPort: process.env.MIX_PUSHER_PORT,
    wssPort: process.env.MIX_PUSHER_PORT,
    forceTLS: process.env.MIX_PUSHER_SCHEME === 'https',
    encrypted: true,
    disableStats: true,
    enabledTransports: [ 'ws', 'wss' ]
});

// HTTP connection to the API
const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: window.Laravel.APP_URL + '/graphql',
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({ query }) => {
        const definition = getMainDefinition(query);
        console.log(definition);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        )
    },
    createLighthouseSubscriptionLink(echoClient),
    httpLink
)

// Create the apollo client
const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: window.Laravel.APP_DEBUG
});

// Create the Vue App instance
const app = createApp(App);

app.provide(DefaultApolloClient, apolloClient);

app.use(router)
   .use(PerfectScrollbar)
   .use(BootstrapIconsPlugin)
   .mount('#shoutzor');
