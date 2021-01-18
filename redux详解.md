### 一、redux介绍
#### 1、redux的三大原则
* 单一事实来源：整个应用程序的状态存储在单个存储中的对象树中。
* 状态是只读的：更改状态的唯一方法是发出一个动作，一个描述发生了什么的对象。
* 使用纯函数进行更改：要指定操作如何转换状态树，请编写纯reducer。
#### 2、你是否需要使用redux？
不是随波逐流，而是真正花时间来了解它的原理，解决什么问题，再根据自己的项目做取舍。  关于此，redux官网给了如下几点参考
* 你有大量合理的数据变化。
* 你需要一个单一来源存储你的应用状态。
* 你发现所有状态保存在顶级组件中不再能够很好的开发维护。
### 二、拆解 redux

![ Redux 在小程序中的交互逻辑](https://doctorwork-1253972064.cos.ap-guangzhou.myqcloud.com/2kgwWechatIMG391.png)

#### 1、state

state 为在函数 createStore 内部定义的变量 currentState，它的改变则只能同过两种方式，第一为初始化 store 时传出 initialState，第二则是通过 reducer 接收 store 的 dispatch 方法传入的 action 来改变。获取则通过 store 的 getState 方法。这样边保证了状态的安全性，可追述性（初始化后 state 每次改变都有对应 action）。

#### 2、action

action 是包含 type 属性的对象，reducer 需要依赖 action 上的 type 属性，执行对应的逻辑修改 state.约定 type 定义为大写的字符串,并且具有一定的语义。(中间件的action不受约束)

#### 3、reducer

reducer 接收 curentState、action 两个参数，返回 newState. 其为纯函数构成，不能处理异步操作。

#### 4、dispatch

dispatch接收action参数 调用 reducer 函数，接收返回的 newState 赋值给 currentState。

### 5、getState

获取内部定义的 currentState
### 6、 subscribe

使得可以订阅每次动作(action)做相应的处理。

### 7、 replaceReducer
替换store的reducer
#### 至此我们便能写一个微型 redux。

注\* 以下代码只做简单的原理说明，不会考虑细节和异常。

```
    const createStore=(reducer,state){
         let currentReducer = reducer
         let currentState = state
         let currentlisteners = []
         function dispatch(action){
              currentState = currentReducer(currentState, action)
             listeners.forEach(listener => listener())
         }
         function subscribe(listener) {
            currentlisteners.push(listener)
            return function unsubscribe() {
                var index = currentlisteners.indexOf(listener)
                currentlisteners.splice(index, 1)
            }
         }
         function getState(){
             return currentState
         }
        function replaceReducer(nextReducer) {
            currentReducer = nextReducer
        }
         return{
             dispatch,
             getState,
             subscribe,
             replaceReducer
         }
    }
    const reducer=(currentState,action)=>{
        switch(action.type){
            case 'ADD':
             return : {num:currentState.num+action.payload};
            default:
             return currentState
        }
    }
    const store=createStore(reducer,{num:0})
    store.subscribe(()=>{console.log(store.getState())})
    store.dispatch({type:'ADD',payload:1})//{num:1}
    store.getState() // {num:1}

```

麻雀虽小、五脏俱全，这个丐版的 redux 能用，但不好用。所以它还有一些扩展。
###三、扩展
#### 1、combineReducers

大型应用需要模块化拆分，不同的功能模块使用不同的 Reducer 减少耦合，使项目逻辑清晰、更有利于开发维护。combineReducers 则是提供这样的支持。由下实现可看出 combineReducers 以传入对象的 key 为状态模块的区分标识。注意：每个 action 都会触发所有模块的 reducer,所以 actionType 的去重需要注意。

```
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const nextState = {};
  return function combination(state = {}, action) {
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
    }
    return nextState;
  };
}
const reducer=combineReducers({user:(state,action)=>{},shop:(state,action)=>{}})
/***
 * state={
 *  user:...,
 *  shop:...
 * }
 */
```

#### 2、applyMiddleware

redux提供的可扩展性，用于处理一些通用操作，异步处理、打印日志等等，因为 reducer 是纯函数，无法支持异步，所以中间间被设计在 dispatch(action)阶段。applyMiddleware 传入 redux 中间件（稍后介绍）,返回值作为 createStore 的第三个参数。

```
const createStore = (reducer, state, enhancer) => {
  if (typeof enhancer !== "undefined" && typeof enhancer == "function") {
      //通过间接递归操作，融入中间件
    return enhancer(createStore)(reducer, state);
  }
};
function applyMiddleware(...middlewares) {
    return (createStore) => (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)
      let dispatch = store.dispatch
      let chain = []

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action) => dispatch(action)
      }
      //依次执行中间件方法，并将执行结果保存在chain中。由此可知中间件可接收含有getState、dispatch两个方法的对象作为参数。
      chain = middlewares.map(middleware => middleware(middlewareAPI))
      //此时的dispath已经不是纯洁的dispatch,它会去调用执行所有的中间件。且看compose方法
      dispatch = compose(...chain)(store.dispatch)

      return {
        ...store,
        dispatch
      }
    }
  }
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }
  //累加器嵌套调用，最先加载的中间件最先执行，后一个中间件最为前一个中间参数next，最后的中间件next=dispatch。
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
//写一个简单的中间件辅助理解
function setTimeoutMiddleware=({dispatch,getState})=>{
    return next=>action=>{
        if(flag){  //被该中间件捕获
            setTimeOut(()=>{
                dispatch({...action,payload})
            },3000)
        }else{
            //执行下一个中间件，或者dispatch
            next(action)
        }
    }
}


```

##### （1）middleware

由 applyMiddleware 可知 redux 的中间件形式为如下，我们便可以愉快的开发适应自己业务的 redux 中间件了。

```
  function  middleware=({dispatch,getState})=>{//接收store的getState、和dispatch方法
    return next=>action=>{//next为下一个中间件调用函数或者dispatch(仅一个中间件，或者最后一个中间件，action是dispatch所传入的action)
      if(flag){  //是否被该中间件捕获
            //相应的逻辑或异步操作
            dispatch({...action,payload})
        }else{
            //未捕获执行下一个中间件，或者dispatch，否则会导致其他中间件无效
            next(action)
        }
    }
  }

```
### 四、总结
在react中需搭配react-redux使用,社区中间件有redux-thunk、redux-promise、redux-observable、redux-saga等等。当然还有些集成方案，dva则是集成redux-saga、react-redux、redux而成。具体怎么使用需要根据实际项目做权衡。至此，redux介绍完啦，希望对感兴趣的朋友有所帮助^-^
### 参考
> https://github.com/reduxjs/redux  

> https://redux.js.org/
