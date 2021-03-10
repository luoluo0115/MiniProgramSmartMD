// pages/offical/extraWork/extraWork.js
const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
import Toast from '../../../vant-weapp/dist/toast/toast';
import Dialog from '../../../vant-weapp/dist/dialog/dialog';
const bmap = require('../../../utils/bmap-wx.min.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidden: true, //是否隐藏登录弹窗
    currentDate:'',
    time:'',
    SStime:'',
    page_index: 1,   //当前页
    page_size: 10,  //每页条数
    hrCardLogList:[],
    wxMarkerData:[],
    longitude: '',   //经度  
    latitude: '',    //纬度 
    location:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setTime();
    
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
    that.getData();
    
  },
  // 设置计时器
  setTime(){
    let that = this
    let myTime = setInterval(function () {
      let date=util.getDates(1, new Date().getTime());
      that.setData({
        time:date[0].time,
        date:date[0].week,
        SStime:date[0].SStime
      })
    }, 1000)
  },
  getData: function() {
    wx.showLoading({
      title: '加载中',
    })
    Promise.all([this.QueryGetHrCardLogList(),this.getLocation()]).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  //查询请假申请数据列表
  QueryGetHrCardLogList:function(e) {
    let that = this;
    let postData={
      openid:app.globalData.openid,
      emp_no:app.globalData.emp_no,
      user_id:app.globalData.user_id,
      user_name:app.globalData.user_name,
      page_index:that.data.page_index,
      page_size:that.data.page_size,
      date:util.formatDataTime(new Date().getTime())   
    }
    console.log(postData,'postData')
    util.request(api.QueryGetHrCardLogListUrl,
        postData
        ,'POST').then(function(res){
        if(res.data.success==true){
          that.setData({
            hrCardLogList:res.data.hrCardLogList,
            maxCount:res.data.maxCount
          });
          console.log(res.data.hrOffDutyList,'hrOffDutyList')
          that.setData({
            noData: false
          })
          if((res.data.maxCount>1)&&(res.data.maxCount<that.data.page_index)){
            that.setData({
              noData: true
            })
          }
        }else{
          that.setData({
            hrCardLogList:[],
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
  
// 加班申请记录提交签核
  Submit(e){
  let that = this;
  let postData={
    openid:app.globalData.openid,
    emp_no:app.globalData.emp_no,
    user_id:app.globalData.user_id,
    user_name:app.globalData.user_name,
    card_log_id:0,
  }
  util.request(api.PostHrCardLogAddUrl,
    postData
    ,'POST').then(function(res){
    if(res.data.success==true){
      Toast(res.data.msg);
      that.QueryGetHrCardLogList();
    }else{
      Toast(res.data.msg);
    }
  })
  
},
getLocation:function(){
  var that = this;
  var BMap = new bmap.BMapWX({
      ak: 'O5Ixy0GsmqbTxh'
  });

  wx.getLocation({
      type: 'wgs84',
      success: function (res) {
          
          that.setData({
              latitude: res.latitude,//经度
              longitude: res.longitude//纬度
          })
          console.log(res,'经纬度')
          console.log(res,'经纬度')
          BMap.regeocoding({
              location: that.data.latitude + ',' + that.data.longitude,
              success: function (res) {
                  console.log(res)
                  
                  that.setData({
                      wxMarkerData : res.wxMarkerData //地址信息
                  })
              },
              fail: function () {
                  wx.showToast({
                      title: '请检查位置服务是否开启',
                  })
              },
          });
      },
      fail: function () {
          console.log('小程序得到坐标失败')
      }
  })
}


})