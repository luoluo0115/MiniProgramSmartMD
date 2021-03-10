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
    openid:app.globalData.openid,
    hrOverTimeList:[],
    page_index:'1',
    page_size:'10',
    plan_date_fm:"",
    plan_date_to:"",
    maxCount: 1, //总页数
    hasMoreData: true, //是否还有更多数据        
    timeshow:false,
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    selectedTime:'',
    ftime:'',
    etime:'',
    timetype:'',
    over_time_id:0
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
    Promise.all([this.QueryGetHrOverTimeList()]).then(res => {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  //查询加班申请数据列表
  QueryGetHrOverTimeList:function(e) {    
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      page_index:that.data.page_index,
      page_size:that.data.page_size,
      plan_date_fm:that.data.ftime,
      plan_date_to:that.data.etime
    }
    util.request(api.QueryGetHrOverTimeListUrl,
        postData
        ,'POST').then(function(res){
        console.log(res,'加班申请数据列表')
        var hrOverTimeListTem = that.data.hrOverTimeList;
        if(res.data.success==true){
          if (that.data.page_index == 1) {
            hrOverTimeListTem = []
          }
          var hrOverTimeList = res.data.hrOverTimeList;
          if (that.data.page_index >= res.data.maxCount) {          
            that.setData({
              hrOverTimeList: hrOverTimeListTem.concat(hrOverTimeList),
              hasMoreData: false,
            });
          } else {          
            that.setData({
              hrOverTimeList: hrOverTimeListTem.concat(hrOverTimeList),
              hasMoreData: true,
              page_index: that.data.page_index + 1
            })          
          }
        }else{
          that.setData({
            hrOverTimeList:[],
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
  /*时间选择*/
  selectedTime:function(e){
    let time= e.currentTarget.dataset.time
    this.setData({
      timeshow:true,
      timeType:time
    })
  },
  onInput(event) {
    this.setData({
      selectedTime:util.formatDataTime(event.detail)
    })
  },
  onConfirm(){
    let that= this
    if(that.data.timeType=='fTime'){
      that.setData({
        ftime:that.data.selectedTime
      })
    }else{
      that.setData({
        etime:that.data.selectedTime
      })
    }
    that.setData({
      timeshow:false
    })
    that.QueryGetHrOverTimeList()
  },
  
  onClose: function(){
    this.setData({
      timeshow:false,
    })
  },
  // 加班取消
  Cancel:function(e){
    let billno= e.currentTarget.dataset.billno
    let overtimeid= e.currentTarget.dataset.overtimeid
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      over_time_id:overtimeid,
      bill_no:billno
    }
    Dialog.confirm({
      message: '确定取消签核吗?',
    })
    .then(() => {
      util.request(api.PostOverTimeCancelSignedByIdUrl,postData,'POST').then(function(res){
        if(res.data.success==true){
          Toast(res.data.msg);
          that.data.page_index = 1;
          that.QueryGetHrOverTimeList();
        }else{
          Toast(res.data.msg);
        }
    })
    })
    .catch(() => {
      Dialog.close();
    });
    
  },
   // 删除加班申请
  Delete(e){
    let overtimeid= e.currentTarget.dataset.overtimeid
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      over_time_id:overtimeid,
    }
    Dialog.confirm({
      message: '确定删除加班申请?',
    })
    .then(() => {
      util.request(api.DeleteOverTimeByIdUrl,
        postData
        ,'POST').then(function(res){        
        if(res.data.success==true){
          Toast(res.data.msg);
          that.data.page_index = 1;
          that.QueryGetHrOverTimeList();
        }else{
          Toast(res.data.msg);
        }
    })
    })
    .catch(() => {
      Dialog.close();
    });
    
  },
   // 加班申请记录提交签核
  Submit(e){
    let overtimeid= e.currentTarget.dataset.overtimeid
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      over_time_id:overtimeid,
    }
    Dialog.confirm({
      message: '确定提交签核吗?',
    })
    .then(() => {
      util.request(api.PostOverTimeSubmitApprovalByIdUrl,
        postData
        ,'POST').then(function(res){
        if(res.data.success==true){
          Toast(res.data.msg);
          that.data.page_index = 1;
          that.QueryGetHrOverTimeList();
        }else{
          Toast(res.data.msg);
        }
      })
    })
    .catch(() => {
      Dialog.close();
    });
   
  },
  // 加班申请添加
  Add: function (e) {
    wx.navigateTo({
      url: "/pages/HR/OverTimeAdd/OverTimeAdd"
    });
  },
  // 加班申请修改
  Updata: function (e) {
    let item= e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/HR/OverTimeAdd/OverTimeAdd?item=" +JSON.stringify(item)
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
  
})