import { setAirPodsMode } from "./core/airpods-control";

export default async function main() {
  await setAirPodsMode("transparency");
}
