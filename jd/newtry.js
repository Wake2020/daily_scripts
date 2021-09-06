/*
 * 由zero205二次修改：脚本默认不运行
 * 由 X1a0He 修复：依然保持脚本默认不运行
 * 如需运行请自行添加环境变量：JD_TRY，值填 true 即可运行
 *
 update 2021/09/05
 脚本兼容: Node.js
 每天最多关注300个商店，但用户商店关注上限为500个。
 请配合取关脚本试用，使用 jd_unsubscribe.js 提前取关至少250个商店确保京东试用脚本正常运行。
 *
 * X1a0He留
 * 由于没有兼容Qx，原脚本已失效，建议原脚本的兼容Qx注释删了
 * 脚本是否耗时只看args_xh.maxLength的大小
 * 上一作者说了每天最多300个商店，总上限为500个，jd_unsubscribe.js我已更新为批量取关版
 * 请提前取关至少250个商店确保京东试用脚本正常运行
 * 没有写通知，是否申请成功没有进行通知，但脚本会把状态log出日志
 * cron "32 10 * * *" jd_try.js
 */
const $ = new Env('京东试用')
const URL = 'https://api.m.jd.com/client.action'
let trialActivityIdList = []
let trialActivityTitleList = []
let notifyMsg = ''
// default params
let args_xh = {
    /*
     * 是否进行通知
     * 可设置环境变量：JD_TRY_NOTIFY
     * */
    // isNotify: process.env.JD_TRY_NOTIFY || false,
    /*
     * 获取试用商品类型，默认为1
     * 1 - 精选
     * 2 - 闪电试
     * 3 - 家用电器(可能会有变化)
     * 4 - 手机数码(可能会有变化)
     * 5 - 电脑办公(可能会有变化)
     * 可设置环境变量：JD_TRY_TABID
     * */
    tabId: process.env.JD_TRY_TABID || 1,
    /*
     * 试用商品标题过滤
     * 可设置环境变量：JD_TRY_TITLEFILTERS，关键词与关键词之间用@分隔
     * */
    titleFilters: process.env.JD_TRY_TITLEFILTERS || ["配方奶粉@戒指@防静电喷雾@燮乐@VDU@植幕@钥匙扣@钥匙挂件@纪念币@Almisan@亿凌@希睿达@黄芪片@豪至尊@COOGI@耳环@QIPUSEN@HAZE@蔻罗娜@汉服@戈美其@欧利时@Timexcel@氧芬磁解@防蚊纱窗@水箱网@木铲@SYGUNY@燃力士@海瑟薇氨基酸@奢迪卡@翡拉拉@窗帘定制@天伊@阿胶@单拍不发@鹊医世家@智灵通@嘉媚乐@肌肤未来@豌豆蛋白粉@无糖蛋白粉@魔贴世家@手机支架@肤乐霜@翡翠吊坠@法妮莎@水梦丽@红糖姜茶@果粉茶@loveskindiy@法卡曼@翰宇@异舒吉@勃起@蝶印牌@友肌@软骨胶@花花公子@军博仕@成人情趣@护发素@陶瓷茶杯@平安扣@女孩玩具@护腰带@儿童补钙@衣物浆挺@霍山铁皮@尿不湿@花迷植物@婴幼儿辅食@益生菌@褪黑素@性感内裤@棒球帽@鸭舌帽@纸尿裤@鼠标垫@奶粉@音频线@短袜@农用喷雾器@氨基酸洁面@防晒袖套@叶开泰@圣哺乐@贵妇膏@护发精油@伤口护理软膏@拉拉裤@床垫定做@兽用打针器@调制乳粉@伊贝诗@床垫定制@长高奶粉@项链@手链@益生菌固体饮料@云南旅游@皮带@跟团游@丽江@大理@课@手术@指甲刀@跟团旅游@一对一@1对1@游戏@外教@炒股@资源@万门@小班@优惠券@学习@辅导@你拍@眼科@视频@咨询@日租卡@腾讯大王@5ML@5ml@10ml@指南@服务@痔疮@两片@体验@软件@系统@时时彩@1粒@1颗@一粒@一颗@单片@1片@止泻药@股票@教学@方案@计划@中国移动@中国联通@中国电信@大王卡@上网卡@流量卡@电话卡@手机卡@米粉卡@会员卡@验孕@早早孕@二维码@口语@教程@三好网@数学@语文@化学@物理@试学@脚气@鸡眼@勿拍@在线@英语@俄语@佑天兰@癣@灰指甲@远程@评估@手册@家政@妊娠@编程@足贴@装修@小靓美@入门@熟练@延时喷剂@延时喷雾@印度神油@延时凝胶@自慰器@灵芝@戒烟@扣头@震动棒@体验卡@皮带扣头@程序开发@北海@卷尺@假阳具@种子@档案袋@老太太@私处@孕妇@卫生条@培训@阴道@生殖器@肛门@狐臭@鱼饵@钓鱼@童装@吊带@黑丝@钢圈@网课@网校@电商@钢化膜@网络课程@美少女@四级@六级@四六级@在线网络@阴道炎@宫颈@糜烂@打底裤@手机膜@鱼@狗@软件定制@课程@后膜@保护贴@背贴@后贴膜@前膜@叛逆@幼儿教育@青春期@胎教@早教@视频教程@软件安装@党建@上门服务@上门家居修缮@牙齿矫正@牙齿取模@基因检测@看房@青少年家庭@医院同款抗HP@陪练@精品课@在线培训@试听课程@智能学习App@试听课@入门到精通@项目实战@开发实战@体验课@系统编程@题库@HPV@一片@特福@hpv@清粉软件@热敏收银纸@购房抵用券@购房@男士营养液@甲状腺@淋巴结@男性保健品@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@八宝茶@壮阳@延时@腱鞘炎@震珠套@艾草贴@艾灸贴@减肥贴@瘦身贴@艾灸@房事快感@玉石@和田玉@青少年家庭@去鸡皮@阴茎@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@吉仁堂@艾条@吉仁堂@艾叶@人参压片糖@海苔@0.5kg@东北米@杨家方@HIV@hiv@血液检测@石英岩玉@结肠癌@汉苑良方@磁石能量@蓉立方@保健内裤@高通量蛋白检测@检测试纸@马上修@提高男功能按摩加强@玛瑙@图纸@表带@汤臣倍健@三宝茶@按摩精油@数据线@丰胸@派样装@旅游签证@面部吸脂@癌症@基因筛查@亮益@豆妃@乐家老铺@锁精@狼牙棒@短袖@T恤@前列腺@健乳@丰胸@人参牡蛎@蚕蛹@BBV@面膜@催奶下奶@五宝@避孕套@鹿鞭@压片糖@梦君@睡眠喷雾@艺星@倍碧唯@芙清@休闲裤@燕窝@毛巾@吉米@润舒草@减肥茶@高丽参@减肥咖啡@集成吊顶扣板@胸部护理@丰乳@纹绣色@迪后@法寇@MZMZ@胶囊@游派@牡蛎@小剪刀@文玩@佳雪@飞机杯@爱优奇@女用高潮@铝扣板@法莎尼亚@法蔻@纪诗哲@骆骐亚@杜莎菲尼@成品窗帘布@牡蛎片@壁纸@泰国佛牌@澳特力@翡舞@龟头@劳拉图@轻奢品牌@4ml@赠品勿下单@菲洛嘉@防脱@芊肌源@希颂@复古道袍@洁面乳@荟名门@洗发露@近视眼镜@睾丸@抱枕@手机壳@卓尼莎@英伦保罗@剪刀@驱虫喷剂@假发@澳特力@车载U盘@石膏线@数字音频线@美尔凯特@磁吸轨道@猫粮@晴文@玉镯子","幼儿园", "教程", "英语", "辅导", "培训", "孩子", "小学"],
    // 试用价格，高于这个价格都不会试用，小于等于才会试用
    trialPrice: 100000000,
    /*
     * 最小提供数量，例如试用商品只提供2份试用资格，当前设置为1，则会进行申请
     * 若只提供5分试用资格，当前设置为10，则不会申请
     * 可设置环境变量：JD_TRY_MINSUPPLYNUM
     * */
    minSupplyNum: process.env.JD_TRY_MINSUPPLYNUM || 10,
    /*
     * 过滤大于设定值的已申请人数，例如下面设置的1000，A商品已经有1001人申请了，则A商品不会进行申请，会被跳过
     * 可设置环境变量：JD_TRY_APPLYNUMFILTER
     * */
    applyNumFilter: process.env.JD_TRY_APPLYNUMFILTER || 30000,
    /*
     * 商品试用之间和获取商品之间的间隔, 单位：毫秒(1秒=1000毫秒)
     * 可设置环境变量：JD_TRY_APPLYINTERVAL
     * */
    applyInterval: process.env.JD_TRY_APPLYINTERVAL || 5000,
    /*
     * 商品数组的最大长度，通俗来说就是即将申请的商品队列长度
     * 例如设置为20，当第一次获取后获得12件，过滤后剩下5件，将会进行第二次获取，过滤后加上第一次剩余件数
     * 例如是18件，将会进行第三次获取，直到过滤完毕后为20件才会停止，不建议设置太大
     * 可设置环境变量：JD_TRY_MAXLENGTH
     * */
    maxLength: process.env.JD_TRY_MAXLENGTH || 10
}
!(async() => {
    console.log(`\n本脚本默认不运行，也不建议运行\n如需运行请自行添加环境变量：JD_TRY，值填：true\n`)
    await $.wait(1000)
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
                let size = 1;
                while(trialActivityIdList.length < args_xh.maxLength){
                    console.log(`\n正在进行第 ${size} 次获取试用商品\n`)
                    await try_feedsList(args_xh.tabId, size++)   //这个是一点进京东试用就显示的页面，默认为精选页面
                    if(trialActivityIdList.length < args_xh.maxLength){
                        console.log(`间隔延时中，请等待 ${args_xh.applyInterval} ms`)
                        await $.wait(args_xh.applyInterval);
                    }
                }
                console.log("正在执行试用申请...")
                await $.wait(args_xh.applyInterval);
                for(let i = 0; i < trialActivityIdList.length; i++){
                    await try_apply(trialActivityTitleList[i], trialActivityIdList[i])
                    console.log(`间隔延时中，请等待 ${args_xh.applyInterval} ms\n`)
                    await $.wait(args_xh.applyInterval);
                }
                for(let actId of trialActivityIdList){
                }
                console.log("试用申请执行完毕...")
                await try_MyTrials(1, 1)    //申请中的商品
                await try_MyTrials(1, 2)    //申请成功的商品
                await try_MyTrials(1, 3)    //申请失败的商品
            }
        }
        // await $.notify.sendNotify(`${$.name}`, notifyMsg);
    } else {
        console.log(`\n您未设置运行【京东试用】脚本，结束运行！\n`)
        await $.wait(1000)
    }
})().catch((e) => {
    console.log(`❗️ ${$.name} 运行错误！\n${e}`)
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
        console.log(`共${$.cookiesArr.length}个京东账号\n`)
        if($.isNode()){
            if(process.env.JD_TRY_TITLEFILTERS){
                args_xh.titleFilters = process.env.JD_TRY_TITLEFILTERS.split('@')
            }
            if(process.env.JD_TRY_MAXLENGTH) args_xh.maxLength = process.env.JD_TRY_MAXLENGTH * 1
            if(process.env.JD_TRY_APPLYINTERVAL) args_xh.applyInterval = process.env.JD_TRY_APPLYINTERVAL * 1
            if(process.env.JD_TRY_APPLYNUMFILTER) args_xh.applyNumFilter = process.env.JD_TRY_APPLYNUMFILTER * 1
            if(process.env.JD_TRY_MINSUPPLYNUM) args_xh.minSupplyNum = process.env.JD_TRY_MINSUPPLYNUM * 1
            if(process.env.JD_TRY_TABID) args_xh.tabId = process.env.JD_TRY_TABID * 1
        } else {
            /*
             * X1a0He留
             * 初步看这里应该是为Qx兼容的，我并没有写Qx兼容，因为我不会用Qx
             * 我只是保证了Node环境下能用
             * 如有介意，删脚本吧
             * */
            // let qxCidsList = []
            // let qxTypeList = []
            // const cidsKeys = Object.keys(cidsMap)
            // const typeKeys = Object.keys(typeMap)
            // for(let key of cidsKeys){
            //     const open = $.getdata(key)
            //     if(open == 'true') qxCidsList.push(key)
            // }
            // for(let key of typeKeys){
            //     const open = $.getdata(key)
            //     if(open == 'true') qxTypeList.push(key)
            // }
            // if(qxCidsList.length != 0) args.cidsList = qxCidsList
            // if(qxTypeList.length != 0) args.typeList = qxTypeList
            // if($.getdata('filter')) args.goodFilters = $.getdata('filter').split('@')
            // if($.getdata('min_price')) args.minPrice = Number($.getdata('min_price'))
            // if($.getdata('page_size')) args.pageSize = Number($.getdata('page_size'))
            // if($.getdata('max_supply_count')) args.maxSupplyCount = Number($.getdata('max_supply_count'))
            // if(args.pageSize == 0) args.pageSize = 12
        }
        resolve()
    })
}

//获取商品列表并且过滤 By X1a0He
function try_feedsList(tabId, page){
    return new Promise((resolve, reject) => {
        if(page > $.totalPages){
            console.log("请求页数错误")
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
                        console.log(`获取到商品 ${data.data.feedList.length} 条\n`)
                        for(let i = 0; i < data.data.feedList.length; i++){
                            if(data.data.feedList[i].applyState === null){
                                if(trialActivityIdList.length < args_xh.maxLength){
                                    if(data.data.feedList[i].skuTitle !== undefined){
                                        console.log(`检测第 ${page} 页 第 ${i + 1} 个商品\n${data.data.feedList[i].skuTitle}`)
                                        $.isPush = false;
                                        for(let filters of args_xh.titleFilters){
                                            if(parseFloat(data.data.feedList[i].supplyNum) < args_xh.minSupplyNum && data.data.feedList[i].supplyNum !== null){
                                                $.isPush = false;
                                                console.log(`商品被过滤，提供申请的份数小于预设申请的份数 \n`)
                                                break;
                                            }
                                            if(parseFloat(data.data.feedList[i].applyNum) > args_xh.applyNumFilter && data.data.feedList[i].applyNum !== null){
                                                $.isPush = false;
                                                console.log(`商品被过滤，已申请试用人数大于预设人数 \n`)
                                                break;
                                            }
                                            if(parseFloat(data.data.feedList[i].trialPrice) > args_xh.trialPrice){
                                                $.isPush = false;
                                                console.log(`商品被过滤，期待价格高于预设价格 \n`)
                                                break;
                                            }
                                            if(data.data.feedList[i].skuTitle.indexOf(filters) !== -1){
                                                $.isPush = false;
                                                console.log(`商品被过滤，含有关键词 ${filters}\n`)
                                                break;
                                            }
                                            $.isPush = true;
                                        }
                                        if($.isPush){
                                            console.log(`商品通过，将加入试用组，trialActivityId为${data.data.feedList[i].trialActivityId}\n`)
                                            trialActivityIdList.push(data.data.feedList[i].trialActivityId)
                                            trialActivityTitleList.push(data.data.feedList[i].skuTitle)
                                        }
                                    }
                                }
                            } else if(data.data.feedList[i].applyState === 1){
                                console.log(`商品已申请试用：${data.data.feedList[i].skuTitle}`)
                            }
                        }
                        console.log(`当前试用组id如下，长度为：${trialActivityIdList.length}\n${trialActivityIdList}\n`)
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
        console.log(`商品：${title}`)
        console.log(`id为：${activityId}`)
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
                    data = JSON.parse(data)
                    if(data.success && data.code === "1"){  // 申请成功
                        console.log(data.message)
                    } else if(data.code === "-106"){
                        console.log(data.message)   // 未在申请时间内！
                    } else if(data.code === "-110"){
                        console.log(data.message)   // 您的申请已成功提交，请勿重复申请…
                    } else if(data.code === "-120"){
                        console.log(data.message)   // 您还不是会员，本品只限会员申请试用，请注册会员后申请！
                    } else if(data.code === "-167"){
                        console.log(data.message)   // 抱歉，此试用需为种草官才能申请。查看下方详情了解更多。
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
                        if(data.data.list.length > 0){
                            for(let item of data.data.list){
                                console.log(`申请时间：${new Date(parseInt(item.applyTime)).toLocaleString()}`)
                                console.log(`申请商品：${item.trialName}`)
                                console.log(`当前状态：${item.text.text}`)
                                console.log(`剩余时间：${remaining(item.leftTime)}`)
                                console.log()
                            }
                        } else {
                            switch(selected){
                                case 1:
                                    console.log('无已申请的商品\n')
                                    break;
                                case 2:
                                    console.log('无申请成功的商品\n')
                                    break;
                                case 3:
                                    console.log('无申请失败的商品\n')
                                    break;
                                default:
                                    console.log('selected错误')
                            }
                        }
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

function remaining(time){
    let days = parseInt(time / (1000 * 60 * 60 * 24));
    let hours = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} 天 ${hours} 小时 ${minutes} 分`
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
    let message = `京东账号${$.index} ${$.nickName || $.UserName}\n🎉 本次申请：${$.totalTry}/${$.totalGoods}个商品🛒\n🎉 ${$.successList.length}个商品待领取🤩\n🎉 结束原因：${$.stopMsg}`
    if(!args.jdNotify || args.jdNotify === 'false'){
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
