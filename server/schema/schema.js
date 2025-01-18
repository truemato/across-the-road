const { GraphQLObjectType, GraphQLSchema, GraphQLInt } = require('graphql');
const { MongoClient } = require('mongodb');

// MongoDBの接続情報
const url = 'mongodb://localhost:27017';
const dbName = 'arduinoData';
const collectionName = 'sensorValues';
const client = new MongoClient(url);

const TotalType = new GraphQLObjectType({
  name: 'Total',
  fields: () => ({
    total: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    getTotal: {
      type: TotalType,
      resolve: async () => {
        try {
          await client.connect();
          const db = client.db(dbName);
          const collection = db.collection(collectionName);

          // MongoDBから全データを取得し、合計値を計算
          const allValues = await collection.find().toArray();
          const total = allValues.reduce((sum, item) => sum + (item.value || 0), 0);

          return { total };
        } catch (error) {
          console.error('Error in getTotal:', error);
          return { total: 0 };
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
