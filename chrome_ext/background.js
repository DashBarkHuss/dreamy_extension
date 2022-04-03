chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //   if (request.event_type === "DreamSign") {
  const eventType = msg.event_type;
  if (eventType === "GetTweet") {
    getAFakeTweet().then((i) => {
      console.log(i);
      response(i);
    });
  } else if (eventType === "DreamSign") {
    realityCheck(msg.body).then(response);
  }
  return true;
});

async function getAFakeTweet() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  let tweet;
  tweet = await fetch(`http://localhost:${3001}/api/fakeTweets`, {
    method: "GET",
    headers,
    credentials: "include",
  })
    .then(async (res) => {
      if (res.status >= 200 && res.status < 300) return await res.json();

      // i dont think this returns an error. it returns an empty object to the caller.
      if (res.status === 401) return new Error("401 not logged in.");
    })
    .catch((err) => {
      console.log(err);
    });
  return tweet;
}

const realityCheck = async (tweet) => {
  console.log("40");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const resp = await fetch(`http:localhost:3001/api/users`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(tweet),
  })
    .then(async (res) => {
      if (res.status === 201) return true;
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
  return resp;
};
// chrome.runtime.onMessage.addListener((msg, sender, response) => {
//   requestFromClient(msg).then(response);
//   return true;
// });

// async function requestFromClient(data) {
//   const headers = new Headers();
//   headers.append("Content-Type", "application/json");

//   let tweet;
//   tweet = await fetch(`http://localhost:${3001}/api/fakeTweets`, {
//     method: "GET",
//     headers,
//     credentials: "include",
//   })
//     .then(async (res) => {
//       return await res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   return tweet;
// }

// chrome.runtime.onMessage.addListener(async function (
//   request,
//   sender,
//   sendResponse
// ) {
//   if (request.event_type === "DreamSign") {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       //   fetch(`http:localhost:3001/api/users`, { method: "POST" });
//       const headers = new Headers();
//       headers.append("Content-Type", "application/json");
//       fetch(`http://localhost:${3001}/api/users`, {
//         method: "PATCH",
//         headers,
//         credentials: "include",
//         body: JSON.stringify(request.body),
//       })
//         .then((res) => console.log(res.status))
//         .catch((err) => alert(err));
//     });
//   }

//   if (request.event_type === "GetTweet") {
//     const requestFromClient = async (data) => {
//       const headers = new Headers();
//       headers.append("Content-Type", "application/json");

//       let tweet;
//       tweet = await fetch(`http://localhost:${3001}/api/fakeTweets`, {
//         method: "GET",
//         headers,
//         credentials: "include",
//       })
//         .then(async (res) => {
//           return await res.json();
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//       return tweet;
//     };
//     const tweet = await requestFromClient();
//     sendResponse(tweet);
//     // chrome.tabs.query(
//     //   { active: true, currentWindow: true },
//     //   async function (tabs) {
//     //     //   fetch(`http:localhost:3001/api/users`, { method: "POST" });

//     //     const headers = new Headers();
//     //     headers.append("Content-Type", "application/json");

//     //     let tweet;
//     //     await fetch(`http://localhost:${3001}/api/fakeTweets`, {
//     //       method: "GET",
//     //       headers,
//     //       credentials: "include",
//     //     })
//     //       .then(async (res) => {
//     //         tweet = await res.json();
//     //         sendResponse(tweet);
//     //       })
//     //       .catch((err) => {
//     //         console.log(err);
//     //       });
//     //     sendDetails(tweet);
//     //   }
//     // );
//   }
// });

// /// test send on
// // chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
// //   if (changeInfo.status == "complete") {
// //     chrome.tabs.query({ active: true }, function (tabs) {
// //       chrome.tabs.sendMessage(tabs[0].id, { message: "sample_msg" });
// //     });
// //   }
// // });

// // /Send message to content script
// function sendDetails(sendData) {
//   chrome.tabs.query({ active: true }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, sendData);
//   });
//   //Select tab
//   //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   //     //Construct & send message
//   //     chrome.tabs.sendMessage(tabs[0].id, sendData, function (response) {
//   //       //On response alert the response
//   //       alert("The response from the content script: " + response.response); //You have to choose which part of the response you want to display ie. response.response
//   //     });
//   //   });
// }
