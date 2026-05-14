import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for /brain/ paths in database...");

  const communities = await prisma.community.findMany({
    where: {
      image: {
        contains: "/brain/",
      },
    },
  });

  if (communities.length > 0) {
    console.log(`Found ${communities.length} communities with /brain/ paths:`);
    communities.forEach((c) => console.log(`- ${c.name}: ${c.image}`));
  } else {
    console.log("No communities with /brain/ paths found.");
  }

  const posts = await prisma.post.findMany({
    where: {
      images: {
        hasSome: ["/brain/"], // This might not work perfectly with partial matches in arrays, let's use a raw query if needed
      },
    },
  });

  // For arrays, we might need a different approach if they are partial matches
  const allPosts = await prisma.post.findMany();
  const postsWithBrainPaths = allPosts.filter(p => p.images.some(img => img.includes("/brain/")));

  if (postsWithBrainPaths.length > 0) {
    console.log(`Found ${postsWithBrainPaths.length} posts with /brain/ paths:`);
    postsWithBrainPaths.forEach((p) => console.log(`- Post ${p.id}: ${p.images.join(", ")}`));
  } else {
    console.log("No posts with /brain/ paths found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
