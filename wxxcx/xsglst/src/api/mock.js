import Mock from 'mockjs'
import homeApi from './mockServeData/home'
import user from './mockServeData/user'
import permission from './mockServeData/permission'

// 定义mock请求拦截

// 1.'请求路径的域名后面','请求方式（/api/index一样的请求方式）'
// Mock.mock('/api/home/getData','get',function(){
//     // 拦截到请求后的处理逻辑
//     console.log('拦截到了');
//     // data返回内容会变化
//     return []
// })

// 2.
Mock.mock('/api/home/getData',homeApi.getStatisticalData)

// 用户列表的数据
Mock.mock('/api/user/add','post',user.createUser)
Mock.mock('/api/user/edit','post',user.updateUser)
Mock.mock('/api/user/del','post',user.deleteUser)
// mock 拦截
// Mock.mock(/api\/user\/getUser/,user.getUserList)
Mock.mock(/api\/user\/getUser/,user.getUserList)
// Mock.mock(RegExp("/api/user/getUser/" + ".*"),'get',user.getUserList)

Mock.mock(/api\/permission\/getMenu/,'post',permission.getMenu)
