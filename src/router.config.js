export default [
  {
    path: '/',
    redirect: '/platformAssess'
  },
  {
    path: '/error/:type',
    name: 'Error',
    component: 'Error'
  },
  {
    name: 'platformAssess',
    path: '/platformAssess',
    menuCode: '001',
    component: 'platformAssess/PlatformAssess'
  },
  {
    // 警情处置
    name: 'alarmHandle',
    path: '/alarmHandle',
    menuCode: '001',
    component: 'alarmHandle/AlarmHandle'
  }
]
