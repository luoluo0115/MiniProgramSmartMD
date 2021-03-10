const FileOssUrl ="https://testms.jiqiao.tech/FileDown/DownFileOSSByType?guid="
const ImgUrl="https://testms.jiqiao.tech/FileDown/GetSharedImageQJZ?image_code="
//const Url="https://qhms.51dljz.com"
const Url="https://testqhms.51dljz.com"
//const Url="http://192.168.1.215:5102"
const Url2="http://localhost:7202/api"


module.exports={
    rootUrl:Url,
    FileOssUrl:FileOssUrl,
    ImgUrl:ImgUrl,
    TokenUrl: Url + "/QHCommonToken/GetQHCommonTokenListSmartMD?appid=qhsmartapi&md5key=",//获取Access_token的地址
    UserUrl:Url+"/MiniProgramSmartMD/CheckWeChatCode",//验证用户是否存在记录
    RegisterUrl:Url+"/MiniProgramSmartMD/Register",//注册手机号
    QueryUserEmpInfoUrl:Url+"/MiniProgramSmartMD/QueryUserEmpInfo",//查询注册的用户信息
    VerificationCodeUrl:Url+"/MiniProgramSmartMD/VerificationCode",//获取验证码 
    QueryGetHrOverTimeListUrl:Url+"/HRSmartMD/QueryGetHrOverTimeList",//查询加班申请数据列表
    DeleteOverTimeByIdUrl:Url+"/HRSmartMD/DeleteOverTimeById",//删除加班申请记录
    PostOverTimeAddUrl:Url+"/HRSmartMD/PostOverTimeAdd",//新增加班申请记录
    PostOverTimeSubmitApprovalByIdUrl:Url+"/HRSmartMD/PostOverTimeSubmitApprovalById",//加班申请记录提交签核
    PostOverTimeCancelSignedByIdUrl:Url+"/HRSmartMD/PostOverTimeCancelSignedById",//加班申请记录取消签核
    GetDutyListUrl:Url+"/HRSmartMD/GetDutyList",//获取请假开始结束时间
    GetPlanHoursUrl:Url+"/HRSmartMD/GetPlanHours",//获取请假时数
    GetOffDutyConditionUrl:Url+"/HRSmartMD/GetOffDutyCondition",//获取请假使用参数列表
    QueryGetHrOffDutyListUrl:Url+"/HRSmartMD/QueryGetHrOffDutyList",//查询请假申请数据列表
    DeleteOffDutyByIdUrl:Url+"/HRSmartMD/DeleteOffDutyById",//删除请假申请记录
    PostOffDutyAddUrl:Url+"/HRSmartMD/PostOffDutyAdd",//新增请假申请记录
    PostOffDutyCancelSignedByIdUrl:Url+"/HRSmartMD/PostOffDutyCancelSignedById",//取消签核 （请假申请记录）
    PostOffDutySubmitApprovalByIdUrl:Url+"/HRSmartMD/PostOffDutySubmitApprovalById",//提交签核 (请假申请记录)
    QueryGetHrEmpDailyCardListUrl:Url+"/HRSmartMD/QueryGetHrEmpDailyCardList",//获取个人考勤记录
    QueryCardLogListUrl:Url+"/HRSmartMD/QueryGetHrCardLogList",//获取个人打卡记录    
    PostHrCardLogAddUrl:Url+"/HRSmartMD/PostHrCardLogAdd",//个人考勤签到
    QueryGetHrPublicitySignListUrl:Url+"/HRSmartMD/QueryGetHrPublicitySignList",//查询公出签到数据列表
    PostHrPublicitySignAddUrl:Url+"/HRSmartMD/PostHrPublicitySignAdd",//新增公出签到记录
    GetLocation:Url+"/HRSmartMD/GetLocation",//根据微信坐标获取地理位置
    QueryMySignBillUrl:Url+"/WFSmartMD/QueryMySignBill",//获取我的签核单据
    QuerySingleSignBillUrl:Url+"/WFSmartMD/QuerySingleSignBill",//根据签核单据获取签核人员和签核信息
    PostSignBillApproveUrl:Url+"/WFSmartMD/PostSignBillApprove",//签核同意
    PostSignBillRejectUrl:Url+"/WFSmartMD/PostSignBillReject",//签核拒绝

    QueryMenuHomeUrl:Url+"/MiniProgramSmartMD/QueryMenuData",//获取用户菜单 
    QueryCustomerInfoByIDUrl:Url+"/SalesSmartMD/QueryCustomerInfoByID",//业务咨询线索接收查询
    PostSalesAcceptedY:Url+"/SalesSmartMD/EditSalesAcceptedY",//业务咨询线索接受
    GetCondition:Url+"/SalesSmartMD/GetCondition",//获取咨询录入条件（1）
    GetConditionService:Url+"/SalesSmartMD/GetConditionService",//获取咨询录入条件（2）
    GetChangeSource:Url+"/SalesSmartMD/GetChangeSource",//招商来源选择事件 : 客户来源下拉框
    GetDetailItem:Url+"/SalesSmartMD/GetDetailItem",//服务项目选择事件：注册项目细分下拉框 
    GetMoreDetailItem:Url+"/SalesSmartMD/GetMoreDetailItem",//服务项目细分选择事件：注册项目再次细分下拉框    
    QueryCustomerInfoCluesList:Url+"/SalesSmartMD/QueryCustomerInfoCluesList",//咨询线索查询    
    QueryCustomerInfoSalesList:Url+"/SalesSmartMD/QueryCustomerInfoSalesList",//业务咨询客户查询
    EditCustomerAllAssign:Url+"/SalesSmartMD/EditCustomerAllAssign",//业务咨询线索分配    
    PostCustomerInfo:Url+"/SalesSmartMD/PostCustomerInfo",//业务咨询记录保存
    PostWorklog:Url+"/SalesSmartMD/PostWorklog",//保存业务跟进记录
    DeleteWorkLog:Url+"/SalesSmartMD/DeleteWorkLog",//删除跟进记录
    GetWorkLogList:Url+"/SalesSmartMD/GetWorkLogList",//查询跟进记录    
    PostCustomerCntact:Url+"/SalesSmartMD/PostCustomerCntact",//保存业务业务客户联系人
    DeleteCustomerContact:Url+"/SalesSmartMD/DeleteCustomerContact",//删除业务联系人记录
    GetCustomerContact:Url+"/SalesSmartMD/GetCustomerContact",//查询业务联系人记录
    PostCustomerChangeAdd:Url+"/SalesSmartMD/PostCustomerChangeAdd",//业务咨询客户修改提交签核    
    GetHistoryChange:Url+"/SalesSmartMD/GetHistoryChange",//业务咨询客户信息修改记录    

    GetMessageCountUrl: Url + '/MiniProgramSmartMD/GetMessageCount', //获取消息个数
    QueryNewMessageUrl: Url + '/MiniProgramSmartMD/QueryNewMessage', //获取消息列表
    PostReadMessageByIdUrl: Url + '/MiniProgramSmartMD/PostReadMessageById', //阅读人id
}