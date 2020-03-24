async function getMessageData() {
  const dataUrl = "https://data.cesko.digital/slack-pick/1/messages.json";
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
  div.innerHTML = `
    Posted
    in <a href="${msg.channel.permalink}">#${msg.channel.name}</a>
    by ${msg.user.username},
    <a href="${msg.permalink}">open in Slack</a>
    .`;
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
  } catch (err) {
    mountPoint.innerText = "Error loading data, please see the console.";
    console.error(err);
  }
}

main();
