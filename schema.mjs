// schema.js
import { GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLFloat, GraphQLString, GraphQLList } from "graphql";
import lastplace from "./models/lastplace.mjs";
import sensorvalue from "./models/sensorvalue.mjs";
import haikuplace from "./models/haikuplace.mjs";

// Arduino の現在値（メモリ上のグローバル変数）を返す型
const ArduinoDataType = new GraphQLObjectType({
  name: "ArduinoData",
  fields: {
    run: { type: GraphQLInt },
    output_rpm: { type: GraphQLInt },
  },
});

// LastPlace 用 GraphQL 型
const LastPlaceType = new GraphQLObjectType({
  name: "LastPlace",
  fields: {
    id: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    placename: { type: GraphQLString },
    comment: { type: GraphQLString },
    timestamp: { type: GraphQLString },
  },
});

// SensorValue 用 GraphQL 型
const SensorValueType = new GraphQLObjectType({
  name: "SensorValue",
  fields: {
    id: { type: GraphQLString },
    value: { type: GraphQLInt },
    total: { type: GraphQLInt },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    updateCount: { type: GraphQLInt },
    totalDistance: { type: GraphQLFloat },
    timestamp: { type: GraphQLString },
  },
});

// HaikuPlace 用 GraphQL 型
const HaikuPlaceType = new GraphQLObjectType({
  name: "HaikuPlace",
  fields: {
    id: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    placename: { type: GraphQLString },
    comment: { type: GraphQLString },
    timestamp: { type: GraphQLString },
  },
});

// ルートクエリ：各種取得用
const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    // Arduino の最新データ（グローバル変数 arduinoData を返す）
    getArduinoData: {
      type: ArduinoDataType,
      resolve: () => {
        return global.arduinoData;
      },
    },
    // LastPlace の一覧を取得（新しい順）
    getLastPlaces: {
      type: new GraphQLList(LastPlaceType),
      resolve: async () => await lastplace.find().sort({ timestamp: -1 }),
    },
    // SensorValue の一覧を取得（新しい順）
    getSensorValues: {
      type: new GraphQLList(SensorValueType),
      resolve: async () => await sensorvalue.find().sort({ timestamp: -1 }),
    },
    // HaikuPlace の一覧を取得（新しい順）
    getHaikuPlaces: {
      type: new GraphQLList(HaikuPlaceType),
      resolve: async () => await haikuplace.find().sort({ timestamp: -1 }),
    },
  },
});

// ルートミューテーション：各種登録用
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // LastPlace を追加するミューテーション
    addLastPlace: {
      type: LastPlaceType,
      args: {
        lat: { type: GraphQLFloat },
        lng: { type: GraphQLFloat },
        placename: { type: GraphQLString },
        comment: { type: GraphQLString },
      },
      resolve: async (_, { lat, lng, placename, comment }) => {
        const finalPlacename = (!placename || placename.trim() === "")
          ? await (async () => {
              const apiKey = process.env.GOOGLE_MAP_API_KEY;
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
              const response = await fetch(geocodeUrl);
              const data = await response.json();
              return (data.results && data.results.length > 0)
                ? data.results[0].formatted_address
                : "";
            })()
          : placename;
        const newPlace = new lastplace({ lat, lng, placename: finalPlacename, comment, timestamp: new Date() });
        return await newPlace.save();
      },
    },
    // SensorValue を追加するミューテーション
    addSensorValue: {
      type: SensorValueType,
      args: {
        value: { type: GraphQLInt },
        total: { type: GraphQLInt },
        lat: { type: GraphQLFloat },
        lng: { type: GraphQLFloat },
        updateCount: { type: GraphQLInt },
        totalDistance: { type: GraphQLFloat },
      },
      resolve: async (_, args) => {
        const newSensorValue = new sensorvalue({ ...args, timestamp: new Date() });
        return await newSensorValue.save();
      },
    },
    // HaikuPlace を追加するミューテーション
    addHaikuPlace: {
      type: HaikuPlaceType,
      args: {
        lat: { type: GraphQLFloat },
        lng: { type: GraphQLFloat },
        placename: { type: GraphQLString },
        comment: { type: GraphQLString },
      },
      resolve: async (_, { lat, lng, placename, comment }) => {
        const finalPlacename = (!placename || placename.trim() === "")
          ? await (async () => {
              const apiKey = process.env.GOOGLE_MAP_API_KEY;
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
              const response = await fetch(geocodeUrl);
              const data = await response.json();
              return (data.results && data.results.length > 0)
                ? data.results[0].formatted_address
                : "";
            })()
          : placename;
        const newHaiku = new haikuplace({ lat, lng, placename: finalPlacename, comment, timestamp: new Date() });
        return await newHaiku.save();
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
