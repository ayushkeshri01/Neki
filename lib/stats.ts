import { prisma } from "@/lib/prisma";

export async function getGlobalStats() {
  try {
    const [postCount, likeCount, userCount] = await Promise.all([
      prisma.post.count({
        where: { 
          status: "VISIBLE"
        },
      }),
      prisma.like.count(),
      prisma.user.count(),
    ]);

    // Format numbers for display (e.g., 245000 -> 245k)
    const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k+";
      return num.toLocaleString();
    };

    // Logic: 
    // - Good Deeds Done = Visible Posts
    // - Total Reactions = Total Likes
    // - Total Volunteers = Total Users
    
    return [
      {
        label: "Good Deeds Shared",
        value: formatNumber(postCount),
        raw: postCount
      },
      {
        label: "Hearts Touched",
        value: formatNumber(likeCount),
        raw: likeCount
      },
      {
        label: "Volunteers Helping",
        value: formatNumber(userCount),
        raw: userCount
      }
    ];
  } catch (error) {
    console.error("Error fetching global stats:", error);
    // Return fallback "real" looking but zeroed data if error
    return [
      { label: "Good Deeds Done", value: "0", raw: 0 },
      { label: "Companies Joined", value: "0", raw: 0 },
      { label: "Hours Volunteered", value: "0", raw: 0 }
    ];
  }
}
