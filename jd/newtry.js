/*
 * 由ZCY01二次修改：脚本默认不运行
 * 由 X1a0He 修复：依然保持脚本默认不运行
 * 如需运行请自行添加环境变量：JD_TRY，值填 true 即可运行
 * 脚本兼容: Node.js
 * X1a0He留
 * 由于没有兼容Qx，原脚本已失效，建议原脚本的兼容Qx注释删了
 * 脚本是否耗时只看args_xh.maxLength的大小
 * 上一作者说了每天最多300个商店，总上限为500个，jd_unsubscribe.js我已更新为批量取关版
 * 请提前取关至少250个商店确保京东试用脚本正常运行
 *
 * @Address: https://github.com/X1a0He/jd_scripts_fixed/blob/main/jd_try_xh.js
 * @LastEditTime: 2021-09-06 16:54:00
 * @LastEditors: X1a0He
 */
const $ = new Env('京东试用')
const URL = 'https://api.m.jd.com/client.action'
let trialActivityIdList = []
let trialActivityTitleList = []
let notifyMsg = ''
let size = 1;
$.isPush = true;
$.isLimit = false;
//下面很重要，遇到问题请把下面注释看一遍再来问
let args_xh = {
    /*
     * 商品原价，低于这个价格都不会试用，意思是
     * A商品原价49元，试用价1元，如果下面设置为50，那么A商品不会被加入到待提交的试用组
     * B商品原价99元，试用价0元，如果下面设置为50，那么B商品将会被加入到待提交的试用组
     * 默认为0
     * */
    jdPrice: process.env.JD_TRY_PRICE * 1 || 256,
    /*
     * 获取试用商品类型，默认为1，原来不是数组形式，我以为就只有几个tab，结果后面还有我服了
     * 1 - 精选
     * 2 - 闪电试
     * 3 - 家用电器(可能会有变化)
     * 4 - 手机数码(可能会有变化)
     * 5 - 电脑办公(可能会有变化)
     * ...
     * 下面有一个function是可以获取所有tabId的，名为try_tabList
     * 2021-09-06 12:32:00时获取到 tabId 16个
     * 可设置环境变量：JD_TRY_TABID，用@进行分隔
     * 默认为 1 到 5
     * */
    tabId: process.env.JD_TRY_TABID && process.env.JD_TRY_TABID.split('@').map(Number) || [1, 2, 3, 4, 5],
    /*
     * 试用商品标题过滤，黑名单，当标题存在关键词时，则不加入试用组
     * 可设置环境变量：JD_TRY_TITLEFILTERS，关键词与关键词之间用@分隔
     * */
    titleFilters: process.env.JD_TRY_TITLEFILTERS && process.env.JD_TRY_TITLEFILTERS.split('@') || ["配方奶粉@游戏@戒指@防静电喷雾@燮乐@VDU@植幕@钥匙扣@钥匙挂件@纪念币@Almisan@亿凌@希睿达@黄芪片@豪至尊@COOGI@耳环@QIPUSEN@HAZE@蔻罗娜@汉服@戈美其@欧利时@Timexcel@氧芬磁解@防蚊纱窗@水箱网@木铲@SYGUNY@燃力士@海瑟薇氨基酸@奢迪卡@翡拉拉@窗帘定制@天伊@阿胶@单拍不发@鹊医世家@智灵通@嘉媚乐@肌肤未来@豌豆蛋白粉@无糖蛋白粉@魔贴世家@手机支架@肤乐霜@翡翠吊坠@法妮莎@水梦丽@红糖姜茶@果粉茶@loveskindiy@法卡曼@翰宇@异舒吉@勃起@蝶印牌@友肌@软骨胶@花花公子@军博仕@成人情趣@护发素@陶瓷茶杯@平安扣@女孩玩具@护腰带@儿童补钙@衣物浆挺@霍山铁皮@尿不湿@花迷植物@婴幼儿辅食@益生菌@褪黑素@性感内裤@棒球帽@鸭舌帽@纸尿裤@鼠标垫@奶粉@音频线@短袜@农用喷雾器@氨基酸洁面@防晒袖套@叶开泰@圣哺乐@贵妇膏@护发精油@伤口护理软膏@拉拉裤@床垫定做@兽用打针器@调制乳粉@伊贝诗@床垫定制@长高奶粉@项链@手链@益生菌固体饮料@云南旅游@皮带@跟团游@丽江@大理@课@手术@指甲刀@跟团旅游@一对一@1对1@外教@炒股@资源@万门@小班@优惠券@学习@辅导@你拍@眼科@视频@咨询@日租卡@腾讯大王@指南@服务@痔疮@两片@体验@软件@系统@时时彩@1粒@1颗@一粒@一颗@单片@1片@止泻药@股票@教学@方案@计划@中国移动@中国联通@中国电信@大王卡@上网卡@流量卡@电话卡@手机卡@米粉卡@会员卡@验孕@早早孕@二维码@口语@教程@三好网@数学@语文@化学@物理@试学@脚气@鸡眼@勿拍@在线@英语@俄语@佑天兰@癣@灰指甲@远程@评估@手册@家政@妊娠@编程@足贴@装修@小靓美@入门@熟练@延时喷剂@延时喷雾@印度神油@延时凝胶@自慰器@灵芝@戒烟@扣头@震动棒@体验卡@皮带扣头@程序开发@北海@卷尺@假阳具@种子@档案袋@老太太@私处@孕妇@卫生条@培训@阴道@生殖器@肛门@狐臭@鱼饵@钓鱼@童装@吊带@黑丝@钢圈@网课@网校@电商@钢化膜@网络课程@美少女@四级@六级@四六级@在线网络@阴道炎@宫颈@糜烂@打底裤@手机膜@鱼@狗@软件定制@课程@后膜@保护贴@背贴@后贴膜@前膜@叛逆@幼儿教育@青春期@胎教@早教@视频教程@软件安装@党建@上门服务@上门家居修缮@牙齿矫正@牙齿取模@基因检测@看房@青少年家庭@医院同款抗HP@陪练@精品课@在线培训@试听课程@智能学习App@试听课@入门到精通@项目实战@开发实战@体验课@系统编程@题库@HPV@一片@特福@hpv@清粉软件@热敏收银纸@购房抵用券@购房@男士营养液@甲状腺@淋巴结@男性保健品@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@八宝茶@壮阳@延时@腱鞘炎@震珠套@艾草贴@艾灸贴@减肥贴@瘦身贴@艾灸@房事快感@玉石@和田玉@青少年家庭@去鸡皮@阴茎@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@吉仁堂@艾条@吉仁堂@艾叶@人参压片糖@海苔@0.5kg@东北米@杨家方@HIV@hiv@血液检测@石英岩玉@结肠癌@汉苑良方@磁石能量@蓉立方@保健内裤@高通量蛋白检测@检测试纸@马上修@提高男功能按摩加强@玛瑙@图纸@表带@汤臣倍健@三宝茶@按摩精油@数据线@丰胸@派样装@旅游签证@面部吸脂@癌症@基因筛查@亮益@豆妃@乐家老铺@锁精@狼牙棒@短袖@T恤@前列腺@健乳@丰胸@人参牡蛎@蚕蛹@BBV@面膜@催奶下奶@五宝@避孕套@鹿鞭@压片糖@梦君@睡眠喷雾@艺星@倍碧唯@芙清@休闲裤@燕窝@毛巾@吉米@润舒草@减肥茶@高丽参@减肥咖啡@集成吊顶扣板@胸部护理@丰乳@纹绣色@迪后@法寇@MZMZ@胶囊@游派@牡蛎@小剪刀@文玩@佳雪@飞机杯@爱优奇@女用高潮@铝扣板@法莎尼亚@法蔻@纪诗哲@骆骐亚@杜莎菲尼@成品窗帘布@牡蛎片@壁纸@泰国佛牌@澳特力@翡舞@龟头@劳拉图@轻奢品牌@4ml@赠品勿下单@菲洛嘉@防脱@芊肌源@希颂@复古道袍@洁面乳@荟名门@洗发露@近视眼镜@睾丸@抱枕@手机壳@卓尼莎@英伦保罗@剪刀@驱虫喷剂@假发@澳特力@车载U盘@石膏线@数字音频线@美尔凯特@磁吸轨道@猫粮@晴文@玉镯子", "教程", "英语", "辅导", "培训", "孩子", "小学"],
    /*
     * 试用价格(中了要花多少钱)，高于这个价格都不会试用，小于等于才会试用，意思就是
     * A商品原价49元，现在试用价1元，如果下面设置为10，那A商品将会被添加到待提交试用组，因为1 < 10
     * B商品原价49元，现在试用价2元，如果下面设置为1，那B商品将不会被添加到待提交试用组，因为2 > 1
     * C商品原价49元，现在试用价1元，如果下面设置为1，那C商品也会被添加到带提交试用组，因为1 = 1
     * 可设置环境变量：JD_TRY_TRIALPRICE，默认为0
     * */
    trialPrice: process.env.JD_TRY_TRIALPRICE * 1 || 999,
    /*
     * 最小提供数量，例如试用商品只提供2份试用资格，当前设置为1，则会进行申请
     * 若只提供5分试用资格，当前设置为10，则不会申请
     * 可设置环境变量：JD_TRY_MINSUPPLYNUM
     * */
    minSupplyNum: process.env.JD_TRY_MINSUPPLYNUM * 1 || 1,
    /*
     * 过滤大于设定值的已申请人数，例如下面设置的1000，A商品已经有1001人申请了，则A商品不会进行申请，会被跳过
     * 可设置环境变量：JD_TRY_APPLYNUMFILTER
     * */
    applyNumFilter: process.env.JD_TRY_APPLYNUMFILTER * 1 || 100000,
    /*
     * 商品试用之间和获取商品之间的间隔, 单位：毫秒(1秒=1000毫秒)
     * 可设置环境变量：JD_TRY_APPLYINTERVAL
     * 默认为3000，也就是3秒
     * */
    applyInterval: process.env.JD_TRY_APPLYINTERVAL * 1 || 5000,
    /*
     * 商品数组的最大长度，通俗来说就是即将申请的商品队列长度
     * 例如设置为20，当第一次获取后获得12件，过滤后剩下5件，将会进行第二次获取，过滤后加上第一次剩余件数
     * 例如是18件，将会进行第三次获取，直到过滤完毕后为20件才会停止，不建议设置太大
     * 可设置环境变量：JD_TRY_MAXLENGTH
     * */
    maxLength: process.env.JD_TRY_MAXLENGTH * 1 || 10,
    /*
     * 过滤种草官类试用，某些试用商品是专属官专属，考虑到部分账号不是种草官账号
     * 例如A商品是种草官专属试用商品，下面设置为true，而你又不是种草官账号，那A商品将不会被添加到待提交试用组
     * 例如B商品是种草官专属试用商品，下面设置为false，而你是种草官账号，那A商品将会被添加到待提交试用组
     * 例如B商品是种草官专属试用商品，下面设置为true，即使你是种草官账号，A商品也不会被添加到待提交试用组
     * 可设置环境变量：JD_TRY_PASSZC，默认为true
     * */
    passZhongCao: process.env.JD_TRY_PASSZC || false,
    /*
     * 是否打印输出到日志，考虑到如果试用组长度过大，例如100以上，如果每个商品检测都打印一遍，日志长度会非常长
     * 打印的优点：清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
     * 打印的缺点：会使日志变得很长
     *
     * 不打印的优点：简短日志长度
     * 不打印的缺点：无法清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
     * 可设置环境变量：JD_TRY_PLOG，默认为true
     * */
    printLog: process.env.JD_TRY_PLOG || true,
    /*
     * 白名单
     * 可通过环境变量控制：JD_TRY_WHITELIST，默认为false
     * */
    whiteList: process.env.JD_TRY_WHITELIST || true,
    /*
     * 白名单关键词，当标题存在关键词时，加入到试用组
     * 可通过环境变量控制：JD_TRY_WHITELIST，用@分隔
     * */
    whiteListKeywords: process.env.JD_TRY_WHITELIST && process.env.JD_TRY_WHITELIST.split('@') || ["显示屏","剃须刀","飞科","多功能料理机","电热水器","天玑","阅读器","矫姿座椅","YOTIME","悠享时","倩碧","落地灯","台灯","SK-II","雅诗兰黛","英睿达","内存条","显卡","路由器","雅诗兰黛","监控器","摄像机","九阳","凉霸","每日坚果","三只松鼠","麦克风","格力","科大讯飞","良品铺子","松下","威力","松下","苏泊尔","海尔","方太","美的","国窖1573","电热水壶","耳机","高清摄像头","电池炉","不粘锅","电压力锅","电饭煲","电饭锅","五粮液","泸州老窖","咖啡机","西部数据","华为手环","小米手环","平板电脑","青岛啤酒","燕京啤酒","洗衣机","电风扇","苏泊尔","九阳","液晶智能电视","吸尘器","吹风机","破壁机","豆浆机","机械硬盘","高色域","机械硬盘","骁龙","固态硬盘","葡萄酒","空调","65英寸","全面屏","超清影像","超级快充","点读机","激光脱毛器","蓝牙耳机","机械键盘","静音电源","电脑椅","办公椅","靠背座椅","百雀羚","学习机","婴幼儿羊奶粉悦白800g","白酒","华为手环","打印机","洗车机","游戏鼠标","罗技","电视盒子","智能手表","监控摄像头","儿童电话手表","智能电动牙刷","兰蔻","方庄北京二锅头","体温监测仪","475ml","除湿机","空气净化器","松下","暖风机","洗碗机","洗地机","笔记本电脑","高性能轻薄本","玉兰油","OLAY","轻薄笔记本","烧水壶","咖啡机","蓝牙音箱"],
}
//上面很重要，遇到问题请把上面注释看一遍再来问
!(async() => {
    console.log('X1a0He留：遇到问题请把脚本内的注释看一遍再来问，谢谢')
    console.log(`本脚本默认不运行，也不建议运行\n如需运行请自行添加环境变量：JD_TRY，值填：true\n`)
    await $.wait(500)
    if(process.env.JD_TRY && process.env.JD_TRY === 'true'){
        await requireConfig()
        if(!$.cookiesArr[0]){
            $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
                "open-url": "https://bean.m.jd.com/"
            })
            return
        }
        for(let i = 0; i < $.cookiesArr.length; i++){
            if($.cookiesArr[i]){
                $.cookie = $.cookiesArr[i];
                $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                await totalBean();
                console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
                if(!$.isLogin){
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                    });
                    await $.notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    continue
                }
                $.totalTry = 0
                $.totalSuccess = 0
                $.nowTabIdIndex = 0;
                $.nowPage = 1;
                $.nowItem = 1;
                trialActivityIdList = []
                trialActivityTitleList = []
                $.isLimit = false;
                console.log(`trialActivityIdList长度：${trialActivityIdList.length}`)
                console.log(`trialActivityTitleList长度：${trialActivityTitleList.length}`)
                console.log(`$.isLimit为：${$.isLimit}`)
                // 获取tabList的，不知道有哪些的把这里的注释解开跑一遍就行了
                // await try_tabList();
                // return;
                while(trialActivityIdList.length < args_xh.maxLength){
                    if($.nowTabIdIndex > args_xh.tabId.length){
                        console.log('不再获取商品，边缘越界');
                        break;
                    } else {
                        await try_feedsList(args_xh.tabId[$.nowTabIdIndex], $.nowPage++)  //获取对应tabId的试用页面
                    }
                    if(trialActivityIdList.length < args_xh.maxLength){
                        console.log(`间隔等待中，请等待 1 秒\n`)
                        await $.wait(1000);
                    }
                }
                console.log(`稍后将执行试用申请，请等待 2 秒\n`)
                await $.wait(2000);
                for(let i = 0; i < trialActivityIdList.length && $.isLimit === false; i++){
                    if($.isLimit){
                        console.log("试用上限")
                        break
                    }
                    await try_apply(trialActivityTitleList[i], trialActivityIdList[i])
                    console.log(`间隔等待中，请等待 ${args_xh.applyInterval} ms\n`)
                    await $.wait(args_xh.applyInterval);
                }
                console.log("试用申请执行完毕...")
                // await try_MyTrials(1, 1)    //申请中的商品
                await try_MyTrials(1, 2)    //申请成功的商品
                // await try_MyTrials(1, 3)    //申请失败的商品
                await showMsg()
            }
        }
        await $.notify.sendNotify(`${$.name}`, notifyMsg);
    } else {
        console.log(`\n您未设置运行【京东试用】脚本，结束运行！\n`)
    }
})().catch((e) => {
    console.error(`❗️ ${$.name} 运行错误！\n${e}`)
}).finally(() => $.done())

function requireConfig(){
    return new Promise(resolve => {
        console.log('开始获取配置文件\n')
        $.notify = $.isNode() ? require('./sendNotify') : { sendNotify: async() => { } }
        //获取 Cookies
        $.cookiesArr = []
        if($.isNode()){
            //Node.js用户请在jdCookie.js处填写京东ck;
            const jdCookieNode = require('./jdCookie.js');
            Object.keys(jdCookieNode).forEach((item) => {
                if(jdCookieNode[item]){
                    $.cookiesArr.push(jdCookieNode[item])
                }
            })
            if(process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
        } else {
            //IOS等用户直接用NobyDa的jd $.cookie
            $.cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
        }
        if(typeof process.env.JD_TRY_WHITELIST === "undefined") args_xh.whiteList = false;
        else args_xh.whiteList = process.env.JD_TRY_WHITELIST === 'true';
        if(typeof process.env.JD_TRY_PLOG === "undefined") args_xh.printLog = true;
        else args_xh.printLog = process.env.JD_TRY_PLOG === 'true';
        if(typeof process.env.JD_TRY_PASSZC === "undefined") args_xh.passZhongCao = true;
        else args_xh.passZhongCao = process.env.JD_TRY_PASSZC === 'true';
        console.log(`共${$.cookiesArr.length}个京东账号\n`)
        console.log('=====环境变量配置如下=====')
        console.log(`jdPrice: ${typeof args_xh.jdPrice}, ${args_xh.jdPrice}`)
        console.log(`tabId: ${typeof args_xh.tabId}, ${args_xh.tabId}`)
        console.log(`titleFilters: ${typeof args_xh.titleFilters}, ${args_xh.titleFilters}`)
        console.log(`trialPrice: ${typeof args_xh.trialPrice}, ${args_xh.trialPrice}`)
        console.log(`minSupplyNum: ${typeof args_xh.minSupplyNum}, ${args_xh.minSupplyNum}`)
        console.log(`applyNumFilter: ${typeof args_xh.applyNumFilter}, ${args_xh.applyNumFilter}`)
        console.log(`applyInterval: ${typeof args_xh.applyInterval}, ${args_xh.applyInterval}`)
        console.log(`maxLength: ${typeof args_xh.maxLength}, ${args_xh.maxLength}`)
        console.log(`passZhongCao: ${typeof args_xh.passZhongCao}, ${args_xh.passZhongCao}`)
        console.log(`printLog: ${typeof args_xh.printLog}, ${args_xh.printLog}`)
        console.log(`whiteList: ${typeof args_xh.whiteList}, ${args_xh.whiteList}`)
        console.log(`whiteListKeywords: ${typeof args_xh.whiteListKeywords}, ${args_xh.whiteListKeywords}`)
        console.log('=======================')
        // for(const key in args_xh){
        //     if(typeof args_xh[key] == 'string'){
        //         args_xh[key] = Number(args_xh[key])
        //     }
        // }
        // console.debug(args_xh)
        resolve()
    })
}

//获取tabList的，如果不知道tabList有哪些，跑一遍这个function就行了
function try_tabList(){
    return new Promise((resolve, reject) => {
        console.log(`获取tabList中...`)
        const body = JSON.stringify({
            "previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_tabList', body)
        $.get(option, (err, resp, data) => {
            try{
                if(err){
                    console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网络\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    if(data.success){
                        for(let tabId of data.data.tabList) console.log(`${tabId.tabName} - ${tabId.tabId}`)
                    } else {
                        console.log("获取失败", data)
                    }
                }
            } catch(e){
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally{
                resolve()
            }
        })
    })
}

//获取商品列表并且过滤 By X1a0He
function try_feedsList(tabId, page){
    return new Promise((resolve, reject) => {
        if(page > $.totalPages){
            console.log("请求页数错误")
            return;
        } else if($.nowTabIdIndex > args_xh.tabId.length){
            console.log(`不再获取商品，边缘越界，提交试用中...`)
            return;
        }
        const body = JSON.stringify({
            "tabId": `${tabId}`,
            "page": page,
            "previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_feedsList', body)
        $.get(option, (err, resp, data) => {
            try{
                if(err){
                    console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    if(data.success){
                        $.totalPages = data.data.pages
                        if($.nowTabIdIndex > args_xh.tabId.length){
                            console.log(`不再获取商品，边缘越界，提交试用中...`)
                        } else {
                            console.log(`第 ${size++} 次获取试用商品成功，tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page}/${$.totalPages} 页`)
                        }
                        console.log(`获取到商品 ${data.data.feedList.length} 条`)
                        for(let item of data.data.feedList){
                            if(trialActivityIdList.length >= args_xh.maxLength){
                                console.log('商品列表长度已满.结束获取')
                                break
                            }
                            if(item.applyState === 1){
                                args_xh.printLog ? console.log(`商品已申请试用：${item.skuTitle}`) : ''
                                continue
                            }
                            if(item.applyState !== null){
                                args_xh.printLog ? console.log(`商品状态异常，未找到skuTitle`) : ''
                                continue
                            }
                            if(args_xh.passZhongCao){
                                $.isPush = true;
                                if(item.tagList.length !== 0){
                                    for(let itemTag of item.tagList){
                                        if(itemTag.tagType === 3){
                                            args_xh.printLog ? console.log('商品被过滤，该商品是种草官专属') : ''
                                            $.isPush = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if(item.skuTitle && $.isPush){
                                args_xh.printLog ? console.log(`检测 tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page}/${$.totalPages} 页 第 ${$.nowItem++ + 1} 个商品\n${item.skuTitle}`) : ''
                                if(args_xh.whiteList){
                                    if(args_xh.whiteListKeywords.some(fileter_word => item.skuTitle.includes(fileter_word))){
                                        args_xh.printLog ? console.log(`商品通过，将加入试用组，trialActivityId为${item.trialActivityId}\n`) : ''
                                        trialActivityIdList.push(item.trialActivityId)
                                        trialActivityTitleList.push(item.skuTitle)
                                    }
                                } else {
                                    if(parseFloat(item.jdPrice) <= args_xh.jdPrice){
                                        args_xh.printLog ? console.log(`商品被过滤，${item.jdPrice} < ${args_xh.jdPrice} \n`) : ''
                                    } else if(parseFloat(item.supplyNum) < args_xh.minSupplyNum && item.supplyNum !== null){
                                        args_xh.printLog ? console.log(`商品被过滤，提供申请的份数小于预设申请的份数 \n`) : ''
                                    } else if(parseFloat(item.applyNum) > args_xh.applyNumFilter && item.applyNum !== null){
                                        args_xh.printLog ? console.log(`商品被过滤，已申请试用人数大于预设人数 \n`) : ''
                                    } else if(parseFloat(item.jdPrice) < args_xh.jdPrice){
                                        args_xh.printLog ? console.log(`商品被过滤，商品原价低于预设商品原价 \n`) : ''
                                    } else if(args_xh.titleFilters.some(fileter_word => item.skuTitle.includes(fileter_word))){
                                        args_xh.printLog ? console.log('商品被过滤，含有关键词 \n') : ''
                                    } else {
                                        args_xh.printLog ? console.log(`商品通过，将加入试用组，trialActivityId为${item.trialActivityId}\n`) : ''
                                        trialActivityIdList.push(item.trialActivityId)
                                        trialActivityTitleList.push(item.skuTitle)
                                    }
                                }
                            } else if($.isPush !== false){
                                console.error('skuTitle解析异常')
                                return
                            }
                        }
                        console.log(`当前试用组长度为：${trialActivityIdList.length}`)
                        args_xh.printLog ? console.log(`${trialActivityIdList}`) : ''
                        if(page === $.totalPages){
                            //这个是因为每一个tab都会有对应的页数，获取完如果还不够的话，就获取下一个tab
                            $.nowTabIdIndex += 1;
                            $.nowPage = 1;
                            $.nowItem = 1;
                        }
                    } else {
                        console.log(`💩 获得试用列表失败: ${data.message}`)
                    }
                }
            } catch(e){
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally{
                resolve()
            }
        })
    })
}

function try_apply(title, activityId){
    return new Promise((resolve, reject) => {
        console.log(`申请试用商品中...`)
        args_xh.printLog ? console.log(`商品：${title}`) : ''
        args_xh.printLog ? console.log(`id为：${activityId}`) : ''
        const body = JSON.stringify({
            "activityId": activityId,
            "previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_apply', body)
        $.get(option, (err, resp, data) => {
            try{
                if(err){
                    console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
                } else {
                    $.totalTry++
                    data = JSON.parse(data)
                    if(data.success && data.code === "1"){  // 申请成功
                        console.log(data.message)
                        $.totalSuccess++
                    } else if(data.code === "-106"){
                        console.log(data.message)   // 未在申请时间内！
                    } else if(data.code === "-110"){
                        console.log(data.message)   // 您的申请已成功提交，请勿重复申请…
                    } else if(data.code === "-120"){
                        console.log(data.message)   // 您还不是会员，本品只限会员申请试用，请注册会员后申请！
                    } else if(data.code === "-167"){
                        console.log(data.message)   // 抱歉，此试用需为种草官才能申请。查看下方详情了解更多。
                    } else if(data.code === "-131"){
                        console.log(data.message)   // 申请次数上限。
                        $.isLimit = true;
                    } else {
                        console.log("申请失败", data)
                    }
                }
            } catch(e){
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally{
                resolve()
            }
        })
    })
}

function try_MyTrials(page, selected){
    return new Promise((resolve, reject) => {
        switch(selected){
            case 1:
                console.log('正在获取已申请的商品...')
                break;
            case 2:
                console.log('正在获取申请成功的商品...')
                break;
            case 3:
                console.log('正在获取申请失败的商品...')
                break;
            default:
                console.log('selected错误')
        }
        const body = JSON.stringify({
            "page": page,
            "selected": selected,   // 1 - 已申请 2 - 成功列表，3 - 失败列表
            "previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_MyTrials', body)
        option.headers.Referer = 'https://pro.m.jd.com/'
        $.get(option, (err, resp, data) => {
            try{
                if(err){
                    console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    if(data.success){
                        //temp adjustment
                        if(selected === 2){
                            if(data.success && data.data){
                                $.successList = data.data.list.filter(item => {
                                    return item.text.text.includes('请尽快领取')
                                })
                                console.log(`待领取: ${$.successList.length}个`)
                            } else {
                                console.log(`获得成功列表失败: ${data.message}`)
                            }
                        }
                        // if(data.data.list.length > 0){
                        //     for(let item of data.data.list){
                        //         console.log(`申请时间：${new Date(parseInt(item.applyTime)).toLocaleString()}`)
                        //         console.log(`申请商品：${item.trialName}`)
                        //         console.log(`当前状态：${item.text.text}`)
                        //         console.log(`剩余时间：${remaining(item.leftTime)}`)
                        //         console.log()
                        //     }
                        // } else {
                        //     switch(selected){
                        //         case 1:
                        //             console.log('无已申请的商品\n')
                        //             break;
                        //         case 2:
                        //             console.log('无申请成功的商品\n')
                        //             break;
                        //         case 3:
                        //             console.log('无申请失败的商品\n')
                        //             break;
                        //         default:
                        //             console.log('selected错误')
                        //     }
                        // }
                    } else {
                        console.error(`ERROR:try_MyTrials`)
                    }
                }
            } catch(e){
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally{
                resolve()
            }
        })
    })
}

function taskurl_xh(appid, functionId, body = JSON.stringify({})){
    return {
        "url": `${URL}?appid=${appid}&functionId=${functionId}&clientVersion=10.1.2&client=wh5&body=${encodeURIComponent(body)}`,
        'headers': {
            'Host': 'api.m.jd.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': $.cookie,
            'Connection': 'keep-alive',
            'UserAgent': 'jdapp;iPhone;10.1.2;15.0;ff2caa92a8529e4788a34b3d8d4df66d9573f499;network/wifi;model/iPhone13,4;addressid/2074196292;appBuild/167802;jdSupportDarkMode/1;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Accept-Language': 'zh-cn',
            'Referer': 'https://prodev.m.jd.com/'
        },
    }
}

async function showMsg(){
    let message = `京东账号${$.index} ${$.nickName || $.UserName}\n🎉 本次申请成功：${$.totalSuccess}/${$.totalTry}个商品🛒\n🎉 ${$.successList.length}个商品待领取`
    if(!args_xh.jdNotify || args_xh.jdNotify === 'false'){
        $.msg($.name, ``, message, {
            "open-url": 'https://try.m.jd.com/user'
        })
        if($.isNode())
            notifyMsg += `${message}\n\n`
    } else {
        console.log(message)
    }
}

function totalBean(){
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": $.cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            },
            "timeout": 10000,
        }
        $.post(options, (err, resp, data) => {
            try{
                if(err){
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                        if(data['retcode'] === 13){
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if(data['retcode'] === 0){
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch(e){
                $.logErr(e, resp)
            } finally{
                resolve();
            }
        })
    })
}

function jsonParse(str){
    if(typeof str == "string"){
        try{
            return JSON.parse(str);
        } catch(e){
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}

// 来自 @chavyleung 大佬
// https://raw.githubusercontent.com/chavyleung/scripts/master/Env.js
function Env(name, opts){
    class Http{
        constructor(env){
            this.env = env
        }

        send(opts, method = 'GET'){
            opts = typeof opts === 'string' ? {
                url: opts
            } : opts
            let sender = this.get
            if(method === 'POST'){
                sender = this.post
            }
            return new Promise((resolve, reject) => {
                sender.call(this, opts, (err, resp, body) => {
                    if(err) reject(err)
                    else resolve(resp)
                })
            })
        }

        get(opts){
            return this.send.call(this.env, opts)
        }

        post(opts){
            return this.send.call(this.env, opts, 'POST')
        }
    }

    return new (class{
        constructor(name, opts){
            this.name = name
            this.http = new Http(this)
            this.data = null
            this.dataFile = 'box.dat'
            this.logs = []
            this.isMute = false
            this.isNeedRewrite = false
            this.logSeparator = '\n'
            this.startTime = new Date().getTime()
            Object.assign(this, opts)
            this.log('', `🔔${this.name}, 开始!`)
        }

        isNode(){
            return 'undefined' !== typeof module && !!module.exports
        }

        isQuanX(){
            return 'undefined' !== typeof $task
        }

        isSurge(){
            return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
        }

        isLoon(){
            return 'undefined' !== typeof $loon
        }

        toObj(str, defaultValue = null){
            try{
                return JSON.parse(str)
            } catch{
                return defaultValue
            }
        }

        toStr(obj, defaultValue = null){
            try{
                return JSON.stringify(obj)
            } catch{
                return defaultValue
            }
        }

        getjson(key, defaultValue){
            let json = defaultValue
            const val = this.getdata(key)
            if(val){
                try{
                    json = JSON.parse(this.getdata(key))
                } catch{ }
            }
            return json
        }

        setjson(val, key){
            try{
                return this.setdata(JSON.stringify(val), key)
            } catch{
                return false
            }
        }

        getScript(url){
            return new Promise((resolve) => {
                this.get({
                    url
                }, (err, resp, body) => resolve(body))
            })
        }

        runScript(script, runOpts){
            return new Promise((resolve) => {
                let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
                httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
                let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
                httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
                httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
                const [key, addr] = httpapi.split('@')
                const opts = {
                    url: `http://${addr}/v1/scripting/evaluate`,
                    body: {
                        script_text: script,
                        mock_type: 'cron',
                        timeout: httpapi_timeout
                    },
                    headers: {
                        'X-Key': key,
                        'Accept': '*/*'
                    }
                }
                this.post(opts, (err, resp, body) => resolve(body))
            }).catch((e) => this.logErr(e))
        }

        loaddata(){
            if(this.isNode()){
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                if(isCurDirDataFile || isRootDirDataFile){
                    const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
                    try{
                        return JSON.parse(this.fs.readFileSync(datPath))
                    } catch(e){
                        return {}
                    }
                } else return {}
            } else return {}
        }

        writedata(){
            if(this.isNode()){
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                const jsondata = JSON.stringify(this.data)
                if(isCurDirDataFile){
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                } else if(isRootDirDataFile){
                    this.fs.writeFileSync(rootDirDataFilePath, jsondata)
                } else {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                }
            }
        }

        lodash_get(source, path, defaultValue = undefined){
            const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
            let result = source
            for(const p of paths){
                result = Object(result)[p]
                if(result === undefined){
                    return defaultValue
                }
            }
            return result
        }

        lodash_set(obj, path, value){
            if(Object(obj) !== obj) return obj
            if(!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
            path.slice(0, -1).reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
                path[path.length - 1]
                ] = value
            return obj
        }

        getdata(key){
            let val = this.getval(key)
            // 如果以 @
            if(/^@/.test(key)){
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objval = objkey ? this.getval(objkey) : ''
                if(objval){
                    try{
                        const objedval = JSON.parse(objval)
                        val = objedval ? this.lodash_get(objedval, paths, '') : val
                    } catch(e){
                        val = ''
                    }
                }
            }
            return val
        }

        setdata(val, key){
            let issuc = false
            if(/^@/.test(key)){
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objdat = this.getval(objkey)
                const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
                try{
                    const objedval = JSON.parse(objval)
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                } catch(e){
                    const objedval = {}
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                }
            } else {
                issuc = this.setval(val, key)
            }
            return issuc
        }

        getval(key){
            if(this.isSurge() || this.isLoon()){
                return $persistentStore.read(key)
            } else if(this.isQuanX()){
                return $prefs.valueForKey(key)
            } else if(this.isNode()){
                this.data = this.loaddata()
                return this.data[key]
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        setval(val, key){
            if(this.isSurge() || this.isLoon()){
                return $persistentStore.write(val, key)
            } else if(this.isQuanX()){
                return $prefs.setValueForKey(val, key)
            } else if(this.isNode()){
                this.data = this.loaddata()
                this.data[key] = val
                this.writedata()
                return true
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        initGotEnv(opts){
            this.got = this.got ? this.got : require('got')
            this.cktough = this.cktough ? this.cktough : require('tough-cookie')
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
            if(opts){
                opts.headers = opts.headers ? opts.headers : {}
                if(undefined === opts.headers.Cookie && undefined === opts.cookieJar){
                    opts.cookieJar = this.ckjar
                }
            }
        }

        get(opts, callback = () => { }){
            if(opts.headers){
                delete opts.headers['Content-Type']
                delete opts.headers['Content-Length']
            }
            if(this.isSurge() || this.isLoon()){
                if(this.isSurge() && this.isNeedRewrite){
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, {
                        'X-Surge-Skip-Scripting': false
                    })
                }
                $httpClient.get(opts, (err, resp, body) => {
                    if(!err && resp){
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if(this.isQuanX()){
                if(this.isNeedRewrite){
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, {
                        hints: false
                    })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => callback(err)
                )
            } else if(this.isNode()){
                this.initGotEnv(opts)
                this.got(opts).on('redirect', (resp, nextOpts) => {
                    try{
                        if(resp.headers['set-cookie']){
                            const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                            if(ck){
                                this.ckjar.setCookieSync(ck, null)
                            }
                            nextOpts.cookieJar = this.ckjar
                        }
                    } catch(e){
                        this.logErr(e)
                    }
                    // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
                }).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => {
                        const {
                            message: error,
                            response: resp
                        } = err
                        callback(error, resp, resp && resp.body)
                    }
                )
            }
        }

        post(opts, callback = () => { }){
            // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
            if(opts.body && opts.headers && !opts.headers['Content-Type']){
                opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if(opts.headers) delete opts.headers['Content-Length']
            if(this.isSurge() || this.isLoon()){
                if(this.isSurge() && this.isNeedRewrite){
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, {
                        'X-Surge-Skip-Scripting': false
                    })
                }
                $httpClient.post(opts, (err, resp, body) => {
                    if(!err && resp){
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if(this.isQuanX()){
                opts.method = 'POST'
                if(this.isNeedRewrite){
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, {
                        hints: false
                    })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => callback(err)
                )
            } else if(this.isNode()){
                this.initGotEnv(opts)
                const {
                    url,
                    ..._opts
                } = opts
                this.got.post(url, _opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => {
                        const {
                            message: error,
                            response: resp
                        } = err
                        callback(error, resp, resp && resp.body)
                    }
                )
            }
        }

        /**
         *
         * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
         *    :$.time('yyyyMMddHHmmssS')
         *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
         *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
         * @param {*} fmt 格式化参数
         *
         */
        time(fmt){
            let o = {
                'M+': new Date().getMonth() + 1,
                'd+': new Date().getDate(),
                'H+': new Date().getHours(),
                'm+': new Date().getMinutes(),
                's+': new Date().getSeconds(),
                'q+': Math.floor((new Date().getMonth() + 3) / 3),
                'S': new Date().getMilliseconds()
            }
            if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (new Date().getFullYear() + '').substr(4 - RegExp.$1.length))
            for(let k in o)
                if(new RegExp('(' + k + ')').test(fmt))
                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
            return fmt
        }

        /**
         * 系统通知
         *
         * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
         *
         * 示例:
         * $.msg(title, subt, desc, 'twitter://')
         * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         *
         * @param {*} title 标题
         * @param {*} subt 副标题
         * @param {*} desc 通知详情
         * @param {*} opts 通知参数
         *
         */
        msg(title = name, subt = '', desc = '', opts){
            const toEnvOpts = (rawopts) => {
                if(!rawopts) return rawopts
                if(typeof rawopts === 'string'){
                    if(this.isLoon()) return rawopts
                    else if(this.isQuanX()) return {
                        'open-url': rawopts
                    }
                    else if(this.isSurge()) return {
                        url: rawopts
                    }
                    else return undefined
                } else if(typeof rawopts === 'object'){
                    if(this.isLoon()){
                        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                        return {
                            openUrl,
                            mediaUrl
                        }
                    } else if(this.isQuanX()){
                        let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                        let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                        return {
                            'open-url': openUrl,
                            'media-url': mediaUrl
                        }
                    } else if(this.isSurge()){
                        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                        return {
                            url: openUrl
                        }
                    }
                } else {
                    return undefined
                }
            }
            if(!this.isMute){
                if(this.isSurge() || this.isLoon()){
                    $notification.post(title, subt, desc, toEnvOpts(opts))
                } else if(this.isQuanX()){
                    $notify(title, subt, desc, toEnvOpts(opts))
                }
            }
            if(!this.isMuteLog){
                let logs = ['', '==============📣系统通知📣==============']
                logs.push(title)
                subt ? logs.push(subt) : ''
                desc ? logs.push(desc) : ''
                console.log(logs.join('\n'))
                this.logs = this.logs.concat(logs)
            }
        }

        log(...logs){
            if(logs.length > 0){
                this.logs = [...this.logs, ...logs]
            }
            console.log(logs.join(this.logSeparator))
        }

        logErr(err, msg){
            const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
            if(!isPrintSack){
                this.log('', `❗️${this.name}, 错误!`, err)
            } else {
                this.log('', `❗️${this.name}, 错误!`, err.stack)
            }
        }

        wait(time){
            return new Promise((resolve) => setTimeout(resolve, time))
        }

        done(val = {}){
            const endTime = new Date().getTime()
            const costTime = (endTime - this.startTime) / 1000
            this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
            this.log()
            if(this.isSurge() || this.isQuanX() || this.isLoon()){
                $done(val)
            }
        }
    })(name, opts)
}
