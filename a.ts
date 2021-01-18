const createStore = (reducer, state) => {
  let currentReducer = reducer;
  let currentState = state;
  //存放订阅的方法
  let currentListeners = [];
  function dispatch(action) {
    //遍历执行订阅的方法
    for (let i = 0; i < currentListeners.length; i++) {
      const listener = currentListeners[i];
      listener();
    }
    currentState = currentReducer(currentState, action);
  }
  function getState() {
    return currentState;
  }
  //订阅
  function subscribe(listener) {
    currentListeners.push(listener);
    //返回取消订阅的方法
    return () => {
      const index = currentListeners.indexOf(listener);
      currentListeners.splice(index, 1);
    };
  }
  return {
    dispatch,
    getState,
    subscribe,
  };
};

//
//先看下

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
const reducer = combineReducers({
  user: (state, action) => {},
  shop: (state, action) => {},
});
/***
 * state={
 *  user:...,
 *  shop:...
 * }
 */
combineReducers;
//

export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;
    let chain = [];

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };
    chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}

//
const createStore = (reducer, state, enhancer) => {
  if (typeof enhancer !== "undefined" && typeof enhancer == "function") {
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
      chain = middlewares.map(middleware => middleware(middlewareAPI))
      dispatch = compose(...chain)(store.dispatch)
  
      return {
        ...store,
        dispatch
      }
    }
  }

  const a=():void=>{
    
  }