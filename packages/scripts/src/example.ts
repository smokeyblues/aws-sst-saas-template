import { Resource } from "sst";
import { Example } from "@aws-sst-saas-template/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
