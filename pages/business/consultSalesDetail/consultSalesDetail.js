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
    active: 0,
    dateShow: false,
    DDLShow: false,
    info: [], //下拉框
    customerSourceList: [], //客户来源
    attractInvestmentSourceList: [], //招商来源
    customerCategoryList: [], //客户分类
    serviceitemcategoryList:[],//服务项目    
    detailItemCategoryList:[],//项目细分    
    moreDetailItemCategory:[],//再次细分
    detailItemCategoryListV2: [], //原始项目细分   
    customerSourceListV2: [], //原始客户来源
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
    pre_customer_info_id: 0,
    consultList: {}, //数据列表
    workLogList: [], //跟进记录
    contactHistoryList:[],//联系人修改历史记录
    contactList:[],//联系人信息记录
  },

  switchTab(event) {
    let that = this;
    let title = event.detail.title;
    if (title == '明细') {       
      wx.setNavigationBarTitle({
        title: '明细'
      });
    } else if (title == '联系人') { 
      that.QueryCustomerContact();
      wx.setNavigationBarTitle({
        title: '联系人'
      });
    }else if (title == '修改历史') {      
      wx.setNavigationBarTitle({
        title: '修改历史'
      });
    }else if (title == '跟进记录') {  
      that.QueryWorkLogList();    
      wx.setNavigationBarTitle({
        title: '跟进记录'
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
    let item = that.data.consultList;
    if (item.sales_id == "" || item.sales_id == null || item.sales_id == undefined) {
      Toast("销售人员为空");
      return;
    }
    if (item.customer_name == "" || item.customer_name == null || item.customer_name == undefined) {
      Toast("请输入公司名称");
      return;
    }
    if (item.contact_name == "" || item.contact_name == null || item.contact_name == undefined) {
      Toast("请输入联系人名称");
      return;
    }
    if (item.contact_phone == "" || item.contact_phone == null || item.contact_phone == undefined) {
      Toast("请输入联系人电话");
      return;
    }
    if (item.attract_investment_source == "" || item.attract_investment_source == null || item.attract_investment_source == undefined) {
      Toast("请选择招商来源");
      return;
    } else {
      if (that.data.customerSourceListV2 != undefined) {
        if (that.data.customerSourceListV2.length > 0) {
          if (item.customer_source == "" || item.customer_source == null) {
            Toast("请选择客户来源");
            return;
          }
        }
      }
    }
    if (item.customer_category == "" || item.customer_category == null || item.customer_category == undefined) {
      Toast("请选择客户分类");
      return;
    }
    if (item.service_item_category == "" || item.service_item_category == null || item.service_item_category == undefined) {
      Toast("请选择服务项目");
      return;
    } else {
      //判断服务项目
      var is_Y = "";
      var is_MY = "";
      that.data.info.serviceitemcategorylist.forEach(function (data, index) {
        if (data.code_name == item.service_item_category) {
          is_Y = data.code_desc;
        }
      });
      if (is_Y == "Y") {
        if (item.detail_item_category == "" || item.detail_item_category == null || item.detail_item_category == undefined) {
          Toast("请选择项目细分");
          return;
        } else {
          that.data.detailItemCategoryListV2.forEach(function (data, index) {
            if (data.code_name == item.detail_item_category) {
              is_MY = data.code_desc;
            }
          });
        }
      }
      if (is_MY == "Y") {
        if (item.more_detail_item_category == "" || item.more_detail_item_category == null || item.more_detail_item_category == undefined) {
          Toast("请选择再次细分");
          return;
        }
      }
      if (is_Y != "Y") {
        item.detail_item_category = "";
      }
      if (is_MY != "Y") {
        item.more_detail_item_category = "";
      }
    }
    if (item.consult_content != "" && item.consult_content != null && item.consult_content != undefined) {
      if (item.consult_content.length < 2) {
        Toast("咨询内容长度要大于2");
        return;
      }
    } else {
      Toast("请输入咨询内容");
      return;
    }
    let formData = that.data.consultList;
    wx.showLoading({
      title: '保存中...',
    })
    util.request(api.PostCustomerInfo, {
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
        //   url: '/pages/business/consultSalesList/consultSalesList'
        // })
      } else {
        Toast.fail(res.data.msg);
      }
    })
  },


  //查询跟进记录
  QueryWorkLogList: function (e) {
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
    util.request(api.GetWorkLogList,
      postData, 'POST').then(function (res) {    
      console.log(res,'res')  
      if (res.data.success == true) {         
        var workLogList = res.data.workList;
        that.setData({
          workLogList: workLogList,             
        })      
      } else {
        that.setData({
          workLogList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  //删除跟进记录
  deleteWorkLog: function(e) {
    let sales_worklog_id = e.currentTarget.dataset.sales_worklog_id
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      sales_worklog_id: sales_worklog_id,
    }    
    Dialog.confirm({
        message: '确定删除该条跟进记录吗?',
      })
      .then(() => {
        util.request(api.DeleteWorkLog,
          postData, 'POST').then(function (res) {          
          if (res.data.success == true) {
            Toast(res.data.msg);            
            that.QueryWorkLogList();
          } else {
            Toast(res.data.msg);
          }
        })
      })
      .catch(() => {
        Dialog.close();
      });

  },

  //查询业务咨询联系人
  QueryCustomerContact: function (e) {
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
    util.request(api.GetCustomerContact,
      postData, 'POST').then(function (res) {      
      if (res.data.success == true) {         
        var contactList = res.data.contactList;
        that.setData({
          contactList: contactList,             
        })      
      } else {
        that.setData({
          contactList: [],
          msg: res.data.msg,
        });
      }
    })
  },
  //删除业务咨询联系人
  deleteContact: function(e) {
    let pre_customer_contact_id = e.currentTarget.dataset.pre_customer_contact_id
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      pre_customer_contact_id: pre_customer_contact_id,
    }    
    Dialog.confirm({
        message: '确定删除该条业务咨询联系人吗?',
      })
      .then(() => {
        util.request(api.DeleteCustomerContact,
          postData, 'POST').then(function (res) {          
          if (res.data.success == true) {
            Toast(res.data.msg);            
            that.QueryCustomerContact();
          } else {
            Toast(res.data.msg);
          }
        })
      })
      .catch(() => {
        Dialog.close();
      });

  },

  //新增跟进记录
  AddWorkLog: function (e) {
    let pre_customer_info_id = this.data.pre_customer_info_id;
    wx.navigateTo({
      url: "/pages/business/workLogAdd/workLogAdd?pre_customer_info_id="+pre_customer_info_id
    });
  },
  //修改跟进记录
  EditWorkLog: function (e) {    
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/workLogAdd/workLogAdd?pre_customer_info_id="+item.pre_customer_info_id+"&item=" + JSON.stringify(item)
    });
  },
  //新增业务咨询联系人
  AddContact: function (e) {
    let pre_customer_info_id = this.data.pre_customer_info_id;
    wx.navigateTo({
      url: "/pages/business/contactAdd/contactAdd?pre_customer_info_id="+pre_customer_info_id
    });
  },
  //修改业务咨询联系人
  EditContact: function (e) {    
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/contactAdd/contactAdd?pre_customer_info_id="+item.pre_customer_info_id+"&item=" + JSON.stringify(item)
    });
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
          user_name:app.globalData.user_name,
        })
        wx.setNavigationBarTitle({
          title: '编辑业务咨询'
        });
      } else {
        wx.setNavigationBarTitle({
          title: '新增业务咨询'
        });      
        that.setData({
          user_name:app.globalData.user_name,
          consultList: {
            is_editable:'N',
            is_assigned:'W',
            enabled: true,
            pre_customer_info_id: 0,
            sales_id: app.globalData.user_id,
            sales_name: app.globalData.user_name
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

  //选择开关
  onChangeSwitch({
    detail
  }) {
    this.setData({
      ['consultList.enabled']: detail
    });
  },
  //选择日期
  onChangeDate: function (event) {
    let that = this;
    let pre_customer_info_id = that.data.consultList.pre_customer_info_id;
    if (pre_customer_info_id == 0) {
      that.setData({
        ['consultList.customer_date']: util.formatDataTime(event.detail)
      })
    }
  },
  //选择日期
  onConfirmDate() {
    let that = this
    that.setData({
      ['consultList.customer_date']: that.data.consultList.customer_date,
    })
    that.setData({
      dateShow: false
    })
  },
  //客户进入日期选择
  onSelectDate: function (e) {
    this.setData({
      dateShow: true,
    })
  },

  //关闭弹窗
  onClose: function () {
    this.setData({
      DDLShow: false, //下拉框
      dateShow: false, //日期
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
    if (type === 'detail_item_category') {
      that.setData({
        DDLList: that.data.detailItemCategoryList
      })
    }
    if (type === 'more_detail_item_category') {
      that.setData({
        DDLList: that.data.moreDetailItemCategory
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
        code_no: that.data.info.serviceSource[index].code_no,
      })
      that.GetChangeSource(that.data.consultList.attract_investment_source);
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
      let code_id = that.data.info.serviceitemcategorylist[index].code_id;
      that.GetDetailItem(code_id);
    }
    if (that.data.type === 'detail_item_category') {
      that.setData({
        ['consultList.detail_item_category']: name,
      })
      let code_id = that.data.detailItemCategoryListV2[index].code_id;
      that.GetMoreDetailItem(code_id);
    }
    if (that.data.type === 'more_detail_item_category') {
      that.setData({
        ['consultList.more_detail_item_category']: name,
      })
    }
    that.setData({
      DDLShow: false,
    })
  },
  //招商来源选择事件 : 客户来源下拉框
  GetChangeSource: function (code_name) {
    var that = this;
    let user_id = app.globalData.user_id;
    var data = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: user_id,
      user_name: app.globalData.user_name,
      code_name: code_name,
    }
    //下拉框
    util.request(api.GetChangeSource,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        //客户来源
        var customerSourceList = res.data.info.map(v => v.code_name);
        that.setData({
          customerSourceList: customerSourceList,
          customerSourceListV2: res.data.info,
        });
      } else {
        that.setData({
          customerSourceList: [],
          customerSourceListV2: [],
        });
      }
    });
  },
  //服务项目选择事件：注册项目细分下拉框
  GetDetailItem: function (code_id) {
    var that = this;
    let user_id = app.globalData.user_id;
    var data = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: user_id,
      user_name: app.globalData.user_name,
      code_id: code_id,
    }
    //下拉框
    util.request(api.GetDetailItem,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        //项目细分
        var detailItemCategoryList = res.data.info.map(v => v.code_name);
        that.setData({
          detailItemCategoryList: detailItemCategoryList,
          detailItemCategoryListV2: res.data.info,
        });
      } else {
        that.setData({
          detailItemCategoryList: [],
          detailItemCategoryListV2: [],
        });
      }
    });
  },
  //服务项目细分选择事件：注册项目再次细分下拉框
  GetMoreDetailItem: function (code_id) {
    var that = this;
    let user_id = app.globalData.user_id;
    var data = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: user_id,
      user_name: app.globalData.user_name,
      code_id: code_id,
    }
    //下拉框
    util.request(api.GetMoreDetailItem,
      data, 'POST').then(function (res) {
      if (res.data.success == true) {
        //再次细分
        var moreDetailItemCategory = res.data.info.map(v => v.code_name);
        that.setData({
          moreDetailItemCategory: moreDetailItemCategory,
        });
      } else {
        that.setData({
          moreDetailItemCategory: [],
        });
      }
    });
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
        var customerSourceList = []; //res.data.info.customerSource.map(v => v.code_name);
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
          serviceitemcategoryList:serviceitemcategoryList,
          //项目细分
          //detailItemCategoryList:res.data.info.detailItemList,
          //再次细分
          //moreDetailItemCategory:res.data.info.moredetailItemList,
        });
      } else {
        that.setData({
          info: [],
          customerSourceList: [],
          attractInvestmentSourceList: [],
          customerCategoryList: [],
          serviceitemcategoryList:[],
        });
      }
    });
  },
})