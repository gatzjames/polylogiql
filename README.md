# polylogiQL

A GraphQL server that wraps the Polylogix Rest API.

> WARNING: polylogiQL is in the _ALPHA_ phase of development. A lot of the APIs exposed by POLYLOGIX have not yet been implemented. That said, any help to do so is more than welcome!

_Tested with Node 12_

## Install

```
$ npm install
```

## Usage

Add the url that the polylogix server is running to your environment as POLYLOGIX_BASE_URL.

Before running the command

```sh
POLYLOGIX_BASE_URL=https://127.0.0.1:5000/services/api/v0 && npm start
```

**OR** create a .env file in the root and then just run `npm start`

## Example Queries

Get all the alerts by specifying the host_identifier:

```gql
query {
  alerts(hostIdentifier: "08DF561C-99F3-5EEF-991A-B20AC5695282") {
    created_at
    message
    rule_name
    rule
  }
}
```

Add a new OSQuery:

```graphql
mutation {
  addOSQuery(
    input: {
      name: "OSQuery added with a GraphQL mutation"
      query: "select * from os_version;"
      interval: 20
      platform: all
      tags: ["test", "test2"]
      snapshot: false
      version: "2.9.0"
      value: "Platform checks"
    }
  ) {
    id
    tags
  }
}
```

Create a new rule

```graphql
mutation createRule {
  createRule(
    input: {
      alerters: ["Rsyslog"]
      description: "My rule description"
      name: "My rule"
      status: "ACTIVE"
      type: "MITRE"
      tactics: ["Execution"]
      conditions: {
        condition: AND
        rules: [
          {
            id: "query_name"
            type: "string"
            field: "query_name"
            input: "text"
            value: "App_disabledExceptionChainValidation"
            operator: "equal"
          }
        ]
      }
    }
  )
}
```

## Contributing

All contributions are welcome. If you have suggestions please open an issue.

## Licence

MIT
