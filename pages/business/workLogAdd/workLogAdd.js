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
    dateShow: false,
    DDLShow: false,
    info: [], //下拉框
    customerStatusList: [], //客户状态
    orderList: [], //获取订单
    customerReasonList: [], //客户理由
    serviceitemcategoryList:[],//服务项目         
    sales_worklog_id: 0,    
    workLogList: {}, //数据列表
  },

  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldname
    let newValue = e.detail;
    let field = 'workLogList.' + fieldname;
    that.setData({
      [field]: newValue,
    })
  },   
  /**
   * 保存
   */
  bindSave: function (e) {
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
    const that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let emp_no = app.globalData.emp_no;

    let pre_customer_info_id = that.data.pre_customer_info_id;
    let item = that.data.workLogList;
    if (item.customer_status == "" || item.customer_status == null || item.customer_status == undefined) {
      Toast("请选择客户状态");
      return;
    }
    if (item.work_log == "" || item.work_log == null || item.work_log == undefined) {
      Toast("请输入工作日志");
      return;
    }
    if (item.customer_status == "成交") {
      if (item.order_master_id == "" || item.order_master_id == null || item.order_master_id == undefined) {
        Toast("请选择订单号");
        return;
      }
      if (item.service_item_category == "" || item.service_item_category == null || item.service_item_category == undefined) {
        Toast("请选择服务项");
        return;
      }
    }
    if (item.customer_status == "放弃") {
      if (item.order_master_id == "" || item.order_master_id == null || item.order_master_id == undefined) {
        Toast("请选择客户理由");
        return;
      }       
    }    
     
    if (item.work_log != "" && item.work_log != null && item.work_log != undefined) {
      if (item.work_log.length < 2) {
        Toast("咨询内容长度要大于2");
        return;
      }
    } else {
      Toast("请输入咨询内容");
      return;
    }
    let formData = that.data.workLogList;
    wx.showLoading({
      title: '保存中...',
    })
    util.request(api.PostWorklog, {
      formdata: formData,
      emp_no: emp_no,
      user_id: user_id,
      user_name: user_name
    }, 'POST').then(function (res) {
      wx.hideLoading();
      if (res.data.success == true) {
        Toast.success(res.data.msg);
        that.goToPage();
        // wx.redirectTo({
        //   url: '/pages/business/consultSalesDetail/consultSalesDetail'
        // })
      } else {
        Toast.fail(res.data.msg);
      }
    })
  },

  /**
   * 跳转页面
   */
  goToPage: function () {
    let pages = getCurrentPages(); //获取所有页面
    let prevPage = null; //上一个页面
    if (pages.length >= 2) {
      prevPage = pages[pages.length - 2]; //获取上一个页面，将其赋值
    }
    if (prevPage) {
      prevPage.setData({
        active: 3,
      })
      prevPage.QueryWorkLogList();
    }
    setTimeout(function () {
      wx.navigateBack({
        delta: 1,
      })
    }, 500);
  },
  //结束时间
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;   
    if (util.checkOpenId()) {
      let pre_customer_info_id = options.pre_customer_info_id;
      if (options.item) {
        let item = JSON.parse(options.item)
        that.setData({
          workLogList: item,
          sales_worklog_id: item.sales_worklog_id,
        })
        wx.setNavigationBarTitle({
          title: '编辑跟进记录'
        });
      } else {
        wx.setNavigationBarTitle({
          title: '新增跟进记录'
        });      
        that.setData({
          workLogList: {             
            sales_worklog_id:0,
            pre_customer_info_id: pre_customer_info_id,             
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

  
  //关闭弹窗
  onClose: function () {
    this.setData({
      DDLShow: false, //下拉框      
    })
  },

  //选择框
  onSelectDDL(e) {
    let that = this
    let type = e.currentTarget.dataset.type
    that.setData({
      DDLShow: true,
      type: e.currentTarget.dataset.type
    })
    if (type === 'customer_status') {
      that.setData({
        DDLList: that.data.customerStatusList
      })
    }
    if (type === 'order_master_id') {
      that.setData({
        DDLList: that.data.orderList
      })
    }
    if (type === 'customer_reason') {
      that.setData({
        DDLList: that.data.customerReasonList
      })
    }
    if (type === 'service_item_category') {
      that.setData({
        DDLList: that.data.serviceitemcategoryList
      })
    }
  },
  //关闭选择框
  onCancelDDL() {
    this.setData({
      DDLShow: false,
    })
  },
  //确认选择下拉框
  onConfirmDDL: function (e) {
    let name = e.detail.value
    let index = e.detail.index
    let that = this
    if (that.data.type === 'customer_status') {
      that.setData({
        ['workLogList.customer_status']: name,        
      })
    }
    if (that.data.type === 'order_master_id') {
      that.setData({
        ['workLogList.order_master_id']: that.data.info.orderList[index].order_master_id,
        ['workLogList.order_no']: that.data.info.orderList[index].order_no,
        order_no: that.data.info.orderList[index].order_no
      })
    }
    if (that.data.type === 'customer_reason') {
      that.setData({
        ['workLogList.customer_reason']: name,
      })
    }
    if (that.data.type === 'service_item_category') {
      that.setData({
        ['workLogList.service_item_category']: name,
      })
    }
    that.setData({
      DDLShow: false,
    })
  },
  /**
   * 初始化数据
   */
  Init: function () {
    var that = this;
    let user_id = app.globalData.user_id;
    var data = {
      user_id: user_id,
    }
    //下拉框
    util.request(api.GetConditionService,
      data, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        //客户状态
        var customerStatusList = res.data.info.customerStatus.map(v => v.code_name);
        //获取订单
        var orderList = res.data.info.orderList.map(v => v.order_no);
        //客户理由
        var customerReasonList = res.data.info.reasonList.map(v => v.code_name);
        //服务项目
        var serviceitemcategoryList = res.data.info.serviceitemcategorylist.map(v => v.code_name);
        
        that.setData({
          info: res.data.info,
          customerStatusList: customerStatusList,
          orderList: orderList,
          customerReasonList: customerReasonList,
          serviceitemcategoryList:serviceitemcategoryList,           
        });
      } else {
        that.setData({
          info: [],
          customerStatusList: [],
          orderList: [],
          customerReasonList: [],
          serviceitemcategoryList:[],
        });
      }
    });
  },
})