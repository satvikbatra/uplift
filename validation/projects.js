const z = require('zod');

const projectSchemaZod = z.object({
    topic: z.string(),
    description: z.string(),
    github_link: z.string(),
    tech_stack: z.array(z.string()),
    date: z.string().date()
});

module.exports = { projectSchemaZod };