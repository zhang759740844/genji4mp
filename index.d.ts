declare class BasePage {
  constructor ()
  mixinLifeCycle (funcObjc: any): any
  mixinAction (funcObjc: any): any
  register (props: any, data: any, lifeCycle: any, privateMethod: any, viewAction: any, computed?: any, watch?: any): any
}

declare class BaseService {
  constructor ()
  router: object
  app: any
  registerEvent (eventName: string, callback: (data: any) => void): void
  resignEvent (eventName: string): void
  executeEvent (eventName: string, data: any): void
  reLaunch (baseUrl: string, params: any): void
  navigateTo (baseUrl: string, params: any): void
  redirectTo (baseUrl: string, params: any): void
  switchTab (baseUrl: string): void
  navigateBack (delta?: number, data?: any, hintString?: string, icon?: string): void
  registerRouter(routers: Array<string>, moduleName?: string): void
}

export let $Page: BasePage
export let $wx: BaseService
export let settinghelper: (funcName: string, info?: string, authorizeLevel?: number, data?: object) => Promise<void>