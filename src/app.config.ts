export default defineAppConfig({
  pages: [
    'pages/publish/index',
    'pages/resume/index',
    'pages/inspect/index',
    'pages/chat/index',
    'pages/mine/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B9A',
    navigationBarTitleText: '净转宝',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF5F8'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B9A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/resume/index',
        text: '履历'
      },
      {
        pagePath: 'pages/inspect/index',
        text: '验货'
      },
      {
        pagePath: 'pages/chat/index',
        text: '聊天'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
