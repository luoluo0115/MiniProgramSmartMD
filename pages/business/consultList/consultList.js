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
    page_index: 1,
    page_size: '20',
    maxCount: 1, //总页数    
    hasMoreData: true, //是否还有更多数据;
    msg:"",
    salesList: [],
    date_start: '',
    date_end: '',
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    customerSourceList :'',//客户来源    
    customerStatusList : '',//客户状态    
    serviceitemcategoryList:'',//服务项目
    activeFiler:false,//筛选显示隐藏
    contact_phone:'',
    customer_name:'',
    sales_name:'',
    customer_source:'',
    service_item_category:'',
    customer_status:'',
    checkedEnabled: 'ALL',//是否有效
    checkedAssigned: 'ALL',//是否分配
    isEnabledList:[{
      value:'ALL',
      title:'全部'
    },{
      value:'Y',
      title:'有效'
    },{
      value:'N',
      title:'无效'
    }],
    isAssignedList:[{
      value:'ALL',
      title:'全部'
    },{
      value:'Y',
      title:'已分配'
    },{
      value:'N',
      title:'未分配'
    }]
  },

  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldname
    let newValue = e.detail;
    let field = fieldname;
    that.setData({
      [field]: newValue,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (!util.checkOpenId()) {
      that.setData({
        isHidden: false
      })
    } else {
      that.getData("正在加载数据...");
      that.Init();
    }
  },
  getData: function (message) {
    wx.showLoading({
      title: message,
    })
    Promise.all([this.QueryCustomerInfoCluesList()]).then(res => {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  //查询咨询线索
  QueryCustomerInfoCluesList: function (e) {
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let emp_no = app.globalData.emp_no;
    let postData = {
      openid: app.globalData.openid,
      emp_no: emp_no,
      user_id: user_id,
      user_name: user_name,
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      customer_date_start: that.data.date_start,
      customer_date_end: that.data.date_end,
      customer_source:that.data.customer_source,
      service_item_category:that.data.service_item_category,
      enabled:that.data.checkedEnabled,
      sales_name:that.data.sales_name,
      customer_name:that.data.customer_name,
      contact_phone:that.data.contact_phone,
      customer_status:that.data.customer_status,
      is_assigned:that.data.checkedAssigned,
    }    
    util.request(api.QueryCustomerInfoCluesList,
      postData, 'POST').then(function (res) {      
      var saleslistTem = that.data.salesList;
      console.log(res,'res')
      if (res.data.success == true) {
        if (that.data.page_index == 1) {
          saleslistTem = []
        }
        var salesList = res.data.salesList;
        if (that.data.page_index >= res.data.maxCount) {          
          that.setData({
            salesList: saleslistTem.concat(salesList),
            hasMoreData: false,
          });
        } else {          
          that.setData({
            salesList: saleslistTem.concat(salesList),
            hasMoreData: true,
            page_index: that.data.page_index + 1
          })          
        }
      } else {
        that.setData({
          salesList: [],
          msg: res.data.msg,
        });
      }
    })
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
        date_start: that.data.selectedTime
      })
    } else {
      that.setData({
        date_end: that.data.selectedTime
      })
    }
    that.setData({
      timeshow: false
    })
    that.getData("正在加载数据...");
  },
  onClose: function () {
    this.setData({
      timeshow: false,
      DDLShow:false,
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
    if (type === 'service_item_category') {
      that.setData({
        DDLList: that.data.serviceitemcategoryList
      })
    }
    if (type === 'customer_status') {
      that.setData({
        DDLList: that.data.customerStatusList
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
    if (that.data.type === 'customer_source') {
      that.setData({
        customer_source: name,
      })
    }
    if (that.data.type === 'service_item_category') {
      that.setData({
        service_item_category: name,
      })
    }
    if (that.data.type === 'customer_status') {
      that.setData({
        customer_status: name,
      })
    }
    that.setData({
      DDLShow: false,
    })
  },

   
  // 分配咨询线索  
  assign: function(e) {
    let pre_customer_info_id = e.currentTarget.dataset.pre_customer_info_id
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      emp_no: app.globalData.emp_no,
      user_id: app.globalData.user_id,
      user_name: app.globalData.user_name,
      pre_customer_info_id: pre_customer_info_id,
    }    
    Dialog.confirm({
        message: '确定分配该线索吗?',
      })
      .then(() => {
        util.request(api.EditCustomerAllAssign,
          postData, 'POST').then(function (res) {          
          if (res.data.success == true) {
            Toast(res.data.msg);
            that.data.page_index = 1;
            that.QueryCustomerInfoCluesList();
          } else {
            Toast(res.data.msg);
          }
        })
      })
      .catch(() => {
        Dialog.close();
      });

  },
  //新增咨询
  Add: function (e) {
    wx.navigateTo({
      url: "/pages/business/consultAdd/consultAdd"
    });
  },
  //修改咨询
  Edit: function (e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/consultAdd/consultAdd?item=" + JSON.stringify(item)
    });
  },
  //咨询详情
  Detail: function (e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/business/consultDetail/consultDetail?item=" + JSON.stringify(item)
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
  //显示登陆弹窗
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
    })
    this.onShow();
  },
  //是否有效
  selectedEnabled:function(e) {    
    this.setData({ checkedEnabled: e.currentTarget.dataset.title });
  },
  //是否分配
  selectedAssigned:function(e) {    
    this.setData({ checkedAssigned: e.currentTarget.dataset.title });
  },
  //筛选点击
  onClickSelectShow:function(){
    let that= this;
    if(that.data.selectShow==true){
      that.setData({
        selectShow:false,
        activeFiler:false
      })
    }else{
      that.setData({
        selectShow:true,
        activeFiler:true
      })
    }   
  },
  confirmSearch: function () {
    let that = this;     
    that.getData("正在加载数据...");
    that.setData({
      selectShow:false,
      activeFiler:false,
    })
  },
  confirmCancel: function () {
    let that = this;
    that.setData({
      contact_phone:'',
      customer_name:'',
      sales_name:'',
      customer_source:'',
      service_item_category:'',
      customer_status:'',
      checkedEnabled: 'ALL',//是否有效
      checkedAssigned: 'ALL',//是否分配
      selectShow:false,
      activeFiler:false
    });
    that.getData("正在加载数据...");  
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
        //客户状态
        var customerStatusList = res.data.info.customerStatus.map(v => v.code_name);
        //服务项目
        var serviceitemcategoryList = res.data.info.serviceitemcategorylist.map(v => v.code_name);        
        that.setData({
          info: res.data.info,
          customerSourceList: customerSourceList,
          customerStatusList: customerStatusList,          
          serviceitemcategoryList:serviceitemcategoryList,          
        });
      } else {
        that.setData({
          info: [],
          customerSourceList: [],
          customerStatusList: [],          
          serviceitemcategoryList:[],
        });
      }
    });
  },
})