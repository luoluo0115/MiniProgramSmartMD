//登陆
const app = getApp()
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
import Dialog from '../../vant-weapp/dist/dialog/dialog';
import Toast from '../../vant-weapp/dist/toast/toast';
Page({

  data: {
    motto: '欢迎来到企汇大管家',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loginBg: api.ImgUrl + 'Q003',
    goPage: '',
    goUrl: '',
  },
  /**
   *  获取系统信息
   */
  getSystemInfo: function () {
    let systemInfo;
    wx.getSystemInfo({
      success: function (res) {
        systemInfo = res;
        console.log(res, '设备信息')
      }
    })
    return systemInfo;
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    //跳转指定页面
    if (options.goPage) {
      let goPage = decodeURIComponent(options.goPage);
      let pre_customer_info_id = decodeURIComponent(options.pre_customer_info_id);
      let url = "/pages/HR/index/index";
      if (goPage == 1) {
        url = "/pages/business/consultReceive/consultReceive?pre_customer_info_id=" + pre_customer_info_id;
      }
      this.setData({
        goPage: goPage,
        goUrl: url,
      })
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onReady: function () {
    // 登录
    this.login();
  },
  goTo(event) {
    wx.reLaunch({
      url: '/pages/index/index'
    });

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    //获取授权后
    this.login();
  },
  login: function () {
    let that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          var code = res.code
          //判断用户是否授权
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                //已经授权，获取用户信息
                wx.getUserInfo({
                  success: function (res) {
                    var systemInfo = that.getSystemInfo();
                    var encryptedData = res.encryptedData
                    var iv = res.iv;
                    var data = {
                      code: code,
                      encryptedData: encryptedData,
                      iv: iv,
                      systemInfo: JSON.stringify(systemInfo)
                    }
                    util.request(api.UserUrl, data, 'POST', true).then(function (res) {
                      console.log(res, '授权验证成功,获取用户信息');
                      if (res.data.success == true) {
                        app.globalData.openid = res.data.openid;
                        app.globalData.sessKey = res.data.session_key;
                        let user_id = res.data.user_id;
                        let user_name = res.data.user_name;
                        let emp_no = res.data.emp_no;
                        // let user_id = "1"; //res.data.user_id;
                        // let user_name = "管理员"; //res.data.user_name;
                        // let emp_no = "admin"; //res.data.emp_no;
                        let user_category = res.data.user_category;
                        app.globalData.user_id = user_id;
                        app.globalData.user_name = user_name;
                        app.globalData.emp_no = emp_no;
                        app.globalData.user_category = user_category;
                        app.globalData.Uinfo = res.data.userInfo;
                        wx.setStorageSync("user_id", user_id);
                        wx.setStorageSync("user_name", user_name);
                        wx.setStorageSync("emp_no", emp_no);
                        wx.setStorageSync("user_category", user_category);
                        wx.setStorageSync("Uinfo", res.data.userInfo);
                        if (!res.data.isRegister) {
                          wx.reLaunch({
                            url: '../registred/registred'
                          });
                        } else {
                          app.globalData.UInfo = res.data.userInfo
                          if (app.globalData.user_id != "" && app.globalData.user_id != null && app.globalData.user_id != undefined) {
                            if (that.data.goPage == 1) {
                              wx.reLaunch({
                                url: that.data.goUrl
                              });
                            } else {
                              wx.reLaunch({
                                url: '/pages/HR/index/index'
                              });
                            }
                          } else {
                            Dialog.confirm({
                              confirmButtonText: '去注册',
                              message: '您不是企汇内部用户,请联系管理员,谢谢'
                            }).then(() => {
                              wx.redirectTo({
                                url: '../registred/registred'
                              })
                            }).catch(() => {                              
                            });
                          }
                        }
                      } else {
                        Toast(res.data.msg);                         
                      }
                    })
                  }
                })
              } else {
                //用户未授权
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },

})