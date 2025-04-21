import db from "@/models/index.js";
import { UserRole } from "~/types";

interface Payload {
  onlyVisible?: boolean;
}
export default defineEventHandler(async (event) => {
  const query: Payload = await getQuery(event);

  return db.UserTypes.findAll({
    ...(query.onlyVisible
      ? {
          where: {
            isVisible: true,
          },
        }
      : {}),
  });
});
