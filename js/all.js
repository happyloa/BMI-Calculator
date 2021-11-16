/* 
網路上找到的參考資料：
https://reurl.cc/95abZv
https://recafox.github.io/2020/02/03/2020-02-03/
*/

// 宣告一個 JSON ，定義各種 BMI 級距
const bmiSettings = [
  {
    maxBMI: 18.5,
    color: "#31BAF9",
    text: "過輕",
  },
  {
    maxBMI: 24,
    color: "#86D73E",
    text: "理想",
  },
  {
    maxBMI: 27,
    color: "#FF982D",
    text: "過重",
  },
  {
    maxBMI: 1000,
    color: "#FF1200",
    text: "肥胖",
  },
];
let record = null;

// 宣告一個 history 變數，專門從 localStorage 裡面抓 JSON 出來
let history = JSON.parse(localStorage.getItem("history"));

// BMI換算函式
let calcBMI = (tall, weight) => {
  // 將使用者在 UI 上填入的公分身高換算成公尺（除以 100）
  let meter = tall / 100;
  // 回傳換算結果（體重除以身高的平方）
  return weight / (meter * meter);
};

// 紀錄結果到換算紀錄
let saveToHistory = () => {
  if (record == null) return;

  // 將資料放入換算結果物件內
  let idx;
  if (history == null) {
    history = { maxIdx: 0, data: {} };
    idx = 0;
  } else {
    idx = history.maxIdx + 1; // 如果換算結果不是空的，那就加一筆資料進去
  }
  history.maxIdx = idx;
  history.data[idx] = {
    bmiLevel: record.bmiLevel,
    bmi: record.bmi,
    weight: record.weight,
    height: record.height,
    // 將日期轉換為本地字串
    // 參考資料：https://ithelp.ithome.com.tw/articles/10227080
    date: new Date().toLocaleString(),
  };

  // 將資料命名為 history ，轉換成字串後存到 localStorage 裡面
  localStorage.setItem("history", JSON.stringify(history));

  // 更新換算紀錄
  genAllRecordItems();
};

// 把資料從 record 中抓出來比較，依照結果在換算紀錄中產生對應的資料
let genRecordItem = (record) => {
  // 宣告一個變數，依照比較結果存放對應的 Class 名稱
  let flagTypeStr = "";
  // 用 switch 依照 record 物件中的 bmiLevel 屬性來作為設定 Class 的判斷依據
  switch (record.bmiLevel) {
    case 0:
      flagTypeStr = "flag-too-light";
      break;
    case 1:
      flagTypeStr = "flag-ideal";
      break;
    case 2:
      flagTypeStr = "flag-too-heavy";
      break;
    case 3:
      flagTypeStr = "flag-obesity";
      break;
  }
  // 將換算結果還有日期組合在一起，組出 DOM 元素
  let html = `
  <li class="item flex-rsbc" data-idx="0">
    <div class="flag ${flagTypeStr}"></div>
    <div class="data">${bmiSettings[record.bmiLevel].text}</div>
    <div class="data flex-rcc">
      <div class="small">BMI</div>
      <span>${record.bmi}</span>
    </div>
    <div class="data flex-rcc">
      <div class="small">weight</div>
      <span>${record.weight}kg</span>
    </div>
    <div class="data flex-rcc">
      <div class="small">height</div>
      <span>${record.height}</span>
    </div>
    <div class="data">
      <div class="small">${record.date}</div>
    </div>
  </li>
  `;
  return html;
};

// 產生換算紀錄
let genAllRecordItems = () => {
  if (!history) return;

  let innerHTML = "";
  for (let i = history.maxIdx; i >= 0; i--) {
    if (history.data[i]) {
      innerHTML += genRecordItem(history.data[i]);
    }
  }
  // 將資料 DOM 到頁面上
  elHistoryList.innerHTML = innerHTML;
};

//=== 各種 DOM 選擇器 ===
let elFieldTall = document.querySelector("#tall");
let elFieldWeight = document.querySelector("#weight");
let elBMI = document.querySelector("#bmi");
let elBtnCalc = document.querySelector(".btn-calc");
let elShowResult = document.querySelector(".show-result");
let elResultCircle = document.querySelector(".result-circle");
let elResultText = document.querySelector(".result-text");
let elBtnRecalc = document.querySelector(".btn-recalc");
let elBtnSave = document.querySelector(".btn-save");
let elHistoryList = document.querySelector(".history-list");
let clearLocalStorage = document.querySelector(".clearLocalStorage");

//四捨五入 BMI 數值作為體態判斷依據
let calc = () => {
  let bmi = calcBMI(elFieldTall.value, elFieldWeight.value);
  bmi = Math.round(bmi * 100) / 100;

  // 介面更新
  if (bmi) {
    // 顯示、隱藏結果按鈕
    elBtnCalc.setAttribute("class", "btn-calc flex-rcc user-select-none hide");
    elShowResult.setAttribute("class", "show-result flex-rlc");

    // 拿 calc 的四捨五入結果判斷 BMI 狀態
    let bmiLevel = 0;
    if (bmi < bmiSettings[0].maxBMI) {
      bmiLevel = 0; // 過輕
    } else if (bmi < bmiSettings[1].maxBMI) {
      bmiLevel = 1; // 理想
    } else if (bmi < bmiSettings[2].maxBMI) {
      bmiLevel = 2; // 過重
    } else {
      bmiLevel = 3; // 肥胖
    }

    // 依照換算結果設定結果按鈕樣式
    elShowResult.setAttribute("style", `color: ${bmiSettings[bmiLevel].color}`);
    elResultCircle.setAttribute(
      "style",
      `border: 6px solid ${bmiSettings[bmiLevel].color}; box-shadow: 0 1px 6px 3px ${bmiSettings[bmiLevel].color} inset;`
    );
    elBMI.textContent = bmi;
    elResultText.textContent = bmiSettings[bmiLevel].text;
    elBtnRecalc.setAttribute(
      "style",
      `background-color: ${bmiSettings[bmiLevel].color}`
    );
    elBtnSave.setAttribute(
      "style",
      `background-color: ${bmiSettings[bmiLevel].color}`
    );

    // 將資料放進 record 物件
    record = {};
    record.bmiLevel = bmiLevel;
    record.bmi = bmi;
    record.weight = elFieldWeight.value;
    record.height = elFieldTall.value;
  }
};
// 監聽事件，按下按鈕執行相對應的函式
elBtnCalc.addEventListener("click", calc);
elBtnRecalc.addEventListener("click", calc);
elBtnSave.addEventListener("click", saveToHistory);
clearLocalStorage.addEventListener("click", removeHistory);

// 清除 localStorage 並重新整理頁面
function removeHistory() {
  localStorage.clear();
  location.reload();
}

// 更新換算紀錄
genAllRecordItems();
