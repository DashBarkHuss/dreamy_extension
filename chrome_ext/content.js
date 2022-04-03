//none of this works in dark mode
const twitterStyles = {
  focusOnTweet: {
    onHover: {
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.03)",
      },
    },
  },
  focusOnName: {
    onHover: {
      style: {
        "text-decoration-line": "underline",
      },
    },
  },
};
const PORT = 3001;
async function requestFromBackground(obj) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage(obj, (response) => {
      res(response);
    });
  });
}
const patchRC = async (action, id) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  message = {
    event_type: "DreamSign",
    body: { id, action },
  };
  const response_from_bg = await requestFromBackground(message);
  return response_from_bg;
};
const dreamSignMissed = async (tweet, interaction) => {
  if (interaction === "clicked") alert("You missed this dream sign.");
  tweet.missed = true;
  const patched = await patchRC("missed", tweet._id);
  if (patched) {
    tweet.missed = true;
  } else {
    tweet.missed = null;
  }
  points.push({ interaction: interaction });
};
const getUsers = async () => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  let tweet;
  await fetch(`http://localhost:${PORT}/api/users`, {
    // await fetch(`http://localhost:${PORT}/api/users`, {
    method: "GET",
    headers,
    credentials: "include",
  })
    .then(async (res) => {
      tweet = await res.json();
    })
    .catch((err) => alert(err));
  return tweet;
};
(async () => {
  const src = chrome.runtime.getURL("tweets.js");

  // let tweet = await getFakeTweet();
  // getFakeTweet();

  const src2 = chrome.runtime.getURL("buttonStyles.js");
  let buttonStyles = await import(src2);
  buttonStyles = buttonStyles.default;

  async function doSomeTestSend() {
    const response_from_bg = await requestFromBackground({
      event_type: "GetTweet",
    });
    return response_from_bg;
  }
  let tweet = await doSomeTestSend();
  debugIndicator = document.createElement("div");
  debugIndicator.style.display = "none";
  debugIndicator.style.width = "100px";
  debugIndicator.style.height = "100px";
  debugIndicator.style.top = "0";
  debugIndicator.style.left = "0";
  debugIndicator.style.position = "fixed";
  debugIndicator.style.border = "5px solid blue";
  debugIndicator.id = "debugIndicatorel";
  debugIndicator.addEventListener("click", function (event) {
    getFakeTweet();
  });
  document.body.appendChild(debugIndicator);
  if (!tweet) return;

  const timelineLoaded = new CustomEvent("timelineLoaded");
  const dreamAdded = new CustomEvent("dreamTweetInserted", { detail: "added" });
  const dreamRemoved = new CustomEvent("dreamTweetInserted", {
    detail: "removed",
  });
  let dreamInViewDetected;
  const dreamInView = new CustomEvent("dreamView", { detail: "inView" });
  const dreamOutOfView = new CustomEvent("dreamView", {
    detail: "outOfView",
  });
  const points = [];

  const addDetectRc = (el) => {
    // const keyDown = (e) => {
    //   detect(e);
    // };

    // code = "";

    // el.addEventListener("keydown", detect);
    // let timer;
    el.addEventListener("mouseover", (event) => {
      const keyDown = (e) => {
        detect(e);
      };
      document.body.addEventListener("keyup", detect);
      //
      // el.addEventListener("keydown", keyDown); // do it to tthe elemnt no the body
      el.addEventListener("mouseleave", (event) => {
        document.body.removeEventListener("keyup", detect);
      });
    });

    // el.addEventListener("mouseout", function (event) {
    //   //remove style
    //   clearTimeout(timer);
    // });
    function detect(e) {
      if (e.code === "KeyR") {
        const link = getFeedItemTwitterLink(e.target);
        // if (!points.filter((p) => p.url && p.url === link).length) {
        alert("You are awake! +++1point");
        // e.target.style.background =
        //   "linear-gradient(rgb(199 189 255), rgb(203 250 255))";
        document.getElementById("dream").style.background =
          "linear-gradient(rgb(199 189 255), rgb(203 250 255))";
        // points.push({
        //   interaction: "realityChecked",
        //   url: link,
        // });
        patchRC("realityChecked", tweet._id);
      }
    }
  };

  document.body.addEventListener(
    "timelineLoaded",
    (e) => {
      document.body.timelineLoaded = true;
      insertDream();
    },
    false
  );

  document.body.addEventListener(
    "dreamView",
    function (e) {
      debugIndicator.style.border =
        e.detail === "inView" ? "5px solid green" : "4px solid orange";
      dreamInViewDetected = e.detail === "inView";
      if (e.detail === "inView") points.push({ interaction: "inView" });
    },
    false
  );
  document.body.addEventListener(
    "dreamTweetInserted",
    function (e) {
      debugIndicator.style.background = e.detail === "added" ? "blue" : "red";
    },
    false
  );

  windowPosition = () => ({
    top: window.scrollY,
    bottom: window.innerHeight + window.scrollY,
  });
  addButtonStyle = (main, type) => {
    els = main.querySelectorAll(
      "." + buttonStyles[type].default.classes.outer.split(" ").join(".")
    );
    indexes = { more: 0, comment: 1, retweet: 2, heart: 3, share: 4 };
    const el = els[indexes[type]];

    el.addEventListener("mouseover", function (event) {
      inner = el.children[0].children[0];
      inner.classList.remove(...inner.classList);
      el.classList.remove(...el.classList);
      inner.classList.add(
        ...buttonStyles[type].onHover.classes.inner.split(" ")
      );
      el.classList.add(...buttonStyles[type].onHover.classes.outer.split(" "));
      if (buttonStyles[type].onHover.style.inner) {
        inner.style.backgroundColor =
          buttonStyles[type].onHover.style.inner.backgroundColor;
      }
      if (buttonStyles[type].onHover.style.outer) {
        el.style.color = buttonStyles[type].onHover.style.outer.color;
      }
    });
    el.addEventListener("click", function (event) {
      dreamSignMissed(tweet, "clicked");
    });
    el.addEventListener("mouseout", function (event) {
      inner = el.children[0].children[0];
      inner.classList.remove(...inner.classList);
      el.classList.remove(...el.classList);
      inner.classList.add(
        ...buttonStyles[type].default.classes.inner.split(" ")
      );
      el.classList.add(...buttonStyles[type].default.classes.outer.split(" "));

      if (buttonStyles[type].onHover.style) {
        el.style = "";
        inner.style = "";
      }
    });
  };
  addMouseOverTweetEvent = (el) => {
    el.addEventListener("mouseover", function (event) {
      //add style
      el.style.backgroundColor =
        twitterStyles.focusOnTweet.onHover.style.backgroundColor;
    });
    el.addEventListener("click", function (event) {
      dreamSignMissed(tweet, "clicked");
    });
    el.addEventListener("mouseout", function (event) {
      //remove style

      el.style = "";
    });
  };
  addMouseOverNameEvent = (el) => {
    let timer;
    el.addEventListener("mouseover", function (event) {
      //add style

      el.querySelector(
        "div[dir=auto].css-901oao.r-1awozwy.r-18jsvk2.r-6koalj.r-37j5jr.r-a023e6.r-b88u0q.r-rjixqe.r-bcqeeo.r-1udh08x.r-3s2u2q.r-qvutc0"
      ).style.textDecorationLine =
        twitterStyles.focusOnName.onHover.style["text-decoration-line"];

      timer = setTimeout(function () {
        dreamSignMissed(tweet, "clicked");
      }, 2000);
    });
    el.addEventListener("click", function (event) {
      dreamSignMissed(tweet, "clicked");
    });
    el.addEventListener("mouseout", function (event) {
      //remove style
      clearTimeout(timer);

      el.querySelector(
        "div[dir=auto].css-901oao.r-1awozwy.r-18jsvk2.r-6koalj.r-37j5jr.r-a023e6.r-b88u0q.r-rjixqe.r-bcqeeo.r-1udh08x.r-3s2u2q.r-qvutc0"
      ).style = "";
    });
  };

  feed = () =>
    document.querySelector('[aria-label="Timeline: Your Home Timeline"]')
      .children[0];

  getTransformPosition = (el) => {
    currentPosition = el.style.transform.match(/(?<=\()(.*)(?=px\))/g)[0];
    return +currentPosition;
  };
  info = () =>
    getAllFeedItems().map((el) => {
      trans = getTransformPosition(el);
      next = +trans + el.clientHeight;
      const obj = { trans, next };
      if (el.id) obj.id = el.id;
      return obj;
    });
  balanced = () => {
    return info().reduce((a, c, i, arr) => {
      if (i === 0) {
        return a;
      } else if (a === false) {
        return a;
      } else {
        last = arr[i - 1];
        if (last.next !== c.trans) {
          return false;
        }
        if (i === arr.length - 1) {
          return true;
        }
      }
    }, null);
  };
  adjust = (div) => {
    const allItems = getAllFeedItems();

    const before = allItems[allItems.indexOf(div) - 1];
    const newPos = getTransformPosition(before) + before.clientHeight;
    const transform = `translateY(${newPos}px)`;
    if (div.style.transform === transform) {
      console.log("already in correct place div: " + allItems.indexOf(div));
      return;
    }
    div.style.transform = transform;
    if (div.style.transform !== transform) {
      console.log("not adjusted div: " + allItems.indexOf(div));
    }
    return div;
  };
  balance = () => {
    const allItems = getAllFeedItems();
    allItems.slice(1).forEach((div) => {
      adjust(div);
    });
    return info();
  };
  getAllFeedItems = () => [...feed().children];
  feedInfo = () => {
    array = [...feed().children];
    return array.map((i) => {
      trans = i.style.transform.match(/(?<=\()(.*)(?=px\))/g)[0];
      next = +trans + i.clientHeight;
      return trans + " next: " + next + " " + i.id;
    });
  };

  getFeedItemTwitterLink = (el) => {
    const promoted = !![...el.querySelectorAll("span")].find(
      (s) => s.innerText.slice(0, 8) === "Promoted"
    );
    if (promoted) {
      console.log("no link, tweet promoted");
      return null;
      // [...el.querySelectorAll('a')].map(p=>p.href)
      //  ['https://twitter.com/Macys', 'https://twitter.com/Macys', 'https://twitter.com/hashtag/MacysParade?src=hashtag_click', 'https://twitter.com/MakeAWish', 'https://www.macys.com/social/macys-parade-nft/?cm_…nw=&m_cn=NOV1_NOPRO_LOVE_HOLIDAY_NFT_TW&m_au=xxxx']
    } else if (el.querySelectorAll("a")[0]) {
      return [...el.querySelectorAll("a")]
        .find((a) => a.href && a.href.match("status"))
        .href.slice(19);
    } else {
      return null;
    }
  };
  getNewItem = () => {
    let el = document.getElementById("new-item");
    return el ? document.getElementById("new-item").parentElement : null;
  };
  getFeedItemByTweetLink = (link) => {
    const a = document.querySelectorAll(`a[href='${link}']`);
    if (a.length) {
      return document.querySelectorAll(`a[href='${link}']`)[0].parentElement
        .parentElement.parentElement.parentElement.parentElement.parentElement
        .parentElement.parentElement.parentElement.parentElement.parentElement
        .parentElement.parentElement;
    } else {
      return null;
    }
  };
  dreamTweetInCorrectPosition = () => {
    allItems = getAllFeedItems();
    dream = getNewItem();
    if (!dream) {
      console.log("no dream tweet");
      return null;
    }
    dream.id = "dream";
    itemBefore = getFeedItemByTweetLink(linkOfItemBefore);
    currentDreamIndex = allItems.indexOf(dream);
    if (!itemBefore) {
      dream.remove();
      document.body.dispatchEvent(dreamRemoved);

      dreamSignAdded = false;
      console.log("dream Sign REMOVED");

      return null;
    } else {
      itemBefore.id = "before";
      shouldBeDreamIndex = allItems.indexOf(itemBefore) + 1;
      return currentDreamIndex === shouldBeDreamIndex;
    }
  };

  hasGreyLine = (el) => {
    let divs = el.querySelectorAll("div");

    divs = Array.from(divs);
    const arr = divs.filter(
      (div) =>
        String(
          document.defaultView.getComputedStyle(div, null).borderBottomColor
        ) == "rgb(239, 243, 244)"
    );
    return arr.length;
  };

  putDreamSignTweetAfterEl = (itemBefore, dreamTweet) => {
    if (!dreamTweet) dreamTweet = getNewItem();
    allItems = getAllFeedItems();
    dreamTweet.id = "dream";

    newIndex = allItems.indexOf(itemBefore) + 1;
    try {
      itemBefore.parentNode.insertBefore(dreamTweet, allItems[newIndex]);
      document.body.dispatchEvent(dreamAdded);
    } catch (error) {
      alert("fix: ", error);
    }
  };

  fix = () => {
    const itemBefore = getFeedItemByTweetLink(linkOfItemBefore);
    if (getNewItem() && dreamTweetInCorrectPosition() === false && itemBefore) {
      putDreamSignTweetAfterEl(itemBefore);
      dreamSignAdded = true;
    }
    if (getNewItem()) {
      getNewItem().style.opacity = 1;
    }

    if (!balanced()) {
      balance();
    }
  };

  // Callback function to execute when mutations are observed
  const callbackDeleteTrend = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // other elements are loading timeline
        const trending = document.querySelector(
          '[aria-label="Timeline: Trending now"]'
        );

        if (trending) return trending.remove();
        // multiple have this label oops fix!
        let loading = document.querySelector('[aria-label="Loading"]');
        if (loading)
          subObserverDeleteTrend.observe(loading, {
            attributeFilter: ["id"],
          });
        loading = document.querySelector('[aria-label="Loading timeline"]');
        if (loading)
          subObserverDeleteTrend.observe(loading, {
            attributeFilter: ["id"],
          });
      }
    }
  };

  // Callback function to execute when mutations are observed
  const subCallbackDeleteTrend = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      alert("sub loading");
    }
  };

  const subObserverDeleteTrend = new MutationObserver(subCallbackDeleteTrend);
  const observerDeleteTrend = new MutationObserver(callbackDeleteTrend);
  handleAwaitTimeline = () => {
    const timeline = document.querySelector(
      '[aria-label="Timeline: Your Home Timeline"]'
    );
    const timelineChildren = timeline && timeline.children.length;
    const loading = timeline && timeline.querySelector("[role=progressbar]");
    if (timelineChildren && !loading)
      document.body.dispatchEvent(timelineLoaded);
  };
  handleTimelineUpdated = () => {
    // other elements are loading timeline
  };

  // Callback function to execute when mutations are observed
  const callbackForAllChanges = function (mutationsList, observer) {
    if (!document.body.timelineLoaded) {
      handleAwaitTimeline();
    } else if (mutationsList.find((record) => record.type === "childList")) {
      if (!dreamSignAdded) insertDream();
      fix();
    }
  };

  const allChanges = new MutationObserver(callbackForAllChanges);

  // set observer
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      allChanges.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ["style", "id"],
        attributeOldValue: true,
      });

      observerDeleteTrend.observe(document.body, { childList: true });
    });
  } else {
    allChanges.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ["style", "id"],
      attributeOldValue: true,
    });
    observerDeleteTrend.observe(document.body, { childList: true });
  }

  // Start observing the target node for configured mutations
  update = () => {
    allitems = getAllFeedItems();

    lu = allitems.findIndex((div) => div.id === "last-updated");

    if (lu > -1) {
      allitems.slice(lu + 1).forEach((div) => {
        newPos = getNewElPosition(div, newI.clientHeight);
        div.style.transform = `translateY(${newPos})`;
      });
      //not quite?
      allitems[lu].id = "";
      allitems[allitems.length - 1].id = "last-updated";
    }
  };

  getPosition = (el) => {
    let currentPosition = window.pageYOffset + el.getBoundingClientRect().top;
    return currentPosition;
  };

  getNewElPosition = (el, pxDown) => {
    const currentPosition = el.style.transform.match(/(?<=\()(.*)(?=px\))/g)[0];
    const newPosition = pxDown + +currentPosition;
    return newPosition + "px";
  };

  handleDreamView = async () => {
    const { top, bottom } = windowPosition();
    const dream = getNewItem();
    if (!dream) return;
    const dreamTop = getPosition(dream);
    const dreamBottom = dreamTop + dream.offsetHeight;
    dreamInScreenNow = !(dreamBottom < top || dreamTop > bottom);

    if (dreamInScreenNow && !dreamInViewDetected) {
      document.body.dispatchEvent(dreamInView);
    } else if (!dreamInScreenNow && dreamInViewDetected) {
      document.body.dispatchEvent(dreamOutOfView);
    }

    if (!tweet.enteredScreen && dreamTop < bottom && dreamTop > top) {
      tweet.enteredScreen = true;
    }

    if (tweet.enteredScreen && dreamBottom < top && !tweet.missed) {
      dreamSignMissed(tweet, "passed");
    }
  };

  insertNodeBeforeEl = (node, elNum, all) =>
    all[elNum - 1].parentNode.insertBefore(node, all[elNum]);

  let dreamSignAdded = false;
  let linkOfItemBefore;
  let tweetPosition;
  // let tweet = Math.floor(Math.random() * (tweets.length - 1));

  insertDream = () => {
    allItems = getAllFeedItems();
    if (allItems.length < 3) return; //is there a better way?

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }
    tweetPosition = getRandomInt(0, allItems.length);
    newEl = document.createElement("div");
    if (!allItems[tweetPosition]) alert("oops");
    values = Object.values(allItems[tweetPosition].style);
    values.forEach((val) => {
      if (val === "") return;
      newEl.style[val] = allItems[tweetPosition].style[val];
    });

    newEl.innerHTML = tweet.html;
    newEl.children[0].id = "new-item";
    addButtonStyle(newEl, "share");
    addButtonStyle(newEl, "heart");
    addButtonStyle(newEl, "comment");
    addButtonStyle(newEl, "retweet");
    addButtonStyle(newEl, "more");
    addMouseOverTweetEvent(newEl.querySelector("[role=article]"));
    addMouseOverNameEvent(
      newEl.querySelector(
        "a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l"
      )
    );
    addDetectRc(newEl);
    svg = newEl.querySelector(
      "#new-item > div > article > div > div > div > div:nth-child(1) > div > div > div > div > div > svg"
    );
    if (svg) {
      svg.style.height = "16px";
      svg.style.width = "16px";
    }
    if (!linkOfItemBefore)
      linkOfItemBefore =
        (allItems[tweetPosition - 1] &&
          getFeedItemTwitterLink(allItems[tweetPosition - 1])) ||
        (allItems[tweetPosition - 2] &&
          getFeedItemTwitterLink(allItems[tweetPosition - 2])); // minus 1 could be a divider so we move to minus 2
    if (!linkOfItemBefore) return;
    console.log(linkOfItemBefore);
    const itemBefore = getFeedItemByTweetLink(linkOfItemBefore);
    if (itemBefore) {
      if (hasGreyLine(itemBefore)) {
        putDreamSignTweetAfterEl(itemBefore, newEl);
        dreamSignAdded = true;
      } else {
        linkOfItemBefore = null;
        dreamSignAdded = false;
        return;
      }
    }
  };

  window.onscroll = function (e) {
    handleDreamView();
  };
})();
