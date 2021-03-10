const app = getApp();
const api = require('../../config/api.js')
var util = require('../../utils/util.js');
Component({
  properties: {
    isHidden: {
      type: Boolean,
      value: true,
    },
    url: {
      type: String,
    }
  },
  /**
   * 组件的初始数据 
   */
  data: {
    bgImgPath: api.ImgUrl + 'Q002',
  },
  methods: {
    gorule(e) {
      console.log(e)
      let url = this.data.url
      wx.navigateTo({
        url: url + "?type=" + e.currentTarget.dataset.type
      })

    },
    close() {
      this.setData({
        isHidden: true,
      })
    },
    bindGetUserInfo(e) {
      if (!e.detail.userInfo) {
        return;
      }
      if (app.globalData.isConnected) {
        wx.setStorageSync('userInfo', e.detail.userInfo)
        app.globalData.userInfo = e.detail.userInfo;
        console.log(e.detail.userInfo, 'userInfobind');
        this.login();
      } else {
        wx.showToast({
          title: '当前无网络',
          icon: 'none',
        })
      }
    },     

    login() {
      const that = this;
      wx.login({
        success(res) {
          if (res.code) {
            var code = res.code
            //判断用户是否授权
            wx.getSetting({
              success: res => {
                if (res.authSetting['scope.userInfo']) {
                  //已经授权，获取用户信息
                  wx.getUserInfo({
                    success: function (res) {
                      console.log(res, '已经授权，获取用户信息');
                      var encryptedData = res.encryptedData
                      var iv = res.iv;
                      var data = {
                        code: code,
                        encryptedData: encryptedData,
                        iv: iv,
                      }
                      util.commonRequest({
                        url: api.UserUrl,
                        data: data,
                        method: "post",
                        success: function (res) {
                          //可以把openid存到本地，方便以后调用
                          app.globalData.openid = res.data.openid;
                          app.globalData.sessKey = res.data.session_key;
                          let user_id = res.data.user_id;
                          let user_name = res.data.user_name;
                          let emp_no = res.data.emp_no;
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

                          that.triggerEvent('afterAuth', app.globalData.Token)
                        },
                        fail: function (err) {
                          console.log(err);
                        },
                        complete: function () {
                          wx.hideLoading();
                        }
                      });
                    },
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
      })
    },

    // 绑定推荐关系
    bindParent: function () {
      var parent_user_id = wx.getStorageSync("parent_user_id");
      if (parent_user_id == "undefined" || parent_user_id == 0)
        return;
      console.log("Try To Bind Parent With User Id:" + parent_user_id);
      var user_id = wx.getStorageSync("user_id");
      if (parent_user_id != 0 && user_id != 0) {
        util.request(api.AddSpreadRelationUrl, {
          openid: app.globalData.openid,
          user_id: app.globalData.user_id,
          parent_user_id: parent_user_id
        }, 'POST').then(function (res) {
          console.log(res, '层级 ')
          if (res.data.success == true) {
            console.log(res.data.msg)
          } else {
            console.log(res.data.msg)
          }
        })
      }
    },
    //登录成功后不刷新的页面
    loginNoRefreshPage: [
      'pages/index/index',
    ],

  }
})