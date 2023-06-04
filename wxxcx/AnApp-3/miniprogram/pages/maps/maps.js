Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    // 获取位置
    getlocation(){
        wx.getLocation({
          success(e){
              console.log("当前位置经度"+e.longitude);
              console.log("当前位置纬度"+e.latitude);
          }
        })
    },
    chooselocation(){
        wx.chooseLocation({
          latitude: 0,
          success(e){
              console.log(e);
          }
        })
    }

})