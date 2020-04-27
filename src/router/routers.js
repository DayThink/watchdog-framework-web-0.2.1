import Main from '@/view/main'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
      hideInMenu: true
    },
    component: () => import('@/view/login')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true
        },
        component: () => import('@/view/home/index')
      }
    ]
  },
  {
    path: '/system',
    name: 'doc',
    component: Main,
    meta: {
      title: '系统设置',
      icon:'ios-cog'
    },
    children:[
      { path: 'user',meta:{icon: 'md-people', title: '用户管理',access: ['system:user:list']}, name: 'system_user', component: () => import('@/view/system/user') },
      { path: 'person-stalker',meta:{icon: 'md-body',title: '角色管理',access: ['system:role:list']}, name: 'system_role', component: () => import('@/view/system/role') },
      { path: 'resource',meta:{icon: 'ios-lock',title: '资源管理',access: ['system:resource:list']}, name: 'system_resource', component: () => import('@/view/system/resource') },
      { path: 'category',meta:{icon: 'md-book',title: '货物品类',access: ['system:category:list']}, name: 'system_category', component: () => import('@/view/system/category/category.vue') },
      { path: 'log',meta:{icon: 'ios-aperture',title: '系统日志',access: ['system:log:list']}, name: 'system_log', component: () => import('@/view/system/log') },
    ]
  },
  {
    path: '/order',
    name: 'order',
    component: Main,
    meta: {
      title: '订单管理',
      icon:'md-aperture'
    },
    children:[
      { path: 'info',meta:{icon: 'md-basket', title: '订单查询',
        access: ['order:info:list']}, name: 'order_info',
        component: () => import('@/view/order/order_info.vue') },
      { path: 'add',meta:{icon: 'ios-add-circle-outline', title: '订单添加',
          access: ['order:info:add']}, name: 'order_add',
        component: () => import('@/view/order/order_add.vue') },
    ]
  },
  {
    path: '/store',
    name: 'store',
    component: Main,
    meta: {
      title: '仓库管理',
      icon:'md-aperture'
    },
    children:[
      { path: 'in',meta:{icon: 'md-add-circle', title: '采购入库',
        access: ['store:in:list']}, name: 'store_in',
        component: () => import('@/view/store/in_store.vue') },
      { path: 'consumer',meta:{icon: 'md-remove-circle', title: '使用出库',
        access: ['store:out:list']}, name: 'out_store',
        component: () => import('@/view/store/out_store.vue') },
      { path: 'check',meta:{icon: 'ios-cart', title: '期末盘存',
          access: ['store:check:list']}, name: 'store_check',
        component: () => import('@/view/store/check.vue') },
      { path: 'info',meta:{icon: 'ios-basket', title: '当前库存',
          access: ['store:info:list']}, name: 'store_info',
        component: () => import('@/view/store/store_info.vue') },
    ]
  },
  {
    path: '/statis',
    name: 'statis',
    component: Main,
    meta: {
      title: '报表管理',
      icon:'md-calculator'
    },
    children:[
      { path: 'item',meta:{icon: 'md-planet', title: '物料报表',access: ['statis:item']},
        name: 'statis_item',component: () => import('@/view/statis/item.vue')},
      { path: 'supply',meta:{icon: 'ios-ionic', title: '供货商报表',access: ['statis:supply']},
        name: 'statis_supply',component: () => import('@/view/statis/supply.vue')}
    ]
  },
  {
    path: '/system',
    name: 'audit',
    component: Main,
    meta: {
      title: '审计管理',
      icon:'md-card'
    },
    children:[
      { path: 'audit',meta:{icon: 'md-card', title: '审计管理',
        access: ['system:log:audit']}, name: 'system_audit',
        component: () => import('@/view/system/log/audit.vue')},
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
