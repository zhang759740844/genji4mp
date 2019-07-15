/**
 * 调用微信需要授权的接口
 *
 * @export
 * @param {String} funcName 微信的API名
 * @param {String} info 提示信息
 * @param {Number} [authorizeLevel = 0] 授权方式 0，1，2。1，弱授权，弹提示，并且跳转到 setting 界面；2，强授权，如果没有设置成功，一直跳转 setting。默认为最弱授权
 * @param {Object} [data = {}]  微信API需要提供的字段
 * @returns 返回一个执行结果的 Promise
 */
export default function authorizeWXAPI (funcName, info = '我们需要您的授权', authorizeLevel = 0, data = {}) {
  return new Promise((resolve, reject) => {
    // 调用相关 api，如定位
    wx[funcName]({
      ...data,
      success: resolve,
      fail: res => {
        if (authorizeLevel === 0) {
          // 最弱授权，执行失败回调
          reject(res)
        } else {
          wx.showModal({
            title: '请授权',
            content: info,
            showCancel: false,
            success: res => {
              wx.openSetting({
                success: res => {
                  if (authorizeLevel === 2) {
                    // 强授权，继续调用自己
                    authorizeWXAPI(funcName, info, 2, data).then(resolve).catch(reject)
                  } else {
                    // 弱授权变为最弱授权
                    authorizeWXAPI(funcName, info, 0, data).then(resolve).catch(reject)
                  }
                }
              })
            }
          })
        }
      }
    })
  })
}
