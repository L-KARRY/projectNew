import Vue from 'vue'
import App from './App.vue'
//  完整引入
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import router from './router'
import store from './store'
import './api/mock'
import Cookie from 'js-cookie'

// 按需引入
// import { Row, Button } from 'element-ui';

Vue.config.productionTip = false

// 完整引入
Vue.use(ElementUI);

// 按需引入
// Vue.use(Button)
// Vue.use(Row)

// 添加全局前置导航守卫
router.beforeEach((to, form, next) => {
  // 判断token存不存在
  const token = Cookie.get('token')
  // token不存在，说明当前用户是未登录，应该跳转至登录页
  if (!token && to.name !== 'login') {
    next({  name:'login' })
  }else if (token && to.name === 'login'){
    // token存在，说明用户登录，此时跳转至首页
    next({ name:'home' })
    // next({name: form.name})
  }else{
    next();
  }
})


new Vue({
  // router挂载
  router,
  store,
  render: h => h(App),
  created(){
    store.commit('addMenu',router)
  }
}).$mount('#app')
