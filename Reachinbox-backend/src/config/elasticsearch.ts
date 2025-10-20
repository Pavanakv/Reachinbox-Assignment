import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200",
});

// Function to check connection
export async function checkElasticsearchConnection() {
  try {
    const health = await esClient.cluster.health();
    const status = (health as any).status || (health as any).body?.status;

    console.log("Elasticsearch connected:", status);
  } catch (error) {
    console.error("Elasticsearch connection failed:", error);
  }
}
