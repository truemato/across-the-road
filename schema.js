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


import graphql from "graphql";
import SensorValue from "./models/sensorvalue.js";
import HaikuPlace from "./models/haikuplace.js";
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

const SensorValueType = new GraphQLObjectType({
  name: "SensorValue",
  fields: () => ({
    id: { type: GraphQLString },
    value: { type: GraphQLInt },
    total: { type: GraphQLInt },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    updateCount: { type: graphql.GraphQLInt },
    totalDistance: { type: GraphQLFloat },
    timestamp: { type: GraphQLString },
  }),
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


