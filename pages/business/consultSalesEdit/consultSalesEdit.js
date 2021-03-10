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
    active: 0,
    DDLShow: false,
    info: [], //下拉框
    customerSourceList: [], //客户来源
    attractInvestmentSourceList: [], //招商来源
    customerCategoryList: [], //客户分类
    serviceitemcategoryList: [], //服务项目         

    pre_customer_info_id: 0,
    consultList: {}, //数据列表  
    editHistoryList: [], //业务咨询修改记录    
  },

  switchTab(event) {
    let that = this;
    let title = event.detail.title;
    if (title == '业务咨询客户修改') {
      wx.setNavigationBarTitle({
        title: '业务咨询客户修改'
      });
    } else if (title == '业务咨询修改历史') {
      that.GetHistoryChange();
      wx.setNavigationBarTitle({
        title: '业务咨询修改历史'
      });
    }
  },
  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldname
    let newValue = e.detail;
    let field = 'consultList.' + fieldname;
    that.setData({
      [field]: newValue,
    })
  },
  /**
   * 业务咨询修改保存并提交签核
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
    let item = that.data.consultList;
    if (item.sales_id == "" || item.sales_id == null || item.sales_id == undefined) {
      Toast("销售人员为空");
      return;
    }
    if (item.pre_customer_info_id == "" || item.pre_customer_info_id == null || item.pre_customer_info_id == undefined) {
      Toast("未找到业务咨询记录");
      return;
    }
    if (item.change_reason == "" || item.change_reason == null || item.change_reason == undefined) {
      Toast("请输入修改理由");
      return;
    }
    let formData = {
      emp_no: emp_no,
      user_id: user_id,
      user_name: user_name,
      pre_customer_info_id: item.pre_customer_info_id,
      attract_investment_source_ca: item.attract_investment_source,
      customer_source_ca: item.customer_source,
      customer_category_ca: item.customer_category,
      service_item_category_ca: item.service_item_category,
      change_reason: item.change_reason,
      enabled_ca: item.enabled,
      remark: item.remark
    };
    wx.showLoading({
      title: '保存中...',
    })
    util.request(api.PostCustomerChangeAdd, formData, 'POST').then(function (res) {
      wx.hideLoading();
      if (res.data.success == true) {
        Toast.success(res.data.msg);
        that.goToPage();
        // wx.redirectTo({
        //   url: '/pages/business/consultSalesList/consultSalesList'
        // })
      } else {
        Toast.fail(res.data.msg);
      }
    })
  },


  //业务咨询修改历史记录
  GetHistoryChange: function (e) {
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let emp_no = app.globalData.emp_no;
    let pre_customer_info_id = that.data.pre_customer_info_id;
    let postData = {
      openid: app.globalData.openid,
      emp_no: emp_no,
      user_id: user_id,
      user_name: user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      pre_customer_info_id: pre_customer_info_id,       
    }
    util.request(api.GetHistoryChange,
      postData, 'POST').then(function (res) {
      if (res.data.success == true) {
        var changeList = res.data.changeList;
        that.setData({
          editHistoryList: changeList,
        })
      } else {
        that.setData({
          editHistoryList: [],
          msg: res.data.msg,
        });
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
        active: 1,
      })
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
      if (options.item) {
        let item = JSON.parse(options.item)
        that.setData({
          consultList: item,
          pre_customer_info_id: item.pre_customer_info_id,
          user_name: app.globalData.user_name,
        })
        wx.setNavigationBarTitle({
          title: '修改业务咨询'
        });
        this.Init();
      }
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

  //选择开关
  onChangeSwitch({
    detail
  }) {
    this.setData({
      ['consultList.enabled']: detail
    });
  },


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
    if (type === 'customer_source') {
      that.setData({
        DDLList: that.data.customerSourceList
      })
    }
    if (type === 'attract_investment_source') {
      that.setData({
        DDLList: that.data.attractInvestmentSourceList
      })
    }
    if (type === 'customer_category') {
      that.setData({
        DDLList: that.data.customerCategoryList
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
    if (that.data.type === 'attract_investment_source') {
      that.setData({
        ['consultList.attract_investment_source']: name,
        code_no: that.data.info.serviceSource[index].code_no
      })
    }
    if (that.data.type === 'customer_source') {
      that.setData({
        ['consultList.customer_source']: name,
      })
    }
    if (that.data.type === 'customer_category') {
      that.setData({
        ['consultList.customer_category']: name,
      })
    }
    if (that.data.type === 'service_item_category') {
      that.setData({
        ['consultList.service_item_category']: name,
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
    util.request(api.GetCondition,
      data, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        //客户来源
        var customerSourceList = res.data.info.customerSource.map(v => v.code_name);
        //招商来源
        var attractInvestmentSourceList = res.data.info.serviceSource.map(v => v.code_name);
        //客户分类
        var customerCategoryList = res.data.info.customerCategoryList.map(v => v.code_name);
        //服务项目
        var serviceitemcategoryList = res.data.info.serviceitemcategorylist.map(v => v.code_name);

        that.setData({
          info: res.data.info,
          customerSourceList: customerSourceList,
          attractInvestmentSourceList: attractInvestmentSourceList,
          customerCategoryList: customerCategoryList,
          serviceitemcategoryList: serviceitemcategoryList,
          //项目细分
          detailItemCategoryList: res.data.info.detailItemList,
          //再次细分
          moreDetailItemCategory: res.data.info.moredetailItemList,
        });
      } else {
        that.setData({
          info: [],
          customerSourceList: [],
          attractInvestmentSourceList: [],
          customerCategoryList: [],
          serviceitemcategoryList: [],
        });
      }
    });
  },
})