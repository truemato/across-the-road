/*
schema.js
Table

test
  haikuplace

  inputlogs
  inputs
  lastplace
  lastplaces
  sensorvalue
  sensorvalues

**/




const graphql = require("graphql");
const SensorValue = require("./models/SensorValue");
const HaikuPlace = require("./models/haikuplace");
const { GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLList, GraphQLString } = graphql;


// GraphQLスキーマの定義
const HaikuPlaceType = new GraphQLObjectType({
  name: "HaikuPlace",
  fields: {
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    placename: { type: GraphQLString },
    comment: { type: GraphQLString },
    timestamp: { type: Date, default: Date.now },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    getLatestPlace: {
      type: HaikuPlaceType,
      resolve: async () => {
        return await HaikuPlace.findOne().sort({ timestamp: -1 });
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addLocation: {
      type: HaikuPlaceType,
      args: {
        lat: { type: GraphQLFloat },
        lng: { type: GraphQLFloat },
        placename: { type: GraphQLString },
      },
      resolve: async (_, { lat, lng, placename }) => {
        const newPlace = new HaikuPlace({ lat, lng, placename, timestamp: new Date() });
        return await newPlace.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

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

module.exports = new GraphQLSchema({
  query: RootQuery,
});
