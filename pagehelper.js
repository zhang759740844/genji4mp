function isObject (key, obj) {
  if (typeof obj !== 'object') {
    throw new Error(`zachary 抛出:${key} 必须是一个对象`)
  }
}


class BasePage {
  constructor () {
    this._mixins = {}
  }
  mixinLifeCycle (funcObjc) {
    this._mixins = funcObjc
  }
  mixinAction (funcObjc) {

  }
  /**
   * 生成Page的方法
   * @param {object} props 不影响UI对象
   * @param {object} data 影响UI对象
   * @param {object} lifeCycle 生命周期对象
   * @param {object} privateMethod 私有方法对象
   * @param {object} viewAction UI点击事件对象
   */
  register (props = {}, data = {}, lifeCycle = {}, privateMethod = {}, viewAction = {}, computed = {}, watch = {}) {
    isObject('props', props) && isObject('data', data) && isObject('lifeCycle', lifeCycle) && isObject('privateMethod', privateMethod) && isObject('viewAction', viewAction) && isObject('computed', computed) && isObject('watch', watch)
  
    let lifeCycleObject = {}
    !!lifeCycle && Object.keys(lifeCycle).forEach(key => {
      let hasMethod = false
      for (const mixKey in this._mixins) {
        const element = this._mixins[mixKey];
        if (key === mixKey) {
          hasMethod = true
          lifeCycleObject[key] = function (...param) {
            if (param[0].param) {
              param[0] = JSON.parse(decodeURIComponent(param[0].param))
            }
            element.apply(this, param)
            lifeCycle[key].apply(this, param)
          }
        }
      }
      if (!hasMethod) {
        lifeCycleObject[key] = lifeCycle[key]
      }
    })

    let onLoad = lifeCycleObject['onLoad'] 
    if (onLoad) {
      const originalOnLoad = onLoad
      onLoad = function (...onLoadParam) {
        // 初始化计算属性
        for (const key in computed) {
          if (computed.hasOwnProperty(key)) {
            const element = computed[key];
            const result = element.apply(this, [this.data])
            this.setData({ [key]: result })
          }
        }

        const originalSetData = this.setData
        // 替换原来的 setData
        this.setData = function (...param) {
          for (const key in computed) {
            if (computed.hasOwnProperty(key)) {
              const element = computed[key];
              const result = element.apply(this, [Object.assign({}, this.data, param[0])])
              console.log(param)
              originalSetData.apply(this, [Object.assign(param[0], {[key]: result}), param[1] || function(){}])
            }
          }
        }
        originalOnLoad.apply(this, onLoadParam)
      }
      lifeCycleObject['onLoad'] = onLoad
    }


  
    let privateMethodObject = {}
    !!privateMethod && Object.keys(privateMethod).forEach(function (key) {
      privateMethodObject[key] = privateMethod[key]
    })
  
    let actionsObject = {}
    !!actionsObject && Object.keys(viewAction).forEach(function (key) {
      let action = viewAction[key]
      actionsObject[key] = function (...args) {
        if (!!args[0] && typeof (args[0].detail) !== 'undefined' ) {
          // 小程序调用
          let e = args[0]
          let detail = {}
          detail = e.detail.hasOwnProperty('value') ? e.detail.value : e.detail
          if (!!e.detail.formId) {
            detail.formId = e.detail.formId
          }
          action.call(this, e.currentTarget.dataset || {}, detail)
        } else {
          // 自己调用
          console.warn('zachary 抛出，不应把非 action 方法放在 aciton 区域')
          action.call(this, args)
        }
      }
    })
  
    const pageObject = {props, data, ...privateMethodObject, ...actionsObject, ...lifeCycleObject}
  
    Page(pageObject)
  }
}

export default new BasePage()