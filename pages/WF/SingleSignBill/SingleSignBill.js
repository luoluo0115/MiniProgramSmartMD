// pages/WF/SingleSignBill/SingleSignBill.js
const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
import Toast from '../../../vant-weapp/dist/toast/toast';
import Dialog from '../../../vant-weapp/dist/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidden: true, //是否隐藏登录弹窗
    signUserList: [],
    dtMaster: [],
    dtDetail: [],
    dtList: [],
    dtModel: [],
    sign_info_name: '',
    sign_info_code: '',
    isHidden: true, //是否隐藏登录弹窗
    isMore: true, //是否还有更多数据
    noData: false, //暂无数据;
    active: 1,
    sign_comment: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options != '') {
      this.setData({
        sign_bill_id: options.sign_bill_id,
        sign_bill_no: options.sign_bill_no
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
  onShow: function () {
    let that = this;
    if (!util.checkOpenId()) {
      that.setData({
        isHidden: false
      })
    } else {      
      that.getData()
    }            
  },
  getData: function () {
    wx.showLoading({
      title: '加载中',
    })
    Promise.all([this.QuerySingleSignBill()]).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  
  //查询签核信息
  QuerySingleSignBill: function (e) {
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      user_id: app.globalData.user_id,
      emp_no: app.globalData.emp_no,
      sign_bill_id: that.data.sign_bill_id,
      sign_bill_no: that.data.sign_bill_no,
    }    
    util.request(api.QuerySingleSignBillUrl,
      postData, 'POST').then(function (res) {
      console.log(res, '根据签核单据获取签核人员和签核信息')      
      if (res.data.success == true) {   
        let  dtMaster=[]
        let  dtModel=[]
        if(res.data.dtMaster.length>0){
          dtMaster=res.data.dtMaster[0]
        } 
        if(res.data.dtModel.length>0){
          dtModel=res.data.dtModel[0]
        }    
        that.setData({
          signUserList: res.data.signUserList,
          dtMaster: dtMaster,
          dtDetail: res.data.dtDetail,
          dtModel: dtModel,
          dtList: res.data.dtList,
          sign_info_name: res.data.sign_info_name,
          sign_info_code: res.data.sign_info_code
        });
        wx.setNavigationBarTitle({
          title: res.data.sign_info_name+'签核流程'
        })
      } else {
        that.setData({
          msg: res.data.msg,
          signUserList: [],
          dtMaster: [],
          dtDetail: [],
          dtList: [],
          dtModel: [],
          sign_info_name: '',
          sign_info_code: ''
        });
      }
    })

  },
  onSignComment: function (e) {
    this.setData({
      sign_comment: e.detail
    })
  },
  //签核
  goSignBill: function (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,      
      emp_name: app.globalData.user_name,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      sign_bill_id: that.data.sign_bill_id,
      sign_bill_no: that.data.sign_bill_no,
      sign_comment: that.data.sign_comment
    }
    if (item == 'approve') {
      Dialog.confirm({
          message: '确定同意核准吗？',
        })
        .then(() => {
          that.PostSignBillApprove(postData)
        })
        .catch(() => {
          // on cancel
        });

    } else if (item == 'reject') {
      if (that.data.sign_comment == '') {
        Toast('请填写拒绝核准理由');
      } else {
        Dialog.confirm({
            message: '确定拒绝核准吗？',
          })
          .then(() => {
            that.PostSignBillReject(postData)
          })
          .catch(() => {
            // on cancel
          });
      }
    }
  },
  //签核同意
  PostSignBillApprove: function (e) {        
    let that = this;
    let postData = e    
    wx.showLoading({
      title: '加载中...',
    })
    util.request(api.PostSignBillApproveUrl,
      postData, 'POST').then(function (res) {
      wx.hideLoading();
      console.log(res, '签核同意')
      if (res.data.success == true) {
        Toast(res.data.msg);        
        wx.reLaunch({
          url: "/pages/WF/MySignBill/MySignBill"
        });         
      } else {        
        Toast(res.data.msg);
      }
    })
  },
  //签核拒绝
  PostSignBillReject: function (e) {
    let that = this;
    let postData = e
    wx.showLoading({
      title: '加载中...',
    })    
    util.request(api.PostSignBillRejectUrl,
      postData, 'POST').then(function (res) {
      wx.hideLoading();
      console.log(res, '签核拒绝')
      if (res.data.success == true) {
        Toast(res.data.msg);
        wx.reLaunch({
          url: "/pages/WF/MySignBill/MySignBill"
        });
      } else {         
        Toast(res.data.msg);
      }
    })

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