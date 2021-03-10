var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
import Toast from '../../../vant-weapp/dist/toast/toast';
import Dialog from '../../../vant-weapp/dist/dialog/dialog';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isHidden: true, //是否隐藏登录弹窗  
    consultInfo: [],
    pre_customer_info_id: 0,
  },
  /**
   * 业务咨询线索接收查询
   */
  QueryCustomerInfoByID: function (e) {
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let pre_customer_info_id = that.data.pre_customer_info_id;
    util.request(api.QueryCustomerInfoByIDUrl, {
      openid: app.globalData.openid,
      user_id: user_id,
      user_name: user_name,
      pre_customer_info_id: pre_customer_info_id,
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        let data = res.data;
        that.setData({
          consultInfo: data.info[0],
        });
      } else {
        that.setData({
          consultInfo: [],
        });
      }
    })
  },
  //确认接收
  AffirmRec: function (e) {
    if (this.data.ButtonClicked) {
      wx.showToast({
        title: '休息一下~',
        icon: 'none'
      })
      return
    }
    this.data.ButtonClicked = true
    setTimeout(() => {
      this.data.ButtonClicked = false;
    }, 1000)
    // 防止连续点击--结束
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let emp_no = app.globalData.emp_no;
    let pre_customer_info_id = that.data.pre_customer_info_id;
    Dialog.confirm({
        message: '确定接收该咨询吗?',
      })
      .then(() => {
        let postData = {
          openid: app.globalData.openid,
          emp_no: emp_no,
          user_id: user_id,
          user_name: user_name,
          pre_customer_info_id: pre_customer_info_id,
        }
        util.request(api.PostSalesAcceptedY, postData, 'POST').then(function (res) {
          if (res.data.success == true) {
            Toast(res.data.msg);
            wx.redirectTo({
              url: '/pages/business/consultSalesList/consultSalesList'
            })
          } else {
            Toast(res.data.msg);
          }
        })
      })
      .catch(() => {
        Dialog.close();
      });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (util.checkOpenId()) {
      let pre_customer_info_id = options.pre_customer_info_id;
      if (pre_customer_info_id) {
        this.setData({
          pre_customer_info_id: pre_customer_info_id,
        })
      }
      that.QueryCustomerInfoByID();
    } else {
      that.setData({
        isHidden: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //显示登陆弹窗
  showAuth() {
    this.setData({
      isHidden: false
    })
  },
  /*
   *授权登录成功后回调
   */
  afterAuth(e) {
    this.setData({
      isHidden: true,
    })
    this.onShow();
  },
})