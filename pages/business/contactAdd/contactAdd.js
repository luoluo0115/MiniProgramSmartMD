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
    sexList: [], //性别          
    pre_customer_contact_id: 0,    
    contactList: {}, //数据列表
  },

  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldname
    let newValue = e.detail;
    let field = 'contactList.' + fieldname;
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
    let item = that.data.contactList;
    if (item.name == "" || item.name == null || item.name == undefined) {
      Toast("请输入姓名");
      return;
    }
    if (item.mp == "" || item.mp == null || item.mp == undefined) {
      Toast("请输入手机");
      return;
    }
    if (item.sex == "" || item.sex == null || item.sex == undefined) {
      Toast("请输入性别");
      return;
    }     
    let formData = that.data.contactList;
    wx.showLoading({
      title: '保存中...',
    })
    util.request(api.PostCustomerCntact, {
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
        active: 1,
      });
      prevPage.QueryCustomerContact();      
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
          contactList: item,
          pre_customer_contact_id: item.pre_customer_contact_id,
        })
        wx.setNavigationBarTitle({
          title: '编辑业务咨询联系人'
        });
      } else {
        wx.setNavigationBarTitle({
          title: '新增业务咨询联系人'
        });      
        that.setData({
          contactList: {             
            pre_customer_contact_id:0,
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
    if (type === 'sex') {
      that.setData({
        DDLList: that.data.sexList
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
    if (that.data.type === 'sex') {
      that.setData({
        ['contactList.sex']: name,        
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
        //性别
        var sexList = res.data.info.sexList.map(v => v.code_name);         
        
        that.setData({
          info: res.data.info,
          sexList: sexList,                      
        });
      } else {
        that.setData({
          info: [],
          sexList: [],           
        });
      }
    });
  },
})