---
title: Auth Popup
date: "2019-01-03T16:51:00.000Z"
layout: post
draft: false
path: "/posts/auth-popup-implementation/"
category: "Javascript"
twitter: "https://twitter.com/valeriimaltsev/status/1103025489227251713"
github: "https://github.com/ValeriiMal/proginmind.io/blob/master/src/pages/articles/2019-03-01---Integration-Popup-Implementation/index.md"
tags:
  - "Javascript"
  - "Web"
description: "How to implement popup for authorization third party APIs"
---

It was interesting to me how to implement the "Sign in with ..." button. When this button
clicked new popup appears and takes care of auth flow. When I implemented that feature
I decided to introduce a solution to people like one of the possible way to achieve that.

In general, there are two main paths:

1. opening popup with correct URL
2. closing popup and read results of the auth flow

Let's do it step by step

### Prerequesites
<a href="https://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a>

<a href="https://hackernoon.com/understanding-async-await-in-javascript-1d81bb079b2c" target="_blank">async/await</a>

<a href="https://www.learnrxjs.io/" target="_blank">RxJS Observable</a>


### Opening popup

Except for a new window, there are other containers where you can do that auth flow:

* new tab of the browser
* iframe

For the current example, let's take a look at new window popup as an auth flow container.

There is a widely known way to open a popup.

```javascript
const popup = window.open(<url>, <name>, <settingstring>);
```

Note that `open()` function have to be called synchronously, in other words directly
in user action listener function. In other cases, if you decided to call it asynchronously,
browsers block such popups.

For example, the simplest click handler will be fine:

```javascript
const signIn = () => {
    // ...
    const poppup = window.open(...)
    // ...
}
```

### Url

Every third party OAuth API provides documentation of how to construct correct URL for auth flow. One of the main query parameters should be called `redrect_uri`.
<a href="https://developers.google.com/identity/protocols/OAuth2UserAgent" target="_blank">There</a> is Google's OAuth flow URL parameters documented. Check Step 2 -> OAuth Endpoints tab.

So URL for the newly opened popup can be like this:

```javascript
const popup = window.open(`https://accounts.google.com/o/oauth2/v2/auth?${queryParamsString}`);

```

where `queryParamsString` is:

```
const queryParamsString = '' +
'client_id={id}&' +
'redirect_uri={our web app or server API url}&' +
'response_type=token&' +
'scope=admin'
```

Sometimes URL for that popup have to be calculated on API side and you as a frontend developer
have to retrieve it first in order to use in your popup. In that case, we can always open
popup synchronously with blank <url> argument, then load our `redirect_url` from the API and
set it to our popup using `location` window's API. Just like that:

```javascript
const clickHandler = async () => {
  const popup = window.open('', null, '');
  const url = await getUrl();
  popup.location.href = url;
}

```

That will redirect our popup window to the required URL. After that action, we can't control
popup behaviour any more, except actions like closing that we are not interested in yet.

### Checking popup state

After a redirecting popup to the URL with a different host from our's, we should start the process of
continuous checking popup's `location.href`. You may notice that trying to read that field
throws an error about restricted access to that field. It is ok, do not try to fix that!
Instead, we should wrap that field access to `try/catch` block.
On that point, we need to use setInterval() with a callback that checks the location of the popup.
When you start to have access to the `href` field and it is one of `sucess_url` or `error_url` we can
close popup with `popup.close()` and set according to result to our app.

There is some pseudo code with promises for that implementation:

```javascript
const handleOpenPopup = async () => {
  const popup = window.open('', null, '');
  const url = await getUrl();
  popup.location.href = url;
  const result = await checkPopup(popup);
  setState({ authSuccessful: result });
}

const checkPopup = (popup) => {
  const href = () => popup.location.href;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      let currentHref; 
      try {
        currentHref = href(popup);
      } catch () {
        // popup doesn't have success or error href
      }
      const isSuccess = currentHref === 'success_url';
      const isHrefValid = isSuccess || currentHref === 'error_url';
      if (isHrefValid){
        clearInterval(interval);
        resolve(isSuccess);
      }
    }, 1000);  
  });
}
```

If you are not familiar with `Promise` and `async / await` keywords there is similar logic implemented with Rx's `Observable` stream:

```javascript
const handleOpenPopup = () => {
  const popup = window.open('', '', 'width=500,height=500');
  // () -> Observable<string>
  getUrl().pipe(
    // good operator for side effects like this
    tap((url) => {
      popup.location.href = url;
    }),
    // string -> number
    switchMap(() => interval(1000)),
    // number -> string | undefined
    map(() => {
      if (popup.closed) {
        return FAILED_URL;
      }
      return getHref(popup);
    }),
    // string | undefined -> string
    // filter only valid results
    filter(Boolean),
    // string -> bool
    map(href => href === SUCCESS_URL),
    take(1),
  )
  .subscribe((result) => {
    popup.close();
    setState({ authSuccessful: result });
  });
};

// Window -> string | undefined
const getHref = (popup) => {
  let href;
  try {
    href = popup.location.href;
  } catch (e) {
    console.log('Failed to get href. Popup window has origin that differs from your\'s');
  }
  return href;
}
```

I prefer this one to promises because it is easy to implement data flow with atomic operations and it is easy to reason about each operation. Also here is an <a href="https://codepen.io/valmal/pen/gEWoPg" target="_blank">Example</a> of simple implementation of that flow. Check it out!

### And that's it!

Let's review our steps:

1. Open popup synchronously on user action
2. get popup URL either synchronously or asynchronously
3. Set `popup.location.href` to obtained URL
4. Start popup checking
5. Wait when popup will be redirected back to success or error URL so that we can read them
6. Check the result
7. Close popup and handle result
