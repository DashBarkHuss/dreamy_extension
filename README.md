There are 3 parts to this repo:

<hr>

1. Backend _Nodejs_
2. Frontend _React_
3. Chrome Extension

## How to Start frontend and backend

<hr>

1. `$ cd frontend`
2. `$ npm run start`
3. In the VSCODE Debugger run _Attach Client+Server_

## How to start the chrome extension

<hr>

1. chrome://extensions/
2. Toggle on developer mode
3. Load Unpacked -->
4. Chose chrome_ext

## Debugging Chrome

<hr>

## content scripts

1. DevTools (cmd opt i)
2. Sources tab
3. Content Scripts tab (Page, Filesystem, expand)
4. Expand relevant extension (Dreamy in this case)
5. Click relevant content script
6. Add break point

## background scripts

1. Manage Extensions
2. Go to extension
3. Inspect view service worker (not always visible, should be under ID)
4. Sources tab >> Page tab >> expand <ID> >> background.js >> inset break point

## popup script

1. Pin extension to browser bar
2. Click Pin
3. Right click popup > Inspect
4. Sources Tab > popup.js > insert a break point

## Make a fake tweet

<hr>

1. Find a tweet to copy
2. Inspect
3. Find the parent that has a transformY attribute within the inline style attribute. This parent div should have a bunch of siblings with transformY attributes also that each represent a different tweet. Copy the children of this parent div. This your template. You can edit it now, or edit it with dev tools and then copy it.
4. Add a new fake tweet on mongo atlas. Add the HTML under the field 'html'
5. optional: Add your screen name to 'addedBy' field.

## Issues

<hr>

1. polls not display correctly
2. only works on light theme
3. **FIXED** _background fetch patch returning multiple responses. get tweets is not- thats good._
4. front end shows "you missed the dream sign" or "you are a wake" even if dream sign already interacted with.

### Features

1. Dynamic retweets- retweet from a user that the main user follows.
2. alarm thing that Nathan W. said

### To do:

1. How to count missed vs passed dream signs?
