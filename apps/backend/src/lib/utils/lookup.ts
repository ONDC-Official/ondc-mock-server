import axios from "axios";
import { SubscriberDetail } from "../../interfaces";
import { STAGING_REGISTRY_URL, PREPOD_REGISTRY_URL } from "./constants";
import { redis } from "./redis";

export async function getSubscriberDetails(
  subscriber_id: string,
  unique_key_id: string,
  env: string
) {
  const cachedData = await redis.get(
    `subscriber_data-${subscriber_id}-${unique_key_id}`
  );
  let subscribers = cachedData ? JSON.parse(cachedData) : [];

  // Determine the appropriate URL based on the environment
  // const url = env === "prepod" ? PREPOD_REGISTRY_URL : STAGING_REGISTRY_URL;

  if (subscribers.length === 0) {
    try {
      // Fetch data from both endpoints
      const [stagingResponse, prepodResponse] = await Promise.all([
        axios.post(STAGING_REGISTRY_URL, {
          subscriber_id,
          ukId: unique_key_id,
        }),
        axios.post(PREPOD_REGISTRY_URL, {
          subscriber_id,
          ukId: unique_key_id,
        }),
      ]);

      // Process and concatenate data from both responses
      [stagingResponse.data, prepodResponse.data].forEach((responseData) => {
        responseData
          .map((data: object) => {
            const { subscriber_url, ...subscriberData } = data as SubscriberDetail;
            return {
              ...subscriberData,
              unique_key_id: subscriber_url,
            };
          })
          .forEach((data: any) => {
            try {
              subscribers.push({
                subscriber_id: data.subscriber_id,
                unique_key_id: data.ukId,
                type: data.type,
                signing_public_key: data.signing_public_key,
                valid_until: data.valid_until,
              });
            } catch (error) {
              console.log("Error processing data:", error);
            }
          });
      });

      // Cache the combined data in Redis
      try {
        await redis.set(
          `subscriber_data-${subscribers[0].subscriber_id}-${subscribers[0].unique_key_id}`,
          JSON.stringify(subscribers),
          "EX",
          432000 // Set TTL for 5 days
        );
      } catch (err) {
        console.error("Error setting subscriber_data in Redis:", err);
      }
    } catch (error) {
      console.error("Error fetching subscriber data:", error);
    }
  }

  return subscribers;
}
