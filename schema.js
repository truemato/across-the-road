require("dotenv").config();
const mongoose = require("mongoose");
const graphql = require("graphql");
const SensorValue = require("./models/SensorValue");
const LastPlace = require("./models/LastPlace");
const HaikuPlace = require("./models/HaikuPlace");

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

// LastPlaceの取得関数
async function fetchLastPlace() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const lastPlace = await LastPlace.findOne().sort({ timestamp: -1 });
    console.log("Last Place:", lastPlace);

    return lastPlace;
  } catch (error) {
    console.error("Error fetching last place:", error);
  } finally {
    mongoose.connection.close();
  }
}

// HaikuPlaceの挿入関数
async function insertHaikuPlace() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const newHaiku = new HaikuPlace({
      lat: 35.6586,
      lng: 139.7454,
      placename: "東京タワー",
      comment: "空風に合わぬ半袖赤いタワー",
      timestamp: new Date("2025-01-18T14:29:58.474+00:00"),
    });

    const savedHaiku = await newHaiku.save();
    console.log("HaikuPlace saved:", savedHaiku);
  } catch (error) {
    console.error("Error inserting haiku place:", error);
  } finally {
    mongoose.connection.close();
  }
}

// 実行
insertHaikuPlace();
fetchLastPlace();

module.exports = new GraphQLSchema({
  query: RootQuery,
});
