---
title: Window Popup Implementation
date: "2019-01-03T16:51:00.000Z"
layout: post
draft: false
path: "/posts/integration-popup-implementation/"
category: "Javascript"
tags:
  - "Javascript"
  - "Web Development"
description: "How to implement login popup or connect google service popup"
---

## Task

For me, this kind of window popup was useful for integration google
calendar with our application, so that a user can connect its google calendar
and manage events (e.g. meetings) through our application.

## User steps

- click on "Connect Google Calendar" button
- window popup opens with link to google oauth flow
- user sign in google account
- user allow connection project to its google account
- google oauth flow redirects user to provided earlier url that points to api url
- api read code and state params and redirects back to web app redurect link
- web app close popup and notify user about successful or failed result

## Solution

Firstly lets bring high level overview of steps that should be implemented
```javascript
// this is inside async function
const popup = window.open('', 'newpopup', 'width=100,height=100,top=100,right=100');
const url = await getGoogleUrl();
popup.window.location.href = url;
// google async oauth flow
const result = await googleOAuthFlow();
// check result
```

