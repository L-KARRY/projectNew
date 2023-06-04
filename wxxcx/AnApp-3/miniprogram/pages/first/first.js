// 日记聚合页
// const config = require("./config");

var app = getApp();
const db = wx.cloud.database()
var util = require("../../utils/util")
var wxCharts = require('../../utils/wxcharts-min.js');

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        spotMap: { //标点的日期
            type: Object,
            value: {}
        },
        defaultTime: { //标记的日期，默认为今日
            type: String,
            value: ''
        },
        title: { //标题
            type: String,
            value: ''
        },
        goNow: { // 是否有快速回到今天的功能
            type: Boolean,
            value: true,
        },
        signedList: {
            type: Array,
            value: [],
            observer(newData, oldData) {
              let list = []
              for (let index = 0; index < newData.length; index++) {
                let element = newData[index];
                element = new Date(this.formatIosDate(element))
                element = this.formatTime(element)
                list.push(element)
              }
              this.setData({
                formatSignedList: list
              })
            }
          }
    },

    /**
     * 组件的初始数据
     */
    data: {
        selectDay: {}, //选中时间
        nowDay: {}, //现在时间
        open: false,
        swiperCurrent: 1, //选中时间
        oldCurrent: 1, //之前选中时间
        dateList0: [], //0位置的日历数组
        dateList1: [], //1位置的日历数组
        dateList2: [], //2位置的日历数组
        swiperDuration: 500,
        swiperHeight: 0,
        backChange: false, //跳过change切换
        showModal: false,
        // 预算
        //本月预算
        budget: 0,
        //本月消费
        monthSpend: 0,
        //今日消费
        todaySpend: 0,
        //日均消费
        avgSpendPerDay: 0,
        //本月剩余
        monthAvailable: 0,
        //日均可用
        dayAvgAvailable: 0,
        //距离月末
        monthLeftDay: 0,
        //使用比例
        usagePercentage: 0,
        //是否超支
        isOverSpend: false,
        Number: 0,
        List: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        swiperChange(e) { // 日历滑动时触发的方法
            if (this.data.backChange) {
                this.setData({
                    backChange: false
                })
                return
            }
            //计算第三个索引
            let rest = 3 - e.detail.current - this.data.oldCurrent
            let dif = e.detail.current - this.data.oldCurrent
            let date
            if (dif === -2 || (dif > 0 && dif !== 2)) { //向右划的情况，日期增加
                if (this.data.open) {
                    date = new Date(this.data.selectDay.year, this.data.selectDay.month)
                    this.setMonth(date.getFullYear(), date.getMonth() + 1, undefined)
                    this.getIndexList({
                        setYear: this.data.selectDay.year,
                        setMonth: this.data.selectDay.month,
                        dateIndex: rest
                    })
                } else {
                    date = new Date(this.data.selectDay.year, this.data.selectDay.month - 1, this.data.selectDay.day + 7)
                    this.setMonth(date.getFullYear(), date.getMonth() + 1, date.getDate())
                    this.getIndexList({
                        setYear: this.data.selectDay.year,
                        setMonth: this.data.selectDay.month - 1,
                        setDay: this.data.selectDay.day + 7,
                        dateIndex: rest
                    })
                }
            } else { //向左划的情况，日期减少
                if (this.data.open) {
                    date = new Date(this.data.selectDay.year, this.data.selectDay.month - 2)
                    this.setMonth(date.getFullYear(), date.getMonth() + 1, undefined)
                    this.getIndexList({
                        setYear: this.data.selectDay.year,
                        setMonth: this.data.selectDay.month - 2,
                        dateIndex: rest
                    })
                } else {
                    date = new Date(this.data.selectDay.year, this.data.selectDay.month - 1, this.data.selectDay.day - 7)
                    this.setMonth(date.getFullYear(), date.getMonth() + 1, date.getDate())
                    this.getIndexList({
                        setYear: this.data.selectDay.year,
                        setMonth: this.data.selectDay.month - 1,
                        setDay: this.data.selectDay.day - 7,
                        dateIndex: rest
                    })
                }
            }
            this.setData({
                oldCurrent: e.detail.current
            })
            this.setSwiperHeight(e.detail.current)
        },
        setSwiperHeight(index) { // 根据指定位置数组的大小计算长度
            this.setData({
                swiperHeight: this.data[`dateList${index}`].length / 7 * 82 + 18
            })
        },
        //更新指定的索引和月份的列表
        getIndexList({
            setYear,
            setMonth,
            setDay = void 0,
            dateIndex
        }) {
            let appointMonth
            if (setDay)
                appointMonth = new Date(setYear, setMonth, setDay)
            else
                appointMonth = new Date(setYear, setMonth)
            let listName = `dateList${dateIndex}`
            this.setData({
                [listName]: this.dateInit({
                    setYear: appointMonth.getFullYear(),
                    setMonth: appointMonth.getMonth() + 1,
                    setDay: appointMonth.getDate(),
                    hasBack: true
                }),
            })
        },
        //设置月份
        setMonth(setYear, setMonth, setDay) {
            const day = Math.min(new Date(setYear, setMonth, 0).getDate(), this.data.selectDay.day)
            if (this.data.selectDay.year !== setYear || this.data.selectDay.month !== setMonth) {
                const data = {
                    selectDay: {
                        year: setYear,
                        month: setMonth,
                        day: setDay ? setDay : day
                    },
                }
                if (!setDay) {
                    data.open = true
                }
                this.setData(data, () => {
                    this.triggerEvent("selectDay", this.data.selectDay)
                })
            } else {
                const data = {
                    selectDay: {
                        year: setYear,
                        month: setMonth,
                        day: setDay ? setDay : day
                    },
                }
                this.setData(data, () => {
                    this.triggerEvent("selectDay", this.data.selectDay)
                })
            }
        },
        //展开收起
        openChange() {
            this.setData({
                open: !this.data.open
            })
            this.triggerEvent("aaa", {
                a: 0
            })
            // 更新数据
            const selectDate = new Date(this.data.selectDay.year, this.data.selectDay.month - 1, this.data.selectDay.day)
            if (this.data.oldCurrent === 0) {
                this.updateList(selectDate, -1, 2)
                this.updateList(selectDate, 0, 0)
                this.updateList(selectDate, 1, 1)
            } else if (this.data.oldCurrent === 1) {
                this.updateList(selectDate, -1, 0)
                this.updateList(selectDate, 0, 1)
                this.updateList(selectDate, 1, 2)
            } else if (this.data.oldCurrent === 2) {
                this.updateList(selectDate, -1, 1)
                this.updateList(selectDate, 0, 2)
                this.updateList(selectDate, 1, 0)
            }
            this.setSwiperHeight(this.data.oldCurrent)
        },
        // 选中并切换今日日期
        switchNowDate() {
            const now = new Date()
            const selectDate = new Date(this.data.selectDay.year, this.data.selectDay.month - 1, this.data.selectDay.day)
            let dateDiff = (selectDate.getFullYear() - now.getFullYear()) * 12 + (selectDate.getMonth() - now.getMonth())
            let diff = dateDiff === 0 ? 0 : dateDiff > 0 ? -1 : 1
            const diffSum = (x) => (3 + (x % 3)) % 3
            if (this.data.oldCurrent === 0) {
                this.updateList(now, -1, diffSum(2 + diff))
                this.updateList(now, 0, diffSum(0 + diff))
                this.updateList(now, 1, diffSum(1 + diff))
            } else if (this.data.oldCurrent === 1) {
                this.updateList(now, -1, diffSum(0 + diff))
                this.updateList(now, 0, diffSum(1 + diff))
                this.updateList(now, 1, diffSum(2 + diff))
            } else if (this.data.oldCurrent === 2) {
                this.updateList(now, -1, diffSum(1 + diff))
                this.updateList(now, 0, diffSum(2 + diff))
                this.updateList(now, 1, diffSum(0 + diff))
            }
            this.setData({
                swiperCurrent: diffSum(this.data.oldCurrent + diff),
                oldCurrent: diffSum(this.data.oldCurrent + diff),
                backChange: dateDiff !== 0,
            })
            this.setData({
                selectDay: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate()
                }
            }, () => {
                this.triggerEvent("selectDay", this.data.selectDay)
            })
            this.setSwiperHeight(this.data.oldCurrent)
        },
        //日历主体的渲染方法
        dateInit({
            setYear,
            setMonth,
            setDay = this.data.selectDay.day,
            hasBack = false
        } = {
            setYear: this.data.selectDay.year,
            setMonth: this.data.selectDay.month,
            setDay: this.data.selectDay.day,
            hasBack: false
        }) {
            let dateList = []; //需要遍历的日历数组数据
            let now = new Date(setYear, setMonth - 1) //当前月份的1号
            let startWeek = now.getDay(); //目标月1号对应的星期
            let resetStartWeek = startWeek == 0 ? 6 : startWeek - 1; //重新定义星期将星期天替换为6其余-1
            let dayNum = new Date(setYear, setMonth, 0).getDate() //当前月有多少天
            let forNum = Math.ceil((resetStartWeek + dayNum) / 7) * 7 //当前月跨越的周数
            let selectDay = setDay ? setDay : this.data.selectDay.day
            this.triggerEvent("getDateList", {
                setYear: now.getFullYear(),
                setMonth: now.getMonth() + 1
            })
            if (this.data.open) {
                //展开状态，需要渲染完整的月份
                for (let i = 0; i < forNum; i++) {
                    const now2 = new Date(now)
                    now2.setDate(i - resetStartWeek + 1)
                    let obj = {};
                    obj = {
                        day: now2.getDate(),
                        month: now2.getMonth() + 1,
                        year: now2.getFullYear()
                    };
                    dateList[i] = obj;
                }
            } else {
                //非展开状态，只需要渲染当前周
                for (let i = 0; i < 7; i++) {
                    const now2 = new Date(now)
                    //当前周的7天
                    now2.setDate(Math.ceil((selectDay + (startWeek - 1)) / 7) * 7 - 6 - (startWeek - 1) + i)
                    let obj = {};
                    obj = {
                        day: now2.getDate(),
                        month: now2.getMonth() + 1,
                        year: now2.getFullYear()
                    };
                    dateList[i] = obj;
                }
            }
            if (hasBack) {
                return dateList
            }
            this.setData({
                dateList1: dateList
            })
        },
        //一天被点击时
        selectChange(e) {
            const year = e.currentTarget.dataset.year
            const month = e.currentTarget.dataset.month
            const day = e.currentTarget.dataset.day
            const selectDay = {
                year: year,
                month: month,
                day: day,
            }
            if (this.data.open && (this.data.selectDay.year !== year || this.data.selectDay.month !== month)) {
                if ((year * 12 + month) > (this.data.selectDay.year * 12 + this.data.selectDay.month)) { // 下个月
                    if (this.data.oldCurrent == 2)
                        this.setData({
                            swiperCurrent: 0
                        })
                    else
                        this.setData({
                            swiperCurrent: this.data.oldCurrent + 1
                        })
                } else { // 点击上个月
                    if (this.data.oldCurrent == 0)
                        this.setData({
                            swiperCurrent: 2
                        })
                    else
                        this.setData({
                            swiperCurrent: this.data.oldCurrent - 1
                        })
                }
                this.setData({
                    ['selectDay.day']: day
                }, () => {
                    this.triggerEvent("selectDay", this.data.selectDay)
                })
            } else if (this.data.selectDay.day !== day) {
                this.setData({
                    selectDay: selectDay
                }, () => {
                    this.triggerEvent("selectDay", this.data.selectDay)
                })
            }
        },
        updateList(date, offset, index) {
            if (this.data.open) { //打开状态
                const setDate = new Date(date.getFullYear(), date.getMonth() + offset * 1) //取得当前日期的上个月日期
                this.getIndexList({
                    setYear: setDate.getFullYear(),
                    setMonth: setDate.getMonth(),
                    dateIndex: index
                })
            } else {
                const setDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset * 7) //取得当前日期的七天后的日期
                this.getIndexList({
                    setYear: setDate.getFullYear(),
                    setMonth: setDate.getMonth(),
                    setDay: setDate.getDate(),
                    dateIndex: index
                })
            }
        },

        // 预算
        onAdd: function () {
            wx.cloud.callFunction({
                name: 'login'
            })
            //如果该opendid不存在,则加入
            db.collection("monBudget").where({
                _openid: app.globalData.openid
            }).get().then(
                res => {
                    console.log(app.globalData.openid, "=====================", res)
                    if (res.data.length == 0) {
                        db.collection("monBudget").add({
                            data: {
                                budget: 0
                            }
                        })
                    }
                }
            )

        },

        btnSub(res) {
            wx.cloud.callFunction({
                name: 'login'
            })
            let resValue = res.detail.value
            console.log("resValue", resValue)
            db.collection("monBudget").where({
                _openid: app.globalData.openid
            }).get().then(
                res => {
                    if (res.data.length == 0) {
                        db.collection("monBudget").add({
                            data: {
                                budget: resValue.budget
                            }
                        })
                    } else {
                        db.collection("monBudget").where({
                            _openid: app.globalData.openid
                        }).update({
                            data: resValue
                        }).then(res => {
                            console.log(res)
                        })
                    }
                }
            )

            this.getall();
        },
        //获取全部
        getall: function () {
            var num = this.data.Number
            var that = this
            db.collection('allCost').count().then(res => {
                num = res.total
                this.setData({
                    Number: num
                })
                this.setData({
                    usagePercentage: 100
                })
                const batchTimes = Math.ceil(this.data.Number / 20) //计算需要获取几次  比如你有36条数据就要获取两次 第一次20条第二次16条
                let arraypro = [] // 定义空数组 用来存储每一次获取到的记录 
                let x = 0 //这是一个标识每次循环就+1 当x等于batchTimes 说明已经到了最后一次获取数据的时候
                for (let i = 0; i < batchTimes; i++) {
                    db.collection('allCost').skip(i * 20).get().then(res => {
                        x += 1
                        for (let j = 0; j < res.data.length; j++) {
                            arraypro.push(res.data[j])
                        }
                        if (x == batchTimes) {
                            this.setData({
                                List: arraypro
                            })
                        }
                        var dayspend = 0; //今日消费
                        var monthspend = 0; //本月消费
                        var avgSpendPerDay = 0; //日均消费

                        //已消费
                        var allList = this.data.List;
                        var DATE = util.formDate(new Date());

                        for (var i in allList) {
                            //今日消费
                            //当日期等于今天时,累加
                            if (allList[i].rq == DATE && allList[i].hf != "") {
                                dayspend = dayspend + parseFloat(allList[i].hf)
                            }
                            //本月消费
                            //当年份和月份对应相同时
                            if (allList[i].rq.substring(0, 7) == DATE.substring(0, 7) && allList[i].hf != "") {
                                monthspend = monthspend + parseFloat(allList[i].hf)
                            }

                        }
                        //日均消费
                        avgSpendPerDay = monthspend / parseInt(DATE.substring(8, 10))
                        var monthLeftDay = 0; //本月剩余天数
                        var DATE = util.formDate(new Date())
                        var year = parseInt(DATE.substring(0, 4))
                        var month = parseInt(DATE.substring(5, 7))
                        var day = parseInt(DATE.substring(8, 10))
                        console.log(year, "-----", month, "-----", day)
                        switch (month) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                monthLeftDay = 31 - day;
                                break;
                            case 2:
                                if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)) {
                                    //是闰年,2月有29天
                                    monthLeftDay = 29 - day;
                                    break;
                                } else {
                                    monthLeftDay = 28 - day;
                                    break;
                                }
                                case 4:
                                case 6:
                                case 9:
                                case 11:
                                    monthLeftDay = 30 - day;
                                    break;
                                default:
                                    console.log("此月份error!");
                                    break;
                        }
                        this.setData({
                            monthLeftDay: monthLeftDay, //本月剩余天数
                        })


                        var dayAvgAvailable = 0; //日均可用
                        var monthAvailable = 0; //本月剩余

                        var usagePercentage = 0; //使用比例
                        var isOverSpend = false; //是否超支
                        db.collection("monBudget").get().then(res => {
                            //本月剩余
                            monthAvailable = res.data[0].budget - monthspend;
                            //日均可用
                            // dayAvgAvailable=(monthAvailable/monthLeftDay)>=0?(monthAvailable/monthLeftDay):0;
                            if (monthLeftDay != 0) {
                                dayAvgAvailable = (monthAvailable / monthLeftDay) >= 0 ? (monthAvailable / monthLeftDay) : 0;
                            } else {
                                dayAvgAvailable = monthAvailable >= 0 ? monthAvailable : 0;
                            }

                            this.setData({
                                budget: res.data[0].budget
                            })
                            //是否超支
                            if (monthAvailable <= 0) {
                                isOverSpend = true;
                                usagePercentage = 100;
                            } else {
                                usagePercentage = (1 - (monthAvailable / this.data.budget)).toFixed(3) * 100;
                            }
                            this.setData({
                                isOverSpend: isOverSpend,
                                usagePercentage: usagePercentage.toFixed(2),
                                monthAvailable: monthAvailable.toFixed(2),
                                dayAvgAvailable: dayAvgAvailable.toFixed(2)
                            })
                        })
                        this.setData({
                            todaySpend: dayspend.toFixed(2),
                            monthSpend: monthspend.toFixed(2),
                            avgSpendPerDay: avgSpendPerDay.toFixed(2)
                        })
                    })
                }
            })
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
            this.getall();
        },

        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function () {
            this.onAdd();
            this.getall();

        },

        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function () {
            this.getall();

        },


        /**
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function () {
            this.getall();
        },
        upchange() {
            wx.showModal({
                title: '提示',
                content: '是否更新',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
    },
    lifetimes: {
        attached() {
            let now = this.data.defaultTime ? new Date(this.data.defaultTime) : new Date()
            let selectDay = {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
            this.setData({
                nowDay: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate()
                }
            })
            this.setMonth(selectDay.year, selectDay.month, selectDay.day)
            this.updateList(now, -1, 0)
            this.updateList(now, 0, 1)
            this.updateList(now, 1, 2)
            this.setSwiperHeight(1)
        },

    },
    observers: {}
})