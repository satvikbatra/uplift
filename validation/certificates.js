const z = require('zod');

const certificateSchemaZod = z.object({
    platform: z.string(),
    field: z.string(),
    title: z.string(),
    description: z.string(),
    verification_link: z.string(),
    date: z.string().date()
});

module.exports = { certificateSchemaZod };