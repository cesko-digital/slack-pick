async function getMessageData() {
  const dataUrl =
    "https://data-cesko-digital.s3.eu-central-1.amazonaws.com/slack-pick/1/messages.json";
  const response = await fetch(dataUrl);
  return await response.json();
}

function elem(elementName, attributes) {
  const elem = document.createElement(elementName);
  for (const [key, val] of Object.entries(attributes || {})) {
    elem.setAttribute(key, val);
  }
  return elem;
}

function renderMetadata(msg) {
  const div = elem("div", { class: "metadata" });
  const date = new Date(msg.timestamp);
  div.innerHTML = `
    Posted
    in <a href="${msg.channel.permalink}">#${msg.channel.name}</a>
    by ${msg.user.username}
    on ${date.toLocaleDateString("cs-CZ")} (${date.toLocaleTimeString("cs-CZ")})
    / <a href="${msg.permalink}">open in Slack</a>
    .`;
  return div;
}

function renderStats(data) {
  const div = elem("div", { class: "stats" });
  const date = new Date(data.timestamp);
  div.innerText = `${
    data.messages.length
  } messages total, last data update ${date.toLocaleDateString(
    "cs-CZ"
  )} at ${date.toLocaleTimeString("cs-CZ")}.`;
  return div;
}

function renderMessage(msg) {
  const div = elem("div", { class: "message" });
  const p = elem("p");
  p.innerText = msg.text;
  div.appendChild(p);
  div.appendChild(renderMetadata(msg));
  return div;
}

function renderData(data) {
  const div = document.createElement("div");
  for (const msg of data.messages) {
    div.appendChild(renderMessage(msg));
  }
  return div;
}

async function main() {
  const mountPoint = document.getElementById("mountpoint");
  mountPoint.innerText = "Loading data…";
  try {
    const data = await getMessageData();
    mountPoint.replaceChild(renderData(data), mountPoint.firstChild);
    mountPoint.appendChild(renderStats(data));
  } catch (err) {
    mountPoint.innerText = "Error loading data, please see the console.";
    console.error(err);
  }
}

main();
