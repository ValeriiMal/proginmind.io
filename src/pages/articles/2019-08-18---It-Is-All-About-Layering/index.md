---
title: It's all about layering
date: "2019-09-19T16:51:00.000Z"
layout: post
draft: false
path: "/posts/it-is-all-about-layering/"
category: "Architecture"
twitter: ""https://twitter.com/valeriimaltsev/status/1174782139235209216
github: "https://github.com/ValeriiMal/proginmind.io/blob/master/src/pages/articles/2019-08-18---It-Is-All-About-Layering/index.md"
tags:
  - "Javascript"
  - "Web"
  - "Architecture"
description: "Why do we need to keep our code layered?"
---

### Prerequesites
<a href="https://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a>

<a href="https://reactjs.org/docs/hooks-intro.html" target="_blank">React hooks</a>

### Go
This article is just my thoughts on how I’m thinking about layering and how to apply it on different levels of the app.
Maybe this help can help you to decide where it is applicable during your work routine.

I found it interesting to think about layered architecture not only in the scope of high-level architecture view but also in low-level project entities. So that layering in one hand is about “divide and conquer” (DC) principle that naturally produces Single Responsibility and Separation Of Concerns principles. And it is also about standardization on the other hand. For me, it is natural to think about almost everything (in the programming world) as of something that can be divided into smaller pieces. I found it exhausted to read articles about patterns, functional programming approaches, different architectures, time management and event human productivity because they often are all partial application of DC law. You can think about almost all parts of life or working process like about something that can be divided into smaller parts. Layering is also about that.

But there is a small difference between terms like “layering” and “decomposition” in programming. “layering” means something standardized, something that you expect to see in different levels of the application. On the other hand, “decomposition” means a more general approach to programming where you trying to extract reusable pieces of functionality.

For example take into consideration standard pattern for frontend applications: MVC. There are three basic layers that you can find in all frontend web applications. VIEW can be exposed using the UI library or framework. CONTROLLER is an object or function with the state that handles events from VIEW and transport data to VIEW. MODEL is something that can store persistent info or state about the application. In React apps that can be app store implemented with Redux or using Context API. In Angular apps that can be Service instance that shares its state between different modules. But this is only implementations that bring the same idea.

Then we can also find this kind of architecture at a higher level. Layering can be expressed through this chain:

```
CLIENT -> SERVER -> DATABASE
CLIENT <- SERVER <- DATABASE
```

Something similar to what we have just seen. Three layers. Each layer has one responsibility. You can also mention that each of these layers can also be divided into more layers with smaller granularity. For example, SERVER layer is often divided to VIEW layer that exposes data that can be sent to the client, CONTROLLER that manipulates data from the request and who knows how to deal with the database. DATABASE also is divided: tables are the exact data and there is another layer that can manipulate data. Usually, this is transactions, triggers, stored procedures and so on.

But I’m mostly working with frontend codebase and I found it very useful think about layering before starting to work on something new or maybe if I need to change something that begins to be hard to change or extend.

If you are a React user, you can see the layering of the framework every day. I’m talking about react and react-dom packages. react package knows how to deal with React components, how to calculate changes in them and that’s all at most part. react-dom package knows how to apply changes produced by react to the dedicated platform (in this case browser DOM) and that’s all. It can be expressed like this:

```
Browser DOM <- ReactDOM <- React <- UI
Natice DOM <- ReactNative <- React <- UI
```

The same thing we can find in react-dnd package as well. There we have react-dnd package that knows how to calculate the state of the drag-n-drop process in the app. And there we have other packages like react-dnd-html5-backend or react-dnd-touch-backend. These packages know how to apply state produced be react-dnd to the dedicated platform.

As you see layering is a great thing that can split abstract API that user deals with from implementation details of different platforms.

Let's consider a simple form. Forms in an application can be very different but we can standardize approach of how to handle it. All forms need UI. UI can be considered as one of the layers that receive value and expose a function that triggers on form change. If UI does not have a persistent state to store value it is obvious that we need someplace to store it. Again, this is implementation details of how to implement such a state store. React can use context API or Redux store or local state of a component. Angular users can use dedicated service or component’s state. Almost all forms need validation. And this is a good point to have the third layer. We can call it VALIDATION layer and it can be implemented in a reusable and standard way in the application. VALIDATIONshould lie between form UI and value state. It means it should receive form value and produce error object for form value and either changed form value due to business rules or not changed form value. Better to keep this error object in the state near the form value so it is easy to find and change. Let's visualize what we have for now. There are three layers:


```
STATE -> UI
STATE <- VALIDATION <- UI
```

The question can be where to apply this VALIDATION layer. So there is no correct answer. But it is important to keep validators in the same place for every form. For example, let's keep it between the form controller and state. React users can consider using higher-order components to apply validators. Redux users can consider to user middlewares. Angular users can consider using service or component class.

If you will keep things like that it will be easier to reason about where to find bugs, where to change validation logic or where to change form value business logic etc. It is great to have little standards for your app so everyone knows what to expect in different places of the app.

Here are a few lines of code to bring some visualization here. I’m using React for examples because it needs less code.

```javascript
// UI layer
// -------------------------------------------------
// UI doesn't know anything about validation
const Form = ({ value, error, onChange, onSubmit }) => {                                            
  return (                                                                                          
    <div>                                                                                           
      {error && (<p>Error message here</p>)}                                                        
      <form onSubmit={onSubmit}>                                                                    
        <input value={value} onChange={onChange} />                                                 
        <button type="submit">Submit</button>                                                       
      </form>                                                                                       
    </div>                                                                                          
  );                                                                                                
};                                                                                                  
// -------------------------------------------------

// VALIDATION layer
// -------------------------------------------------
// Validation function is static and can be passed as an argument to HOC
// This HOC have to be used with components with `onChange` action. This is common interface
// for form controls
const withError = (Wrapped, validate) => {                                                                    

  const Component = ({ onError, onChange, ...props }) => {                                          
    const handleChange = (e) => {                                                                   
      onChange(e);                                                                                  
      const validatedData = validate(e.target.value);                                               
      if (validatedData.error) {                                                                    
        // onError handler is attached to the new component created by HOC
        onError(validatedData);                                                                     
      }                                                                                             
    };                                                                                              

    return (
      <Wrapped {...props} onChange={handleChange} />
    );
  };
  return Component;
};

const UiWithErrorHandling = withError(Form);
// -------------------------------------------------

// STATE layer
// -------------------------------------------------
const initialState = { value: '', error: '' };                                                       
                                                                                                    
const reducer = (state, action) => {                                                                
  const { type, payload: { value, error } } = action;                                               
  if (type === 'change') {                                                                          
    return { ...state, value }; 
  }
  if (type === 'error') {                                                                          
    return { ...state, error }; 
  }
  return state;                                                                                     
};                                                                                                  


// Container for the UI layer to store the UI state
const StateContainer = () => {                                                                      
  // checkout react hooks
  const [state, dispatch] = React.useReducer(reducer, initialState);                                

  const handleChange = (e) => {                                                                     
    const { value } = e.target;
    dispatch({ type: 'change', payload: { value } });                               
  };                                                                                                
                                                                                                    
  const handleError = (validationData) => {                                                         
    dispatch({ type: 'error', payload: validationData });                                           
  };                                                                                                
                                                                                                    
  const handleSubmit = () => {};                                                                   
                                                                                                    
  return (                                                                                          
    <UiWithErrorHandling                                                                            
      value={state.value}                                                                           
      error={state.error}                                                                           
      onChange={handleChange}                                                                       
      // this action attached by our VALIDATION layer
      onError={handleError}                                                                         
      onSubmit={handleSubmit}                                                                       
    />                                                                                              
  );                                                                                                
};           
// -------------------------------------------------

```

What about authentication guard? Imagine you don’t want to let the user access the whole component and show some fallback component instead or event login component? Yeap, you are right. And as this is so common logic that we can consider it as a separate layer that knows who can access to components and who can not.

A higher-order component is a good fit for that purpose. Or wait, imagine we are using context to store user value across the app and lets use react’s hook to build our HOC.

```javascript
// somewhere in the tree user is attached to context
const UserContext = React.createContext();

const App = () => {                                                                                 
  // ...                                                                                            
  return (                                                                                          
    <UserContext.Provider value={user}>                                                             
      {children}                                                                                    
    </UserContext.Provider>                                                                         
  );                                                                                                
};                                                                                                  

// AUTHGUARD
// -------------------------------------------------
const withAuth = (Wrapped, options = {}) => {                                                       
  const { permissions, FallbackComponent, fallbackProps = {} } = options;                          

  return (props) => {
    const user = React.useContext(UserContext);                                                       
    
    // check user permissions
    if (isUserHasPermissions(user, permissions)) {                                                  
      return (                                                                                      
        <Wrapped {...props} />                                                                        
      );                                                                                            
    }                                                                                               

    // show fallback component
    if (FallbackComponent) {                                                                        
      return (                                                                                      
        <FallbackComponent {...fallbackProps} />                                                     
      );                                                                                            
    }                                                                                               

    // or fallback text if component not specified
    return (                                                                                        
      <span>You are not allowed to see this content</span>                                          
    );                                                                                              
  };                                                                                                
};
// -------------------------------------------------
```
Angular users are familiar with guards as `canActivate` field of route object.

With this new layer our app layered architecture should look like this.

```
STATE -> GUARD -> UI
STATE <- VALIDATION <- UI
```

Also, there is a lot of other stuff in the regular frontend app. For example, look at API calls. How would you organize them? Usually, interaction with API looks pretty similar. It means it should have some clearly defined functions and layers that can be easily standardized. For example handling of a different response statuses can be extracted to layer, handling of single-item response or paginated response can be also extracted to layer etc.

In javascript, this things can be implemented in different ways, simple or complex. The main task there is to make layers to be easily found, maintained and extended.

