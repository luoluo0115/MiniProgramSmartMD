const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
import Toast from '../../../vant-weapp/dist/toast/toast';
import Dialog from '../../../vant-weapp/dist/dialog/dialog';
const bmap = require('../../../utils/bmap-wx.min.js');
Page({
  data: {
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    isHidden: true, //是否隐藏登录弹窗
    page_index: 1, //当前页
    page_size: 10, //每页条数
    maxCount: 1, //总页数
    isMore: true, //是否还有更多数据
    noData: false, //暂无数据;
    indexList: 0,
    loading: false,
    start: '',
    end: '',
    hrEmpDailyCardList: [],
    cardLogList:[],//个人打卡记录
    location: '',
    user_category:'',//用户类型
  },
  onLoad: function () {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let monthF = (month < 10 ? ("0" + month) : month);
    let dayFormateF = (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate());
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + month + now.getDate(),
      ftime: year + '-' + monthF + '-' + dayFormateF,
      user_category:app.globalData.user_category,
    })
  },
  onShow: function () {
    let that = this;
    that.getData()
    that.getUserLocation();
    setInterval(function () {
      const _currentTime = util.formatTime(new Date()).split(" ")[1];       
      that.setData({
        currentTime: _currentTime,         
      });
    }, 1000)
  },
  getData: function () {
    wx.showLoading({
      title: '加载中',
    })
    Promise.all([this.QueryGetHrEmpDailyCardList(),this.QueryCardLog()]).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  //选择天
  onEmpDaily(e) {
    let year = e.currentTarget.dataset.year
    let month = e.currentTarget.dataset.month
    let datenum = e.currentTarget.dataset.datenum
    let monthF = (month < 10 ? ("0" + month) : month);
    let datenumF = (datenum < 10 ? ("0" + datenum) : datenum);
    this.setData({
      isToday: '' + year + month + datenum,
      ftime: year + '-' + monthF + '-' + datenumF
    })
    this.getData()
  },
  // 新增个人考勤记录
  Submit(e) {
    let that = this;
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
      card_log_id: 0,
      path: path,
      sign_gps: sign_gps,
    }
    util.request(api.PostHrCardLogAddUrl,
      postData, 'POST').then(function (res) {
      if (res.data.success == true) {
        Toast(res.data.msg);
        that.QueryGetHrEmpDailyCardList();
        that.QueryCardLog();
      } else {
        Toast(res.data.msg);
      }
    })
  },
  //获取个人考勤记录
  QueryGetHrEmpDailyCardList: function (e) {
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      start: that.data.ftime,
      end: that.data.ftime
    }
    util.request(api.QueryGetHrEmpDailyCardListUrl,
      postData, 'POST').then(function (res) {      
      if (res.data.success == true) {
        that.setData({
          hrEmpDailyCardList: res.data.hrEmpDailyCardList,
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
          hrEmpDailyCardList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  //获取个人打卡记录
  QueryCardLog: function (e) {
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      start_date: that.data.ftime,
      end_date: that.data.ftime
    }
    util.request(api.QueryCardLogListUrl,
      postData, 'POST').then(function (res) {       
      if (res.data.success == true) {
        that.setData({
          cardLogList: res.data.hrCardLogList,
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
          cardLogList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth(); //没有+1方便后面计算当月总天数
    let currMonth = month;
    currMonth = currMonth+1;
    if(parseInt(currMonth)<10){
      currMonth= '0' +currMonth;
    }     
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);    
    let startWeek = new Date(year + '-' + (currMonth) + '-01').getDay(); //目标月1号对应的星期        
    let dayNums = new Date(year, nextMonth, 0).getDate(); //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;    
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          isToday: '' + year + (month + 1) + num,
          dateNum: num,
          weight: 5
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })    
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  /**
   * 上月切换
   */
  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  /**
   * 下月切换
   */
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
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
              location: result.location
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
      complete: function () {}
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.page_index = 1
    if (!this.data.loading) {
      this.setData({
        signBillList: [],
      })
      this.getData()       
    }

  },
  /**
   * 页面相关事件处理函数--监听用户上拉动作
   */
  onReachBottom: function () {   
  }
})