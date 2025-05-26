document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const resultBox = document.getElementById("result-box");

  // Circle elements
  const easyLabel = document.getElementById("easy-level");
  const mediumLabel = document.getElementById("medium-level");
  const hardLabel = document.getElementById("hard-level");
  const easyCircle = document.querySelector(".easy-progress").parentElement;
  const mediumCircle = document.querySelector(".medium-progress").parentElement;
  const hardCircle = document.querySelector(".hard-progress").parentElement;

  function validateUsername(username) {
    if (username.trim() === "") {
      resultBox.innerHTML = `<span style="color:red;">❌ Username should not be empty</span>`;
      return false;
    }
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      resultBox.innerHTML = `<span style="color:red;">❌ Invalid Username (3-16 chars, starts with letter, letters/numbers/_ allowed)</span>`;
    }
    return isMatching;
  }

  searchButton.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    resultBox.innerHTML = "";

    if (!validateUsername(username)) return;

    fetchUserDetails(username);
  });

  async function fetchUserDetails(username) {
    searchButton.textContent = "Searching...";
    searchButton.disabled = true;
    resultBox.innerHTML = "";

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const url = "https://leetcode.com/graphql";
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
    const variables = { username };

    try {
      const response = await fetch(proxyUrl + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
      });

      const json = await response.json();
      const stats = json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

      if (!stats) {
        resultBox.innerHTML = `<span style="color:red;">❌ User not found!</span>`;
        return;
      }

      // Process stats and update progress
      const result = {};
      stats.forEach(entry => {
        result[entry.difficulty] = entry.count;
      });

      updateProgress(result.Easy, result.All, easyLabel, easyCircle);
      updateProgress(result.Medium, result.All, mediumLabel, mediumCircle);
      updateProgress(result.Hard, result.All, hardLabel, hardCircle);
    } catch (error) {
      console.error("Error fetching LeetCode stats:", error);
      resultBox.innerHTML = `<span style="color:red;">❌ Error fetching data. Try again later.</span>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  
});
