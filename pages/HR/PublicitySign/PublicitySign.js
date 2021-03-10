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
    hrCardLogList: [],
    page_index: 1, //当前页
    page_size: 10, //每页条数
    maxCount: 1, //总页数
    isMore: true, //是否还有更多数据
    noData: false, //暂无数据;
    ftime: '',
    etime: '',
    start_date: '',
    end_date: '',
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    selectShow: false,
    address: '定位中',
    sign_gps: '',
    showIconLoad: false,
    location: '',
    activeFiler: false, //筛选显示隐藏
    checkedType: '',
    TypeList: [{
      title: '有效'
    }, {
      title: '无效'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ftime: util.formatDataTime(new Date().getTime()),
      etime: util.formatDataTime(new Date().getTime()),
    })
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
    that.getData();
    that.getUserLocation();
  },
  getData: function () {
    wx.showLoading({
      title: '加载中',
    })
    Promise.all([this.QueryGetHrPublicitySignList()]).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  //公出申请数据列表
  QueryGetHrPublicitySignList: function (e) {
   
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      start_date: that.data.ftime,
      end_date: that.data.etime
    }
    util.request(api.QueryGetHrPublicitySignListUrl,
      postData, 'POST').then(function (res) {      
      if (res.data.success == true) {        
        that.setData({
          hrCardLogList: res.data.hrCardLogList,
          maxCount: res.data.maxCount
        });
        that.setData({
          noData: false
        })
        if ((res.data.maxCount > 1) && (res.data.maxCount < that.data.page_index)) {
          that.setData({
            noData: true
          })
        }
      } else {
        that.setData({
          hrCardLogList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  //展示登陆弹窗
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
      token: e.detail
    })
    this.onShow();
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
        ftime: that.data.selectedTime
      })
    } else {
      that.setData({
        etime: that.data.selectedTime
      })
    }
    that.setData({
      timeshow: false
    })
    that.getData()
  },

  onClose: function () {
    this.setData({
      timeshow: false,
    })
  },

  PostHrPublicitySignAdd: function (e) {
    let that = this
    let off_duty_id = e.currentTarget.dataset.off_duty_id
    let sign_io_type = e.currentTarget.dataset.sign_io_type

    let path = that.data.address;
    let sign_gps = that.data.sign_gps;
    if (path == "" || path == null || path == undefined) {
      Toast("获取地理位置失败,请稍后重试!");
      return;
    }
    if (sign_gps == "" || sign_gps == null || sign_gps == undefined) {
      Toast("获取地理坐标失败,请稍后重试!");
      return;
    }
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      off_duty_id: off_duty_id,
      path: path,
      sign_gps: that.data.sign_gps,
      sign_io_type: sign_io_type
    }
    util.request(api.PostHrPublicitySignAddUrl, postData, 'POST').then(function (res) {
      if (res.data.success == true) {
        Toast(res.data.msg);
        that.getData();
      } else {
        Toast(res.data.msg);
      }
    })
  },
  /*
   *获取微信地理位置坐标
   */
  getLocationV2: function () {
    const that = this
    var BMap = new bmap.BMapWX({
      ak: app.globalData.AK
    });
    this.setData({
      showIconLoad: true
    })
    var i = setInterval(function () {
      wx.getLocation({
        type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
        success: function (res) {
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          })
          var longitude = res.longitude
          var latitude = res.latitude
          that.loadAddress(longitude, latitude)
          clearInterval(i)
          that.setData({
            showIconLoad: false
          })
        },
        fail: function () {
          wx.showToast({
            title: '请检查您的位置服务是否开启',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            showIconLoad: false
          })
        },
        complete: function () {}
      })
    }, 2000)
  },
  /*
   *根据微信地理位置坐标获取地址
   */
  loadAddress: function (longitude, latitude) {
    var that = this
    let BaiduAK = app.globalData.AK;
    wx.request({
      url: "https://api.map.baidu.com/geoconv/v1/?coords=" + longitude + "," + latitude + "&from=1&to=5&ak=" + BaiduAK + "&output=json",
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        wx.request({
          url: "https://api.map.baidu.com/reverse_geocoding/v3/?ak=" + BaiduAK + "&output=json&location=" + res.data.result[0].y + "," + res.data.result[0].x,
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            const result = res.data.result
            that.setData({
              location: res.data.result.location
            });
            that.setData({
              address: result.formatted_address,
              sign_gps: result.location.lat + ',' + result.location.lng,
              showIconLoad: false
            })
          },
          fail: function () {
            wx.showToast({
              title: '获取地理位置失败,请稍后在试!',
            })
          },
          complete: function () {}
        })
      },
      fail: function () {
        wx.showToast({
          title: '地理位置转换失败,请稍后在试!',
        })
      },
      complete: function () {       
      }
    })
  },  
  
  getUserLocation: function() {
    let vm = this;
    wx.getSetting({
      success: (res) => {
        console.log("设置信息"+JSON.stringify(res))
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          vm.getLocation();
        } else {
          //调用wx.getLocation的API
          vm.getLocation();
        }
      }
    })
  }, 
  // 微信获得经纬度
  getLocation: function() {
    let that = this;
    this.setData({
      showIconLoad: true
    })
    var i = setInterval(function () {
      wx.getLocation({
        type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
        success: function (res) {          
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          })
          var longitude = res.longitude
          var latitude = res.latitude
          that.getLocal(latitude,longitude);
          clearInterval(i)
          that.setData({
            showIconLoad: false
          })
        },
        fail: function () {
          wx.showToast({
            title: '请检查您的位置服务是否开启',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            showIconLoad: false
          })
        },
        complete: function () {}
      })
    }, 1500);  

  },
  // 获取当前地理位置
  getLocal: function(latitude, longitude) {
    let vm = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      latitude: latitude,
      longitude: longitude,
    }
    util.request(api.GetLocation,
      postData, 'POST').then(function (res) {   
      console.log(res,'res')     
      if (res.data.success == true) {               
        vm.setData({
          address: res.data.formatted_address,
          sign_gps: res.data.lat + ',' + res.data.lng,
          showIconLoad: false
        })
      } else {
        Toast(res.data.msg);
        vm.setData({   
          address: '',
          sign_gps: '',        
        });
      }
    });     
  }, 

  //是否有效
  selectedType: function (e) {
    this.setData({
      checkedType: e.currentTarget.dataset.title
    });
  },
  //筛选点击
  onClickSelectShow: function () {
    let that = this
    if (that.data.selectShow == true) {
      that.setData({
        selectShow: false,
        activeFiler: false
      })
    } else {
      that.setData({
        selectShow: true,
        activeFiler: true
      })
    }
  },
})