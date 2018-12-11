function _getUrl (baseUrl, params={}) {
  return baseUrl + '?param=' + JSON.stringify(params)
}

class BaseService {
  constructor () {
    this.router = {}
    this.app = null
  }


  reLaunch (baseUrl, params) {
    return new Promise((res, rej) => {
      wx.reLaunch({
        url: _getUrl(baseUrl, params),
        success: res,
        fail: rej
      })
    })
  }

  navigateTo (baseUrl, params) {
    return new Promise((res, rej) => {
      wx.navigateTo({
        url: _getUrl(baseUrl, params),
        success: res,
        fail: rej
      })
    })
  }

  redirectTo (baseUrl, params) {
    return new Promise((res, rej) => {
      wx.redirectTo({
        url: _getUrl(baseUrl, params),
        success: res,
        fail: rej
      })
    }) 
  }

  switchTab (baseUrl) {
    return new Promise((res, rej) => {
      wx.switchTab({
        url: baseUrl,
        success: res,
        fail: rej
      })
    })  
  }

  switchTabTo (baseUrl, nextUrl, params={}) {
    return this.switchTab(baseUrl).then(() => {
      this.navigateTo(nextUrl, params)
    })
  }

  navigateBack (delta=1, data = {}) {
    let param = {}
    if (typeof(delta) === 'object') {
      // 原始小程序的返回
      param = delta
    } else if (JSON.stringify(data) === "{}") {
      // 只设置了返回级数的返回
      param = {delta}
    } else {
      // 设置之前的数据
      param = {delta}
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - delta - 1]
      if (!prevPage.hasOwnProperty('onNavigateBack')) {
        console.error('zachary 抛出: 上级页面未实现 onNavigateBack 方法接收参数')
      } else {
        prevPage.onNavigateBack(data)
      }
    }
    return new Promise((res, rej) => {
      wx.navigateBack({
        ...param,
        success: res,
        fail: rej
      })
    })
  }

  registerRouter (routers) {
    for (const key in routers) {
      if (routers.hasOwnProperty(key)) {
        const element = routers[key];
        this.router[key] = `/pages/${element}/${element}`
      }
    }
  }
}

const $wx = new BaseService()

export default new Proxy($wx, {
  get: function (target, property) {
    if (property in target) {
      if (property === 'app') {
        return getApp()
      }
      return target[property]
    } else if (property in wx) {
      return (param = {}) => {
        return new Promise((resolve, reject) => {
          param.success = (...args) => resolve(...args)
          param.fail = (...args) => reject(...args)
          wx[property](param)
        })
      }
    } else {
      throw new Error('zachary 抛出：' + property + '不存在')
    }
  }  
})