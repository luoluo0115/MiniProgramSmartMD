const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imageURL:'https://img.yzcdn.cn/vant/cat.jpeg',
    userInfo:'',
    isHidden: true, //是否隐藏登录弹窗
    userInfoList:'',
    userInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    console.log(app.globalData.userInfo,'app.globalData.userInfo')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that= this;
    that.getData()
  },
  getData: function() {
    wx.showLoading({
      title: '加载中',
    })
    Promise.all([this.QueryUserEmpInfo()]).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  //查询用户信息
  QueryUserEmpInfo:function(e) {
    let that = this;
    let postData={
      openid:app.globalData.openid,
      user_id:app.globalData.user_id,
    }
    util.request(api.QueryUserEmpInfoUrl,
        postData
        ,'POST').then(function(res){
        console.log(res,'查询用户信息')
        if(res.data.success==true){
          that.setData({
            userInfoList:res.data.userInfo[0],
          });
        }else{
          that.setData({
            userInfoList:'',
            msg:res.data.msg,
          });
        }
    })
  
  },
  //展示登陆弹窗
  showAuth(){
    this.setData({
      isHidden:false
    })
  },
  /*
  *授权登录成功后回调
  */
  afterAuth(e){
    
    this.setData({
      isHidden:true,
      token:e.detail
    })
    this.onShow();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
})