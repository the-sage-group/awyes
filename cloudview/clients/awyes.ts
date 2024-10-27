import * as AWS from "@aws-sdk/client-acm";

const acm = new AWS.ACM({ region: "us-west-2" });

export default {
  acm,
};
