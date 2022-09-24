import {createRouter, createWebHashHistory} from "vue-router";

function loadView(view) {
    return () => import(`@js/views/${view}.vue`);
}

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'dashboard',
            path: '/',
            component: loadView('main/dashboard'),
            meta: {
                requiresPermission: "website.access"
            }
        },
        {
            name: 'history',
            path: '/history',
            component: loadView('main/history'),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'popular',
            path: '/popular',
            component: loadView('main/dashboard'),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'upload',
            path: '/upload',
            component: loadView('main/upload'),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'artist',
            path: '/artist/:id',
            component: loadView('main/artist'),
            props: ({params}) => ({
                id: params.id || null
            }),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'album',
            path: '/album/:id',
            component: loadView('main/album'),
            props: ({params}) => ({
                id: params.id || null
            }),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'search',
            path: '/search',
            component: loadView('main/search'),
            meta: {
                requiresPermission: "website.search"
            }
        }, {
            name: 'profile',
            path: '/profile',
            component: loadView('main/dashboard'),
            meta: {
                requiresAuth: true
            }
        },
        {
            name: 'admin',
            path: '/admin',
            redirect: {
                name: 'admin-dashboard'
            },
            meta: {
                requiresPermission: 'admin.access'
            },
            children: [{
                name: 'admin-dashboard',
                path: 'dashboard',
                component: loadView('admin/dashboard'),
                meta: {
                    requiresPermission: 'admin.access'
                },
            }]
        }/*, {
                name: 'admin-users',
                path: 'users',
                component: loadView('admin/users')
            }, {
                name: 'admin-roles',
                path: 'roles',
                component: loadView('admin/roles'),
                children: [{
                    name: 'admin-roles-list',
                    path: 'list',
                    component: loadView('admin/roles/list')
                }, {
                    name: 'admin-roles-edit',
                    path: 'edit/:roleId',
                    component: loadView('admin/roles/edit'),
                    props: ({params}) => ({
                        roleId: Number.parseInt(params.roleId, 10) || null
                    })
                }]
            }, {
                name: 'admin-modules',
                path: 'modules',
                component: loadView('admin/modules')
            }]
        }*/
    ]
});

//Authentication check
/*router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (store.getters.hasToken) {
            next()
            return
        }
        next('/')
    } else {
        next()
    }
});*/

export default (app) => {
    app.router = router;
    app.use(router);
}
