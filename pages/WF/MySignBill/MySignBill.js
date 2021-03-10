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
    signBillList:[],
    page_index: 1,   //当前页
    page_size: 10,  //每页条数
    maxCount: 1, //总页数
    hasMoreData: true, //是否还有更多数据
    noData: false,   //暂无数据;
    indexList:0,
    loading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
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
    that.setData({
      page_index: 1,
      emp_no:app.globalData.emp_no,
    })
    that.getData("正在加载数据...")
  },
  getData: function(message) {
    wx.showLoading({
      title: message,
    })
    Promise.all([this.QueryMySignBill()]).then(res => {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  //查询我的签核
  QueryMySignBill:function(e) {
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      page_index:that.data.page_index,
      page_size:that.data.page_size,
    }
    util.request(api.QueryMySignBillUrl,
        postData
        ,'POST').then(function(res){        
        var signBillListTem = that.data.signBillList;
        if(res.data.success==true){
          if (that.data.page_index == 1) {
            signBillListTem = []
          }
          var signBillList = res.data.signBillList;
          if (that.data.page_index >= res.data.maxCount) {          
            that.setData({
              signBillList: signBillListTem.concat(signBillList),
              hasMoreData: false,
            });
          } else {          
            that.setData({
              signBillList: signBillListTem.concat(signBillList),
              hasMoreData: true,
              page_index: that.data.page_index + 1
            })          
          }
        }else{
          that.setData({
            signBillList:[],
            msg:res.data.msg,
            noData: false,
            loading: false,
          });
        }
    })
  
  },
  goSingleSignBill(e){
    let sign_bill_id= e.currentTarget.dataset.item.sign_bill_id;
    let sign_bill_no= e.currentTarget.dataset.item.sign_bill_no;    
    wx.navigateTo({
      url: "/pages/WF/SingleSignBill/SingleSignBill?sign_bill_id=" + sign_bill_id +'&sign_bill_no='+sign_bill_no
    });
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {    
    wx.showNavigationBarLoading();//在标题栏中显示加载    
    this.getData("正在刷新数据");
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getData("加载更多数据")
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
})