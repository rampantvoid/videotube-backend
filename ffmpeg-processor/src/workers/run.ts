import { RunTaskCommand, waitUntilTasksStopped } from "@aws-sdk/client-ecs";
import { Job } from "bullmq";
import { ecsClient } from "../ecs";

/**
 * Dummy worker
 *
 * This worker is responsible for doing something useful.
 *
 */
export default async function (job: Job) {
  await job.log("Start processing job");
  console.log("Doing something useful...", job.id, job.data);

  const key = job.data.fileKey;

  const command = new RunTaskCommand({
    cluster: "",
    taskDefinition: "",
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-06c379699b74ea7a1",
          "subnet-056a2041d0c414eb8",
          "subnet-008cc544d9d27929c",
        ],
        securityGroups: ["sg-0a0b1656049c67ca4"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "transcoder",
          environment: [{ name: "FILE_KEY", value: key }],
        },
      ],
    },
  });

  const result = await ecsClient.send(command);

  console.log(result.tasks);
  if (!result.tasks?.length) return;

  console.log("waiting for task to stop");

  await waitUntilTasksStopped(
    {
      client: ecsClient,
      // Change this
      maxWaitTime: Infinity,
    },
    {
      cluster: "",
      tasks: [result.tasks[0].taskArn!],
    }
  );

  console.log("task done");
}
