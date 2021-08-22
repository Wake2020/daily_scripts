/*
update 2021/4/11
京东试用：脚本更新地址 https://raw.githubusercontent.com/ZCY01/daily_scripts/main/jd/jd_try.js
脚本兼容: QuantumultX, Node.js

⚠️ 非常耗时的脚本。最多可能执行半小时！
每天最多关注300个商店，但用户商店关注上限为500个。
请配合取关脚本试用，使用 jd_unsubscribe.js 提前取关至少250个商店确保京东试用脚本正常运行。
==========================Quantumultx=========================
[task_local]
# 取关京东店铺商品，请在 boxjs 修改取消关注店铺数量
5 10 * * * https://raw.githubusercontent.com/lxk0301/jd_scripts/master/jd_unsubscribe.js, tag=取关京东店铺商品, enabled=true

# 京东试用
30 10 * * * https://raw.githubusercontent.com/ZCY01/daily_scripts/main/jd/jd_try.js, tag=京东试用, img-url=https://raw.githubusercontent.com/ZCY01/img/master/jdtryv1.png, enabled=true
 */
const $ = new Env('京东试用')
const notify = $.isNode() ? require( './sendNotify' ) : '';
const jdCookieNode = $.isNode() ? require( './jdCookie.js' ) : '';
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let cookiesArr = [], cookie = '', message = '', allMessage = '';
const selfDomain = 'https://try.m.jd.com'
let allGoodList = [];
if ( $.isNode() ) {
	Object.keys( jdCookieNode ).forEach( ( item ) => {
		cookiesArr.push( jdCookieNode[ item ] )
	} )
	if ( process.env.JD_DEBUG && process.env.JD_DEBUG === 'false' ) console.log = () => { };
} else {
	cookiesArr = [ $.getdata( 'CookieJD' ), $.getdata( 'CookieJD2' ), ...jsonParse( $.getdata( 'CookiesJD' ) || "[]" ).map( item => item.cookie ) ].filter( item => !!item );
}
// console.warn( cookiesArr);
// default params
const args = {
	jdNotify: false,
	pageSize: 12,
	cidsList: ["家用电器","手机数码","电脑办公","家居家装","美妆护肤","服饰鞋包","母婴玩具","生鲜美食","图书音像","钟表奢品","个人护理","食品饮料","更多惊喜","不知道是啥"],
	typeList: [],
	whiteList: ["显示屏","剃须刀","飞科","多功能料理机","天玑","阅读器","矫姿座椅","YOTIME","悠享时","倩碧","落地灯","台灯","SK-II","雅诗兰黛","英睿达","内存条","显卡","路由器","雅诗兰黛","监控器","摄像机","九阳","凉霸","每日坚果","三只松鼠","麦克风","格力","科大讯飞","良品铺子","松下","威力","松下","苏泊尔","海尔","方太","美的","国窖1573","电热水壶","耳机","高清摄像头","电池炉","不粘锅","电压力锅","电饭煲","电饭锅","五粮液","泸州老窖","咖啡机","西部数据","华为手环","小米手环","平板电脑","青岛啤酒","燕京啤酒","洗衣机","电风扇","苏泊尔","九阳","液晶智能电视","吸尘器","吹风机","破壁机","豆浆机","机械硬盘","高色域","机械硬盘","骁龙","固态硬盘","葡萄酒","空调","65英寸","全面屏","超清影像","超级快充","点读机","激光脱毛器","蓝牙耳机","机械键盘","静音电源","电脑椅","办公椅","靠背座椅","百雀羚","学习机","婴幼儿羊奶粉悦白800g","白酒","华为手环","打印机","洗车机","游戏鼠标","罗技","电视盒子","智能手表","监控摄像头","儿童电话手表","智能电动牙刷","兰蔻","方庄北京二锅头","体温监测仪","475ml","除湿机","空气净化器","松下","暖风机","洗碗机","洗地机","笔记本电脑","高性能轻薄本","玉兰油","OLAY","轻薄笔记本","烧水壶","咖啡机","蓝牙音箱"],
	goodFilters: "配方奶粉@戒指@防静电喷雾@燮乐@VDU@植幕@钥匙扣@钥匙挂件@纪念币@Almisan@亿凌@希睿达@黄芪片@豪至尊@COOGI@耳环@QIPUSEN@HAZE@蔻罗娜@汉服@戈美其@欧利时@Timexcel@氧芬磁解@防蚊纱窗@水箱网@木铲@SYGUNY@燃力士@海瑟薇氨基酸@奢迪卡@翡拉拉@窗帘定制@天伊@阿胶@单拍不发@鹊医世家@智灵通@嘉媚乐@肌肤未来@豌豆蛋白粉@无糖蛋白粉@魔贴世家@手机支架@肤乐霜@翡翠吊坠@法妮莎@水梦丽@红糖姜茶@果粉茶@loveskindiy@法卡曼@翰宇@异舒吉@勃起@蝶印牌@友肌@软骨胶@花花公子@军博仕@成人情趣@护发素@陶瓷茶杯@平安扣@女孩玩具@护腰带@儿童补钙@衣物浆挺@霍山铁皮@尿不湿@花迷植物@婴幼儿辅食@益生菌@褪黑素@性感内裤@棒球帽@鸭舌帽@纸尿裤@鼠标垫@奶粉@音频线@短袜@农用喷雾器@氨基酸洁面@防晒袖套@叶开泰@圣哺乐@贵妇膏@护发精油@伤口护理软膏@拉拉裤@床垫定做@兽用打针器@调制乳粉@伊贝诗@床垫定制@长高奶粉@项链@手链@益生菌固体饮料@云南旅游@皮带@跟团游@丽江@大理@课@手术@指甲刀@跟团旅游@一对一@1对1@游戏@外教@炒股@资源@万门@小班@优惠券@学习@辅导@你拍@眼科@视频@咨询@日租卡@腾讯大王@5ML@5ml@10ml@指南@服务@痔疮@两片@体验@软件@系统@时时彩@1粒@1颗@一粒@一颗@单片@1片@止泻药@股票@教学@方案@计划@中国移动@中国联通@中国电信@大王卡@上网卡@流量卡@电话卡@手机卡@米粉卡@会员卡@验孕@早早孕@二维码@口语@教程@三好网@数学@语文@化学@物理@试学@脚气@鸡眼@勿拍@在线@英语@俄语@佑天兰@癣@灰指甲@远程@评估@手册@家政@妊娠@编程@足贴@装修@小靓美@入门@熟练@延时喷剂@延时喷雾@印度神油@延时凝胶@自慰器@灵芝@戒烟@扣头@震动棒@体验卡@皮带扣头@程序开发@北海@卷尺@假阳具@种子@档案袋@老太太@私处@孕妇@卫生条@培训@阴道@生殖器@肛门@狐臭@鱼饵@钓鱼@童装@吊带@黑丝@钢圈@网课@网校@电商@钢化膜@网络课程@美少女@四级@六级@四六级@在线网络@阴道炎@宫颈@糜烂@打底裤@手机膜@鱼@狗@软件定制@课程@后膜@保护贴@背贴@后贴膜@前膜@叛逆@幼儿教育@青春期@胎教@早教@视频教程@软件安装@党建@上门服务@上门家居修缮@牙齿矫正@牙齿取模@基因检测@看房@青少年家庭@医院同款抗HP@陪练@精品课@在线培训@试听课程@智能学习App@试听课@入门到精通@项目实战@开发实战@体验课@系统编程@题库@HPV@一片@特福@hpv@清粉软件@热敏收银纸@购房抵用券@购房@男士营养液@甲状腺@淋巴结@男性保健品@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@八宝茶@壮阳@延时@腱鞘炎@震珠套@艾草贴@艾灸贴@减肥贴@瘦身贴@艾灸@房事快感@玉石@和田玉@青少年家庭@去鸡皮@阴茎@体验装@试用装@磨牙棒@营养米粉@代餐面包@托马斯小火车@吉仁堂@艾条@吉仁堂@艾叶@人参压片糖@海苔@0.5kg@东北米@杨家方@HIV@hiv@血液检测@石英岩玉@结肠癌@汉苑良方@磁石能量@蓉立方@保健内裤@高通量蛋白检测@检测试纸@马上修@提高男功能按摩加强@玛瑙@图纸@表带@汤臣倍健@三宝茶@按摩精油@数据线@丰胸@派样装@旅游签证@面部吸脂@癌症@基因筛查@亮益@豆妃@乐家老铺@锁精@狼牙棒@短袖@T恤@前列腺@健乳@丰胸@人参牡蛎@蚕蛹@BBV@面膜@催奶下奶@五宝@避孕套@鹿鞭@压片糖@梦君@睡眠喷雾@艺星@倍碧唯@芙清@休闲裤@燕窝@毛巾@吉米@润舒草@减肥茶@高丽参@减肥咖啡@集成吊顶扣板@胸部护理@丰乳@纹绣色@迪后@法寇@MZMZ@胶囊@游派@牡蛎@小剪刀@文玩@佳雪@飞机杯@爱优奇@女用高潮@铝扣板@法莎尼亚@法蔻@纪诗哲@骆骐亚@杜莎菲尼@成品窗帘布@牡蛎片@壁纸@泰国佛牌@澳特力@翡舞@龟头@劳拉图@轻奢品牌@4ml@赠品勿下单@菲洛嘉@防脱@芊肌源@希颂@复古道袍@洁面乳@荟名门@洗发露@近视眼镜@睾丸@抱枕@手机壳@卓尼莎@英伦保罗@剪刀@驱虫喷剂@假发@澳特力@车载U盘@石膏线@数字音频线@美尔凯特@磁吸轨道@猫粮@晴文@玉镯子".split('@'),
	minPrice: 169,
	maxSupplyCount: 15,
	white_price_limit: 149,
	limit_day: 1
}

const cidsMap = {
	"全部商品": "0",
	"家用电器": "737",
	"手机数码": "652,9987",
	"电脑办公": "670",
	"家居家装": "1620,6728,9847,9855,6196,15248,14065",
	"美妆护肤": "1316",
	"服饰鞋包": "1315,1672,1318,11729",
	"母婴玩具": "1319,6233",
	"生鲜美食": "12218",
	"图书音像": "1713,4051,4052,4053,7191,7192,5272",
	"钟表奢品": "5025,6144",
	"个人护理": "16750",
	"家庭清洁": "15901",
	"食品饮料": "1320,12259",
	"更多惊喜": "4938,13314,6994,9192,12473,6196,5272,12379,13678,15083,15126,15980",
	"不知道是啥":"17329,2575,5257"
}
const typeMap = {
		"全部试用": "0",
		"普通试用": "1",
		"闪电试用": "2",
		"30天试用": "5",
	}

	!(async () => {
		// await requireConfig()
		if (!cookiesArr[0]) {
			$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
				"open-url": "https://bean.m.jd.com/"
			})
			return
		}
		for (let i = 0; i < cookiesArr.length; i++) {
			if (cookiesArr[i]) {
				$.cookie = cookiesArr[i];
				$.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1])
				$.index = i + 1;
				$.isLogin = true;
				$.nickName = '';
				await totalBean();
				console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
				if (!$.isLogin) {
					$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
						"open-url": "https://bean.m.jd.com/bean/signIndex.action"
					});
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
					continue
				}

				$.goodList = []
				$.successList = []
				if (i == 0) {
					await getGoodList()
				}
				await filterGoodList()

				$.totalTry = 0
				$.totalGoods = $.goodList.length
				
				await tryGoodList()
				await getSuccessList()

				await showMsg()
			}
		}
	})()
	.catch((e) => {
		console.log(`❗️ ${$.name} 运行错误！\n${e}`)
	}).finally(() => $.done())

function requireConfig() {
	return new Promise(resolve => {
		console.log('开始获取配置文件\n')
		$.notify = $.isNode() ? require('../ql/repo/panghu999_jd_scripts/sendNotify') : {sendNotify:async () => {}}

		//获取 Cookies
		cookiesArr = []
		if ($.isNode()) {
			//Node.js用户请在jdCookie.js处填写京东ck;
			const jdCookieNode = require('../ql/repo/panghu999_jd_scripts/jdCookie.js');
			Object.keys(jdCookieNode).forEach((item) => {
				if (jdCookieNode[item]) {
					cookiesArr.push(jdCookieNode[item])
				}
			})
			if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
		} else {
			//IOS等用户直接用NobyDa的jd $.cookie
			cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
		}
		console.log(`共${cookiesArr.length}个京东账号\n`)

		if ($.isNode()) {
			if (process.env.JD_TRY_CIDS_KEYS) {
				args.cidsList = process.env.JD_TRY_CIDS_KEYS.split('@').filter(key => {
					return Object.keys(cidsMap).includes(key)
				})
			}
			if (process.env.JD_TRY_TYPE_KEYS) {
				args.typeList = process.env.JD_TRY_CIDS_KEYS.split('@').filter(key => {
					return Object.keys(typeMap).includes(key)
				})
			}
			if (process.env.JD_TRY_GOOD_FILTERS) {
				args.goodFilters = process.env.JD_TRY_GOOD_FILTERS.split('@')
			}
			if (process.env.JD_TRY_MIN_PRICE) {
				args.minPrice = process.env.JD_TRY_MIN_PRICE * 1
			}
			if (process.env.JD_TRY_PAGE_SIZE) {
				args.pageSize = process.env.JD_TRY_PAGE_SIZE * 1
			}
			if (process.env.JD_TRY_MAX_SUPPLY_COUNT) {
				args.maxSupplyCount = process.env.JD_TRY_MAX_SUPPLY_COUNT * 1
			}
			console.log(JSON.stringify(args))
		} else {
			let qxCidsList = []
			let qxTypeList = []
			const cidsKeys = Object.keys(cidsMap)
			const typeKeys = Object.keys(typeMap)
			for (let key of cidsKeys) {
				const open = $.getdata(key)
				if (open == 'true') qxCidsList.push(key)
			}
			for (let key of typeKeys) {
				const open = $.getdata(key)
				if (open == 'true') qxTypeList.push(key)
			}
			if (qxCidsList.length != 0) args.cidsList = qxCidsList
			if (qxTypeList.length != 0) args.typeList = qxTypeList
			if ($.getdata('filter')) args.goodFilters = $.getdata('filter').split('&')
			if ($.getdata('min_price')) args.minPrice = Number($.getdata('min_price'))
			if ($.getdata('page_size')) args.pageSize = Number($.getdata('page_size'))
			if ($.getdata('max_supply_count')) args.maxSupplyCount = Number($.getdata('max_supply_count'))
			if (args.pageSize == 0) args.pageSize = 12
		}
		resolve()
	})
}

function getGoodListByCond(cids, page, pageSize, type, state) {
	return new Promise((resolve, reject) => {
		let option = taskurl(`${selfDomain}/activity/list?pb=1&cids=${cids}&page=${page}&pageSize=${pageSize}&type=${type}&state=${state}`)
		delete option.headers['Cookie']
		$.get(option, (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success) {
						if(data.data.pages > $.totalPages)
						{
							$.totalPages = data.data.pages;
						}else if(data.data.pages < $.totalPages)
						{
							console.log("cids:" + cids + ",currentpage:" + page + ", resppage:" + data.data.pages)
						}
						allGoodList = allGoodList.concat(data.data.data)
					} else {
						console.log(`💩 获得 ${cids} ${page} 列表失败: ${data.message}`)
					}
				}
				resolve()
			} catch (e) {
				console.log(page + " 请求出错")
				sleep(1000);
				getGoodListByCond(cids, page, pageSize, type, state)
				resolve()
			} finally {
				
			}
		})
	})
}

async function getGoodList() {
	if (args.cidsList.length === 0) args.cidsList.push("全部商品")
	if (args.typeList.length === 0) args.typeList.push("全部试用")
	for (let cidsKey of args.cidsList) {
		for (let typeKey of args.typeList) {
			if (!cidsMap.hasOwnProperty(cidsKey) || !typeMap.hasOwnProperty(typeKey)) continue
			console.log(`⏰ 获取 ${cidsKey} ${typeKey} 商品列表`)
			$.totalPages = 1
			for (let page = 1; page <= $.totalPages; page++) {
				await getGoodListByCond(cidsMap[cidsKey], page, args.pageSize, typeMap[typeKey], '0')
			}
		}
	}
}

async function filterGoodList() {
	console.log(`⏰ 过滤商品列表，当前共有${allGoodList.length}个商品`)
	const now = Date.now()
	const oneMoreDay = now + 24 * 60 * 60 * 1000 * args.limit_day
	$.goodList = allGoodList.filter(good => {
		// 1. good 有问题
		// 2. good 距离结束不到10min
		// 3. good 的结束时间大于一天
		// 4. good 的价格小于最小的限制
		// 5. good 的试用数量大于 maxSupplyCount, 视为垃圾商品
		if(!good || good.endTime < now + 10 * 60 * 1000 || good.endTime > oneMoreDay)
		{
			return false
		}
		if(good.jdPrice >= args.white_price_limit || good.jdPrice == -1)
		{
			outer:for (let item of args.whiteList) {
				for(let keyword of item.split("##"))
				{
					if (good.trialName.indexOf(keyword) == -1) 
					{
						continue outer;
					}
					
				}
				console.log(good.trialName + "  命中白名单：  " + item + "   价格：  " + good.jdPrice)
				return true
			}
		}
		
		if (good.jdPrice < args.minPrice) {
			return false
		}
		for (let item of args.goodFilters) {
			if (good.trialName.indexOf(item) != -1) 
			{
				console.log(good.trialName + "  命中黑名单：  " + item + "   价格：  " + good.jdPrice)
				return false
			}
		}
		if(good.supplyCount > args.maxSupplyCount){
			return false
		}
		return true
		// if(!good)
		// {
		// 	return false
		// }
		// for (let item of args.goodFilters) { // 黑名单
		// 	if (good.trialName.indexOf(item) != -1) return false
		// }
		// for (let item of args.whiteList) { // 白名单
		// 	if (good.trialName.indexOf(item) != -1) return true
		// }
		// if(good.supplyCount == 1) // 申请一份
		// {
		// 	return true;
		// }
		// if (good.jdPrice < args.minPrice) { // 价格大于1000
		// 	return false
		// }
		// if(good.supplyCount > args.maxSupplyCount){ // 申请一百份以上
		// 	return false
		// }
		// return true

	})
	await getApplyStateByActivityIds()
	$.goodList = $.goodList.sort((a, b) => {
		return b.jdPrice - a.jdPrice
	})
}

async function getApplyStateByActivityIds() {
	function opt(ids) {
		return new Promise((resolve, reject) => {
			$.get(taskurl(`${selfDomain}/getApplyStateByActivityIds?activityIds=${ids.join(',')}`), (err, resp, data) => {
				try {
					if (err) {
						console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
					} else {
						data = JSON.parse(data)
						ids.length = 0
						for (let apply of data) ids.push(apply.activityId)
					}
					$.goodList = $.goodList.filter(good => {
						for (let id of ids) {
							if (id == good.id) {
								return false
							}
						}
						return true
					})
					resolve()
				} catch (e) {
					console.log("getApplyStateByActivityIds 出错")
					sleep(1000)
					getApplyStateByActivityIds()
					resolve()
				} finally {
					
					
				}
			})
		})
	}

	let list = []
	for (let good of $.goodList) {
		list.push(good.id)
		if (list.length == args.pageSize) {
			await opt(list)
			list.length = 0
		}
	}
	if (list.length) await opt(list)
}

function canTry(good) {
	return new Promise((resolve, reject) => {
		let ret = false
		$.get(taskurl(`${selfDomain}/activity?id=${good.id}`), (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					ret = data.indexOf('trySku') != -1
					let result = data.match(/"shopId":(\d+)/)
					if (result) {
						good.shopId = eval(result[1])
					}
				}
				resolve(ret)
			} catch (e) {
				console.log("cantry 出错")
				sleep(1000)
				canTry(good)
				resolve(true)
			} finally {
				
			}
		})
	})
}

function isFollowed(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfDomain}/isFollowed?id=${good.shopId}`, good.id), (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
					resolve(false)
				} else {
					data = JSON.parse(data)
					resolve(data.success && data.data)
				}
			} catch (e) {
				console.log("isfollow出错");
				sleep(1000)
				isFollowed(good);
				resolve(true)
			} finally {
			}
		})
	})
}

function followShop(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfDomain}/followShop?id=${good.shopId}`, good.id), (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
					resolve(false)
				} else {
					data = JSON.parse(data)
					if (data.code == 'F0410') {
						$.running = false
						$.stopMsg = data.msg || "关注数超过上限了哦~先清理下关注列表吧"
					}
					resolve(data.success && data.data)
				}
			} catch (e) {
				console.log("followShop  出错")
				sleep(1000)
				followShop(good);
				resolve(true)
			} finally {
				
			}
		})
	})
}

async function tryGoodList() {
	console.log(`⏰ 即将申请 ${$.goodList.length} 个商品`)
	$.running = true
	$.stopMsg = '申请完毕'
	for (let i = 0; i < $.goodList.length && $.running; i++) {
		let good = $.goodList[i]
		if (!await canTry(good)) continue
		// 如果没有关注且关注失败
		if (good.shopId && !await isFollowed(good) && !await followShop(good)) continue
		// 两个申请间隔不能太短，放在下面有利于确保 follwShop 完成
		await $.wait(5000)
		// 关注完毕，即将试用
		await doTry(good)
	}
}

async function doTry(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfDomain}/migrate/apply?activityId=${good.id}&source=1&_s=m`, good.id), (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success) {
						$.totalTry += 1
						console.log(`🥳 ${good.id} 🛒${good.trialName.substr(0,15)}🛒 ${data.message}`)
					} else if (data.code == '-131') { // 每日300个商品
						$.stopMsg = data.message
						$.running = false
					} else {
						console.log(`🤬 ${good.id} 🛒${good.trialName.substr(0,15)}🛒 ${JSON.stringify(data)}`)
					}
				}
				resolve()
			} catch (e) {
				console.log("dotry出错")
				sleep(1000)
				doTry(good)
				resolve()
			} finally {
				
			}
		})
	})
}

async function getSuccessList() {
	// 一页12个商品，不会吧不会吧，不会有人一次性中奖12个商品吧？！🤔
	return new Promise((resolve, reject) => {
		const option = {
			url: `https://try.jd.com/my/tryList?selected=2&page=1&tryVersion=2&_s=m`,
			headers: {
				'Host': 'try.jd.com',
				'Connection': 'keep-alive',
				'UserAgent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				'Accept': '*/*',
				'Referer': 'https://try.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'zh,zh-CN;q=0.9,en;q=0.8',
				'Cookie': $.cookie
			}
		}
		$.get(option, (err, resp, data) => {
			try {
				if (err) {
					console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success && data.data) {
						$.successList = data.data.data.filter(item => {
							if(item.text.text.indexOf('请尽快领取') != -1)
							{
								try{
									console.log(item.trialName);
								}catch(e)
								{
									
								}
								return true;
							}
							return false;
						})
					} else {
						console.log(`💩 获得成功列表失败: ${data.message}`)
					}
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve()
			}
		})
	})
}

async function showMsg() {
	let message = `京东账号${$.index} ${$.nickName || $.UserName}\n🎉 本次申请：${$.totalTry}/${$.totalGoods}个商品🛒\n🎉 ${$.successList.length}个商品待领取🤩\n🎉 结束原因：${$.stopMsg}`
	if (!args.jdNotify || args.jdNotify === 'false') {
		$.msg($.name, ``, message, {
			"open-url": 'https://try.m.jd.com/user'
		})
		await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, message)
	} else {
		console.log(message)
	}
}

function taskurl(url, goodId) {
	return {
		'url': url,
		'headers': {
			'Host': 'try.m.jd.com',
			'Accept-Encoding': 'gzip, deflate, br',
			'Cookie': $.cookie,
			'Connection': 'keep-alive',
			'Accept': '*/*',
			'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
         		'Accept-Language': 'zh-cn',
			'Referer': goodId ? `https://try.m.jd.com/activity/?id=${goodId}` : undefined
		},
	}
}

// function totalBean() {
// 	return new Promise(async resolve => {
// 		const options = {
// 			"url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
// 			"headers": {
// 				"Accept": "application/json,text/plain, */*",
// 				"Content-Type": "application/x-www-form-urlencoded",
// 				"Accept-Encoding": "gzip, deflate, br",
// 				"Accept-Language": "zh-cn",
// 				"Connection": "keep-alive",
// 				"Cookie": $.cookie,
// 				"Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
// 				"User-Agent": $.isNode() ? ( process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : ( require( './USER_AGENTS' ).USER_AGENT ) ) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
// 			},
// 			"timeout": 10000,
// 		}
// 		$.post(options, (err, resp, data) => {
// 			try {
// 				if (err) {
// 					console.log(`${JSON.stringify(err)}`)
// 					console.log(`${$.name} API请求失败，请检查网路重试`)
// 				} else {
// 					console.warn( "|||||||||||=====,,,,", data);
// 					if (data) {
// 						data = JSON.parse(data);
// 						if (data['retcode'] === 13) {
// 							$.isLogin = false; //cookie过期
// 							return
// 						}
// 						if (data['retcode'] === 0) {
// 							$.nickName = (data['base'] && data['base'].nickname) || $.UserName;
// 						} else {
// 							$.nickName = $.UserName
// 						}
// 					} else {
// 						console.log(`京东服务器返回空数据`)
// 					}
// 				}
// 			} catch (e) {
// 				$.logErr(e, resp)
// 			} finally {
// 				resolve();
// 			}
// 		})
// 	})
// }
function totalBean () {
	return new Promise( async resolve => {
		const options = {
			url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
			headers: {
				Host: "me-api.jd.com",
				Accept: "*/*",
				Connection: "keep-alive",
				Cookie: $.cookie,
				"User-Agent": $.isNode() ? ( process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : ( require( './USER_AGENTS' ).USER_AGENT ) ) : ( $.getdata( 'JDUA' ) ? $.getdata( 'JDUA' ) : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1" ),
				"Accept-Language": "zh-cn",
				"Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
				"Accept-Encoding": "gzip, deflate, br"
			}
		}
		$.get( options, ( err, resp, data ) => {
			try {
				if ( err ) {
					$.logErr( err )
				} else {
					if ( data ) {
						data = JSON.parse( data );
						if ( data[ 'retcode' ] === "1001" ) {
							$.isLogin = false; //cookie过期
							return;
						}
						if ( data[ 'retcode' ] === "0" && data.data && data.data.hasOwnProperty( "userInfo" ) ) {
							$.nickName = data.data.userInfo.baseInfo.nickname;
						}
						if ( data[ 'retcode' ] === '0' && data.data && data.data[ 'assetInfo' ] ) {
							$.beanCount = data.data && data.data[ 'assetInfo' ][ 'beanNum' ];
						}
					} else {
						$.log( '京东服务器返回空数据' );
					}
				}
			} catch ( e ) {
				$.logErr( e )
			} finally {
				resolve();
			}
		} )
	} )
}

function jsonParse(str) {
	if (typeof str == "string") {
		try {
			return JSON.parse(str);
		} catch (e) {
			console.log(e);
			$.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
			return [];
		}
	}
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
        return;
        }
}

// 来自 @chavyleung 大佬
// https://raw.githubusercontent.com/chavyleung/scripts/master/Env.js
function Env(name, opts) {
	class Http {
		constructor(env) {
			this.env = env
		}

		send(opts, method = 'GET') {
			opts = typeof opts === 'string' ? {
				url: opts
			} : opts
			let sender = this.get
			if (method === 'POST') {
				sender = this.post
			}
			return new Promise((resolve, reject) => {
				sender.call(this, opts, (err, resp, body) => {
					if (err) reject(err)
					else resolve(resp)
				})
			})
		}

		get(opts) {
			return this.send.call(this.env, opts)
		}

		post(opts) {
			return this.send.call(this.env, opts, 'POST')
		}
	}

	return new(class {
		constructor(name, opts) {
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

		isNode() {
			return 'undefined' !== typeof module && !!module.exports
		}

		isQuanX() {
			return 'undefined' !== typeof $task
		}

		isSurge() {
			return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
		}

		isLoon() {
			return 'undefined' !== typeof $loon
		}

		toObj(str, defaultValue = null) {
			try {
				return JSON.parse(str)
			} catch {
				return defaultValue
			}
		}

		toStr(obj, defaultValue = null) {
			try {
				return JSON.stringify(obj)
			} catch {
				return defaultValue
			}
		}

		getjson(key, defaultValue) {
			let json = defaultValue
			const val = this.getdata(key)
			if (val) {
				try {
					json = JSON.parse(this.getdata(key))
				} catch {}
			}
			return json
		}

		setjson(val, key) {
			try {
				return this.setdata(JSON.stringify(val), key)
			} catch {
				return false
			}
		}

		getScript(url) {
			return new Promise((resolve) => {
				this.get({
					url
				}, (err, resp, body) => resolve(body))
			})
		}

		runScript(script, runOpts) {
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

		loaddata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require('fs')
				this.path = this.path ? this.path : require('path')
				const curDirDataFilePath = this.path.resolve(this.dataFile)
				const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
				const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
				const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
				if (isCurDirDataFile || isRootDirDataFile) {
					const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
					try {
						return JSON.parse(this.fs.readFileSync(datPath))
					} catch (e) {
						return {}
					}
				} else return {}
			} else return {}
		}

		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require('fs')
				this.path = this.path ? this.path : require('path')
				const curDirDataFilePath = this.path.resolve(this.dataFile)
				const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
				const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
				const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
				const jsondata = JSON.stringify(this.data)
				if (isCurDirDataFile) {
					this.fs.writeFileSync(curDirDataFilePath, jsondata)
				} else if (isRootDirDataFile) {
					this.fs.writeFileSync(rootDirDataFilePath, jsondata)
				} else {
					this.fs.writeFileSync(curDirDataFilePath, jsondata)
				}
			}
		}

		lodash_get(source, path, defaultValue = undefined) {
			const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
			let result = source
			for (const p of paths) {
				result = Object(result)[p]
				if (result === undefined) {
					return defaultValue
				}
			}
			return result
		}

		lodash_set(obj, path, value) {
			if (Object(obj) !== obj) return obj
			if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
			path
				.slice(0, -1)
				.reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
					path[path.length - 1]
				] = value
			return obj
		}

		getdata(key) {
			let val = this.getval(key)
			// 如果以 @
			if (/^@/.test(key)) {
				const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
				const objval = objkey ? this.getval(objkey) : ''
				if (objval) {
					try {
						const objedval = JSON.parse(objval)
						val = objedval ? this.lodash_get(objedval, paths, '') : val
					} catch (e) {
						val = ''
					}
				}
			}
			return val
		}

		setdata(val, key) {
			let issuc = false
			if (/^@/.test(key)) {
				const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
				const objdat = this.getval(objkey)
				const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
				try {
					const objedval = JSON.parse(objval)
					this.lodash_set(objedval, paths, val)
					issuc = this.setval(JSON.stringify(objedval), objkey)
				} catch (e) {
					const objedval = {}
					this.lodash_set(objedval, paths, val)
					issuc = this.setval(JSON.stringify(objedval), objkey)
				}
			} else {
				issuc = this.setval(val, key)
			}
			return issuc
		}

		getval(key) {
			if (this.isSurge() || this.isLoon()) {
				return $persistentStore.read(key)
			} else if (this.isQuanX()) {
				return $prefs.valueForKey(key)
			} else if (this.isNode()) {
				this.data = this.loaddata()
				return this.data[key]
			} else {
				return (this.data && this.data[key]) || null
			}
		}

		setval(val, key) {
			if (this.isSurge() || this.isLoon()) {
				return $persistentStore.write(val, key)
			} else if (this.isQuanX()) {
				return $prefs.setValueForKey(val, key)
			} else if (this.isNode()) {
				this.data = this.loaddata()
				this.data[key] = val
				this.writedata()
				return true
			} else {
				return (this.data && this.data[key]) || null
			}
		}

		initGotEnv(opts) {
			this.got = this.got ? this.got : require('got')
			this.cktough = this.cktough ? this.cktough : require('tough-cookie')
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
			if (opts) {
				opts.headers = opts.headers ? opts.headers : {}
				if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
					opts.cookieJar = this.ckjar
				}
			}
		}

		get(opts, callback = () => {}) {
			if (opts.headers) {
				delete opts.headers['Content-Type']
				delete opts.headers['Content-Length']
			}
			if (this.isSurge() || this.isLoon()) {
				if (this.isSurge() && this.isNeedRewrite) {
					opts.headers = opts.headers || {}
					Object.assign(opts.headers, {
						'X-Surge-Skip-Scripting': false
					})
				}
				$httpClient.get(opts, (err, resp, body) => {
					if (!err && resp) {
						resp.body = body
						resp.statusCode = resp.status
					}
					callback(err, resp, body)
				})
			} else if (this.isQuanX()) {
				if (this.isNeedRewrite) {
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
			} else if (this.isNode()) {
				this.initGotEnv(opts)
				this.got(opts)
					.on('redirect', (resp, nextOpts) => {
						try {
							if (resp.headers['set-cookie']) {
								const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
								if (ck) {
									this.ckjar.setCookieSync(ck, null)
								}
								nextOpts.cookieJar = this.ckjar
							}
						} catch (e) {
							this.logErr(e)
						}
						// this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
					})
					.then(
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

		post(opts, callback = () => {}) {
			// 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
			if (opts.body && opts.headers && !opts.headers['Content-Type']) {
				opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
			}
			if (opts.headers) delete opts.headers['Content-Length']
			if (this.isSurge() || this.isLoon()) {
				if (this.isSurge() && this.isNeedRewrite) {
					opts.headers = opts.headers || {}
					Object.assign(opts.headers, {
						'X-Surge-Skip-Scripting': false
					})
				}
				$httpClient.post(opts, (err, resp, body) => {
					if (!err && resp) {
						resp.body = body
						resp.statusCode = resp.status
					}
					callback(err, resp, body)
				})
			} else if (this.isQuanX()) {
				opts.method = 'POST'
				if (this.isNeedRewrite) {
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
			} else if (this.isNode()) {
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
		time(fmt) {
			let o = {
				'M+': new Date().getMonth() + 1,
				'd+': new Date().getDate(),
				'H+': new Date().getHours(),
				'm+': new Date().getMinutes(),
				's+': new Date().getSeconds(),
				'q+': Math.floor((new Date().getMonth() + 3) / 3),
				'S': new Date().getMilliseconds()
			}
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (new Date().getFullYear() + '').substr(4 - RegExp.$1.length))
			for (let k in o)
				if (new RegExp('(' + k + ')').test(fmt))
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
		msg(title = name, subt = '', desc = '', opts) {
			const toEnvOpts = (rawopts) => {
				if (!rawopts) return rawopts
				if (typeof rawopts === 'string') {
					if (this.isLoon()) return rawopts
					else if (this.isQuanX()) return {
						'open-url': rawopts
					}
					else if (this.isSurge()) return {
						url: rawopts
					}
					else return undefined
				} else if (typeof rawopts === 'object') {
					if (this.isLoon()) {
						let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
						let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
						return {
							openUrl,
							mediaUrl
						}
					} else if (this.isQuanX()) {
						let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
						let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
						return {
							'open-url': openUrl,
							'media-url': mediaUrl
						}
					} else if (this.isSurge()) {
						let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
						return {
							url: openUrl
						}
					}
				} else {
					return undefined
				}
			}
			if (!this.isMute) {
				if (this.isSurge() || this.isLoon()) {
					$notification.post(title, subt, desc, toEnvOpts(opts))
				} else if (this.isQuanX()) {
					$notify(title, subt, desc, toEnvOpts(opts))
				}
			}
			if (!this.isMuteLog) {
				let logs = ['', '==============📣系统通知📣==============']
				logs.push(title)
				subt ? logs.push(subt) : ''
				desc ? logs.push(desc) : ''
				console.log(logs.join('\n'))
				this.logs = this.logs.concat(logs)
			}
		}

		log(...logs) {
			if (logs.length > 0) {
				this.logs = [...this.logs, ...logs]
			}
			console.log(logs.join(this.logSeparator))
		}

		logErr(err, msg) {
			const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
			if (!isPrintSack) {
				this.log('', `❗️${this.name}, 错误!`, err)
			} else {
				this.log('', `❗️${this.name}, 错误!`, err.stack)
			}
		}

		wait(time) {
			return new Promise((resolve) => setTimeout(resolve, time))
		}

		done(val = {}) {
			const endTime = new Date().getTime()
			const costTime = (endTime - this.startTime) / 1000
			this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
			this.log()
			if (this.isSurge() || this.isQuanX() || this.isLoon()) {
				$done(val)
			}
		}
	})(name, opts)
}
