// 渲染进程js代码
const TabGroup = require("../index");
const { ipcRenderer } = require('electron');
const isMac = process.platform === 'darwin';
if (!isMac) {
  document.querySelector('.goAndBack').classList.add('enterFs');
}
let tabGroup = new TabGroup();
tabGroup.addTab({
  title: '发现报告',
  src: 'https://www.fxbaogao.com',
  visible: true,
  active: true,
  closable: false,
});
// 初始状态下隐藏标签栏
document.querySelector('.etabs-tabgroup').classList.remove('visible');
// 双击标题栏放大窗口
const onDbClick = e => {
  // 防止事件冒泡，原生的stopPropagation()失效
  if (e.target.tagName === "DIV") {
    ipcRenderer.send('dbclick-title-app');
  }
}
// 获取当前标签页的webview对象
const getActiveTabWebView = () => {
  return tabGroup.getActiveTab().webview;
}
// 刷新页面
const onRefresh = () => {
  getActiveTabWebView().reload();
}
// 前进
const onGo = () => {
  getActiveTabWebView().goForward();
}
// 后退
const onBack = () => {
  if (getActiveTabWebView().canGoBack()) {
    getActiveTabWebView().goBack();
  }
}
// 回到首页
const onHomePage = () => {
  // 判断是否当前就在首页，如果不在就回到首页
  if (getActiveTabWebView().getURL() !== "https://www.fxbaogao.com/") {
    getActiveTabWebView().loadURL("https://www.fxbaogao.com/");
  }
}
// 停止加载
const onStopLoad = () => {
  getActiveTabWebView().stop();
}
// 关闭当前选项卡
ipcRenderer.on('close', () => {
  tabGroup.getActiveTab().close();
  // 关闭选项卡之后，如果只剩一个标签，隐藏标签栏
  if (tabGroup.tabs.length === 1) {
    document.querySelector('.etabs-tabgroup').classList.remove('visible');
    document.querySelector('.etabs-views').classList.remove('tabShow');
  }
})
// 刷新当前页面
ipcRenderer.on('refresh', () => {
  getActiveTabWebView().reload();
})
// 进入全屏模式
ipcRenderer.on('enter-full-screen', () => {
  document.querySelector('.goAndBack').classList.add('enterFs');
})
// 退出全屏模式
ipcRenderer.on('leave-full-screen', () => {
  document.querySelector('.goAndBack').classList.remove('enterFs');
})
// 传入url对象，根据url获得标题（这边还需要修改，出现的情况或有多种）
const creatTitle = url => {
  if (url.indexOf('pdf') !== -1) {
    return '【PDF】智能阅读器'
  }
  if (url.indexOf('data') !== -1 || url.indexOf('dt?') !== -1) {
    return '发现数据'
  }
  return '发现报告'
}
// 此方法需要出现新的标签页的时候，创建一个新的标签，并且在新的标签页添加监听事件
const addEventNewWindow = () => {
  const webview1 = document.querySelector('webview:last-child');
  webview1.addEventListener('new-window', e => {
    if (e && e.url) {
      tabGroup.addTab({
        title: creatTitle(e.url),
        src: e.url,
        visible: true,
        active: true
      });
      if (tabGroup.tabs.length > 1) {
        document.querySelector('.etabs-views').classList.add('tabShow')
      }
      // 为标签页添加关闭按钮
      const tab = document.querySelector('.etabs-tab:last-child');
      const a = document.createElement('a');
      a.setAttribute('class', 'disable');
      const span = document.createElement('span');
      span.setAttribute("class", "icon-close"); 
      const id = tabGroup.getActiveTab().id;
      a.appendChild(span);
      a.addEventListener("click", () => {
        tabGroup.getTab(id).close();
        // 关闭标签页之后，如果只剩一个标签页隐藏标签栏
        if (tabGroup.tabs.length === 1) {
          document.querySelector('.etabs-tabgroup').classList.remove('visible');
          document.querySelector('.etabs-views').classList.remove('tabShow');
        }
      })
      tab.appendChild(a);
    }
    // 递归
    addEventNewWindow();
  });
  // 在页面加载完url之后，修改标签标题（有时候不会打开新的选项卡，只会本地打开）
  const webview2 = document.querySelector('webview:last-child');
  const tab = tabGroup.getActiveTab();
  webview2.addEventListener('did-start-loading', () => {
    // 开始加载时，停止加载不被禁用
    if (webview2.isLoading()) {
      document.querySelector('.close').classList.remove('disable');
    }
  });
  webview2.addEventListener('did-stop-loading', () => {
    if (!webview2.isLoading()) {
      // 加载结束之后，停止加载被禁用
      document.querySelector('.close').classList.add('disable');
    }
    tab.setTitle(webview2.getTitle());
    // 修改当前是否可以前进后退
    if (webview2.canGoBack()) {
      document.querySelector('.back').classList.remove('disable');
    } else {
      document.querySelector('.back').classList.add('disable');
    }
    if (webview2.canGoForward()) {
      document.querySelector('.go').classList.remove('disable');
    } else {
      document.querySelector('.go').classList.add('disable');
    }
  });
}
addEventNewWindow();
