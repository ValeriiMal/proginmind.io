---
title: Build your own utils
date: "2019-12-29T22:26:00.000Z"
layout: post
draft: false
path: "/posts/build-your-utils/"
category: "Tools"
tags:
  - "Javascript"
  - "Web"
  - "Architecture"
description: "Only you the one who knows how you like to use the code"
---

## Preface

This little talk is about how it is important to build your own tools, build wrappers
for third party dependencies of the application code. How it is important to isolate your application
code from anything else.

> "Nobody knows exactly how do you like to use the code, except yourself." - Me

Your applaction code should contain facades for you dependency's code. It can be considered as 
a rule in a project - 'use wrapper for dependency'. Doesn't matter what kind of dependency it is.
It can be helper library to work with arrays and objects or it can be a UI library of components.

In order to bring some arguments here lets consider regular app's code that doesn't use wrappers.
First you decided to use 'OneUI' (just example) library for components like input, select, button etc.
You built several pages and ten forms which all the way use this components directly imported
from 'OneUI' module. Then UX designer came and modify your app in the way, that it is easier to choose
another 'TwoUI' lib in order to support nice UX and performance. Or maybe even write your own
components. In that point you began to think about hundred of places where you imported old
'OneUI' library and started to imagine how painful it is going to be reimplementing all components with new 'TwoUI' library.

Now think about how much it is easier to replace old library with new one if you just need to update
your code in modules that expose particular components and don't touch your application code? E.g. just
import 'TwoUI' instead of 'OneUI' to Input module and change implementation in one place. This way
you can incrementally replace components in your app one by one and not be lost in 'where I can miss to replace components?'.

## Making utils

There is a bunch of code that involved in data processing. E.g. traversing lists of data, mutating / creating objects. Often for
that purpose developers use third party libraries like [lodash](https://lodash.com/) or [ramda](https://ramdajs.com/) or smth else.

Through the article I'm using examples with `ramda` just because I'm using it a lot in my day to day coding. The thing that it is more suitable for functional programming is another
topic which I think I'll cover soon. So for purpose of exposing
main ideas in the current article I'll add brief descriptions
to some `ramda` code.

In your application finding an item by specific id can look like this:

```javascript
import _ from 'ramda';

const found = _.find( // check if specific predicate returns True for input item, and return that item
  _.propEq('id', 'specific id to look up'), // accept property name, property value and an object which should be checked
  list,
);
```

If you are not familiar with `partial function application` then
check how previous code snipped could look without it:


```javascript
import _ from 'ramda';

const found = _.find(
  (item) => _.propEq('id', 'specific id to look up')(item),
  list,
);
```

`Partial application` is one of the fundamental tool that makes
functional programming possible with JavaScript. If you interested check [this one](https://fr.umio.us/favoring-curry/). But there we won't cover it in details. I'll use such examples
in the article just because it looks better, without characters that decrease readability =)

So lets make our utils right from here!
Code, shown above likely often faced in the application in different places. But you can create your
`findById` util function:

```javascript
// utils/list.js
import _ from 'ramda';

// findById :: ID -> Array Object -> Object
const findById = id => _.find(_.propEq('id', id));
```

`findById` takes value of id, then list where we want to find
an item and returns item or `undefined` if there is no such item in the list.

[Codesandbox](https://codesandbox.io/s/wizardly-cohen-9zlfm)

Feel free to use it everywhere in the app! Now you can not only use it but improve it or extend it.
This way it is even make it easy to change the third party library. Just edit your utils and don't touch other
app's code. Cool!

The next one I've used a lot is mapping lists. For example we often map list to make list of ids from list of objects. With direct usage of library you can write it like that:

```javascript
// app/code.js
import _ from 'ramda';

const list = [{ id: 1 }, { id: 2 }];
const ids = _.map(_.prop('id'), list);
```

Lets "util" it!

```javascript
// utils/object.js
import _ from 'ramda';

/**
 * Get "id" from object.
 * @example
 * const objId = id(obj);
 */
const id = _.prop('id'); // takes property name and object, return property value

// utils/list.js
import _ from 'ramda';
import { id } from './object';

const mapId = _.map(id); // apply specific function to every item of the list, passed as a second argument
```

The next one I've used a lot is filtering items that has `undefined` or `null` values. With direct usage of the library
you can write it like that:

```javascript
// app/code.js

import _ from 'ramda';

const filtered = _.filter(// takes predicate and return new list with items that sutisfied this predicate
  _.pipe( // just make one function from other ones
    _.either( // return True if at least one of args return True
      _.isNil, // check if value is undefined or null
      _.isEmpty, // check if value is empty, e.g. "" or [] or {}
    ),
    _.not, // reverce True to False and vise versa
  ),
  list,
);
// or
const filtered = _.reject( // opposed to filter
  _.either(
    _.isNil,
    _.isEmpty,
  ),
  list,
);
// or
const filtered = _.filter(Boolean, list); // will filter also zeros which is not ok for some cases
```

There is first filter function without third party library just to get you an idea how it works:

```javascript
// app/code.js

import _ from 'ramda';

const filtered = _.filter(// takes predicate and return new list with items that sutisfied this predicate
  (item) => {
    const invalid = (
      item === undefined
      || item === null
      || item.length === 0
      || Object.keys(item).length === 0
      || item === ''
    );
    return !invalid;
  },
  list,
);
```

So much functions in so frequently used logic! Have to do smth with it. Yeap, right. Make util for it:

```javascript
// utils/list.js
import _ from 'ramda';

const clear = _.reject(_.either(_.isNil, _.isEmpty));
```

Here is another `ramda`'s function `adjust`. What does it do? It applies specific function to list item under specific index.

```javascript
  // app/code.js
  import _ from 'ramda';

  const list = [1, 2];
  const index = _.findIndex(item => item === 1, list);
  const adjusted = _.adjust( // apply first argument to list item under index from second argument
    _.inc, // increase input number by 1
    index,
    list,
  ); // [2, 2]
```
The main inconvenience for me was that I need to calculate index of the item I want to update.
It can be improved by providing your own `adjustBy` function! Look:

```javascript
  // utils/list.js
  import _ from 'ramda';

  const adjustBy = (applyF, findF, list) => {
    return _.adjust(
      applyF,
      _.findIndex(findF, list), // find index of an intem by specific predicate
      list,
    );
  };
  
  // app/code.js
  import { adjustBy } from '../utils/list.js';

  const list = [1, 2];
  const adjusted = adjustBy(
    inc, // set 'id' property to 3
    _.equals(1), // check if item's 'id' property equals 2
    list,
  ); // [2, 2]
```

So neet!

Now, instead of separately find index and then apply `adjust` function we can do all this steps in
one function call. Cool! One more our own util.

This way you can create your own domain specific language on top of your host programming language.
What do I mean? Imagine we have an app with cart and items that can be placed in the cart. Now you
need to add item to the cart. In the simplest structure it looks like that:

```javascript
  const cart = { items: [] };
  const item = { name: 'food' };

  // add item to the cart and return new cart object (immutability is important =))
  const newCart = { ...cart, items: [...cart.items, item] };
```

Ok. I don't want to write this code twice anywhere in my app code. So I'm going what? Right! Util it!

```javascript
  // utils/cart.js
  import _ from 'ramda';
  
  const addItem = (cart, item) => {
    return _.assoc( // set property value to object and return new object
      'items',
      _.append(item, cart.items), // add item to the end of list
      cart,
    );
  };

  // app/code.js
  import { addItem } from '../utils/cart.js';

  const cart = { items: [] };
  const item = { name: 'food' };
  const newCart = addItem(cart, item);
```

Not so hard, right? But how exciting our code could look like!

You can achieve great readability and maintainability this way but don't be lazy to do this from
the start, so you don't neet to improve your code in the future =)

One more huge positive effect of "utiling" is portability of the code. This days it is common
to write web and mobile applications for clients, maybe even browser extention.
And the easiest way to reduce time spending on
development is to reuse your own code. All utils you built you can now port to different places.
Just made different repository for all utils have been made and reuse them everywhere!
At the end you just need to write platform specific code, which in most cases deals with UI, API calls
and caching on device side. But at least you can store business logic and utils shareable.

Lets check what we can "util" when working with React application. There is lot of interesting
stuff to do! Lets think about most commonly used way we work with JSX and components. Lets cover common case of using ternary operator inside JSX code. For me it is hard to
read and manipulate if it has lot of JSX. Just for illustration, ternary code can look like that:

```
{
  (a < b) ? (
    <ComponentForTruthy />
  ) : (
    <ComponentForFalsy />
  )
}
```

I'd like to replace it with more semantic one. Lets build `IfElse` component.

```
<IfElse condition={a > b}>
  <IfElse.T><ComponentForTruthy /></IfElse.T>
  <IfElse.F><ComponentForFalsy /></IfElse.T>
</IfElse>
```

That will be widely used util for sure.

```javascript
  const IfElse = ({ condition, children }) => {
    return React.Children.map(children, (child) => {
      if (condition && child.type === IfElse.T) return child;
      if (!condition && child.type === IfElse.F) return child;
      return null;
    });
  };
  IfElse.T = ({ children }) => {
    return children;
  };
  IfElse.F = ({ children }) => {
    return children;
  };
```

Now we can use it and even extend it for supporting cases like this (declarative version of `{ isTruthy && <Component /> }` kind of things):

```
<IfElse.T condition={a > b}>
  <ComponentForTruthy />
</IfElse.T>

<IfElse.F condition={a > b}>
  <ComponentForFalsy />
</IfElse.F>
```

[Codesandbox](https://codesandbox.io/s/confident-dream-wvghc)

### Testing

One more positiv argument to build utils is certanity that your code is still working fine after
replacing something because tests are successfully passed. Lets consider one little case.

Take into consideration `mapId` function that we built earlier. It uses `map` and `prop` functions
from `ramda`. It is not so likely but maybe you want to replace `ramda`'s `map` with `lodash`'s `map`.
The second one takes array argument as a first parameter. It means that our `mapId` function will
be broken. We can quickly make test for it and check it once we made a change to an implementation.
With `lodash` it can be reimplemented like that:

```javascript
import _ from 'ramda';
import map from 'lodash.map';

const mapId = (list) => map(list, _.prop('id'));
```

Thats it. Now all your app code that uses this function will receive updated implementation of the 
`mapId` function. It was very easy to test and change because of our wrapper for `ramda` and `lodash` libraries.

Ideally all the functions from such library should be exposed through application "util" module. I'm afraid of thinking about
how much work it can bring if at some point we decided to change
third party library. For example from `lodash` to `ramda`, or from `OneUI` to `TwoUI`. Without special util module we'll have to change almost all files in the application. But with it, only change of specific util files is required.

### Conclusion

Imagine your app code as three layers of dependencies:
1. application code itself
2. your utils and tools, wrappers for third party code
3. third party code itself

This approach will make you happier to use your utils and to bring more certanity how it works and
how it can be improved, how third party code can be replaced without pain.

Enjoy coding!
