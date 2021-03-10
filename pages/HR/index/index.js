//index.js
//获取应用实例
const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
Page({

  data: {
    motto: '欢迎来到企汇大管家',
    userInfo: app.globalData.userInfo,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loginBg: api.ImgUrl + 'A003',         
    isHidden: true, //是否隐藏登录弹窗
    headerUrl:api.ImgUrl + 'Q001',
    menuList:'',//用户菜单数据
    messageList:[]
  },
  //父组件接收子组件传值
  compontpass:function(e){
    var modal=e.detail.val;    
    var isHidden=e.detail.isHidden;    
    if(isHidden==false){
      this.setData({
        isHidden:false
      })
    }
    wx.setStorageSync('modal', modal)
  },
  onLoad: function (options) {   
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else { 
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow() {
    if(!util.checkOpenId()){
      this.setData({
        isHidden:false
      })      
    }
    this.QueryMenuHome();
    this.QueryNewMessage();
  },
  goExtraWork:function(e){    
    wx.navigateTo({
      url: "/pages/HR/OverTime/OverTime",
    });
  },
  goOffDuty:function(){
    wx.navigateTo({
      url: "/pages/HR/OffDuty/OffDuty",
    });
  },
  goEmpDailyCard:function(){
    wx.navigateTo({
      url: "/pages/HR/empDailyCard/empDailyCard",
    });
  },
  goCardLog:function(){
    wx.navigateTo({
      url: "/pages/HR/PublicitySign/PublicitySign",
    });
  },
  goAutoWork:function(){
    wx.navigateTo({
      url: "/pages/HR/AutoWork/AutoWork",
    });
  },
  goMySignBill:function(){
    wx.navigateTo({
      url: "/pages/WF/MySignBill/MySignBill",
    });
  },
  goConsultList:function(){
    wx.navigateTo({
      url: "/pages/business/consultList/consultList",
    });
  },
  goConsultSalesList:function(){
    wx.navigateTo({
      url: "/pages/business/consultSalesList/consultSalesList",
    });
  },
  goConsultRec:function(){
    wx.navigateTo({
      url: "/pages/business/consultReceive/consultReceive",      
    });
  },
  goPageUrl:function(e){
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url,      
    });
  },

  /**
   * 获取用户菜单
   */
  QueryMenuHome: function (e) {
    let that = this;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;    
    util.request(api.QueryMenuHomeUrl, {
      openid: app.globalData.openid,
      user_id: user_id,       
    }, 'POST').then(function (res) {
      if (res.data.success == true) {        
        let data = res.data;
        that.setData({
          menuList: data.menuList,
        });        
      } else {
        that.setData({
          menuList: [],
        });
      }
    })
  },
  //首页消息轮播
  QueryNewMessage: function(e) {
    let that= this;
    util.request(api.QueryNewMessageUrl,//首页消息轮播
      { openid:app.globalData.openid,user_id:app.globalData.user_id}
      ,'POST').then(function(res){
        console.log(res,'消息')
        if(res.data.success==true){
          that.setData({
            messageList:res.data.messageList,
            msg:res.data.msg
          });
          
        }else{
          that.setData({
            messageList:[],
            msg:res.data.msg
          });
        }
    })
  },
  
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
    })     
    this.onShow();
	},
})