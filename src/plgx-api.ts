import got from "got";
import { config } from "dotenv";

const { parsed: ENV } = config();

if (!ENV.POLYLOGIX_BASE_URL) {
  console.error(
    "You likely forgot to add the POLYLOGIX_BASE_URL to your env file.\n",
    "Please create a .env file in the root folder and add the POLYLOGIX_BASE_URL"
  );

  process.exit(0);
}

console.log(`Initializing with base url ${ENV.POLYLOGIX_BASE_URL}`);

const getAuthToken = ({ auth }) => ({
  "x-access-token": auth?.token
});

const polylogixAPI = got.extend({
  prefixUrl: ENV.POLYLOGIX_BASE_URL,
  responseType: "json",
  rejectUnauthorized: false,
  headers: {
    "Content-Type": "application/json"
  }
});

const getNode = async (hostIdentifier: string, context) => {
  let results: any = await polylogixAPI
    .get(`nodes/${hostIdentifier}`, {
      headers: getAuthToken(context)
    })
    .json();

  return results?.data;
};

const getNodes = async (_, ctx) => {
  let results: any = await polylogixAPI
    .get("nodes", { headers: getAuthToken(ctx) })
    .json();

  return results?.data;
};

const updateNodeTags = ({
  add,
  remove,
  hostIdentifier
}: {
  add: string[];
  remove: string[];
  hostIdentifier: string;
}) =>
  polylogixAPI.post("nodes/tag/edit", {
    body: JSON.stringify({
      add_tags: add.join(","),
      remove_tags: remove.join(","),
      host_identifier: hostIdentifier
    })
  });

const getNodeTags = ({ hostIdentifier }) =>
  polylogixAPI.get(`nodes/${hostIdentifier}/tags`);

const createNodeTags = ({
  hostIdentifier,
  tags
}: {
  hostIdentifier: string;
  tags: string[];
}) =>
  polylogixAPI.post(`nodes/${hostIdentifier}/tags`, {
    body: JSON.stringify(tags.join(","))
  });

const getScheduledQueries = ({ hostIdentifier }) =>
  polylogixAPI.get(`nodes/schedule_query/${hostIdentifier}`);

const getScheduledQueriesResults = ({
  hostIdentifier,
  start,
  limit,
  queryName
}) =>
  polylogixAPI.post(`nodes/${hostIdentifier}/queryResult`, {
    form: {
      start,
      limit,
      query_name: queryName,
      host_identifier: hostIdentifier
    }
  });

const getNodeQueryResults = ({ hostIdentifier, start, length, searchValue }) =>
  polylogixAPI.post(`nodes/${hostIdentifier}/queryResult`, {
    form: {
      start,
      length,
      search: {
        value: searchValue
      }
    }
  });

const getNodeActivityResults = ({ hostIdentifier, timestamp }) =>
  polylogixAPI.post(`nodes/${hostIdentifier}/activity`, {
    body: JSON.stringify({
      timestamp
    })
  });

const getAllTags = () => polylogixAPI.get("/tags");

const addTags = ({ tags }: { tags: string[] }) =>
  polylogixAPI.post("tags/add", {
    body: JSON.stringify({
      tags: tags.join(",")
    })
  });

const getAlertsInfo = async (
  { hostIdentifier = "", queryName = "", ruleId = null },
  ctx
) => {
  let body = JSON.stringify({
    host_identifier: hostIdentifier,
    query_name: queryName,
    rule_id: ruleId
  });

  let results: any = await polylogixAPI
    .post("alerts", {
      body,
      headers: getAuthToken(ctx)
    })
    .json();

  return results?.data;
};

const getAlertData = ({ alertId }) =>
  polylogixAPI.get(`alerts/data/${alertId}`);

const addDistributedQueries = ({
  description,
  tags,
  query,
  nodes
}: {
  tags: string[];
  description: string;
  query: string;
  nodes: string[];
}) =>
  polylogixAPI.post("distributed/add", {
    body: JSON.stringify({
      query,
      description,
      tags: tags.join(","),
      nodes: nodes.join(",")
    })
  });

const login = ({ password, username }) => {
  return polylogixAPI
    .post("login", {
      body: JSON.stringify({ password, username })
    })
    .json();
};

const logout = () => polylogixAPI.post("logout");

const updateUserPassword = ({ currentPassword, newPassword }) =>
  polylogixAPI.post("changepw", {
    body: JSON.stringify({
      old_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: newPassword
    })
  });

const updateAPIKeys = ({ apiKeys }) => {
  const keys = apiKeys.reduce((allKeys, apiKey) => {
    return (allKeys[apiKey.api] = apiKey.key);
  }, {});
  return polylogixAPI.post("apikeys", {
    body: JSON.stringify(keys)
  });
};

const getAPIKeys = () => polylogixAPI.get("apikeys");

const updateOptions = ({ options }) => {
  polylogixAPI.post("options/add", {
    body: JSON.stringify({
      option: options
    })
  });
};

async function getQuery(_, { id }, ctx) {
  let result: any = await polylogixAPI
    .get(`queries/${id}`, {
      headers: getAuthToken(ctx)
    })
    .json();

  return result?.data;
}

async function getQueries(_, __, ctx) {
  let results: any = await polylogixAPI
    .get("queries", { headers: getAuthToken(ctx) })
    .json();

  return results?.data;
}

async function addOSQuery(_, { input }, ctx) {
  let body = JSON.stringify({ ...input, tags: input.tags.join(",") });

  let results: any = await polylogixAPI
    .post("queries/add", {
      body,
      headers: getAuthToken(ctx)
    })
    .json();

  let { query_id } = results;

  let query = await getQuery(_, { id: query_id }, ctx);

  return query;
}

async function addRule(_, { input }, ctx) {
  let results: any = await polylogixAPI
    .post("rules/add", {
      body: JSON.stringify(input),
      headers: getAuthToken(ctx)
    })
    .json();

  let { rule_id } = results;

  let rule = getRule(_, { id: rule_id }, ctx);

  return rule;
}

async function getRules(_, __, ctx) {
  let results: any = await polylogixAPI
    .get("rules", {
      headers: getAuthToken(ctx)
    })
    .json();

  return results?.data;
}

async function getRule(_, { id }, ctx) {
  let results: any = await polylogixAPI
    .get(`rules/${id}`, {
      headers: getAuthToken(ctx)
    })
    .json();

  return results?.data;
}

async function editRule(_, { id, ...rest }, ctx) {
  let results: any = await polylogixAPI
    .post(`rules/${id}`, {
      body: JSON.stringify(rest),
      headers: getAuthToken(ctx)
    })
    .json();

  return results?.data;
}

export {
  getNode,
  getRules,
  addRule,
  getRule,
  editRule,
  getNodes,
  createNodeTags,
  updateNodeTags,
  getNodeTags,
  getScheduledQueries,
  getScheduledQueriesResults,
  getNodeQueryResults,
  getNodeActivityResults,
  getAllTags,
  addTags,
  getAlertsInfo,
  getAlertData,
  addDistributedQueries,
  login,
  logout,
  updateUserPassword,
  updateAPIKeys,
  getAPIKeys,
  updateOptions,
  getQueries,
  addOSQuery
};
