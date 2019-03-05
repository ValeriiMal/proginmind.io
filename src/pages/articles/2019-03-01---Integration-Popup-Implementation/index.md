---
title: Auth Popup
date: "2019-01-03T16:51:00.000Z"
layout: post
draft: false
path: "/posts/integration-popup-implementation/"
category: "Javascript"
tags:
  - "Javascript"
  - "Web"
description: "How to implement popup for authorization third party APIs"
---

It was interesting to me how to implement "Sign in with ..." button. When this button
clicked new popup appears and takes care of auth flow. When I implemented that feature
I decided to introduce solution to the people like one of the possible way to achieve that.

In general there is two main paths:

1. opening popup with correct url
2. closing popup and read results of the auth flow

Lets do it step by step

#### Prerequesites
[JavaScript](https://en.wikipedia.org/wiki/JavaScript)
[async/await](https://hackernoon.com/understanding-async-await-in-javascript-1d81bb079b2c)


### Opening popup

Except new window, there are other containers where you can do that auth flow:

* new tab of the browser
* iframe

For the current example lets take a look at new window popup as a auth flow container.

There is widely known way to open a popup.

```javascript
const popup = window.open(<url>, <name>, <settingstring>);
```

Note that `open()` function have to be called synchronously, in other words directly
in user action listener function. In other case, if you decided to call it asynchronously,
browsers block such popups.

For example the simplest click handler will be fine:

```javascript
const signIn = () => {
	// ...
	const poppup = window.open(...)
	// ...
}
```

### Url

Every third party OAuth API provides documentation of how to construct correct url for
auth flow. One of the main query parameter should be called like `redrect_uri`.
[There](https://developers.google.com/identity/protocols/OAuth2UserAgent) is google's OAuth flow url parameters documented.
Check Step 2 -> OAuth Endpoints tab.

So url for the newly opened popup can be like this:

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

Sometimes url for that popup have to be calculated on API side and you as a frontend developer
have to retreive it first in order to use in your popup. In that case we can always open
popup synchronously with blank <url> argument, then load our `redirect_url` from the API and
set it to our popup using `location` window's API. Just like that:

```javascript
const clickHandler = async () => {
  const popup = window.open('', null, '');
  const url = await getUrl();
  popup.location.href = url;
}

```

That will redirect our popup window to the required url. After that action we can't control
popup behavior any more, except actions like closing that we are not interesting in yet.

### Checking popup state

After redurecting popup to the url with different host from our's, we should start process of
continuous checking popup's `location.href`. You may notice that trying to read that field
throws error about restricted access to that field. It is ok, do not try to fix that!
Instead we should wrap that field access to `try/catch` block.
On that point we need to use setInterval() with callback that checks location of the popup.
When you start to have access to `href` field and it is one of `sucess_url` or `error_url` we can
close popup with `popup.close()` and set according result to our app.

There is some pseudo code for that implementation:

```
const clickHandler = async () => {
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

### And that's it!

Lets review our steps:

1. open popup synchronously on user action
2. get popup url either synchronously or asynchronously
3. set popup.location.href to obtained url
4. start popup checking
5. wait when popup will be redirected back to success or error urls and we can read them
6. close popup
7. check the result
