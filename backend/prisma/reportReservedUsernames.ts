import { PrismaClient } from "@prisma/client";
import { RESERVED_USERNAMES } from "../src/lib/reservedUsernames";

/**
 * Lists existing creators whose username is now reserved (#387).
 *
 * The reserved list is new, so a profile registered before this change could
 * already hold one of those names. This only reports them — maintainers
 * decide case by case whether to rename, contact, or leave a given profile,
 * since a username someone's audience already knows isn't safe to change
 * automatically.
 *
 * Run with: npm run report:reserved-usernames
 */
const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creator.findMany({
    select: { id: true, username: true, userId: true, createdAt: true },
  });

  const collisions = creators.filter((creator) =>
    RESERVED_USERNAMES.has(creator.username.toLowerCase())
  );

  if (collisions.length === 0) {
    console.log("No existing creator uses a now-reserved username.");
    return;
  }

  console.log(`${collisions.length} existing creator(s) use a now-reserved username:`);
  for (const creator of collisions) {
    console.log(
      `  id=${creator.id} username=${creator.username} userId=${creator.userId} createdAt=${creator.createdAt.toISOString()}`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
