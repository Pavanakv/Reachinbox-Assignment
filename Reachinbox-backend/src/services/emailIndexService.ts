import { esClient } from "../config/elasticsearch";

export const INDEX_NAME = "emails";

export async function createEmailIndex() {
  try {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      await esClient.indices.create({
        index: INDEX_NAME,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
        mappings: {
          properties: {
            subject: { type: "text" },
            body: { type: "text" },
            from: { type: "keyword" },
            to: { type: "keyword" },
            date: { type: "date" },
            aiCategory: { type: "keyword" },
            accountId: { type: "keyword" },
            folder: { type: "keyword" },
          },
        },
      });

      console.log("Created new Elasticsearch index:", INDEX_NAME);
    } else {
      console.log("Index already exists:", INDEX_NAME);
    }
  } catch (error: any) {
    if (
      error.meta?.body?.error?.type === "resource_already_exists_exception"
    ) {
      console.log("Index already exists:", INDEX_NAME);
    } else {
      console.error("Error creating index:", error);
    }
  }
}


export async function indexEmail(emailData: any) {
  try {

    const uniqueId = `${emailData.accountId}-${Buffer.from(
      (emailData.subject || "") + emailData.date
    ).toString("base64")}`;

    await esClient.index({
      index: INDEX_NAME,
      id: uniqueId, 
      document: {
        ...emailData,
        aiCategory:
          emailData.aiCategory || "Uncategorized", 
      },
      refresh: "true", 
    });

    console.log(`Indexed email: ${emailData.subject}`);
  } catch (error) {
    console.error("Failed to index email:", error);
  }
}

export async function getAllEmails() {
  try {
    const result = await esClient.search({
      index: INDEX_NAME,
      size: 50,
      sort: [{ date: { order: "desc" } }],
      query: { match_all: {} },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  } catch (error) {
    console.error("Error fetching emails from index:", error);
    return [];
  }
}
