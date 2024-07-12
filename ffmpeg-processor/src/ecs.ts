import { ECSClient } from "@aws-sdk/client-ecs";

export const ecsClient = new ECSClient({
  region: process.env.REGION!,
});
