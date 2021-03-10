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
    page_index: 1,
    page_size: '20',
    maxCount: 1, //总页数    
    hasMoreData: true, //是否还有更多数据;
    msg:"",
    salesList: [],
    date_start: '',
    date_end: '',
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

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
      that.getData("正在加载数据...");
    }
  },
  getData: function (message) {
    wx.showLoading({
      title: message,
    })
    Promise.all([this.QueryCustomerInfoSalesList()]).then(res => {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  //查询业务咨询
  QueryCustomerInfoSalesList: function (e) {
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let emp_no = app.globalData.emp_no;
    let postData = {
      openid: app.globalData.openid,
      emp_no: emp_no,
      user_id: user_id,
      user_name: user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      customer_date_start: that.data.date_start,
      customer_date_end: that.data.date_end
    }
    util.request(api.QueryCustomerInfoSalesList,
      postData, 'POST').then(function (res) {      
      var saleslistTem = that.data.salesList;
      if (res.data.success == true) {
        if (that.data.page_index == 1) {
          saleslistTem = []
        }
        var salesList = res.data.salesList;
        if (that.data.page_index >= res.data.maxCount) {          
          that.setData({
            salesList: saleslistTem.concat(salesList),
            hasMoreData: false,
          });
        } else {          
          that.setData({
            salesList: saleslistTem.concat(salesList),
            hasMoreData: true,
            page_index: that.data.page_index + 1
          })          
        }
      } else {
        that.setData({
          salesList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  /*时间选择*/
  selectedTime: function (e) {
    let time = e.currentTarget.dataset.time
    this.setData({
      timeshow: true,
      timeType: time
    })
  },
  onInput(event) {
    this.setData({
      selectedTime: util.formatDataTime(event.detail)
    })
  },
  onConfirm() {
    let that = this
    if (that.data.timeType == 'fTime') {
      that.setData({
        date_start: that.data.selectedTime
      })
    } else {
      that.setData({
        date_end: that.data.selectedTime
      })
    }
    that.setData({
      timeshow: false
    })
    that.getData("正在加载数据...");
  },
  onClose: function () {
    this.setData({
      timeshow: false,
    })
  },
   
  // 接收咨询线索  
  accepted: function(e) {
    let pre_customer_info_id = e.currentTarget.dataset.pre_customer_info_id
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      pre_customer_info_id: pre_customer_info_id,
    }    
    Dialog.confirm({
        message: '确定接受该咨询线索吗?',
      })
      .then(() => {
        util.request(api.PostSalesAcceptedY,
          postData, 'POST').then(function (res) {          
          if (res.data.success == true) {
            Toast(res.data.msg);
            that.data.page_index = 1;
            that.QueryCustomerInfoSalesList();
          } else {
            Toast(res.data.msg);
          }
        })
      })
      .catch(() => {
        Dialog.close();
      });

  },
  //新增咨询
  Add: function (e) {
    wx.navigateTo({
      url: "/pages/business/consultSalesAdd/consultSalesAdd"
    });
  },
  //修改咨询
  Upd: function (e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/consultSalesAdd/consultSalesAdd?item=" + JSON.stringify(item)
    });
  },
  //修改咨询
  Edit: function (e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/consultSalesEdit/consultSalesEdit?item=" + JSON.stringify(item)
    });
  },
  //咨询详情
  Detail: function (e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/consultSalesDetail/consultSalesDetail?item=" + JSON.stringify(item)
    });
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