/** Return message data as a parsed object */
async function getMessageData() {
  const dataUrl =
    "https://data-cesko-digital.s3.eu-central-1.amazonaws.com/slack-pick/1/messages.json";
  const response = await fetch(dataUrl);
  return await response.json();
}

/** Create element, optionally setting attributes from the second argument */
function elem(elementName, attributes) {
  const elem = document.createElement(elementName);
  for (const [key, val] of Object.entries(attributes || {})) {
    elem.setAttribute(key, val);
  }
  return elem;
}

/**
 * Turn Slack message text into HTML
 *
 * This is probably quite wrong, especially security-wise.
 */
function renderText(text) {
  // Basic sanitization. Is this enough?
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");

  text = text.replace(/\n/g, "<br>");

  text = text.replace(
    /&lt;(https?:.+?)(\|(.+?))?&gt;/gi,
    (_, url, __, label) => {
      return `<a href="${url}">${label || url}</a>`;
    }
  );

  return text;
}

/** Return an array with all channel names present in data */
function getAllChannelNames(data) {
  return [...new Set(data.messages.map(msg => msg.channel.name))];
}

/** Render the channel selector */
function renderChannelToggle(data) {
  const select = elem("select");
  for (const channel of getAllChannelNames(data)) {
    const option = elem("option", { value: channel });
    option.innerText = "#" + channel;
    select.appendChild(option);
  }
  select.onchange = () => {
    displayChannel(data, select.value);
  };
  return select;
}

/** Render message metadata: author, timestamp, etc. */
function renderMetadata(msg) {
  const div = elem("div", { class: "metadata" });
  const date = new Date(msg.timestamp);
  div.innerHTML = `
    Posted
    by ${msg.user.username}
    on ${date.toLocaleDateString("cs-CZ")}
    (${date.toLocaleTimeString("cs-CZ")}).
    <a href="${msg.permalink}">Open in Slack</a>
    `;
  return div;
}

/** Render overall stats: message count etc. */
function renderStats(data) {
  const div = elem("div", { class: "footer" });
  const date = new Date(data.timestamp);
  div.innerHTML = `
    ${data.messages.length} messages total.<br>
    Last data update ${date.toLocaleDateString("cs-CZ")}
    at ${date.toLocaleTimeString("cs-CZ")}.<br>
    <a href="https://github.com/cesko-digital/slack-pick/">
    Bug reports and feature requests welcome!</a>
  `;
  return div;
}

/** Render single message */
function renderMessage(msg) {
  const div = elem("div", { class: "message" });
  const p = elem("p");
  p.innerHTML = renderText(msg.text);
  div.appendChild(p);
  div.appendChild(renderMetadata(msg));
  return div;
}

/** Display content for given channel */
function displayChannel(data, name) {
  const container = document.getElementById("output");
  container.innerText = "";
  const matches = data.messages.filter(msg => msg.channel.name === name);
  for (const msg of matches) {
    container.appendChild(renderMessage(msg));
  }
}

async function main() {
  const mountPoint = document.getElementById("mountpoint");
  mountPoint.innerText = "Loading data…";
  try {
    const data = await getMessageData();
    mountPoint.replaceChild(renderChannelToggle(data), mountPoint.firstChild);
    mountPoint.appendChild(elem("div", { id: "output" }));
    mountPoint.appendChild(renderStats(data));
    displayChannel(data, getAllChannelNames(data)[0]);
  } catch (err) {
    mountPoint.innerText = "Error loading data, please see the console.";
    console.error(err);
  }
}

main();
