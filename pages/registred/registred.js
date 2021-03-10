// pages/registred/registred.js
var app = getApp()
var that;
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
import Toast from '../../vant-weapp/dist/toast/toast';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isClick: false, //获取验证码按钮，默认允许点击
        name: '', //用户名
        phone: '', //手机号
        code: '', //验证码
        res: 0, //获取验证返回信息
        btntext: '获取验证码',
        sh: false,
        content: '',
    },
    onLoad: function () {},
    onClose: function () {
        this.setData({
            sh: false
        })
    },
    goTo: function () {
        //收到验证码后，提交

        //判断验证码是否正确
        //提示
        if (this.data.phone == '' || this.data.phone == null) {
            const text = second => `请输入手机号`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else if (this.data.code == '' || this.data.code == null) {
            const text = second => `请输入验证码`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else if (this.data.res == 0) {
            const text = second => `请先获取验证码`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else if (this.data.code != this.data.res) {
            const text = second => `输入验证码不正确`;
            const toast = Toast({
                message: text(3)
            });
            return;
        };
        //提交
        util.request(api.RegisterUrl, {
            openid: app.globalData.openid,
            user_name: this.data.name,
            mobile_phone: this.data.phone,
            code: this.data.res
        }, 'POST', true).then(function (res) {
            if (res.data.success == true) {
                console.log(res, '注册成功');
                app.globalData.openid = res.data.openid;
                app.globalData.sessKey = res.data.session_key;
                app.globalData.user_id = res.data.user_id;
                app.globalData.user_name = res.data.user_name;
                app.globalData.emp_no = res.data.emp_no;
                app.globalData.user_category = res.data.user_category;
                app.globalData.UInfo = res.data.userInfo;
                wx.setStorageSync("openid", res.data.openid);
                wx.setStorageSync("user_id", res.data.user_id);
                wx.setStorageSync("user_name", res.data.user_id);
                wx.setStorageSync("emp_no", res.data.emp_no);
                wx.setStorageSync("user_category", res.data.user_category);
                wx.setStorageSync("Uinfo", res.data.userInfo);
                //挑到主页面        
                wx.reLaunch({
                    url: '/pages/index/index'
                });
            } else {
                const text = second => res.data.msg;
                const toast = Toast({
                    message: text(3)
                });
            }
        });
    },
    nameInput: function (e) {
        //获取输入用户名
        this.setData({
            name: e.detail
        })
    },
    phoneInput: function (e) {
        //获取输入手机号
        this.setData({
            phone: e.detail
        })
    },
    codeInput: function (e) {
        //获取输入验证码
        this.setData({
            code: e.detail
        })
    },
    getCode: function () {
        that = this;
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}|(19[0-9]{1})))+\d{8})$/;
        //提示
        if (that.data.phone == '' || that.data.phone == null) {
            const text = second => `请输入手机号`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else if (that.data.phone.length < 11) {
            const text = second => `输入手机号长度有误`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else if (!myreg.test(that.data.phone)) {
            const text = second => `输入手机号有误`;
            const toast = Toast({
                message: text(3)
            });
            return;
        } else {
            //获取验证码
            var _this = this
            var coden = 60 // 定义60秒的倒计时
            _this.setData({ // _this这里的作用域不同了
                btntext: '60后重新发送',
                isClick: true,
            })
            var codeV = setInterval(function () {
                _this.setData({ // _this这里的作用域不同了
                    btntext: '重新获取(' + (--coden) + 's)',
                })
                if (coden == -1) { // 清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
                    clearInterval(codeV)
                    _this.setData({
                        btntext: '获取验证码',
                        isClick: false
                    })
                }
            }, 1000) //  1000是1秒
            //获取验证码
            util.request(api.VerificationCodeUrl, {
                openid: app.globalData.openid,
                mobile_phone: this.data.phone,
            }, 'POST', true).then(function (res) {
                //获取验证码成功
                that.setData({
                    res: res.data.code
                })


            })
        }
    }
});