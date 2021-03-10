//app.js
var util = require('./utils/util.js');
var utilMd5 = require('./utils/md5.js'); 
import versionUtil from './utils/version-util';
App({
  md5Key: "",
  is_on_launch: true,
  onLaunch: function () {
    var client_id="qhminiapi";
    var client_secret="rbrlVLRWPsQvJqiciLUEKDIzMSTgt1";
    var AppID='wxe623aabd3b922853';
    var AppSecret ='5a81217f4f4a74b13b967c026e8d1a70';
    var AK="2VxzuAgq04fkrCIc5TjbUe36e3zLuzGH";//百度地图AK
    var that=this;
    that.globalData.client_id=client_id;
    that.globalData.client_secret=client_secret;
    that.globalData.AppID=AppID;
    that.globalData.AK=AK;
    var yymmdd = util.formatDateUnderLine(new Date());
    var md5key = utilMd5.hexMD5('COMMON_TOKEN_' + yymmdd).toUpperCase();
    that.md5Key = md5key;

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);


    // app.js
    wx.getSystemInfo({
      success: e => {
        // 设计稿一般是 750 rpx, 但是 canvas 是 px;
        // 1rpx 转换成 px 的时候
        this.globalData.rpx2px = 1 / 750 * e.windowWidth;
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
             
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 检查更新
    versionUtil.checkUpdate();
  },

  globalData: {
    userInfo: null,       
    is_on_show:true,
    nickname: '点击登录',
    isConnected: true,
    iphone: false,
    //如果用户没有授权，无法在加载小程序的时候获取头像，就使用默认头像
    avatarUrlTempPath: "./images/defaultHeader.jpg",
    avatar: '',
    openid:'',
    user_id:'',
    user_name:'',
    emp_no:'',
    user_category:'',
    commonInfo:[]
  }
})