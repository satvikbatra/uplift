const z = require('zod');

const researchPaperSchemaZod = z.object({
    title: z.string(),
    description: z.string(),
    certificate_of_publication: z.string(),
    verification_link: z.string(),
    conference_name: z.string(),
    publish_date: z.string().date()
});

module.exports = { researchPaperSchemaZod };