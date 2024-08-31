const z = require('zod');

const otherAchievementsSchemaZod = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().date(),
    category: z.string().min(1)
});

module.exports = { otherAchievementsSchemaZod };