declare interface BaseRouter {}
declare interface BaseParam {

}

declare interface PageInstance {
  props?: any,
  data?: any,
  setData?: (param: object) => void
  setState?: (param: object) => void
  refreshPage?: () => void
  [someFunc: string]: any
}

declare interface LifeCycle extends PageInstance {
  onLoad?: (param?: any) => void
  onReady?: () => void
  onShow?: () => void
  onHide?: () => void
  onUnload?: () => void
  onPullDownRefresh?: () => void
  onReachBottom?: () => void
  onShareAppMessage?: () => void
  onPageScroll?: () => void
  onTabItemTap?: (item?: any) => void
  onNavigateBack?: (param?: any) => void
}

declare namespace Genji4mp {
  class BasePage {
    constructor ()
    mixinLifeCycle (funcObjc: LifeCycle): void
    register (props?: object, data?: object, lifeCycle?: LifeCycle, privateMethod?: PageInstance, viewAction?: PageInstance, computed?: object, watch?: object): void
  }

  class BaseService {
    constructor ()
    router: BaseRouter
    registerEvent (eventName: string, callback: (data: any) => void): void
    resignEvent (eventName: string): void
    executeEvent (eventName: string, data: any): void
    reLaunch (baseUrl: string, params: BaseParam): void
    navigateTo (baseUrl: string, params: BaseParam): void
    redirectTo (baseUrl: string, params: BaseParam): void
    switchTab (baseUrl: string): void
    navigateBack (delta?: number, data?: BaseParam, hintString?: string, icon?: string): void
    registerRouter(router: BaseRouter, moduleName?: string): void
  }
}

export let $Page: Genji4mp.BasePage
export let $wx: Genji4mp.BaseService
export let settinghelper: (funcName: string, info?: string, authorizeLevel?: number, data?: object) => Promise<void>