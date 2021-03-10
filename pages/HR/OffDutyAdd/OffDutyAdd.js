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
    isHidden: true, //是否隐藏登录弹窗  
    show: false,
    minHour: 10,
    maxHour: 20,
    loading: false,
    dayTime: '',
    selectedTime: '',
    currentDate: new Date().getTime(),
    minDate: new Date(2020, 1, 1).getTime(),
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
    currentDateTime: '',
    hhshow: false,
    mmshow: false,
    plan_time_to: '',
    plan_time_fm: '',
    plan_time_hh_to: '',
    plan_time_hh_fm: '',
    plan_time_mm_fm: '',
    plan_time_mm_to: '',
    NameList: [],
    nameshow: false,
    agent_emp_no: '',
    absent_code: '',
    hrOffDutyList: '', //加班申请参数列表
    aclist: [], //原始假别   
    helist: [], //原始代理人
    codeNameList: [], //原始假别细分
    empNameList: [], //原始代理人细分
    startDutylist: [], //原始开始时间 
    endDutylist: [], //原始结束时间
    amTimeFrom: [], //原始开始时间细分 
    pmTimeTo: [], //原始结束时间细分 
    timeList: [], //开始结束时间列表
    off_duty_id: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (util.checkOpenId()) {
      if (options.item) {
        let item = JSON.parse(options.item);
        item.plan_date_fm = util.formatDataTime(item.plan_date_fm);
        item.plan_date_to = util.formatDataTime(item.plan_date_to);
        that.setData({
          hrOffDutyList: item,
          off_duty_id: item.off_duty_id,
          amTime: item.plan_time_hh_fm + ':' + item.plan_time_mm_fm,
          pmTime: item.plan_time_hh_to + ':' + item.plan_time_mm_to
        })
        wx.setNavigationBarTitle({
          title: '编辑请假申请'
        });
      } else {
        wx.setNavigationBarTitle({
          title: '新增请假申请'
        });
        that.setData({
          amTime: '',
          pmTime: '',
          hrOffDutyList: {
            off_duty_id: 0,
            plan_time_hh_fm: "9",
            plan_time_hh_to: "17"
          }, //数据列表
        })
      }
      this.Init();
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

  //请假时数
  PlanHoursChange: function (e) {
    var that = this;
    let openid = app.globalData.openid;
    let emp_no = app.globalData.emp_no;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    var data = {
      openid: openid,
      user_id: user_id,
      emp_no: emp_no,
      user_name: user_name,
      formdata: that.data.hrOffDutyList
    }
    util.request(api.GetPlanHoursUrl,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          ['hrOffDutyList.plan_hours']: res.data.planHours,
        });
      } else {
        that.setData({
          ['hrOffDutyList.plan_hours']: 0,
        });
      }
    });
  },
  /**
   * 初始化数据
   */
  Init: function () {
    Promise.all([this.GetOffDutyCondition(), this.GetDutyList()]).then(res => {});
  },
  //获取请假使用参数列表
  GetOffDutyCondition: function (e) {
    var that = this;
    let openid = app.globalData.openid;
    let emp_no = app.globalData.emp_no;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    var data = {
      openid: openid,
      user_id: user_id,
      emp_no: emp_no,
      user_name: user_name
    }
    //下拉框
    util.request(api.GetOffDutyConditionUrl,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        //假别
        var codeNameList = res.data.aclist.map(v => v.code_name)
        //代理人
        var empNameList = res.data.helist.map(v => v.emp_name)
        that.setData({
          msg: res.data.msg,
          codeNameList: codeNameList,
          aclist: res.data.aclist,
          empNameList: empNameList,
          helist: res.data.helist
        });
      } else {
        that.setData({
          msg: [],
          codeNameList: [],
          empNameList: [],
        });
      }
    });
  },
  //获取请假开始结束时间
  GetDutyList: function (e) {
    var that = this;
    let openid = app.globalData.openid;
    let emp_no = app.globalData.emp_no;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    var data = {
      openid: openid,
      user_id: user_id,
      emp_no: emp_no,
      user_name: user_name
    }
    util.request(api.GetDutyListUrl,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        //开始时间
        var amTimeFrom = res.data.start_dutylist.map(v => v.am_time_from)
        //结束时间
        var pmTimeTo = res.data.end_dutylist.map(v => v.pm_time_to)
        that.setData({
          startDutylist: res.data.start_dutylist,
          endDutylist: res.data.end_dutylist,
          amTimeFrom: amTimeFrom,
          pmTimeTo: pmTimeTo
        });
      } else {
        that.setData({
          startDutylist: [],
          endDutylist: [],
          amTimeFrom: [],
          pmTimeTo: []
        });
      }
    });
  },
  //选择框 假别 代理人
  onSelect: function (e) {
    let that = this
    let type = e.currentTarget.dataset.type
    that.setData({
      nameshow: true,
      type: e.currentTarget.dataset.type
    })
    if (type === 'codeName') {
      that.setData({
        nameList: that.data.codeNameList
      })
    }
    if (type === 'empName') {
      that.setData({
        nameList: that.data.empNameList
      })
    }
  },
  //选中 假别 代理人
  onName: function (e) {
    let name = e.detail.value
    let index = e.detail.index
    let that = this
    if (that.data.type === 'codeName') {
      that.setData({
        ['hrOffDutyList.absent_name']: name,
        ['hrOffDutyList.absent_code']: that.data.aclist[index].code_no,
      })
    }
    if (that.data.type === 'empName') {
      that.setData({
        ['hrOffDutyList.agent_emp_name']: name,
        ['hrOffDutyList.agent_emp_no']: that.data.helist[index].emp_no
      })
    }
    that.setData({
      nameshow: false,
    })

  },

  //选择框 am开始时间 pm结束时间 fm开始日期 to 结束日期
  onSelectTime: function (e) {
    let that = this
    let time = e.currentTarget.dataset.time
    that.setData({
      time: e.currentTarget.dataset.time
    })
    if (time === 'am') {
      that.setData({
        timeList: that.data.amTimeFrom,
        timeshow: true,
      })
    } else if (time === 'pm') {
      that.setData({
        timeList: that.data.pmTimeTo,
        timeshow: true,
      })
    } else if (time === 'fm' || time === 'to') {
      that.setData({
        show: true
      })
    }
  },
  //选中 开始时间 结束时间
  onConfirmTime: function (e) {
    let name = e.detail.value
    let that = this
    if (that.data.time === 'am') {
      that.setData({
        amTime: name,
        ['hrOffDutyList.plan_time_hh_fm']: name.split(":")[0],
        ['hrOffDutyList.plan_time_mm_fm']: name.split(":")[1]
      })

    } else if (that.data.time === 'pm') {
      that.setData({
        pmTime: name,
        ['hrOffDutyList.plan_time_hh_to']: name.split(":")[0],
        ['hrOffDutyList.plan_time_mm_to']: name.split(":")[1]
      })

    }
    if (that.data.amTime === that.data.pmTime) {
      Toast('请假开始时间和结束时间不能相同!');
      return;
    }
    that.PlanHoursChange();
    that.setData({
      timeshow: false,
    })

  },
  //选中 开始日期 结束日期
  onConfirm: function (e) {
    let that = this
    if (that.data.time === 'fm') {
      that.setData({
        ['hrOffDutyList.plan_date_fm']: util.formatDataTime(e.detail)
      })
    }
    if (that.data.time === 'to') {
      that.setData({
        ['hrOffDutyList.plan_date_to']: util.formatDataTime(e.detail)
      })
    }
    that.PlanHoursChange();
    that.setData({
      show: false
    })
  },
  //关闭弹窗
  onCancel: function () {
    this.setData({
      nameshow: false,
      timeshow: false,
      show: false,
    })
  },
  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldname
    let newValue = e.detail;
    let field = 'hrOffDutyList.' + fieldname;
    that.setData({
      [field]: newValue,
    })
    if (fieldname == "plan_time_hh_fm" || fieldname == "plan_time_mm_fm" || fieldname == "plan_time_hh_to" || fieldname == "plan_time_mm_to") {
      that.PlanHoursChange();
    }
  },

  //提交请假申请
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
    let item = that.data.hrOffDutyList;
    if (item.absent_code == "" || item.absent_code == null || item.absent_code == undefined) {
      Toast('请选择假别');
      return;
    }
    if (item.absent_code != "H" && item.absent_code != "I") {
      if (item.agent_emp_no == "" || item.agent_emp_no == null || item.agent_emp_no == undefined) {
        Toast('请选择代理人');
        return;
      }
    }
    if (item.plan_date_fm == "" || item.plan_date_fm == null || item.plan_date_fm == undefined) {
      Toast('请选择请假开始日期');
      return;
    }
    if (item.plan_date_to == "" || item.plan_date_to == null || item.plan_date_to == undefined) {
      Toast('请选择请假结束日期');
      return;
    }
    if (item.plan_time_hh_fm == "" || item.plan_time_hh_fm == null || item.plan_time_hh_fm == undefined) {
      Toast('请输入请假开始时间(时)');
      return;
    }
    if (item.plan_time_hh_to == "" || item.plan_time_hh_to == null || item.plan_time_hh_to == undefined) {
      Toast('请输入请假结束时间(时)');
      return;
    }
    if (item.reason == "" || item.reason == null || item.reason == undefined) {
      Toast('请输入请假原因');
      return;
    }
    // if (item.plan_hours == 0) {
    //   Toast('请检查请假日期是否存在周六周末或公假');
    //   return;
    // }
    if (item.absent_code != "I") {
      item.plan_time_mm_fm = item.plan_time_hh_fm == 9 ? 0 : 30;
      item.plan_time_mm_to = 30;
    }
    item.apply_date = new Date();
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      formdata: item
    }
    wx.showLoading({
      title: '保存中...',
    })
    //新增加班申请
    util.request(api.PostOffDutyAddUrl,
      postData, 'POST').then(function (res) {
      wx.hideLoading();
      if (res.data.success == true) {
        Toast({
          type: 'success',
          message: res.data.msg,
          onClose: () => {
            that.goToPage();
          },
        });
      } else {
        Toast(res.data.msg);
      }
    })
  },

  goToPage: function () {
    let pages = getCurrentPages(); //获取所有页面
    let prevPage = null; //上一个页面
    if (pages.length >= 2) {
      prevPage = pages[pages.length - 2]; //获取上一个页面，将其赋值
    }
    if (prevPage) {
      prevPage.setData({
        page_index: 1,
      });
      prevPage.QueryGetHrOffDutyList();
    }
    setTimeout(function () {
      wx.navigateBack({
        delta: 1,
      })
    }, 100);
  },
})