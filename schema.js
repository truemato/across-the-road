const graphql = require("graphql");
const SensorValue = require("./models/SensorValue");

const { GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLList, GraphQLString } = graphql;

// センサー値タイプ
const SensorValueType = new GraphQLObjectType({
  name: "SensorValue",
  fields: () => ({
    id: { type: GraphQLString },
    value: { type: GraphQLInt },
    total: { type: GraphQLInt },
    timestamp: { type: GraphQLString },
  }),
});

// ルートクエリ
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    latestSensorValue: {
      type: SensorValueType,
      resolve: async () => {
        // MongoDB から最新のデータを取得
        const latestValue = await SensorValue.findOne().sort({ timestamp: -1 });
        return latestValue;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
