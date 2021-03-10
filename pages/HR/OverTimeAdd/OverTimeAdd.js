// pages/offical/addExtraWork/addExtraWork.js
const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
import Toast from '../../../vant-weapp/dist/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    minHour: 10,
    maxHour: 20,
    loading: false,
    plan_date_fm: '',
    selectedTime: '',
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    currentDate1: '09:00',
    filter(type, options) {
      if (type === 'minute') {
        return options.filter((option) => option % 30 === 0);
      }

      return options;
    },
    hhshow: false,
    plan_time_hh_to: '',
    plan_time_hh_fm: '',
    selectedHour: '',
    plan_time_mm_fm: '',
    plan_time_mm_to: '',
    columnsHH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    columnsMM: [0, 30],
    mmshow: false,
    mtime: '',
    remark: '',
    reason: '',
    checked: false,
    over_time_id: 0,
    item: '',
    is_special: 'false',

  },
  onChange({
    detail
  }) {
    // 需要手动对 checked 状态进行更新
    this.setData({
      is_special: detail
    });
  },

  onInput(event) {
    this.setData({
      selectedTime: util.formatDataTime(event.detail)
    })
  },
  onConfirm() {
    let that = this
    that.setData({
      plan_date_fm: that.data.selectedTime
    })
    that.setData({
      show: false
    })
  },
  //加班日期选择
  onChangedayTime: function (e) {
    this.setData({
      show: true,
    })
  },
  onClose: function () {
    this.setData({
      show: false,
      hhshow: false,
    })
  },
  onChangeHour: function (e) {
    this.setData({
      hhshow: true,
      time: e.currentTarget.dataset.time
    })
  },
  onChangeMM: function (e) {
    this.setData({
      mmshow: true,
      mtime: e.currentTarget.dataset.mtime
    })
  },
  onInputHour(event) {
    this.setData({
      selectedHour: event.detail
    })
  },
  onConfirmHH(event) {
    let that = this
    const {
      picker,
      value,
      index
    } = event.detail;
    if (that.data.time == 'fhour') {
      that.setData({
        plan_time_hh_fm: event.detail.value,
      })
    } else {
      that.setData({
        plan_time_hh_to: event.detail.value
      })
    }
    that.setData({
      hhshow: false
    })
  },
  onConfirmMM(event) {
    let that = this
    const {
      picker,
      value,
      index
    } = event.detail;
    if (that.data.mtime == 'fMM') {
      that.setData({
        plan_time_mm_fm: event.detail.value,
      })
    } else {
      that.setData({
        plan_time_mm_to: event.detail.value
      })
    }
    that.setData({
      mmshow: false
    })
  },
  onClose: function () {
    this.setData({
      show: false,
      hhshow: false,
      mmshow: false
    })
  },
  onChangeReason(event) {
    this.setData({
      reason: event.detail
    })
  },
  onChangeRemark(event) {
    this.setData({
      remark: event.detail
    })
  },
  onSubmit: function () {
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
    let formdata = {
      over_time_id: that.data.over_time_id,
      plan_date_fm: that.data.plan_date_fm,
      plan_time_hh_fm: that.data.plan_time_hh_fm,
      plan_time_mm_fm: that.data.plan_time_mm_fm,
      plan_time_hh_to: that.data.plan_time_hh_to,
      plan_time_mm_to: that.data.plan_time_mm_to,
      reason: that.data.reason,
      remark: that.data.remark,
      is_special: that.data.is_special,
    }
    if (that.data.plan_date_fm == '') {
      Toast('请选择加班日期');
      return;
    }
    if (that.data.plan_time_hh_fm === '') {
      Toast('请选择开始时间(小时)');
      return;
    }
    if (that.data.plan_time_hh_to === '') {
      Toast('请选择结束时间(小时)');
      return;
    }
    if (that.data.plan_time_mm_fm === '') {
      Toast('请选择开始时间(分钟)');
      return;
    }
    if (that.data.plan_time_mm_to === '') {
      Toast('请选择结束时间(分钟)');
      return;
    }
    if (that.data.plan_time_mm_to === '') {
      Toast('请填写加班理由');
      return;
    }
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      formdata: formdata
    }
    wx.showLoading({
      title: '保存中...',
    })
    util.request(api.PostOverTimeAddUrl,
      postData, 'POST').then(function (res) {
      wx.hideLoading();
      if (res.data.success == true) {
        Toast({
          type: 'success',
          message: res.data.msg,
          onClose: () => {
            that.goToPage();
            // wx.reLaunch({
            //   url: '/pages/HR/OverTime/OverTime'
            // })
          },
        });
      } else {
        Toast(res.data.msg);
      }
    })
  },
  /**
   * 跳转页面
   */
  goToPage: function () {
    let that =this;
    let pages = getCurrentPages(); //获取所有页面
    let prevPage = null; //上一个页面
    if (pages.length >= 2) {
      prevPage = pages[pages.length - 2]; //获取上一个页面，将其赋值
    }
    if (prevPage) {
      prevPage.setData({
        page_index: 1,
      });
      //prevPage.QueryGetHrOverTimeList();
    }
    setTimeout(function () {
      wx.navigateBack({
        delta: 1,
      })
    }, 100);
  },

  //结束时间
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.item) {
      let item = JSON.parse(options.item)
      this.setData({
        item: item,
        over_time_id: item.over_time_id,
        plan_date_fm: util.formatDataTime(item.plan_date_fm),
        plan_time_hh_fm: item.plan_time_hh_fm,
        plan_time_mm_fm: item.plan_time_mm_fm,
        plan_time_hh_to: item.plan_time_hh_to,
        plan_time_mm_to: item.plan_time_mm_to,
        is_special: item.is_special,
        reason: item.reason,
        remark: item.remark
      })
      wx.setNavigationBarTitle({
        title: '编辑加班申请'
      });
    }else{
      this.setData({
        plan_date_fm: util.formatDataTime(new Date().getTime()),
      })
      wx.setNavigationBarTitle({
        title: '新增加班申请'
      });
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
  onShow: function () {}

})