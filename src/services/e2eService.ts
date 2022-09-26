import reset from "../repositories/e2eRepository.js";

export default async function clearDB() {
  await reset();
}
