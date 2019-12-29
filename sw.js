/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("workbox-v3.6.2/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "workbox-v3.6.2"});

workbox.core.setCacheNameDetails({prefix: "gatsby-plugin-offline"});

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "webpack-runtime-df13cbc874cb2e3e3b8b.js"
  },
  {
    "url": "app-f7560001493a17b1aff9.js"
  },
  {
    "url": "component---node-modules-gatsby-plugin-offline-app-shell-js-b12d9bb3b7a286c12329.js"
  },
  {
    "url": "index.html",
    "revision": "47c90b376a5211dda9b0c088540a86dd"
  },
  {
    "url": "offline-plugin-app-shell-fallback/index.html",
    "revision": "81646906316655f084bfb2c313e2d9de"
  },
  {
    "url": "2.eac03220ef9302b061c7.css"
  },
  {
    "url": "component---src-pages-index-jsx.69a945a11e23dfafac91.css"
  },
  {
    "url": "component---src-pages-index-jsx-f4b718ab13d8d2ba3c97.js"
  },
  {
    "url": "1-97392d6ea5adaf944e1f.js"
  },
  {
    "url": "0-b8503e2c4e230276dc09.js"
  },
  {
    "url": "3-33c210f6aea9be8bdf5b.js"
  },
  {
    "url": "2-223f7609e828b3c3e6ef.js"
  },
  {
    "url": "static/d/148/path---index-6a9-cSBRwZJVxLezcflvEQ0gfJtmCis.json",
    "revision": "1cd48c0921d27ed9c2323ec53faf559a"
  },
  {
    "url": "component---src-pages-404-jsx-be8d4bbbfa8071caa88b.js"
  },
  {
    "url": "static/d/6/path---404-html-516-62a-S2kKqCkUyhn5jMGFCCMt6k8lB4.json",
    "revision": "0e02ed3d16b7e2160c55c32cadffb605"
  },
  {
    "url": "static/d/520/path---offline-plugin-app-shell-fallback-a-30-c5a-NZuapzHg3X9TaN1iIixfv1W23E.json",
    "revision": "c2508676a2f33ea9f1f0bf472997f9a0"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute("/offline-plugin-app-shell-fallback/index.html", {
  whitelist: [/^[^?]*([^.?]{5}|\.html)(\?.*)?$/],
  blacklist: [/\?(.+&)?no-cache=1$/],
});

workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/, workbox.strategies.staleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/^https:/, workbox.strategies.networkFirst(), 'GET');
"use strict";

/* global workbox */
self.addEventListener("message", function (event) {
  var api = event.data.api;

  if (api === "gatsby-runtime-cache") {
    var resources = event.data.resources;
    var cacheName = workbox.core.cacheNames.runtime;
    event.waitUntil(caches.open(cacheName).then(function (cache) {
      return Promise.all(resources.map(function (resource) {
        return cache.add(resource).catch(function (e) {
          // ignore TypeErrors - these are usually due to
          // external resources which don't allow CORS
          if (!(e instanceof TypeError)) throw e;
        });
      }));
    }));
  }
});