import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import AddHtml from "./components/AddHtml";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App() {
  const [user, setUser] = useState();
  const [dreamSignTotal, setDreamSignTotal] = useState();

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    fetch("http://localhost:3001/users/current", {
      credentials: "include",
      headers,
    }).then(async (res) => {
      if (res.status === 401) return setUser(null);
      const json = await res.json();
      setUser(json);
    });
  }, []);

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    fetch("http://localhost:3001/api/faketweets?fields=total", {
      credentials: "include",
      headers,
    }).then(async (res) => {
      if (res.status === 200) {
        const json = await res.json();
        setDreamSignTotal(json.total);
      }
    });
  }, []);

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    fetch("http://localhost:3001/users/current", {
      credentials: "include",
      headers,
    }).then(async (res) => {
      if (res.status === 401) return setUser(null);
      const json = await res.json();
      setUser(json);
    });
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
              }}
            >
              {user && (
                <>
                  <h2>
                    <span style={{ fontSize: "2em" }}>
                      {
                        user.dreamSigns.filter(
                          (ds) => ds.action === "realityChecked"
                        ).length
                      }
                    </span>{" "}
                    reality checks
                  </h2>
                  <h2>
                    {dreamSignTotal &&
                      dreamSignTotal -
                        user.dreamSigns.filter((ds) => ds.action).length}{" "}
                    dream sign available to capture
                  </h2>
                  <h2>
                    {
                      user.dreamSigns.filter((ds) => ds.action === "missed")
                        .length
                    }{" "}
                    dream signs missed
                  </h2>{" "}
                  <h2>
                    <a href="http://localhost:3001/twitter/authenticate">
                      See your spot on the leaderboard
                    </a>
                  </h2>{" "}
                </>
              )}
              {/* is this good? */}
              {user !== undefined && !user && (
                <a
                  href="http://localhost:3001/twitter/authenticate"
                  // onClick={() => {
                  //   fetch("http://localhost:3001/twitter/authenticate");
                  // }}
                >
                  login with twitter
                </a>
              )}
            </div>
          }
        />
        <Route path="/add_tweet" element={<AddHtml />} />
      </Routes>
    </Router>
  );
}

// 6 dream signs missed
// 12 reality checks
// 4 dreams signs captures

export default App;
