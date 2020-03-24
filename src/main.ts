import * as slack from "slack";
import { writeFileSync } from "fs";

// Incoming data

interface Channel {
  id: string;
  name: string;
}

interface Match {
  text: string;
  permalink: string;
  username: string;
  user: string;
  channel: Channel;
  ts: string;
}

interface Response {
  messages: {
    total: number;
    matches: Match[];
  };
}

// Output data

interface Message {
  text: string;
  permalink: string;
  user: {
    id: string;
    username: string;
  };
  channel: {
    id: string;
    name: string;
    permalink: string;
  };
  timestamp: string;
}

interface Envelope {
  timestamp: string;
  messages: Message[];
}

const toJSON = (obj: any) => JSON.stringify(obj, null, 2);

/** Convert Slack-style timestamp to ISO date stamp */
function convertTimestamp(slackTS: string): string {
  const [unixTime, _] = slackTS.split(".");
  return new Date(parseInt(unixTime) * 1000).toISOString();
}

async function getTaggedMessages(
  token: string,
  channelName: string | null = null
): Promise<Message[]> {
  const query =
    channelName != null ? `has::mega: in:${channelName}` : "has::mega:";
  const response = ((await slack.search.messages({
    token,
    query,
    sort: "timestamp"
  })) as unknown) as Response;
  return response.messages.matches.map(match => {
    return {
      text: match.text,
      permalink: match.permalink,
      user: {
        id: match.user,
        username: match.username
      },
      timestamp: convertTimestamp(match.ts),
      channel: {
        id: match.channel.id,
        name: match.channel.name,
        permalink: `https://cesko-digital.slack.com/archives/${match.channel.id}`
      }
    };
  });
}

function envOrDie(key: string): string {
  const val = process.env[key];
  if (val == null) {
    throw `Please define the ${key} env variable.`;
  }
  return val;
}

async function main() {
  const token = envOrDie("SLACK_USER_TOKEN");
  const msgs = await getTaggedMessages(token);
  const wrapped: Envelope = {
    timestamp: new Date().toISOString(),
    messages: msgs
  };
  writeFileSync("messages.json", toJSON(wrapped));
}

main();
