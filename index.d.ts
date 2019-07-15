declare interface LifeCycle {
  onLoad: (param: object) => void
  onReady: () => void
  onShow: () => void
  onHide: () => void
  onUnload: () => void
  onPullDownRefresh: () => void
  onReachBottom: () => void
  onShareAppMessage: () => void
  onPageScroll: () => void
  onTabItemTap: (item: any) => void
  onNavigateBack: (param: object) => void
}

declare class BasePage {
  constructor ()
  mixinLifeCycle (funcObjc: object): void
  mixinAction (funcObjc: object): void
  register (props?: object, data?: object, lifeCycle?: object, privateMethod?: object, viewAction?: object, computed?: object, watch?: object): object
}

declare class BaseService {
  constructor ()
  router: object
  app: any
  registerEvent (eventName: string, callback: (data: object) => void): void
  resignEvent (eventName: string): void
  executeEvent (eventName: string, data: object): void
  reLaunch (baseUrl: string, params: object): void
  navigateTo (baseUrl: string, params: object): void
  redirectTo (baseUrl: string, params: object): void
  switchTab (baseUrl: string): void
  navigateBack (delta?: number, data?: object, hintString?: string, icon?: string): void
  registerRouter(routers: Array<string>, moduleName?: string): void
}

export let $Page: BasePage
export let $wx: BaseService
export let settinghelper: (funcName: string, info?: string, authorizeLevel?: number, data?: object) => Promise<void>