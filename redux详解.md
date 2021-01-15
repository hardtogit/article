### 一、redux简介
随着前端mvc框架日趋成熟，开发由频繁操作dom元素，转变为状态驱动视图的模式，开发人员的聚焦点越来越关注于状态，尤其是在大型项目中，可以说管理好了状态就管理好了整个应用。所以一个好的状态管理方案迫在眉睫。redux伴随着react应运而生，但它并不独属于react.  
### 二、redux主要名词含义及其作用

#### 1、state
state为在函数createStore内部定义的变量currentState，它的改变则只能同过两种方式，第一为初始化store时传出initialState，第二则是通过reducer接收store的dispatch方法传入的action来改变。获取则通过store的getState方法。这样边保证了状态的安全性，可追述性（初始化后state每次改变都有对应action）。
#### 2、action
action是包含type属性的对象，reducer需要依赖action上的type属性，执行对应的逻辑修改state.约定type定义为大写的字符串。
#### 3、reducer
reducer接收curentState、action两个参数，返回newState.  其为纯函数构成，不能处理异步操作。
