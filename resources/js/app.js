import axios from 'axios';
import Echo from 'laravel-echo';
import router from "./router/app";
import mitt from 'mitt';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import { createApp } from 'vue'
import {BootstrapIconsPlugin} from 'bootstrap-icons-vue';
import {DefaultApolloClient} from '@vue/apollo-composable'
import {ApolloClient, HttpLink, split} from '@apollo/client/core'
import {createLighthouseSubscriptionLink} from "@thekonz/apollo-lighthouse-subscription-link";
import {getMainDefinition} from "@apollo/client/utilities";
import App from "@js/views/App.vue";
import { cache } from "@graphql/cache";
import { AuthenticationPlugin } from "@js/plugins/Authentication";
import { MediaPlayerPlugin } from "@js/plugins/MediaPlayer";
import { BootstrapControlPlugin } from "@js/plugins/BootstrapControl";
import {UploadManagerPlugin} from "@js/plugins/UploadManager";

// The UploadManager still uses Axios. Ideally this also should be replaced by GraphQL later on
// Currently not the case because I haven't figured out how to track upload progress.
axios.defaults.baseURL = window.Laravel.APP_URL + '/api';
axios.defaults.headers.common['Accept'] = 'application/json';

const emitter = mitt();
window.Pusher = require('pusher-js');

let echoClient = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    wsHost: process.env.MIX_PUSHER_SOCKET_HOST,
    wsPort: process.env.MIX_PUSHER_PORT,
    wssPort: process.env.MIX_PUSHER_PORT,
    forceTLS: process.env.MIX_PUSHER_SCHEME === 'https',
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss']
});

// HTTP connection to the API
const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: window.Laravel.APP_URL + '/graphql',
    headers: {}
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({query}) => {
        const definition = getMainDefinition(query);
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
    cache,
    connectToDevTools: window.Laravel.APP_DEBUG,
    defaultOptions: {
        $query: {
            fetchPolicy: 'cache-and-network',
        },
    }
});

// Create the Vue App instance
const app = createApp(App);

//app.directive('media-image-fallback', MediaImageFallback);
app.provide(DefaultApolloClient, apolloClient);

app.config.globalProperties.echo = echoClient;
app.config.globalProperties.emitter = emitter;

app.use(router)
    .use(BootstrapControlPlugin)
    .use(AuthenticationPlugin, {
        tokenName: 'token',
        apolloClient,
        echoClient,
        httpClient: httpLink
    })
    .use(MediaPlayerPlugin, {
        broadcastUrl: window.Laravel.BROADCAST_URL,
        apolloClient,
        echoClient
    })
    .use(UploadManagerPlugin, {
        echoClient
    })
    .use(PerfectScrollbar)
    .use(BootstrapIconsPlugin)
    .mount('#shoutzor');
