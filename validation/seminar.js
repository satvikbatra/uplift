const z = require('zod');

const seminarSchemaZod = z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    role: z.string(),
    date: z.string().date()
});

module.exports = { seminarSchemaZod };