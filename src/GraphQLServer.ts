import { GraphQLServer } from "graphql-yoga";
import {
  getAlertsInfo,
  login,
  logout,
  updateUserPassword,
  updateAPIKeys,
  getAPIKeys,
  updateOptions,
  getNode,
  getNodes,
  getQueries,
  addOSQuery,
  getRules,
  getRule,
  editRule,
  addRule
} from "./plgx-api";
import { readFileSync } from "fs";

const typeDefs = readFileSync(require.resolve("./schema.graphql"), {
  encoding: "utf-8"
});

const notImplemented = () => new Error("Not implemented");

import {
  JSONResolver,
  DateTimeResolver,
  PositiveIntResolver
} from "graphql-scalars";

const resolvers = {
  JSON: JSONResolver,
  DateTime: DateTimeResolver,
  PositiveInt: PositiveIntResolver,
  ConditionRule: {
    value: ({ value }) => (Array.isArray(value) ? value : [value])
  },
  Rule: {
    conditions: ({ conditions }) =>
      JSON.parse(
        conditions
          .replace(/\'/g, '"')
          .replace(/True/g, "true")
          .replace(/False/g, "false")
          .replace(/None/g, '"None"')
      )
  },
  ConditionGroup: {
    __resolveType: obj => {
      if (obj.rules) {
        return "Condition";
      } else {
        return "ConditionRule";
      }
    }
  },
  LoginUserResult: {
    __resolveType: ({ __typename }) => __typename
  },
  Query: {
    node: (_, { hostIdentifier }, ctx) => {
      return getNode(hostIdentifier, ctx);
    },
    nodes: (_, __, ctx) => getNodes(_, ctx),
    apiKeys: getAPIKeys,
    alerts: (_, { hostIdentifier, ruleId, queryName }, ctx) =>
      getAlertsInfo(
        {
          hostIdentifier,
          ruleId,
          queryName
        },
        ctx
      ),
    queries: getQueries,
    rules: getRules,
    rule: getRule
  },
  Mutation: {
    loginUser: async (_, { input: { password, username } }) => {
      let results: {} = await login({ password, username });

      return { __typename: "LoginUserSuccess", ...results };
    },
    logoutUser: async () => {
      await logout();

      return true;
    },
    updateUserPassword: (_, { input: { currentPassword, newPassword } }) =>
      updateUserPassword({ currentPassword, newPassword }),
    updateAPIKeys: (_, { input }) => updateAPIKeys({ apiKeys: input }),
    deleteOSQueryResult: notImplemented,
    updateOptions: (_, { input: { options } }) => {
      updateOptions({ options });
    },
    updateNodeTags: notImplemented,
    updateRule: editRule,
    createRule: addRule,
    addOSQuery,
    editOSQueryTags: notImplemented,
    addOSQueryTags: notImplemented,
    addPacks: notImplemented,
    addPackTags: notImplemented,
    updatePlatformConfig: notImplemented,
    addPlatformConfig: notImplemented,
    addIOCFiles: notImplemented,
    addYaraFile: notImplemented
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request }) => ({
    auth: {
      token: request.headers["x-access-token"]
    }
  })
});

server.start(() =>
  console.log("Polylogix GraphQL server is running on http://localhost:4000")
);
