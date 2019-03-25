## Genji4mp

Genji4mp 是一个帮助开发者更快捷开发小程序项目的微形框架，对小程序项目侵入小，只有四个文件，解决小程序日常开发中的一些问题

---

### 小程序开发存在的问题

1. 所有方法和数据都声明在一个对象中交由 Page 注册，无法职责分离。
2. 调用小程序方法的成功和失败回调都需要作为参数传入。
3. 跳转页面需要拼接一个很长的url，比如 `pages/xxxx/xxxx`。
4. 传参不支持对象。并且如果跳转页面的 url 中含有特殊字符比如 `&` 就会被小程序自动拆开当成两个参数。
5. 页面返回无法进行回调以及带回参数。
6. 跨页面的状态只能通过 globalData 传递。
7. 不支持 mixin ，无法做一些统一设置
8. 按钮以及输入等回调需要写很长的诸如 `event.currentTarget.dataset` 或者 `event.detail.value`
9. 缺少类似 vue 的 computed 和 watch 属性
10. 授权麻烦

### 解决方法

#### 1. 更改小程序的注册方法

提供了 `$Page` 对象，将原本小程序 `Page({})` 的注册方式改为：

```js
// 职责分类
const props = {}
const data = {}
const lifecycle = {}
const privateMethods = {}
const viewAction = {}

// 注册对象
$Page.register(props, data, lifecycle, privateMethods, viewAction)
```

- props: 负责页面中不会影响界面显示的参数
- data: 也就是小程序提供的 data，所有与页面相关的数据都存放在这里
- lifecycle: 生命周期相关的方法放在这里
- viewAction: 和页面交互的方法放在这里
- privateMethod: 其他与上面都无关的方法放在这里

这种分类不只是代码规范上的拆分。对于不同职责代码的分类能更容易的对同一类代码进行统一 hook。

#### 2. 更改调用小程序提供方法的方式

提供了 `$wx` 变量，替换调用小程序方法的全局变量 `wx`中。调用方式采用 Promise 替代原来的 success 和 failure 入参。例：

```js
// 原本的小程序调用方式：
wx.navigateTo({url: 'xxx', success: ()=>{}, failure: ()=>{})
// 现在的调用方式：
$wx.navigateTo(url, param).then(() => {
}).catch(err => {
})
```

#### 3. 解决跳转页面需要填写的很长的 url

原本页面需要记住很长的页面路径，以及拼接参数的操作比较繁琐

```js
wx.navigateTo({url: `pages/my-view/my-view?param1=1&param2=2`})
```

现在需要分成几步完成：

1. 在根目录下创建 router.js，写入如有信息：

```js
// router.js
export default {
  myView1: 'my-view1',
  myView2: 'my-view2'
}
```

2. 在小程序的全局注册文件 `app.js` 中注册路由：

```js
import router from 'router'
// app.js
App({
  onLaunch () {
    $wx.registerRouter(router)
  }
})
```

3. 在需要的地方调用跳转方法：

```js
$wx.navigateTo($wx.router.myView1, {param1: 1, param2: 2})
```

#### 4. 小程序传递对象，解决传参时截取参数中的符号

小程序的传参是通过 url 的形式进行的。正常情况下需要将参数拼接到路由的后面。并且如果参数中出现特殊符号，比如 `&`，会被小程序强行截取，下个页面的 `onLoad` 方法中就得不到正确的传参。

```js
$wx.navigateTo($wx.router.myView1, {param1: '1&3', param2: 2})
```

这种方式的参数会先被 encode，然后再下个页面中自动 decode。下个页面中直接获取即可：

```js
onLoad(query) {
  console.log(query.param1)
  console.log(query.param2)
}
```

#### 5. 小程序无页面回调

小程序的页面通信方式其实是匮乏的。我们无法在 navigateTo 下一个页面的时候传入回调方法，并且 `wx.navigateBack()`方法并没有提供默认的回调。

因此，提供了 `$wx.navigateBack()` 方法，实现页面返回刷新状态：

```js
// delta: 要返回的页面数
// data: 返回上一级页面带回去的参数
// hintString: 返回上一级要提示的文字
function navigateBack (delta=1, data={}, hintString) {}
```

这里有两种接收 data 的方式，一种是在上一个页面的 lifecycle 中注册回调方法 `onNavigateBack`：

```js
// 上一个页面
const lifecycle = {
  onNavigateBack (data) {
    console.log(data)
  }
}
```

还有一种是直接通过 `$wx.navigateBack()` 返回的 promise 对象。这个 promise 对象提供了一个上个页面实例的参数：

```js
$wx.navigateBack().then(prevPage => {
  prevPage.setData({})
})
```

在上个页面写回调和直接拿到上个页面的实例操作两种方式各有利弊。前者更符合逻辑，但是如果多个页面都有回调就需要传入 type；后者比较直观，但是直接获取上一个页面的实例影响上一个页面总是不太安全的。需要酌情考虑。

另外，最后提供了一个 `hintString` 参数。是因为有些页面返回之后需要在上一个页面弹出一个结果提示的 Toast。但是如果再当前页面弹出 Toast ，会由于当期那页面快速 pop 出去而快速消失。但是如果在回调方法中写一个 Toast 封装性上又很差，所以额外提供了这样一个入参。

#### 6. 跨页面间无法传参

还是页面间通信的问题。一般我们只能通过 globalData，或者保存到本地解决。

这里提供了一种监听事件的逻辑，通过事件的注册与发送触发：

```js
// 页面 A 中注册事件
$wx.registerEvent('pageANeedCallback', callbackData => {
  console.log(callbackData)
})

// 页面 B 中调用事件
$wx.executeEvent('pageANeedCallback', {string: '来自页面B的数据'})
```

注册的同时不要忘记要在 `onUnload`的时候注销监听，否则会有内存泄露：

```js
onUnload () {
  $wx.resignEvent('pageANeedCallback')
}
```



#### 7. 给生命周期方法注入统一的方法

提供了 mixin 生命周期的方法，可以在想要的生命周期中统一做一些操作，比如初始化某个实例，执行某个方法，页面打点等：

```js
// 注册 App 的时候注入
App({
  onLaunch () {
    $wx.mixinLifeCycle ({
      onLoad: function (query) {
        console.log('注入成功啦，query 为' + JSON.stringify(query))
      }
    })
  }
})
```

注意，这里就不要使用箭头函数了，否则 this 会错误指向。

另外，其实还可以对各种点击事件做响应的 mixin，这是最好的对点击事件埋点的方式。但是暂时没有这个需求，所以没有实现。

#### 8. 小程序点击和输入事件回调的精简

小程序的点击事件和输入事件回调的参数大部分是无用的，一般情况下我们关心的结果都在 `event.currentTarget.dataset` 或者 `event.detail.value`下。所以这里做了精简。在 viewAction 分类中的方法，默认传出的都是 `event.currentTarget.dataset` 或者 `event.detail.value`：

```js
const viewAction = {
  onSomeAction (d, v) {
    console.log('这是 btn 绑定的 data ：' + d.someValue)
    console.log('这是你输入的值 value ：' + v)
  }
}
```

#### 9. 实现小程序中的 computed 和 watch

小程序并不提供计算属性和属性监听器。这对开发的影响就是增加了很多的胶水代码与中间状态量。

因此提供了 computed 和 watch 两种改变数据的方式，使用方式和 vue 一致：

```js
const data = {
  someOtherData: 20
}
const computed = {
  someData (data) {
    return data.someOtherData + 1
  }
}

const watch = {
  someOtherData (newValue, oldValue) {
    console.log('监听器正在工作')
    console.log('newValue:' + newValue)
    console.log('oldValue:' + oldValue)
  }
}

$Page.register(props, data, lifeCycle, privateMethods, viewAction, computed, watch)
```



#### 10. 小程序的几种授权场景

其实这和上面是分割开的，只能说这是对于授权逻辑的一个封装。

由于微信对小程序的权限进行了控制，没有权限不能使用某些功能。但是有些 pm 作怪，用户不给，我还是偏要，导致没有权限的时候就得不停的弹授权页面。所以才提供了这样一个方法：

```js
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
export default function authorizeWXAPI(funcName, info = '我们需要您的授权', authorizeLevel = 0, data = {}) {
```

